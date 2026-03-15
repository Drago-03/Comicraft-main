/**
 * KavyaScript Poetry Engine Routes — /api/v1/ai/poetry
 *
 * Generate, render, and iterate poems with calligraphy-style visual output.
 * Supports haiku, sonnet, ghazal, free verse, spoken word, limerick, tanka, villanelle.
 */

const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const geminiService = require('../services/geminiService');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Poetry
 *     description: KavyaScript poetry engine — generation, rendering, iteration
 */

// ── Poetry form specs ───────────────────────────────────────────────────────

const POETRY_FORMS = {
  haiku: { name: 'Haiku', structure: '3 lines (5-7-5 syllables)', defaultStanzas: 1 },
  sonnet: { name: 'Sonnet', structure: '14 lines, iambic pentameter', defaultStanzas: 1 },
  ghazal: { name: 'Ghazal', structure: 'Couplets with radif and qafia', defaultStanzas: 5 },
  free_verse: { name: 'Free Verse', structure: 'No fixed form', defaultStanzas: 3 },
  spoken_word: { name: 'Spoken Word', structure: 'Performance poetry, rhythmic', defaultStanzas: 4 },
  limerick: { name: 'Limerick', structure: '5 lines (AABBA)', defaultStanzas: 1 },
  tanka: { name: 'Tanka', structure: '5 lines (5-7-5-7-7 syllables)', defaultStanzas: 1 },
  villanelle: { name: 'Villanelle', structure: '19 lines, 5 tercets + 1 quatrain', defaultStanzas: 1 },
};

const CALLIGRAPHY_STYLES = {
  modern: { font: 'sans-serif', weight: 300, letterSpacing: 2, color: '#1a1a2e', bg: '#f8f4ef' },
  classical: { font: 'serif', weight: 400, letterSpacing: 1, color: '#2c1810', bg: '#f5e6c8' },
  devanagari: { font: 'serif', weight: 400, letterSpacing: 1, color: '#8b0000', bg: '#fff8dc' },
  arabic: { font: 'serif', weight: 400, letterSpacing: 3, color: '#1a472a', bg: '#f0ead6' },
  brush: { font: 'serif', weight: 700, letterSpacing: 0, color: '#0a0a0a', bg: '#fefcf3' },
};

// ── POST /api/v1/ai/poetry/generate ─────────────────────────────────────────
/**
 * @swagger
 * /api/v1/ai/poetry/generate:
 *   post:
 *     tags: [Poetry]
 *     summary: Generate poetry with KavyaScript
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               form:
 *                 type: string
 *                 enum: [haiku, sonnet, ghazal, free_verse, spoken_word, limerick, tanka, villanelle]
 *                 default: free_verse
 *               theme:
 *                 type: string
 *                 example: "cosmic loneliness"
 *               mood:
 *                 type: string
 *                 example: "melancholic"
 *               language_style:
 *                 type: string
 *                 example: "contemporary"
 *               length:
 *                 type: integer
 *                 description: Number of stanzas
 *               rhyme_scheme:
 *                 type: string
 *                 example: "ABAB"
 *               calligraphy_style:
 *                 type: string
 *                 enum: [modern, classical, devanagari, arabic, brush]
 *     responses:
 *       200:
 *         description: Poem generated
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Generation failed
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      form = 'free_verse',
      theme = 'beauty',
      mood = 'contemplative',
      language_style = 'contemporary',
      length,
      rhyme_scheme,
      calligraphy_style = 'modern',
    } = req.body;

    const formSpec = POETRY_FORMS[form];
    if (!formSpec) {
      return res.status(400).json({
        error: `Invalid form. Must be one of: ${Object.keys(POETRY_FORMS).join(', ')}`,
      });
    }

    const stanzas = length || formSpec.defaultStanzas;

    const prompt = `You are KavyaScript, a master poetry engine. Generate a ${formSpec.name} poem.

Form: ${formSpec.name} (${formSpec.structure})
Theme: ${theme}
Mood: ${mood}
Language Style: ${language_style}
Number of stanzas: ${stanzas}
${rhyme_scheme ? `Rhyme scheme: ${rhyme_scheme}` : ''}

Rules:
- Follow the structural rules of ${formSpec.name} precisely
- Express the theme with vivid imagery and emotional depth
- Match the requested mood throughout
- Use the ${language_style} language style

Return ONLY the poem text, nothing else. Separate stanzas with blank lines.`;

    const poemText = await geminiService.generateContent({
      prompt,
      config: { temperature: 0.9, maxTokensPerResponse: 2000 },
    });

    return res.json({
      success: true,
      data: {
        poem: poemText.trim(),
        form,
        theme,
        mood,
        language_style,
        calligraphy_style,
        stanzas,
        generatedAt: new Date().toISOString(),
        engine: 'KavyaScript',
      },
    });
  } catch (error) {
    logger.error('Poetry generate error', { component: 'poetry', error: error.message });
    return res.status(500).json({ error: 'Poetry generation failed' });
  }
});

// ── POST /api/v1/ai/poetry/render ───────────────────────────────────────────
/**
 * @swagger
 * /api/v1/ai/poetry/render:
 *   post:
 *     tags: [Poetry]
 *     summary: Render poem as calligraphy image
 *     description: Takes generated poem text and calligraphy style, returns PNG image suitable for NFT minting.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [poem]
 *             properties:
 *               poem:
 *                 type: string
 *               calligraphy_style:
 *                 type: string
 *                 enum: [modern, classical, devanagari, arabic, brush]
 *                 default: modern
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rendered image (PNG)
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/render', async (req, res) => {
  try {
    const { poem, calligraphy_style = 'modern', title, author } = req.body;

    if (!poem) {
      return res.status(400).json({ error: 'poem text is required' });
    }

    const style = CALLIGRAPHY_STYLES[calligraphy_style] || CALLIGRAPHY_STYLES.modern;
    const lines = poem.split('\n');
    const lineHeight = 36;
    const padding = 60;
    const titleHeight = title ? 60 : 0;
    const authorHeight = author ? 40 : 0;
    const height = Math.max(400, padding * 2 + titleHeight + (lines.length * lineHeight) + authorHeight + 40);
    const width = 800;

    // Build SVG for the calligraphy rendering
    const escapeSvg = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${style.bg}" />
      <style>
        .title { font: bold 28px ${style.font}; fill: ${style.color}; letter-spacing: ${style.letterSpacing}px; }
        .line { font: ${style.weight} 18px ${style.font}; fill: ${style.color}; letter-spacing: ${style.letterSpacing}px; }
        .author { font: italic 16px ${style.font}; fill: ${style.color}; opacity: 0.7; }
        .border { fill: none; stroke: ${style.color}; stroke-width: 2; opacity: 0.3; }
      </style>
      <rect class="border" x="20" y="20" width="${width - 40}" height="${height - 40}" rx="4" />`;

    let y = padding;

    if (title) {
      svgContent += `<text class="title" x="${width / 2}" y="${y}" text-anchor="middle">${escapeSvg(title)}</text>`;
      y += titleHeight;
    }

    for (const line of lines) {
      svgContent += `<text class="line" x="${padding}" y="${y}">${escapeSvg(line)}</text>`;
      y += lineHeight;
    }

    if (author) {
      y += 20;
      svgContent += `<text class="author" x="${width - padding}" y="${y}" text-anchor="end">— ${escapeSvg(author)}</text>`;
    }

    svgContent += '</svg>';

    // Convert SVG to PNG using sharp (lazy loaded to prevent startup crashes on Render)
    let pngBuffer;
    try {
      const sharp = require('sharp');
      pngBuffer = await sharp(Buffer.from(svgContent))
        .png({ quality: 95 })
        .toBuffer();
    } catch (e) {
      logger.error('sharp module is not installed or failed to load. Please run npm install sharp.', { error: e.message });
      return res.status(500).json({ error: 'Image processing library missing on server.' });
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="poem-${Date.now()}.png"`);
    return res.send(pngBuffer);
  } catch (error) {
    logger.error('Poetry render error', { component: 'poetry', error: error.message });
    return res.status(500).json({ error: 'Poetry rendering failed' });
  }
});

// ── POST /api/v1/ai/poetry/iterate ──────────────────────────────────────────
/**
 * @swagger
 * /api/v1/ai/poetry/iterate:
 *   post:
 *     tags: [Poetry]
 *     summary: Iterate on existing poem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [poem, instructions]
 *             properties:
 *               poem:
 *                 type: string
 *               instructions:
 *                 type: string
 *                 example: "Make the ending more hopeful"
 *               form:
 *                 type: string
 *     responses:
 *       200:
 *         description: Revised poem
 */
router.post('/iterate', async (req, res) => {
  try {
    const { poem, instructions, form } = req.body;

    if (!poem || !instructions) {
      return res.status(400).json({ error: 'poem and instructions are required' });
    }

    const formInfo = form ? POETRY_FORMS[form] : null;
    const prompt = `You are KavyaScript, a master poetry editor. Revise the following poem according to the instructions.
${formInfo ? `\nThe poem is a ${formInfo.name} (${formInfo.structure}). Maintain the form.` : ''}

Original poem:
${poem}

Revision instructions: ${instructions}

Return ONLY the revised poem text, nothing else.`;

    const revisedPoem = await geminiService.generateContent({
      prompt,
      config: { temperature: 0.7, maxTokensPerResponse: 2000 },
    });

    return res.json({
      success: true,
      data: {
        original: poem,
        revised: revisedPoem.trim(),
        instructions,
        iteratedAt: new Date().toISOString(),
        engine: 'KavyaScript',
      },
    });
  } catch (error) {
    logger.error('Poetry iterate error', { component: 'poetry', error: error.message });
    return res.status(500).json({ error: 'Poetry iteration failed' });
  }
});

// ── POST /api/v1/ai/poetry/tts ─────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/ai/poetry/tts:
 *   post:
 *     tags: [Poetry]
 *     summary: Generate Text-to-Speech audio for a poem
 *     description: Converts the poem text to high-quality audio using ElevenLabs TTS.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [poem]
 *             properties:
 *               poem:
 *                 type: string
 *               voiceId:
 *                 type: string
 *                 description: ElevenLabs voice ID
 *     responses:
 *       200:
 *         description: Audio generated successfully
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post('/tts', async (req, res) => {
  try {
    const { poem, voiceId } = req.body;

    if (!poem) {
      return res.status(400).json({ error: 'poem text is required' });
    }

    try {
      const elevenlabsService = require('../services/elevenlabsService');
      
      // We stream the audio directly back to the client
      const audioBuffer = await elevenlabsService.generateSpeech({
        text: poem,
        voiceId: voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID,
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="poem-tts-${Date.now()}.mp3"`);
      return res.send(audioBuffer);
    } catch (e) {
      logger.error('ElevenLabs TTS error in KavyaScript', { error: e.message });
      return res.status(500).json({ error: 'Failed to generate audio via ElevenLabs.' });
    }
  } catch (error) {
    logger.error('Poetry TTS error', { component: 'poetry', error: error.message });
    return res.status(500).json({ error: 'Poetry TTS generation failed' });
  }
});

module.exports = router;
