/**
 * TTS Routes – ElevenLabs Text-to-Speech
 *
 * POST /api/v1/tts/generate   Generate (or reuse cached) narration audio for a story/chapter
 * GET  /api/v1/tts/audio      Fetch existing audio metadata for a story/chapter
 * GET  /api/v1/tts/speakers   List available voices
 *
 * NOTE: Sarvam AI Bulbul v3 (bulbulService) is still in the codebase but no longer
 *       actively used by this route. ElevenLabs is now the primary TTS provider.
 */

const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { supabaseAdmin } = require('../config/supabase');
const elevenlabsService = require('../services/elevenlabsService');
const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Helper: upload audio buffer to Supabase Storage
// ---------------------------------------------------------------------------
async function uploadAudioToSupabase({ audioBuffer, storyId, chapterIndex, voiceId, mimeType }) {
    if (!supabaseAdmin) throw new Error('Supabase not configured');

    const bucket = 'tts-audio';
    const ext = mimeType === 'audio/mpeg' ? 'mp3' : 'wav';
    const filePath = `stories/${storyId}/chapters/${chapterIndex}/elevenlabs-${voiceId}.${ext}`;

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
async function upsertAudioRecord({ storyId, chapterIndex, audioUrl, voiceId, modelId }) {
    if (!supabaseAdmin) throw new Error('Supabase not configured');

    const { error } = await supabaseAdmin.from('story_audio').upsert(
        {
            story_id: storyId,
            chapter_index: chapterIndex,
            audio_url: audioUrl,
            speaker: voiceId,            // Reuse the speaker column for ElevenLabs voice ID
            language_code: 'multilingual', // ElevenLabs multilingual model
            pace: 1.0,                   // Not applicable to ElevenLabs, kept for schema compat
            sample_rate: 44100,          // Default MP3 sample rate
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
 *     summary: Generate narration audio using ElevenLabs
 *     description: |
 *       Converts story/chapter text to speech using ElevenLabs TTS.
 *       If audio already exists for the same story + chapter + voice,
 *       the cached URL is returned immediately without calling the TTS API.
 *       For texts longer than 5000 chars, the service automatically chunks and concatenates.
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
 *               voiceId:
 *                 type: string
 *                 default: 21m00Tcm4TlvDq8ikWAM
 *                 description: ElevenLabs voice ID (default Rachel)
 *               modelId:
 *                 type: string
 *                 default: eleven_multilingual_v2
 *                 description: ElevenLabs model to use
 *               stability:
 *                 type: number
 *                 default: 0.5
 *                 minimum: 0
 *                 maximum: 1
 *               similarityBoost:
 *                 type: number
 *                 default: 0.75
 *                 minimum: 0
 *                 maximum: 1
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
 *                 voiceId:
 *                   type: string
 *                 modelId:
 *                   type: string
 *                 provider:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: TTS service unavailable (missing ELEVENLABS_API_KEY)
 */
router.post('/generate', authRequired, async (req, res) => {
    const {
        storyId,
        chapterIndex = 0,
        text,
        voiceId = elevenlabsService.DEFAULT_VOICE_ID,
        modelId = elevenlabsService.DEFAULT_MODEL,
        stability = elevenlabsService.DEFAULT_STABILITY,
        similarityBoost = elevenlabsService.DEFAULT_SIMILARITY_BOOST,
        // Backward compatibility: map old bulbul params to ElevenLabs
        speaker,         // Old param — map to voiceId if present
        languageCode,    // Old param — ignored (ElevenLabs is multilingual)
        pace,            // Old param — ignored (ElevenLabs doesn't have pace)
        forceRegenerate = false,
    } = req.body;

    // Handle backward compatibility: if old 'speaker' param is sent, use default voice
    const effectiveVoiceId = voiceId || elevenlabsService.DEFAULT_VOICE_ID;

    // --- Validate required fields ---
    if (!storyId) {
        return res.status(400).json({ error: 'storyId is required', code: 'VALIDATION_ERROR' });
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'text must be a non-empty string', code: 'VALIDATION_ERROR' });
    }

    // --- Check if ELEVENLABS_API_KEY is configured ---
    if (!process.env.ELEVENLABS_API_KEY) {
        return res.status(503).json({
            error: 'Text-to-speech service is not configured. ELEVENLABS_API_KEY is missing.',
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
            .eq('speaker', effectiveVoiceId)
            .eq('language_code', 'multilingual')
            .maybeSingle();

        if (existing?.audio_url) {
            return res.json({
                audioUrl: existing.audio_url,
                cached: true,
                voiceId: effectiveVoiceId,
                modelId,
                provider: 'elevenlabs',
            });
        }
    }

    // --- Generate audio using ElevenLabs ---
    try {
        logger.info(`[TTS] Generating audio for story=${storyId} chapter=${chapterIndex} voice=${effectiveVoiceId}`);

        const { audioBuffer, mimeType } = await elevenlabsService.generateSpeech({
            text: text.trim(),
            voiceId: effectiveVoiceId,
            modelId,
            stability,
            similarityBoost,
        });

        // --- Upload to Supabase Storage ---
        const audioUrl = await uploadAudioToSupabase({
            audioBuffer,
            storyId,
            chapterIndex,
            voiceId: effectiveVoiceId,
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
            voiceId: effectiveVoiceId,
            modelId,
        });

        logger.info(`[TTS] Audio ready: ${audioUrl}`);

        return res.json({
            audioUrl,
            cached: false,
            voiceId: effectiveVoiceId,
            modelId,
            provider: 'elevenlabs',
        });
    } catch (err) {
        logger.error('[TTS] Generation error:', err.message);

        if (err.message.includes('ELEVENLABS_API_KEY')) {
            return res.status(503).json({ error: err.message, code: 'TTS_NOT_CONFIGURED' });
        }
        if (err.message.includes('timed out')) {
            return res.status(504).json({ error: 'TTS service timed out. Please try again.', code: 'TTS_TIMEOUT' });
        }
        if (err.message.includes('ElevenLabs API error')) {
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
 *         name: voiceId
 *         schema:
 *           type: string
 *           default: 21m00Tcm4TlvDq8ikWAM
 *     responses:
 *       200:
 *         description: Audio record found or null
 */
router.get('/audio', async (req, res) => {
    const {
        storyId,
        chapterIndex = 0,
        voiceId = elevenlabsService.DEFAULT_VOICE_ID,
        // Backward compat: accept old param names
        speaker,
        languageCode,
    } = req.query;

    const effectiveVoiceId = voiceId || speaker || elevenlabsService.DEFAULT_VOICE_ID;

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
        .eq('speaker', effectiveVoiceId)
        .maybeSingle();

    if (error) {
        logger.warn('[TTS] Failed to fetch audio record:', error.message);
        return res.json({ audioUrl: null });
    }

    return res.json({
        audioUrl: data?.audio_url || null,
        voiceId: data?.speaker || null,
        modelId: data?.language_code || null,
        provider: 'elevenlabs',
        updatedAt: data?.updated_at || null,
    });
});

// ---------------------------------------------------------------------------
// GET /api/v1/tts/speakers  – list all valid voices
// ---------------------------------------------------------------------------
router.get('/speakers', async (req, res) => {
    try {
        const voices = await elevenlabsService.fetchVoices();
        res.json({
            provider: 'elevenlabs',
            voices,
            defaultVoiceId: elevenlabsService.DEFAULT_VOICE_ID,
            models: elevenlabsService.ELEVENLABS_MODELS,
            defaultModel: elevenlabsService.DEFAULT_MODEL,
            formats: elevenlabsService.ELEVENLABS_OUTPUT_FORMATS,
            defaultFormat: elevenlabsService.DEFAULT_OUTPUT_FORMAT,
        });
    } catch (err) {
        logger.error('[TTS] Error fetching voices:', err.message);
        res.json({
            provider: 'elevenlabs',
            voices: elevenlabsService.ELEVENLABS_VOICES,
            defaultVoiceId: elevenlabsService.DEFAULT_VOICE_ID,
            models: elevenlabsService.ELEVENLABS_MODELS,
            defaultModel: elevenlabsService.DEFAULT_MODEL,
        });
    }
});

module.exports = router;
