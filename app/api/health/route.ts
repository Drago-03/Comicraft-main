import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Server-side proxy for the backend health check. The browser calls this
 * same-origin endpoint; Next.js fetches the Render backend from the server,
 * eliminating any CORS concern.
 *
 * Falls back to a "degraded" response if the backend is unreachable so the
 * footer status indicator still renders gracefully.
 */
export const dynamic = 'force-dynamic';

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || 'https://comicraft-main.onrender.com';

export async function GET() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout

        const res = await fetch(`${BACKEND_URL}/api/health`, {
            cache: 'no-store',
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data);
        }

        return NextResponse.json({ status: 'degraded', source: 'proxy-fallback' });
    } catch {
        // Backend unreachable — return degraded so the footer shows "Degraded"
        // rather than "System Offline", which is more accurate when it's a
        // Render free-tier cold start
        return NextResponse.json({ status: 'degraded', source: 'offline-fallback' });
    }
}
