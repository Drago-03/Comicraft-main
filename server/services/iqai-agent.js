/**
 * IQai Agent Service — Comicraft Story Agent
 *
 * Wraps the story generation pipeline in an IQai ADK agent.
 * Uses @iqai/adk Agent class with Gemini as the LLM provider.
 *
 * The ADK Agent API:
 *   - new Agent({ name, model, instructions, tools })
 *   - agent.run({ messages: [{ role, content }] })
 *
 * Dependencies: @iqai/adk (Agent Development Kit for TypeScript)
 * Docs: https://docs.iqai.com / https://github.com/IQ-ai/adk-ts
 *
 * Environment Variables:
 *   - GOOGLE_API_KEY or GEMINI_API_KEY — required for LLM calls
 *   - IQAI_API_KEY — optional, for ATP registration/tokenization
 */

let logger;
try {
    logger = require('../utils/logger');
} catch {
    logger = { info: console.log, warn: console.warn, error: console.error, debug: () => { } };
}

// ---------------------------------------------------------------------------
// IQai ADK imports — graceful fallback if not installed
// ---------------------------------------------------------------------------

let Agent = null;
let AgentBuilder = null;
let adkAvailable = false;

try {
    const adk = require('@iqai/adk');
    Agent = adk.Agent || adk.LlmAgent;
    AgentBuilder = adk.AgentBuilder;
    adkAvailable = !!(Agent || AgentBuilder);
    if (adkAvailable) {
        logger.info('[IQai] ADK-TS loaded successfully');
    } else {
        logger.warn('[IQai] ADK-TS loaded but Agent/AgentBuilder classes not found');
    }
} catch (err) {
    logger.warn(`[IQai] @iqai/adk not installed or failed to load: ${err.message}. Running in compatibility mode (direct Gemini calls).`);
}

// ---------------------------------------------------------------------------
// Ensure GOOGLE_API_KEY is set (ADK reads this env var for Gemini)
// ---------------------------------------------------------------------------
if (!process.env.GOOGLE_API_KEY && process.env.GEMINI_API_KEY) {
    process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
    logger.info('[IQai] Set GOOGLE_API_KEY from GEMINI_API_KEY for ADK compatibility');
}

// ---------------------------------------------------------------------------
// Internal Gemini caller (used when ADK is not available or as fallback)
// ---------------------------------------------------------------------------

const geminiService = require('./geminiService');
const groqService = require('./groqService');

// ---------------------------------------------------------------------------
// Agent configuration
// ---------------------------------------------------------------------------

const AGENT_CONFIG = {
    name: 'comicraft_story_agent',
    description: 'AI-powered storytelling agent for the ComiCraft platform. Generates stories, comic scripts, and novels with deep narrative understanding.',
    version: '1.0.0',
    model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
    systemInstruction: `You are the ComiCraft Story Agent — a master storyteller and creative writing assistant.
You specialize in generating engaging stories, comic scripts, and novels across all genres.
You understand narrative structure, character development, pacing, and visual storytelling.
When generating comic scripts, you think in panels with vivid visual descriptions.
When analyzing content, you provide precise, structured feedback.
You never break character or add meta-commentary to your creative output.
Start immediately with the narrative — no preamble, no author notes.`,
};

// ---------------------------------------------------------------------------
// IQai Agent class
// ---------------------------------------------------------------------------

class ComiCraftStoryAgent {
    constructor() {
        this.config = AGENT_CONFIG;
        this.isInitialized = false;
        this.adkAgent = null;
    }

    /**
     * Initialize the agent. If @iqai/adk is available, creates an ADK agent.
     * Otherwise operates in compatibility mode using direct Gemini calls.
     */
    async initialize() {
        if (this.isInitialized) return;

        if (adkAvailable) {
            try {
                if (AgentBuilder) {
                    // Use AgentBuilder fluent API (preferred)
                    const built = await AgentBuilder
                        .create(this.config.name)
                        .withModel(this.config.model)
                        .withDescription(this.config.description)
                        .withInstruction(this.config.systemInstruction)
                        .build();

                    this.adkAgent = built.agent || built;
                    logger.info('[IQai] ComiCraft Story Agent initialized via AgentBuilder');
                } else if (Agent) {
                    // Use Agent constructor directly
                    this.adkAgent = new Agent({
                        name: this.config.name,
                        model: this.config.model,
                        description: this.config.description,
                        instructions: this.config.systemInstruction,
                    });
                    logger.info('[IQai] ComiCraft Story Agent initialized via Agent constructor');
                }
            } catch (err) {
                logger.warn(`[IQai] ADK agent init failed (${err.message}), falling back to compatibility mode`);
                this.adkAgent = null;
            }
        } else {
            logger.info('[IQai] Running in compatibility mode (no ADK)');
        }

        this.isInitialized = true;
    }

    /**
     * Run a story generation task through the IQai agent or fallback.
     * This is the primary method called by the AI routes.
     *
     * @param {Object} params - Generation parameters
     * @param {string} params.prompt - The story prompt/premise
     * @param {string} [params.genre] - Story genre
     * @param {string} [params.theme] - Central theme
     * @param {string} [params.length] - Story length (short/medium/long)
     * @param {string} [params.tone] - Narrative tone
     * @param {string} [params.characters] - Character descriptions
     * @param {string} [params.setting] - Story setting
     * @param {string} [params.formatType] - Output format (story/comic/novel)
     * @param {number} [params.temperature] - Generation temperature
     * @param {number} [params.maxTokens] - Max output tokens
     * @returns {Promise<string>} - The generated content
     */
    async run(params) {
        await this.initialize();

        // Build a comprehensive prompt from all parameters
        const promptParts = [];
        if (params.genre) promptParts.push(`Genre: ${params.genre}`);
        if (params.theme) promptParts.push(`Theme: ${params.theme}`);
        if (params.tone) promptParts.push(`Tone: ${params.tone}`);
        if (params.characters) promptParts.push(`Characters: ${params.characters}`);
        if (params.setting) promptParts.push(`Setting: ${params.setting}`);
        if (params.formatType) promptParts.push(`Format: ${params.formatType}`);
        if (params.length) promptParts.push(`Length: ${params.length}`);

        const userMessage = params.prompt
            ? (promptParts.length > 0
                ? `${promptParts.join('. ')}.\n\n${params.prompt}`
                : params.prompt)
            : promptParts.join('. ') + '. Write a compelling story based on these parameters.';

        // Try ADK agent first
        if (this.adkAgent) {
            try {
                logger.info('[IQai] Running story generation via ADK agent');

                let response;

                // Try the agent's run method with messages format
                if (typeof this.adkAgent.run === 'function') {
                    response = await this.adkAgent.run({
                        messages: [{ role: 'user', content: userMessage }],
                    });
                }

                // Extract content from response
                if (response) {
                    const content = typeof response === 'string'
                        ? response
                        : response.content || response.text || response.output
                          || (response.messages && response.messages.length > 0
                              ? response.messages[response.messages.length - 1].content
                              : null);

                    if (content && typeof content === 'string' && content.length > 10) {
                        logger.info(`[IQai] ADK generation successful (${content.length} chars)`);
                        return content;
                    }
                }

                logger.warn('[IQai] ADK agent returned empty/invalid response, falling back to Gemini');
            } catch (err) {
                logger.warn(`[IQai] ADK run failed: ${err.message}, falling back to direct Gemini`);
            }
        }

        // Fallback: direct Gemini call via geminiService
        logger.info('[IQai] Using direct Gemini call (compatibility mode)');
        return await geminiService.generateContent({
            prompt: userMessage,
            config: {
                temperature: params.temperature || 0.8,
                maxTokensPerResponse: params.maxTokens || 1200,
            },
        });
    }

    /**
     * Generate a story using the agent (legacy method used by orchestrator).
     * @param {Object} params - Same params as groqService.generate()
     * @returns {Promise<{content: string, model: string, tokensUsed: Object, agent: string}>}
     */
    async generateStory(params) {
        await this.initialize();

        logger.info(`[IQai] generateStory: genre=${params.genre}, format=${params.formatType}`);

        // Try ADK agent
        if (this.adkAgent && typeof this.adkAgent.run === 'function') {
            try {
                const content = await this.run(params);
                if (content && content.length > 10) {
                    return {
                        content,
                        model: this.config.model,
                        tokensUsed: { total: 0 },
                        agent: 'iqai-adk',
                    };
                }
            } catch (err) {
                logger.warn(`[IQai] ADK generateStory failed (${err.message}), falling back`);
            }
        }

        // Compatibility mode: use Gemini-powered groqService directly
        const result = await groqService.generate(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Analyze story content.
     * @param {Object} params - Same params as groqService.analyze()
     * @returns {Promise<Object>}
     */
    async analyzeStory(params) {
        await this.initialize();
        logger.info('[IQai] analyzeStory');

        const result = await groqService.analyze(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Break a story into comic panels.
     */
    async breakdownPanels({ story, panelCount = 6, artStyle }) {
        await this.initialize();
        logger.info(`[IQai] breakdownPanels: ${panelCount} panels`);

        const prompt = [
            `Break this story into exactly ${panelCount} comic panels.`,
            `For each panel, provide:`,
            `PANEL N:`,
            `  Visual: [detailed visual description for the artist${artStyle ? `, in ${artStyle} style` : ''}]`,
            `  Dialogue: [character dialogue in quotes, or "No dialogue"]`,
            `  Caption: [optional narration caption]`,
            ``,
            `Story:`,
            story.length > 4000 ? story.substring(0, 4000) + '…' : story,
        ].join('\n');

        const result = await groqService.callGroq({
            model: groqService.MODELS.PRIMARY,
            systemPrompt: 'You are a comic panel layout artist. Break stories into visual panels with descriptions, dialogue, and captions. Be specific and cinematic in visual descriptions.',
            userPrompt: prompt,
            maxTokens: 2800,
            temperature: 0.7,
        });

        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Generate story ideas.
     */
    async generateIdeas(params) {
        await this.initialize();
        logger.info(`[IQai] generateIdeas: genre=${params.genre}`);

        const result = await groqService.generateIdeas(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Improve content.
     */
    async improveContent(params) {
        await this.initialize();
        logger.info(`[IQai] improveContent`);

        const result = await groqService.improve(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Generate a synopsis.
     */
    async generateSynopsis(params) {
        await this.initialize();
        logger.info(`[IQai] generateSynopsis`);

        const result = await groqService.generateSynopsis(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Check if ADK is available.
     */
    isAdkAvailable() {
        return adkAvailable;
    }

    /**
     * Get agent info for health checks / debugging.
     */
    getInfo() {
        return {
            name: this.config.name,
            version: this.config.version,
            model: this.config.model,
            adkAvailable,
            adkActive: !!this.adkAgent,
            mode: this.adkAgent ? 'adk' : 'compatibility',
        };
    }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

const storyAgent = new ComiCraftStoryAgent();

module.exports = {
    storyAgent,
    ComiCraftStoryAgent,
    AGENT_CONFIG,
};
