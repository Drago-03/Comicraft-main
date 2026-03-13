/**
 * Supabase Client Configuration
 * 
 * Provides two clients:
 * 1. supabaseAdmin — uses SERVICE_ROLE_KEY for server-side admin operations (bypasses RLS)
 * 2. createUserClient(token) — creates a per-request client scoped to the user's JWT
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
    console.warn('[Supabase] SUPABASE_URL not set — Supabase features will be unavailable');
}

// Admin client — bypasses RLS, used for server-side operations
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

// Per-request client scoped to a user's JWT token
function createUserClient(accessToken) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: { Authorization: `Bearer ${accessToken}` },
        },
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Health check — verifies connectivity and measures latency
async function checkSupabaseHealth() {
    if (!supabaseAdmin) return { connected: false, latency_ms: null, note: 'Supabase env vars not set (SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL)' };
    const t0 = Date.now();
    try {
        const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
        const latency_ms = Date.now() - t0;
        // PGRST116 = row not found — still means DB is reachable
        if (error && error.code !== 'PGRST116') {
            return { connected: false, latency_ms: null, error: error.message, note: 'Supabase reachable but query failed' };
        }
        return { connected: true, latency_ms };
    } catch (err) {
        return { connected: false, latency_ms: null, error: err.message, note: 'Supabase connection failed' };
    }
}

module.exports = { supabaseAdmin, createUserClient, checkSupabaseHealth, SUPABASE_URL };
