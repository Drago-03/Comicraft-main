'use client';

/**
 * TTS Hook — Eleven Labs Integration
 *
 * Replaced Bulbul (Sarvam AI) with Eleven Labs for high-quality narration.
 * Falls back to existing cached audio from the `/api/tts/audio` endpoint.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Eleven Labs Voices ───
export const ELEVENLABS_VOICES = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', accent: 'British' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', accent: 'American' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', accent: 'British' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', accent: 'British' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', accent: 'American' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', accent: 'British' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', accent: 'Scottish' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', accent: 'American' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', accent: 'American' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', accent: 'American' },
];

export const ELEVENLABS_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'pt', label: 'Português' },
];

// Legacy exports for backward compatibility
export const BULBUL_SPEAKERS = ELEVENLABS_VOICES.map(v => v.name);
export const BULBUL_LANGUAGES = ELEVENLABS_LANGUAGES.map(l => ({ code: l.code, label: l.label }));

export interface TTSOptions {
    storyId: string;
    chapterIndex?: number;
    text: string;
    speaker?: string;
    languageCode?: string;
    pace?: number;
}

interface TTSState {
    audioUrl: string | null;
    isPlaying: boolean;
    isGenerating: boolean;
    isLoading: boolean;
    currentTime: number;
    duration: number;
    speaker: string;
    voiceId: string;
    languageCode: string;
    pace: number;
    error: string | null;
}

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function useTTS(storyId: string, chapterIndex = 0, defaultSpeaker = 'George', defaultLang = 'en') {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const defaultVoice = ELEVENLABS_VOICES.find(v => v.name === defaultSpeaker) ?? ELEVENLABS_VOICES[0];

    const [state, setState] = useState<TTSState>({
        audioUrl: null,
        isPlaying: false,
        isGenerating: false,
        isLoading: false,
        currentTime: 0,
        duration: 0,
        speaker: defaultSpeaker,
        voiceId: defaultVoice.id,
        languageCode: defaultLang,
        pace: 1,
        error: null,
    });

    // Fetch existing audio on mount/param change
    useEffect(() => {
        if (!storyId) return;
        let cancelled = false;

        async function fetchExisting() {
            setState(prev => ({ ...prev, isLoading: true, audioUrl: null, error: null }));
            try {
                const params = new URLSearchParams({
                    storyId,
                    chapterIndex: String(chapterIndex),
                    speaker: state.speaker,
                    languageCode: state.languageCode,
                });
                const res = await fetch(`/api/tts/audio?${params}`);
                if (!cancelled && res.ok) {
                    const data = await res.json();
                    setState(prev => ({
                        ...prev,
                        audioUrl: data.audioUrl || null,
                        isLoading: false,
                    }));
                } else if (!cancelled) {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch {
                if (!cancelled) setState(prev => ({ ...prev, isLoading: false }));
            }
        }
        fetchExisting();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storyId, chapterIndex, state.speaker, state.languageCode]);

    // Sync audio element when audioUrl changes
    useEffect(() => {
        if (!state.audioUrl) return;
        const audio = audioRef.current || new Audio();
        audioRef.current = audio;
        audio.src = state.audioUrl;
        audio.playbackRate = state.pace;

        const onTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime }));
        const onDurationChange = () => setState(prev => ({ ...prev, duration: audio.duration || 0 }));
        const onEnded = () => setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
        const onError = () => setState(prev => ({ ...prev, error: 'Audio playback error', isPlaying: false }));

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('durationchange', onDurationChange);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.pause();
            audio.currentTime = 0;
            audio.src = '';
            if (audioRef.current === audio) {
                audioRef.current = null;
            }
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('durationchange', onDurationChange);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    }, [state.audioUrl, state.pace]);

    const play = useCallback(() => {
        if (!audioRef.current || !state.audioUrl) return;
        audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
    }, [state.audioUrl]);

    const pause = useCallback(() => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
    }, []);

    const seek = useCallback((time: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = time;
        setState(prev => ({ ...prev, currentTime: time }));
    }, []);

    const setSpeed = useCallback((speed: number) => {
        if (audioRef.current) audioRef.current.playbackRate = speed;
        setState(prev => ({ ...prev, pace: speed }));
    }, []);

    const setSpeaker = useCallback((speaker: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
            audioRef.current = null;
        }
        const voice = ELEVENLABS_VOICES.find(v => v.name === speaker) ?? ELEVENLABS_VOICES[0];
        setState(prev => ({ ...prev, speaker, voiceId: voice.id, audioUrl: null, isPlaying: false }));
    }, []);

    const setLanguage = useCallback((languageCode: string) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = '';
            audioRef.current = null;
        }
        setState(prev => ({ ...prev, languageCode, audioUrl: null, isPlaying: false }));
    }, []);

    /**
     * Generate audio using Eleven Labs API via our backend endpoint.
     * The API route handles the actual Eleven Labs API call and returns an audio URL.
     */
    const generateAudio = useCallback(async (text: string, token?: string) => {
        if (!text || !storyId) return;
        setState(prev => ({ ...prev, isGenerating: true, error: null }));
        try {
            const res = await fetch(`/api/tts/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    storyId,
                    chapterIndex,
                    text,
                    voiceId: state.voiceId,
                    speaker: state.speaker,
                    languageCode: state.languageCode,
                    pace: state.pace,
                    provider: 'elevenlabs',
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setState(prev => ({
                    ...prev,
                    isGenerating: false,
                    error: data.error || 'Failed to generate audio',
                }));
                return;
            }
            setState(prev => ({
                ...prev,
                audioUrl: data.audioUrl,
                isGenerating: false,
                error: null,
            }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                isGenerating: false,
                error: 'Audio generation failed. Check your connection.',
            }));
        }
    }, [storyId, chapterIndex, state.voiceId, state.speaker, state.languageCode, state.pace]);

    return {
        ...state,
        audioRef,
        play,
        pause,
        seek,
        setSpeed,
        setSpeaker,
        setLanguage,
        generateAudio,
        SPEEDS,
        ELEVENLABS_VOICES,
        ELEVENLABS_LANGUAGES,
        // Legacy compatibility
        BULBUL_SPEAKERS,
        BULBUL_LANGUAGES,
    };
}
