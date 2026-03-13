/**
 * ElevenLabs Text-to-Speech Service
 *
 * Wraps the ElevenLabs REST API for high-quality text-to-speech generation.
 * API key is read exclusively from the ELEVENLABS_API_KEY environment variable.
 *
 * REST endpoint: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 *
 * Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
 */

const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_MODEL = 'eleven_multilingual_v2';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel – clear, warm narration voice
const DEFAULT_STABILITY = 0.5;
const DEFAULT_SIMILARITY_BOOST = 0.75;
const DEFAULT_STYLE = 0.0;
const DEFAULT_OUTPUT_FORMAT = 'mp3_44100_128'; // MP3, 44.1 kHz, 128 kbps
const MAX_CHARS_PER_REQUEST = 5000; // ElevenLabs supports up to ~5000 chars per request

/**
 * Curated selection of ElevenLabs voices suitable for story narration.
 * Each entry: { id, name, description, accent, gender, useCase }
 */
const ELEVENLABS_VOICES = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, clear narration', accent: 'American', gender: 'female', useCase: 'narration' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft, engaging storytelling', accent: 'American', gender: 'female', useCase: 'narration' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Well-rounded male voice', accent: 'American', gender: 'male', useCase: 'narration' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Crisp, confident male', accent: 'American', gender: 'male', useCase: 'narration' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, authoritative male', accent: 'American', gender: 'male', useCase: 'narration' },
    { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', description: 'Raspy, dynamic male', accent: 'American', gender: 'male', useCase: 'characters' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Young, enthusiastic female', accent: 'American', gender: 'female', useCase: 'characters' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Young, engaging male', accent: 'American', gender: 'male', useCase: 'narration' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Strong, commanding female', accent: 'American', gender: 'female', useCase: 'characters' },
    { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', description: 'Mature, contemplative female', accent: 'American', gender: 'female', useCase: 'narration' },
];

/** Supported ElevenLabs models */
const ELEVENLABS_MODELS = [
    'eleven_multilingual_v2',    // Best quality, multilingual
    'eleven_turbo_v2_5',         // Low-latency, near real-time
    'eleven_monolingual_v1',     // English only, classic
];

/** Supported output formats */
const ELEVENLABS_OUTPUT_FORMATS = [
    'mp3_22050_32',    // MP3 22.05 kHz 32 kbps (smallest)
    'mp3_44100_64',    // MP3 44.1 kHz 64 kbps
    'mp3_44100_96',    // MP3 44.1 kHz 96 kbps
    'mp3_44100_128',   // MP3 44.1 kHz 128 kbps (default)
    'mp3_44100_192',   // MP3 44.1 kHz 192 kbps
    'pcm_16000',       // Raw PCM 16 kHz
    'pcm_22050',       // Raw PCM 22.05 kHz
    'pcm_24000',       // Raw PCM 24 kHz
    'pcm_44100',       // Raw PCM 44.1 kHz
];

// ---------------------------------------------------------------------------
// Helper: chunk text at sentence boundaries ≤ MAX_CHARS_PER_REQUEST
// ---------------------------------------------------------------------------

/**
 * Splits `text` into an array of strings, each ≤ maxChars characters,
 * breaking at sentence/paragraph boundaries to preserve natural flow.
 *
 * @param {string} text
 * @param {number} [maxChars]
 * @returns {string[]}
 */
function chunkText(text, maxChars = MAX_CHARS_PER_REQUEST) {
    if (text.length <= maxChars) return [text];

    const chunks = [];
    // Split at sentence endings, then handle oversized sentences
    const sentences = text.replace(/([.!?])\s+/g, '$1\n').split('\n');
    let current = '';

    for (const sentence of sentences) {
        const candidate = current ? `${current} ${sentence}` : sentence;
        if (candidate.length <= maxChars) {
            current = candidate;
        } else {
            if (current) chunks.push(current.trim());
            // If a single sentence exceeds maxChars, split at word boundaries
            if (sentence.length > maxChars) {
                const words = sentence.split(' ');
                let wordChunk = '';
                for (const word of words) {
                    const c = wordChunk ? `${wordChunk} ${word}` : word;
                    if (c.length <= maxChars) {
                        wordChunk = c;
                    } else {
                        if (wordChunk) chunks.push(wordChunk.trim());
                        wordChunk = word;
                    }
                }
                current = wordChunk;
            } else {
                current = sentence;
            }
        }
    }
    if (current) chunks.push(current.trim());
    return chunks.filter(Boolean);
}

// ---------------------------------------------------------------------------
// Core TTS function
// ---------------------------------------------------------------------------

/**
 * Generates speech audio from text using ElevenLabs TTS.
 *
 * For texts longer than 5000 chars, the function automatically chunks
 * and concatenates the resulting audio buffers.
 *
 * @param {Object} params
 * @param {string}  params.text              - Text to synthesise
 * @param {string}  [params.voiceId]         - ElevenLabs voice ID (default: Rachel)
 * @param {string}  [params.modelId]         - Model ID (default: eleven_multilingual_v2)
 * @param {number}  [params.stability]       - Voice stability 0-1 (default: 0.5)
 * @param {number}  [params.similarityBoost] - Similarity boost 0-1 (default: 0.75)
 * @param {number}  [params.style]           - Style exaggeration 0-1 (default: 0.0)
 * @param {string}  [params.outputFormat]    - Audio format (default: mp3_44100_128)
 * @returns {Promise<{ audioBuffer: Buffer, mimeType: string }>}
 */
async function generateSpeech({
    text,
    voiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || DEFAULT_VOICE_ID,
    modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL,
    stability = DEFAULT_STABILITY,
    similarityBoost = DEFAULT_SIMILARITY_BOOST,
    style = DEFAULT_STYLE,
    outputFormat = DEFAULT_OUTPUT_FORMAT,
}) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is not set. Cannot call ElevenLabs TTS.');
    }

    // Validate inputs
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('text must be a non-empty string');
    }

    // Validate voice ID — check against known voices, or allow custom IDs
    const knownVoice = ELEVENLABS_VOICES.find(v => v.id === voiceId);
    if (!knownVoice) {
        logger.warn(`[ElevenLabs] Unknown voiceId "${voiceId}", proceeding anyway (may be a custom/cloned voice)`);
    }

    // Validate model
    if (!ELEVENLABS_MODELS.includes(modelId)) {
        logger.warn(`[ElevenLabs] Unrecognised modelId "${modelId}", falling back to "${DEFAULT_MODEL}"`);
        modelId = DEFAULT_MODEL;
    }

    // Validate output format
    if (!ELEVENLABS_OUTPUT_FORMATS.includes(outputFormat)) {
        logger.warn(`[ElevenLabs] Unsupported outputFormat "${outputFormat}", falling back to "${DEFAULT_OUTPUT_FORMAT}"`);
        outputFormat = DEFAULT_OUTPUT_FORMAT;
    }

    // Clamp numeric parameters
    stability = Math.min(1.0, Math.max(0.0, Number(stability) || DEFAULT_STABILITY));
    similarityBoost = Math.min(1.0, Math.max(0.0, Number(similarityBoost) || DEFAULT_SIMILARITY_BOOST));
    style = Math.min(1.0, Math.max(0.0, Number(style) || DEFAULT_STYLE));

    const chunks = chunkText(text.trim());
    logger.info(`[ElevenLabs] Generating speech: ${chunks.length} chunk(s), voice=${knownVoice?.name || voiceId}, model=${modelId}`);

    const audioBuffers = await Promise.all(
        chunks.map((chunk, idx) => _callElevenLabsAPI({
            chunk,
            voiceId,
            modelId,
            stability,
            similarityBoost,
            style,
            outputFormat,
            apiKey,
            idx,
        }))
    );

    // Concatenate all audio buffers
    const combined = Buffer.concat(audioBuffers);
    const mimeType = outputFormat.startsWith('pcm_') ? 'audio/pcm' : 'audio/mpeg';

    return { audioBuffer: combined, mimeType };
}

/**
 * Makes a single call to the ElevenLabs TTS endpoint.
 * @private
 */
async function _callElevenLabsAPI({
    chunk,
    voiceId,
    modelId,
    stability,
    similarityBoost,
    style,
    outputFormat,
    apiKey,
    idx = 0,
}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout (ElevenLabs can be slower for long text)

    const url = `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}?output_format=${outputFormat}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: chunk,
                model_id: modelId,
                voice_settings: {
                    stability,
                    similarity_boost: similarityBoost,
                    style,
                    use_speaker_boost: true,
                },
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errText = await response.text().catch(() => 'unknown error');
            throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
        }

        // ElevenLabs returns raw audio binary directly
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        clearTimeout(timeout);
        if (err.name === 'AbortError') {
            throw new Error(`ElevenLabs API request timed out (chunk ${idx + 1})`);
        }
        throw err;
    }
}

/**
 * Fetch available voices from ElevenLabs API.
 * Falls back to the built-in curated list if the API call fails.
 *
 * @returns {Promise<Array>}
 */
async function fetchVoices() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return ELEVENLABS_VOICES;
    }

    try {
        const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            logger.warn('[ElevenLabs] Failed to fetch voices from API, using built-in list');
            return ELEVENLABS_VOICES;
        }

        const data = await response.json();
        return (data.voices || []).map(v => ({
            id: v.voice_id,
            name: v.name,
            description: v.description || '',
            accent: v.labels?.accent || 'Unknown',
            gender: v.labels?.gender || 'Unknown',
            useCase: v.labels?.use_case || 'general',
        }));
    } catch (err) {
        logger.warn(`[ElevenLabs] Error fetching voices: ${err.message}`);
        return ELEVENLABS_VOICES;
    }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
    generateSpeech,
    fetchVoices,
    chunkText,
    ELEVENLABS_VOICES,
    ELEVENLABS_MODELS,
    ELEVENLABS_OUTPUT_FORMATS,
    DEFAULT_VOICE_ID,
    DEFAULT_MODEL,
    DEFAULT_OUTPUT_FORMAT,
    DEFAULT_STABILITY,
    DEFAULT_SIMILARITY_BOOST,
    MAX_CHARS_PER_REQUEST,
};
