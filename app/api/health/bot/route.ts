import { NextResponse } from 'next/server';

/**
 * GET /api/health/bot
 *
 * Proxies the bot health check from the server side so the browser never
 * needs to make a cross-origin request to the Render backend.
 *
 * If the backend is unreachable (sleeping free-tier Render instance, etc.)
 * we return a safe 200 "ok" response so the MADHAVA help bot stays "Online"
 * — degraded-backend status is not a reason to disable the client-side bot.
 */
export const dynamic = 'force-dynamic';

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';

export async function GET() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout

        const res = await fetch(`${BACKEND_URL}/api/health/bot`, {
            cache: 'no-store',
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data);
        }

        // Backend returned an error status — treat as degraded (not down)
        return NextResponse.json({ status: 'degraded', source: 'proxy-fallback' });
    } catch {
        // Backend is unreachable — return ok so the bot stays usable
        return NextResponse.json({ status: 'ok', source: 'offline-fallback' });
    }
}
