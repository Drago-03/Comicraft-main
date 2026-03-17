/**
 * TTS Routes – Sarvam AI Bulbul v3 Text-to-Speech
 *
 * POST /api/v1/tts/generate   Generate (or reuse cached) narration audio for a story/chapter
 * GET  /api/v1/tts/audio      Fetch existing audio metadata for a story/chapter
 * GET  /api/v1/tts/speakers   List available speakers
 */

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const bulbulService = require('../services/bulbulService');
const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Helper: upload audio buffer to Supabase Storage
// ---------------------------------------------------------------------------
async function uploadAudioToSupabase({ audioBuffer, storyId, chapterIndex, voiceId, mimeType }) {
    if (!supabaseAdmin) throw new Error('Supabase not configured');

    const bucket = 'tts-audio';
    const ext = mimeType === 'audio/wav' ? 'wav' : 'mp3';
    const filePath = `stories/${storyId}/chapters/${chapterIndex}/bulbul-${voiceId}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, audioBuffer, {
            contentType: mimeType,
            upsert: true,
        });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    return urlData?.publicUrl || null;
}

// ---------------------------------------------------------------------------
// Helper: upsert audio record in story_audio table
// ---------------------------------------------------------------------------
async function upsertAudioRecord({ storyId, chapterIndex, audioUrl, speaker, languageCode, pace }) {
    if (!supabaseAdmin) throw new Error('Supabase not configured');

    const { error } = await supabaseAdmin.from('story_audio').upsert(
        {
            story_id: storyId,
            chapter_index: chapterIndex,
            audio_url: audioUrl,
            speaker,
            language_code: languageCode,
            pace,
            sample_rate: bulbulService.DEFAULT_SAMPLE_RATE,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'story_id,chapter_index,speaker,language_code' }
    );

    if (error) logger.warn('[TTS] Failed to upsert story_audio record:', error.message);
}

// ---------------------------------------------------------------------------
// POST /api/v1/tts/generate
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/tts/generate:
 *   post:
 *     tags:
 *       - TTS
 *     summary: Generate narration audio using Sarvam AI Bulbul v3
 *     description: |
 *       Converts story/chapter text to speech using Bulbul v3.
 *       If audio already exists for the same story + chapter + speaker + language,
 *       the cached URL is returned immediately without calling the TTS API.
 *       For texts longer than 2500 chars, the service automatically chunks and concatenates.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storyId
 *               - text
 *             properties:
 *               storyId:
 *                 type: string
 *                 description: UUID of the story
 *               chapterIndex:
 *                 type: integer
 *                 default: 0
 *                 description: Chapter index (0-based)
 *               text:
 *                 type: string
 *                 description: Text to narrate (chunked automatically if >5000 chars)
 *               speaker:
 *                 type: string
 *                 default: Shubh
 *                 description: Bulbul v3 speaker name
 *               languageCode:
 *                 type: string
 *                 default: en-IN
 *                 description: BCP-47 language code supported by Bulbul v3
 *               pace:
 *                 type: number
 *                 default: 1.0
 *                 minimum: 0.5
 *                 maximum: 2.0
 *                 description: Speech rate
 *               forceRegenerate:
 *                 type: boolean
 *                 default: false
 *                 description: Force regeneration even if cached audio exists
 *     responses:
 *       200:
 *         description: Audio generated or retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 audioUrl:
 *                   type: string
 *                 cached:
 *                   type: boolean
 *                 speaker:
 *                   type: string
 *                 languageCode:
 *                   type: string
 *                 provider:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: TTS service unavailable (missing SARVAM_API_KEY)
 */
router.post('/generate', authRequired, async (req, res) => {
    const {
        storyId,
        chapterIndex = 0,
        text,
        speaker = bulbulService.DEFAULT_SPEAKER,
        languageCode = bulbulService.DEFAULT_LANGUAGE,
        pace = bulbulService.DEFAULT_PACE,
        forceRegenerate = false,
    } = req.body;

    // --- Validate required fields ---
    if (!storyId) {
        return res.status(400).json({ error: 'storyId is required', code: 'VALIDATION_ERROR' });
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'text must be a non-empty string', code: 'VALIDATION_ERROR' });
    }

    // --- Check if SARVAM_API_KEY is configured ---
    if (!process.env.SARVAM_API_KEY) {
        return res.status(503).json({
            error: 'Text-to-speech service is not configured. SARVAM_API_KEY is missing.',
            code: 'TTS_NOT_CONFIGURED',
        });
    }

    // --- Cache check (skip if forceRegenerate) ---
    if (!forceRegenerate && supabaseAdmin) {
        const { data: existing } = await supabaseAdmin
            .from('story_audio')
            .select('audio_url, pace, sample_rate')
            .eq('story_id', storyId)
            .eq('chapter_index', chapterIndex)
            .eq('speaker', speaker)
            .eq('language_code', languageCode)
            .maybeSingle();

        if (existing?.audio_url) {
            return res.json({
                audioUrl: existing.audio_url,
                cached: true,
                speaker,
                languageCode,
                provider: 'bulbul',
            });
        }
    }

    // --- Generate audio using Bulbul v3 ---
    try {
        logger.info(`[TTS] Generating audio for story=${storyId} chapter=${chapterIndex} speaker=${speaker} lang=${languageCode}`);

        const { audioBuffer, mimeType } = await bulbulService.generateSpeech({
            text: text.trim(),
            speaker,
            languageCode,
            pace,
        });

        // --- Upload to Supabase Storage ---
        const audioUrl = await uploadAudioToSupabase({
            audioBuffer,
            storyId,
            chapterIndex,
            voiceId: speaker,
            mimeType,
        });

        if (!audioUrl) {
            return res.status(500).json({ error: 'Failed to get public URL after upload', code: 'STORAGE_ERROR' });
        }

        // --- Persist metadata ---
        await upsertAudioRecord({
            storyId,
            chapterIndex,
            audioUrl,
            speaker,
            languageCode,
            pace,
        });

        logger.info(`[TTS] Audio ready: ${audioUrl}`);

        return res.json({
            audioUrl,
            cached: false,
            speaker,
            languageCode,
            provider: 'bulbul',
        });
    } catch (err) {
        logger.error('[TTS] Generation error:', err.message);

        if (err.message.includes('SARVAM_API_KEY')) {
            return res.status(503).json({ error: err.message, code: 'TTS_NOT_CONFIGURED' });
        }
        if (err.message.includes('timed out')) {
            return res.status(504).json({ error: 'TTS service timed out. Please try again.', code: 'TTS_TIMEOUT' });
        }
        if (err.message.includes('Sarvam API error')) {
            return res.status(502).json({ error: err.message, code: 'TTS_API_ERROR' });
        }

        return res.status(500).json({ error: 'Audio generation failed', code: 'TTS_ERROR' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/v1/tts/audio  – fetch existing audio record (no auth needed)
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/v1/tts/audio:
 *   get:
 *     tags:
 *       - TTS
 *     summary: Get existing audio metadata for a story chapter
 *     parameters:
 *       - in: query
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: chapterIndex
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: speaker
 *         schema:
 *           type: string
 *           default: Shubh
 *       - in: query
 *         name: languageCode
 *         schema:
 *           type: string
 *           default: en-IN
 *     responses:
 *       200:
 *         description: Audio record found or null
 */
router.get('/audio', async (req, res) => {
    const {
        storyId,
        chapterIndex = 0,
        speaker = bulbulService.DEFAULT_SPEAKER,
        languageCode = bulbulService.DEFAULT_LANGUAGE,
    } = req.query;

    if (!storyId) {
        return res.status(400).json({ error: 'storyId query param is required', code: 'VALIDATION_ERROR' });
    }

    if (!supabaseAdmin) {
        return res.json({ audioUrl: null });
    }

    const { data, error } = await supabaseAdmin
        .from('story_audio')
        .select('audio_url, speaker, language_code, pace, sample_rate, updated_at')
        .eq('story_id', storyId)
        .eq('chapter_index', Number(chapterIndex))
        .eq('speaker', speaker)
        .eq('language_code', languageCode)
        .maybeSingle();

    if (error) {
        logger.warn('[TTS] Failed to fetch audio record:', error.message);
        return res.json({ audioUrl: null });
    }

    return res.json({
        audioUrl: data?.audio_url || null,
        speaker: data?.speaker || null,
        languageCode: data?.language_code || null,
        provider: 'bulbul',
        updatedAt: data?.updated_at || null,
    });
});

// ---------------------------------------------------------------------------
// GET /api/v1/tts/speakers  – list all valid voices
// ---------------------------------------------------------------------------
router.get('/speakers', async (req, res) => {
    res.json({
        provider: 'bulbul',
        speakers: bulbulService.BULBUL_SPEAKERS,
        defaultSpeaker: bulbulService.DEFAULT_SPEAKER,
        languages: bulbulService.BULBUL_LANGUAGES,
        defaultLanguage: bulbulService.DEFAULT_LANGUAGE,
        model: 'bulbul:v3',
    });
});

module.exports = router;
