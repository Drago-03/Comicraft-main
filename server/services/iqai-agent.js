/**
 * IQai Agent Service — Comicraft Story Agent
 *
 * Wraps the story generation pipeline in an IQai ADK-TS compatible agent
 * structure. This service creates a tokenizable AI agent on IQai's ATP
 * (Agent Tokenization Platform) that orchestrates story generation,
 * analysis, and panel breakdown using Google Gemini as the LLM provider.
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
let adkAvailable = false;

try {
    const adk = require('@iqai/adk');
    Agent = adk.Agent || adk.LlmAgent || adk.AgentBuilder;
    adkAvailable = true;
    logger.info('[IQai] ADK-TS loaded successfully');
} catch {
    logger.warn('[IQai] @iqai/adk not installed. Running in compatibility mode (direct Gemini calls).');
}

// ---------------------------------------------------------------------------
// Internal Gemini caller (used when ADK is not available or for tools)
// ---------------------------------------------------------------------------

const geminiService = require('./geminiService');
const groqService = require('./groqService'); // Now Gemini-powered

// ---------------------------------------------------------------------------
// Tool definitions for the IQai agent
// ---------------------------------------------------------------------------

const AGENT_TOOLS = {
    generateStory: {
        name: 'generate_story',
        description: 'Generate a story, comic script, or novel chapter based on given parameters.',
        parameters: {
            type: 'object',
            properties: {
                prompt: { type: 'string', description: 'Direct prompt for story generation' },
                genre: { type: 'string', description: 'Story genre (e.g., fantasy, sci-fi, horror)' },
                theme: { type: 'string', description: 'Central theme of the story' },
                length: { type: 'string', enum: ['short', 'medium', 'long'], description: 'Story length' },
                tone: { type: 'string', description: 'Narrative tone (e.g., dark, humorous, serious)' },
                characters: { type: 'string', description: 'Character descriptions' },
                setting: { type: 'string', description: 'Story setting' },
                formatType: { type: 'string', enum: ['story', 'comic', 'novel', 'storybook'], description: 'Output format' },
            },
        },
    },
    analyzeStory: {
        name: 'analyze_story',
        description: 'Analyze text content for sentiment, themes, readability, and complexity.',
        parameters: {
            type: 'object',
            required: ['content'],
            properties: {
                content: { type: 'string', description: 'Text content to analyze' },
                analysisType: { type: 'string', enum: ['general', 'sentiment', 'themes', 'readability'], description: 'Type of analysis' },
            },
        },
    },
    breakdownPanels: {
        name: 'breakdown_panels',
        description: 'Break a story into comic panels with visual descriptions and dialogue.',
        parameters: {
            type: 'object',
            required: ['story'],
            properties: {
                story: { type: 'string', description: 'Story text to break into panels' },
                panelCount: { type: 'number', description: 'Desired number of panels (default: 6)' },
                artStyle: { type: 'string', description: 'Art style for visual descriptions' },
            },
        },
    },
    generateIdeas: {
        name: 'generate_ideas',
        description: 'Generate creative story premises/ideas.',
        parameters: {
            type: 'object',
            properties: {
                genre: { type: 'string', description: 'Genre to generate ideas for' },
                count: { type: 'number', description: 'Number of ideas (default: 5)' },
                theme: { type: 'string', description: 'Theme constraint' },
            },
        },
    },
    improveContent: {
        name: 'improve_content',
        description: 'Improve and enhance existing text content.',
        parameters: {
            type: 'object',
            required: ['content'],
            properties: {
                content: { type: 'string', description: 'Text to improve' },
                focusArea: { type: 'string', description: 'Area to focus improvement on (e.g., dialogue, pacing, description)' },
            },
        },
    },
};

// ---------------------------------------------------------------------------
// Agent configuration
// ---------------------------------------------------------------------------

const AGENT_CONFIG = {
    name: 'ComiCraft Story Agent',
    description: 'AI-powered storytelling agent for the ComiCraft platform. Generates stories, comic scripts, and novels with deep narrative understanding.',
    version: '1.0.0',
    model: 'gemini-3.1-pro',
    systemInstruction: `You are the ComiCraft Story Agent — a master storyteller and creative writing assistant.
You specialize in generating engaging stories, comic scripts, and novels across all genres.
You understand narrative structure, character development, pacing, and visual storytelling.
When generating comic scripts, you think in panels with vivid visual descriptions.
When analyzing content, you provide precise, structured feedback.
You never break character or add meta-commentary to your creative output.`,
};

// ---------------------------------------------------------------------------
// IQai Agent class
// ---------------------------------------------------------------------------

class ComiCraftStoryAgent {
    constructor() {
        this.config = AGENT_CONFIG;
        this.tools = AGENT_TOOLS;
        this.isInitialized = false;
        this.adkAgent = null;
    }

    /**
     * Initialize the agent. If @iqai/adk is available, creates an ADK agent.
     * Otherwise operates in compatibility mode using direct Gemini calls.
     */
    async initialize() {
        if (this.isInitialized) return;

        if (adkAvailable && Agent) {
            try {
                // Build ADK agent with Gemini as the LLM provider
                const builder = typeof Agent === 'function' && Agent.builder
                    ? Agent.builder()
                    : new Agent();

                if (typeof builder.setName === 'function') builder.setName(this.config.name);
                if (typeof builder.setDescription === 'function') builder.setDescription(this.config.description);
                if (typeof builder.setModel === 'function') builder.setModel(this.config.model);
                if (typeof builder.setSystemInstruction === 'function') builder.setSystemInstruction(this.config.systemInstruction);

                // Register tools
                for (const toolDef of Object.values(this.tools)) {
                    if (typeof builder.addTool === 'function') {
                        builder.addTool(toolDef);
                    }
                }

                this.adkAgent = typeof builder.build === 'function' ? builder.build() : builder;
                logger.info('[IQai] ComiCraft Story Agent initialized with ADK-TS');
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
     * Generate a story using the agent.
     * @param {Object} params - Same params as groqService.generate()
     * @returns {Promise<{content: string, model: string, tokensUsed: Object, agent: string}>}
     */
    async generateStory(params) {
        await this.initialize();

        logger.info(`[IQai] generateStory: genre=${params.genre}, format=${params.formatType}`);

        // If ADK agent is available and supports direct invocation, use it
        if (this.adkAgent && typeof this.adkAgent.invoke === 'function') {
            try {
                const result = await this.adkAgent.invoke({
                    tool: 'generate_story',
                    params,
                });
                return { ...result, agent: 'iqai-adk' };
            } catch (err) {
                logger.warn(`[IQai] ADK invoke failed (${err.message}), falling back to direct Gemini`);
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

        if (this.adkAgent && typeof this.adkAgent.invoke === 'function') {
            try {
                const result = await this.adkAgent.invoke({
                    tool: 'analyze_story',
                    params,
                });
                return { ...result, agent: 'iqai-adk' };
            } catch (err) {
                logger.warn(`[IQai] ADK analyze failed: ${err.message}`);
            }
        }

        const result = await groqService.analyze(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Break a story into comic panels.
     * @param {Object} params
     * @param {string} params.story - Story text
     * @param {number} [params.panelCount=6] - Number of panels
     * @param {string} [params.artStyle] - Art style description
     * @returns {Promise<Object>}
     */
    async breakdownPanels({ story, panelCount = 6, artStyle }) {
        await this.initialize();

        logger.info(`[IQai] breakdownPanels: ${panelCount} panels`);

        if (this.adkAgent && typeof this.adkAgent.invoke === 'function') {
            try {
                const result = await this.adkAgent.invoke({
                    tool: 'breakdown_panels',
                    params: { story, panelCount, artStyle },
                });
                return { ...result, agent: 'iqai-adk' };
            } catch (err) {
                logger.warn(`[IQai] ADK panel breakdown failed: ${err.message}`);
            }
        }

        // Compatibility mode: build panel breakdown prompt and call Gemini
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
     * @param {Object} params - Same params as groqService.generateIdeas()
     * @returns {Promise<Object>}
     */
    async generateIdeas(params) {
        await this.initialize();
        logger.info(`[IQai] generateIdeas: genre=${params.genre}`);

        const result = await groqService.generateIdeas(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Improve content.
     * @param {Object} params - Same params as groqService.improve()
     * @returns {Promise<Object>}
     */
    async improveContent(params) {
        await this.initialize();
        logger.info(`[IQai] improveContent`);

        const result = await groqService.improve(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Generate a synopsis.
     * @param {Object} params - Same params as groqService.generateSynopsis()
     * @returns {Promise<Object>}
     */
    async generateSynopsis(params) {
        await this.initialize();
        logger.info(`[IQai] generateSynopsis`);

        const result = await groqService.generateSynopsis(params);
        return { ...result, agent: 'iqai-compat' };
    }

    /**
     * Run a task through the agent.
     * @param {Object} params - Input parameters for the task
     * @returns {Promise<string>} - The result content
     */
    async run(params) {
        await this.initialize();

        // Use ADK agent if available
        if (this.adkAgent && typeof this.adkAgent.invoke === 'function') {
            try {
                const response = await this.adkAgent.invoke({
                    tool: 'generate_story',
                    params: params
                });
                return response.content || response;
            } catch (err) {
                logger.warn(`[IQai] ADK run failed: ${err.message}, falling back to Gemini`);
            }
        }

        // Fallback to direct Gemini call via geminiService
        const prompt = `Task: Generate a story/content based on the following parameters:
Genre: ${params.genre || 'Not specified'}
Theme: ${params.theme || 'Not specified'}
Tone: ${params.tone || 'Not specified'}
Characters: ${params.characters || 'Not specified'}
Setting: ${params.setting || 'Not specified'}
Format: ${params.formatType || 'story'}
Length: ${params.length || 'medium'}
Additional Prompt: ${params.prompt || ''}

Please generate the content now.`;

        return await geminiService.generateContent({
            prompt,
            config: {
                temperature: params.temperature || 0.8,
                maxTokensPerResponse: params.maxTokens || 1200
            }
        });
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
            tools: Object.keys(this.tools),
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
    AGENT_TOOLS,
};
