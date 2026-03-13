/**
 * AI API Routes — Live Groq Integration
 * Handles AI-powered story generation, analysis, and enhancement
 */

const express = require('express');
const router = express.Router();
// const groqService = require('../services/groqService'); // DEPRECATED - Migrated to Gemini 3
const geminiService = require('../services/geminiService');

/**
 * @swagger
 * /api/v1/ai/generate:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate content with AI
 *     description: |
 *       Uses Groq AI to generate story content, comic scripts, novel chapters,
 *       or other creative text based on a prompt and parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "Write a sci-fi opening paragraph about Mars colonization"
 *               model:
 *                 type: string
 *                 default: llama-3.3-70b-versatile
 *               formatType:
 *                 type: string
 *                 enum: [story, comic, novel, storybook]
 *                 default: story
 *               parameters:
 *                 type: object
 *                 properties:
 *                   temperature:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 1
 *                     default: 0.8
 *                   maxTokens:
 *                     type: integer
 *                     default: 1200
 *                   genre:
 *                     type: string
 *                   theme:
 *                     type: string
 *                   length:
 *                     type: string
 *                     enum: [short, medium, long]
 *                   tone:
 *                     type: string
 *                   characters:
 *                     type: string
 *                   setting:
 *                     type: string
 *     responses:
 *       200:
 *         description: Content generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                 model:
 *                   type: string
 *                 tokensUsed:
 *                   type: object
 *                   properties:
 *                     prompt:
 *                       type: integer
 *                     completion:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing required prompt.
 *       500:
 *         description: AI generation failed.
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, model, formatType, parameters = {} } = req.body;

    if (!prompt && !parameters.theme) {
      return res.status(400).json({ error: 'prompt or parameters.theme is required' });
    }

    // Build prompt with parameters - delegate to Gemini
    let fullPrompt = prompt || '';
    if (parameters.theme) fullPrompt += `\nTheme: ${parameters.theme}`;
    if (parameters.genre) fullPrompt += `\nGenre: ${parameters.genre}`;
    if (parameters.length) fullPrompt += `\nLength: ${parameters.length}`;
    if (parameters.tone) fullPrompt += `\nTone: ${parameters.tone}`;
    if (parameters.characters) fullPrompt += `\nCharacters: ${parameters.characters}`;
    if (parameters.setting) fullPrompt += `\nSetting: ${parameters.setting}`;
    if (formatType) fullPrompt += `\nFormat: ${formatType}`;

    const content = await geminiService.generateContent({
      prompt: fullPrompt,
      config: {
        temperature: parameters.temperature || 0.8,
        maxTokensPerResponse: parameters.maxTokens || 1200,
      },
    });

    res.json({
      content,
      model: model || 'gemini-2.5-pro',
      tokensUsed: { total: 0 }, // Gemini doesn't return token counts in the same way
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI generate error:', error);
    res.status(500).json({ error: error.message || 'AI generation failed' });
  }
});

/**
 * @swagger
 * /api/v1/ai/analyze:
 *   post:
 *     tags:
 *       - AI
 *     summary: Analyze content with AI
 *     description: |
 *       Performs AI-powered analysis on text content, returning structured JSON
 *       with sentiment, themes, genres, readability score, word count, and complexity.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "The spaceship drifted silently through the asteroid belt..."
 *               analysisType:
 *                 type: string
 *                 enum: [general, sentiment, themes, readability]
 *                 default: general
 *     responses:
 *       200:
 *         description: Analysis completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     sentiment:
 *                       type: string
 *                     themes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     complexity:
 *                       type: string
 *                     readabilityScore:
 *                       type: number
 *                     wordCount:
 *                       type: integer
 *                     estimatedReadingTime:
 *                       type: number
 *                 tokensUsed:
 *                   type: object
 *                 analyzedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Missing required content.
 *       500:
 *         description: Analysis failed.
 */
router.post('/analyze', async (req, res) => {
  try {
    const { content, analysisType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    // Build analysis prompt - delegate to Gemini
    const analysisPrompt = `Analyze the following content and provide a ${analysisType || 'general'} analysis.
Return structured JSON with: sentiment, themes (array), complexity, readabilityScore (number), wordCount, estimatedReadingTime (minutes).

Content:
${content}

Return JSON ONLY (no markdown):`;

    const response = await geminiService.generateContent({
      prompt: analysisPrompt,
      config: {
        temperature: 0.3,
        maxTokensPerResponse: 500,
      },
    });

    // Try to parse JSON response
    let results;
    try {
      results = JSON.parse(response);
    } catch {
      // If not valid JSON, return raw response
      results = { analysis: response };
    }

    res.json({
      type: analysisType || 'general',
      results,
      tokensUsed: { total: 0 },
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

module.exports = router;
