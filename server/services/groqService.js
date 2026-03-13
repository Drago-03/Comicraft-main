/**
 * AI Service — Gemini-Powered (formerly Groq)
 *
 * All AI text-generation interactions flow through this service, now using
 * Google Gemini instead of Groq. The exported API surface is UNCHANGED so
 * existing callers (routes, orchestrator) work without modification.
 *
 * Features:
 *  - Token-efficient prompt engineering per content type
 *  - Retry logic with exponential backoff
 *  - Structured JSON output for analysis endpoints
 *  - Backward-compatible exports (MODELS, callGroq → callGemini internally)
 */

let logger;
try {
    logger = require('../utils/logger');
} catch {
    logger = { info: console.log, warn: console.warn, error: console.error, debug: () => { } };
}

// ---------------------------------------------------------------------------
// Gemini Configuration
// ---------------------------------------------------------------------------

const GEMINI_CONFIG = {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-3.1-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
};

// ---------------------------------------------------------------------------
// Models — Mapped from old Groq names to Gemini equivalents
// ---------------------------------------------------------------------------
const MODELS = {
    PRIMARY: 'gemini-3.1-pro',
    FAST: 'gemini-3.0-flash',
    LONG_CONTEXT: 'gemini-3.1-pro',
};

const MODEL_DISPLAY_NAMES = {
    [MODELS.PRIMARY]: 'Gemini 3.1 Pro',
    [MODELS.FAST]: 'Gemini 3.0 Flash',
    [MODELS.LONG_CONTEXT]: 'Gemini 3.1 Pro (Long Context)',
};

// ---------------------------------------------------------------------------
// Token budgets per content length
// ---------------------------------------------------------------------------
const TOKEN_BUDGETS = {
    short: 512,
    medium: 1200,
    long: 2800,
    synopsis: 150,
    analysis: 400,
    ideas: 600,
    improvement: 2000,
};

// ---------------------------------------------------------------------------
// Prompt Templates — Token-Efficient (unchanged from original)
// ---------------------------------------------------------------------------

function buildStoryPrompt({ genre, theme, length, tone, characters, setting, formatType }) {
    const parts = [`Write a ${length || 'medium'}-length ${formatType || 'story'}`];
    if (genre) parts.push(`in the ${genre} genre`);
    if (theme) parts.push(`themed around "${theme}"`);
    if (tone) parts.push(`with a ${tone} tone`);
    if (characters) parts.push(`featuring: ${characters}`);
    if (setting) parts.push(`set in: ${setting}`);
    parts.push('. Include vivid descriptions, dialogue, and a satisfying arc. Start immediately with the narrative — no preamble.');
    return parts.join(' ');
}

function buildComicPrompt({ genre, theme, pages = 6, characters, setting, style }) {
    return [
        `Create a ${pages}-page comic script in the ${genre || 'adventure'} genre`,
        theme ? ` themed "${theme}"` : '',
        characters ? ` with characters: ${characters}` : '',
        setting ? ` set in: ${setting}` : '',
        style ? `. Art style: ${style}` : '',
        `. For each page output: PAGE N: [panel descriptions with dialogue in quotes].`,
        ' Keep descriptions visual and concise. No prose — panel format only.',
    ].join('');
}

function buildNovelPrompt({ genre, theme, chapters = 3, characters, setting, tone }) {
    return [
        `Write ${chapters} chapters of a ${genre || 'literary fiction'} novel`,
        theme ? ` about "${theme}"` : '',
        tone ? ` in a ${tone} tone` : '',
        characters ? `. Key characters: ${characters}` : '',
        setting ? `. Setting: ${setting}` : '',
        `. Format: "CHAPTER N: [Title]" then prose. Each chapter ~500 words with strong narrative hooks.`,
        ' No meta-commentary — start directly with Chapter 1.',
    ].join('');
}

function buildAnalysisPrompt(content) {
    const truncated = content.length > 3000 ? content.substring(0, 3000) + '…' : content;
    return [
        'Analyze this text and return ONLY a JSON object (no markdown, no explanation):',
        '{"sentiment":"positive|negative|neutral|mixed",',
        '"themes":["theme1","theme2"],',
        '"genres":["genre1"],',
        '"readabilityScore":1-10,',
        '"wordCount":<number>,',
        '"estimatedReadingTime":<minutes>,',
        '"complexity":"simple|medium|complex"}',
        '',
        `Text: ${truncated}`,
    ].join('\n');
}

function buildSynopsisPrompt(content, genre, formatType) {
    const truncated = content.length > 1500 ? content.substring(0, 1500) + '…' : content;
    return `Write a compelling 2-sentence synopsis for this ${formatType || 'story'} (${genre || 'fiction'}). ` +
        `No quotes around the synopsis.\n\n${truncated}`;
}

function buildIdeasPrompt(genre, count = 5, theme) {
    const themeClause = theme ? ` around the theme "${theme}"` : '';
    return genre
        ? `List ${count} original ${genre} story premises${themeClause}. One line each, numbered 1-${count}. No explanations.`
        : `List ${count} original story premises across varied genres${themeClause}. One line each, numbered 1-${count}. No explanations.`;
}

function buildImprovementPrompt(content, focusArea) {
    const truncated = content.length > 4000 ? content.substring(0, 4000) + '…' : content;
    return `Improve this text${focusArea ? `, focusing on ${focusArea}` : ''}. ` +
        `Return only the improved version — no commentary.\n\n${truncated}`;
}

// ---------------------------------------------------------------------------
// System Prompts — Minimal for token efficiency
// ---------------------------------------------------------------------------
const SYSTEM_PROMPTS = {
    story: 'You are a master storyteller. Write engaging, vivid narratives. Never break character or add meta-commentary.',
    comic: 'You are a comic script writer. Output panel-by-panel descriptions with dialogue. Visual, concise, cinematic.',
    novel: 'You are a novelist. Write immersive prose with strong characters and pacing. Chapter format.',
    analysis: 'You are a literary analyst. Return ONLY valid JSON — no markdown fences, no explanation.',
    synopsis: 'You write compelling blurbs. Concise, intriguing, spoiler-free.',
    ideas: 'You generate creative story premises. Each is unique, specific, and compelling.',
    improve: 'You are an expert editor. Enhance the text while preserving the author\'s voice. Return only the improved text.',
    general: 'You are a helpful creative writing assistant.',
};

// ---------------------------------------------------------------------------
// Core API Call — Gemini (backward-compatible name: callGroq)
// ---------------------------------------------------------------------------

const TIMEOUT_MS = 60000;
const MAX_RETRIES = 2;
const RETRY_BACKOFF_MS = 1000;

/**
 * Call Gemini API. Named `callGroq` for backward compatibility with existing callers.
 * @param {Object} params
 * @param {string} [params.model] - Gemini model name
 * @param {string} [params.systemPrompt] - System instruction
 * @param {string} params.userPrompt - User prompt
 * @param {number} [params.maxTokens] - Max output tokens
 * @param {number} [params.temperature] - Temperature
 * @param {string} [params.apiKey] - Override API key
 * @param {string} [params.responseFormat] - 'json' for JSON mode
 * @returns {Promise<{content: string, model: string, tokensUsed: Object}>}
 */
async function callGroq({ model, systemPrompt, userPrompt, maxTokens, temperature, apiKey, responseFormat }) {
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your environment.');
    }

    const effectiveModel = model || GEMINI_CONFIG.model || MODELS.PRIMARY;

    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

            // Build Gemini request body
            const contents = [];

            // Gemini uses systemInstruction for system prompts
            const requestBody = {
                contents: [
                    {
                        parts: [{ text: userPrompt }],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: maxTokens || 1000,
                    temperature: temperature ?? 0.7,
                    topP: 0.9,
                },
            };

            // Add system instruction if provided
            if (systemPrompt) {
                requestBody.systemInstruction = {
                    parts: [{ text: systemPrompt }],
                };
            }

            // Add JSON response format if requested
            if (responseFormat === 'json') {
                requestBody.generationConfig.responseMimeType = 'application/json';
            }

            const url = `${GEMINI_CONFIG.baseUrl}/${effectiveModel}:generateContent?key=${geminiApiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorBody = await response.text();
                // Rate-limited — retry with backoff
                if (response.status === 429 && attempt < MAX_RETRIES) {
                    lastError = new Error(`Gemini API ${response.status}: ${errorBody}`);
                    const delay = RETRY_BACKOFF_MS * Math.pow(2, attempt);
                    logger.warn(`Gemini API rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                // Server error — retry
                if (response.status >= 500 && attempt < MAX_RETRIES) {
                    lastError = new Error(`Gemini API ${response.status}: ${errorBody}`);
                    const delay = Math.pow(2, attempt) * 500;
                    logger.warn(`Gemini API ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
            }

            const data = await response.json();
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!content) {
                throw new Error('Empty response from Gemini API');
            }

            // Extract token usage (Gemini provides usageMetadata)
            const usage = data.usageMetadata || {};

            return {
                content: content.trim(),
                model: effectiveModel,
                tokensUsed: {
                    prompt: usage.promptTokenCount || 0,
                    completion: usage.candidatesTokenCount || 0,
                    total: usage.totalTokenCount || 0,
                },
            };
        } catch (err) {
            lastError = err;
            if (err.name === 'AbortError') {
                if (attempt < MAX_RETRIES) {
                    const delay = RETRY_BACKOFF_MS * Math.pow(2, attempt);
                    logger.warn(`Gemini API timeout, retrying in ${delay}ms`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw new Error('Gemini API request timed out after retries');
            }
            if (attempt < MAX_RETRIES && err.message?.includes('500')) {
                const delay = Math.pow(2, attempt) * 500;
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }

    throw lastError;
}

// ---------------------------------------------------------------------------
// Public API (unchanged function signatures)
// ---------------------------------------------------------------------------

/**
 * Generate creative content (story, comic, novel)
 */
async function generate({ prompt, genre, theme, length, tone, characters, setting, formatType, model, temperature, maxTokens, apiKey }) {
    let userPrompt;
    let systemPrompt;
    let budget;

    const ft = (formatType || '').toLowerCase();

    if (ft === 'comic' || ft === 'comics') {
        userPrompt = prompt || buildComicPrompt({ genre, theme, characters, setting });
        systemPrompt = SYSTEM_PROMPTS.comic;
        budget = TOKEN_BUDGETS.long;
    } else if (ft === 'novel' || ft === 'book') {
        userPrompt = prompt || buildNovelPrompt({ genre, theme, characters, setting, tone });
        systemPrompt = SYSTEM_PROMPTS.novel;
        budget = TOKEN_BUDGETS.long;
    } else {
        userPrompt = prompt || buildStoryPrompt({ genre, theme, length, tone, characters, setting, formatType });
        systemPrompt = SYSTEM_PROMPTS.story;
        budget = TOKEN_BUDGETS[length] || TOKEN_BUDGETS.medium;
    }

    const result = await callGroq({
        model: model || MODELS.PRIMARY,
        systemPrompt,
        userPrompt,
        maxTokens: maxTokens || budget,
        temperature: temperature ?? 0.8,
        apiKey,
    });

    return result;
}

/**
 * Analyze content — returns structured JSON
 */
async function analyze({ content, analysisType, apiKey }) {
    const result = await callGroq({
        model: MODELS.FAST,
        systemPrompt: SYSTEM_PROMPTS.analysis,
        userPrompt: buildAnalysisPrompt(content),
        maxTokens: TOKEN_BUDGETS.analysis,
        temperature: 0.2,
        apiKey,
        responseFormat: 'json',
    });

    // Parse JSON from response
    try {
        let jsonStr = result.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        return { ...result, content: parsed };
    } catch {
        const words = content.split(/\s+/).length;
        return {
            ...result,
            content: {
                sentiment: 'neutral',
                themes: ['general'],
                genres: ['fiction'],
                readabilityScore: 7,
                wordCount: words,
                estimatedReadingTime: Math.ceil(words / 200),
                complexity: 'medium',
                rawAnalysis: result.content,
            },
        };
    }
}

/**
 * Generate story ideas
 */
async function generateIdeas({ genre, count = 5, theme, apiKey }) {
    const result = await callGroq({
        model: MODELS.FAST,
        systemPrompt: SYSTEM_PROMPTS.ideas,
        userPrompt: buildIdeasPrompt(genre, count, theme),
        maxTokens: TOKEN_BUDGETS.ideas,
        temperature: 0.9,
        apiKey,
    });

    const ideas = result.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+[\.)\]]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, count);

    return { ...result, content: ideas };
}

/**
 * Improve existing content
 */
async function improve({ content, focusArea, apiKey }) {
    const result = await callGroq({
        model: MODELS.LONG_CONTEXT,
        systemPrompt: SYSTEM_PROMPTS.improve,
        userPrompt: buildImprovementPrompt(content, focusArea),
        maxTokens: TOKEN_BUDGETS.improvement,
        temperature: 0.6,
        apiKey,
    });

    return result;
}

/**
 * Generate a synopsis for uploaded content
 */
async function generateSynopsis({ content, genre, formatType, apiKey }) {
    const result = await callGroq({
        model: MODELS.FAST,
        systemPrompt: SYSTEM_PROMPTS.synopsis,
        userPrompt: buildSynopsisPrompt(content, genre, formatType),
        maxTokens: TOKEN_BUDGETS.synopsis,
        temperature: 0.5,
        apiKey,
    });

    return result;
}

/**
 * Test connection to Gemini API (backward-compatible signature)
 */
async function testConnection(apiKey) {
    try {
        const geminiApiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        if (!geminiApiKey) return { success: false, message: 'GEMINI_API_KEY not configured' };

        const response = await fetch(
            `${GEMINI_CONFIG.baseUrl}/${GEMINI_CONFIG.model}:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'ping' }] }],
                    generationConfig: { maxOutputTokens: 10 },
                }),
                signal: AbortSignal.timeout(5000),
            }
        );

        return {
            success: response.ok,
            message: response.ok ? 'Connected to Gemini API' : `Failed: ${response.status}`,
            provider: 'gemini',
            model: GEMINI_CONFIG.model,
        };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

/* COMMENTED OUT - Groq service deprecated
module.exports = {
    MODELS,
    MODEL_DISPLAY_NAMES,
    TOKEN_BUDGETS,
    generate,
    analyze,
    generateIdeas,
    improve,
    generateSynopsis,
    testConnection,
    callGroq,  // Kept as callGroq for backward compat — internally uses Gemini
    // Expose prompt builders for testing/customization
    buildStoryPrompt,
    buildComicPrompt,
    buildNovelPrompt,
    buildAnalysisPrompt,
    buildSynopsisPrompt,
    buildIdeasPrompt,
    buildImprovementPrompt,
    SYSTEM_PROMPTS,
};
*/
