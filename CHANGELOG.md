# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Supported Versions

Active full support: 1.1.0 (latest). See `SECURITY.md` for the support policy.

## [1.1.0] - 2026-03-14

### Changed

- **Homepage Visual Redesign** (`app/page.tsx`, `tailwind.config.js`, `app/globals.css`): Complete redesign of the homepage to a vintage newspaper/comic editorial aesthetic. Warm beige (`#F5E6C8`) background, heavy ink-black (`#1a100f`) borders, bold red accent (`#bf3a2b`), halftone dot patterns, comic-style `box-shadow`, and thick uppercase Be Vietnam Pro typography. Hero section now features a centered layout with a 1.5x scaled Spline 3D model (`spline-viewer`) as a non-interactive background element. Engines section redesigned as a 4-column grid of numbered cards with hover reveal. Added "Provenance Gazette" newspaper-style layout with drop-cap, sidebar, and classifieds. Bazaar and Worlds sections restyled with comic-border cards and horizontal carousel. All existing text content, functionality, API calls, and routing preserved.
- **Performance Opts**: Replaced heavy CSS `radial-gradient` dot patterns with ultra-fast inline SVG backgrounds to completely resolve scrolling lag.

### Added

- **Design Tokens** (`tailwind.config.js`): New colors `comic-primary`, `background-light`, `background-dark`, `ink`, `paper`; `display` font family (Be Vietnam Pro); `scroll-marquee-home` animation for worlds carousel.
- **Font Imports** (`app/globals.css`): Added `Be Vietnam Pro` (400, 500, 700, 900) and `Material Symbols Outlined` from Google Fonts.

## [1.0.4] - 2026-03-14

### Fixed

- **Render Build Crash — Missing `NEXT_PUBLIC_URL`** (`app/layout.tsx`): The build-time environment variable validation was throwing a hard error when `NEXT_PUBLIC_URL` was not set, which Render does not provide at build time. Replaced the `throw` with a warn-and-default strategy: missing `NEXT_PUBLIC_*` vars are now backfilled with production defaults (`https://comicraft.xyz`), and a console warning is emitted at runtime so operators still notice any misconfiguration. Also added detection for the Render-specific `RENDER` env var to the build-phase skip list alongside `CI` and `NEXT_PUBLIC_BUILD_MODE`.

## [1.0.3] - 2026-03-14

### Fixed

- **Docker Build Failure** (`Dockerfile`): Removed `NEXT_PUBLIC_BUILD_MODE=true` from the Docker build stage. This env var triggers `output: 'export'` in `next.config.js`, which is incompatible with Next.js API routes (`force-dynamic`). Docker runs a full Node.js server and should use `BUILD_STANDALONE=true` for standalone output mode instead.
- **Render Build Failure** (`package.json`): Removed `NEXT_PUBLIC_BUILD_MODE=true` from the `build` script. Only `cf-build` (Cloudflare Pages) should use export mode — it strips `app/api/` first. The regular `build` command is for Render/Docker and needs a full Next.js server build.

### Changed

- **MADHAVA Help Bot — Gemini Migration** (`app/api/helpbot/chat/route.ts`) [NEW]: Replaced the backend Groq-powered helpbot endpoint with a local Next.js API route powered by Google Gemini. The bot now carries the full Comicraft platform knowledge base as a system prompt, eliminating the dependency on the backend for chat.
- **Helpbot Health Check** (`components/madhava-helpbot.tsx`): Updated the health check to use `no-cors` mode for the backend ping, and the bot now stays online even when the backend is cold-starting since Gemini chat works independently.

## [1.0.2] - 2026-03-14

### Fixed

- **Cloudflare Pages Build Error** (`wrangler.toml`): Removed the `[build]` table from `wrangler.toml`. Cloudflare Pages does not support the `[build]` key in wrangler config files (it must be set in the Cloudflare Pages dashboard under Settings → Build). The validator was hard-failing the deploy with `Configuration file for Pages projects does not support "build"`. Build command (`npm run cf-build`) and output directory (`out`) are now documented in comments only.

## [1.0.1] - 2026-03-14

### Fixed

- **Backend URL**: Updated all backend API references from the old Render service URL to `https://comicraft-main.onrender.com` across all hooks, components, API clients, config files, `_redirects`, `.env.local`, and `render.yaml`.
- **Docker Build (`ERESOLVE`)**: Added `--legacy-peer-deps` to `npm ci` in the `Dockerfile` to resolve the peer dependency conflict between `@cloudflare/next-on-pages@^1.13.12` (which requires `next >= 14.3.0`) and the project's `next@14.1.0` — allowing Docker builds to complete without upgrading Next.js.
- **Supabase Noop Client — Missing `onAuthStateChange`** (`lib/supabase/client.ts`): Expanded the `createNoopClient()` auth stub to include all auth methods used across the codebase (`onAuthStateChange`, `signInWithOAuth`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser`, `exchangeCodeForSession`). Prevents `TypeError: f.auth.onAuthStateChange is not a function` on every page load.
- **Duplicate Supabase Env Vars** (`.env.local`): Removed duplicate placeholder `NEXT_PUBLIC_SUPABASE_*` entries that were overwriting real credentials, eliminating the `[supabase] missing env vars during build – returning noop client` warning.
- **CORS Errors — Footer Health Check** (`components/footer.tsx`): Changed direct cross-origin `fetch` to the Render backend to a relative `/api/health` fetch handled by a Next.js server-side proxy route.
- **CORS Errors — MADHAVA HelpBot** (`components/madhava-helpbot.tsx`): Simplified two-step cross-origin health polling to a single relative `/api/health/bot` fetch.
- **`GET /api/health/bot` 404** (`app/api/health/bot/route.ts`) [NEW]: Created Next.js server-side proxy route for bot health checks. Falls back gracefully when the Render backend is cold-starting.
- **`GET /api/health` CORS** (`app/api/health/route.ts`) [NEW]: Created server-side proxy for the main health check endpoint.
- **`GET /favicon.ico` 404** (`public/favicon.ico`) [NEW]: Added `favicon.ico` to `/public` to stop unconditional browser favicon requests from returning a 404 error.

## [1.0.0] - 2026-03-13

### Added

- **AI-Powered Story Engine (VedaScript)**: Multi-chapter story creation with 70+ parameters, genre pills, and Groq/Gemini AI orchestration.
- **Comic Creation Engine (Panelra)**: Visual panel builder with sketch upload, character/co-star management, layout picker, and AI art generation.
- **Marketplace**: Real-time story and NFT marketplace backed by Supabase. Supports story discovery, audio badge display, and lazy audio previews.
- **Gallery**: Community gallery of un-minted works, synced with Supabase `stories` table.
- **User Authentication**: Supabase Auth with email/password, Google OAuth, and wallet-based login (EIP-191 SIWE).
- **NFT Minting Pipeline**: Post-publish NFT mint request flow with admin approval queue (`nft_mint_requests` table).
- **Story Engagement**: Upvote/downvote, comments, saves — all with RLS-enforced Supabase tables.
- **TTS Narration (Sarvam AI Bulbul v3)**: Chapter audio generation with 39 voices, 11 Indian languages, and a full in-page audio player.
- **MADHAVA Help Bot**: Groq-powered contextual help bot with real-time typing animation and health polling.
- **Dashboard**: 5-tab command center — stories, comics, NFTs, feed, and settings.
- **Profile Pages**: Username-based public profiles with story lists, stats, and NFT mint CTAs.
- **Admin Panel**: Moderation queue for pending stories and NFT mint request review.
- **RBAC**: Role-based access (admin, moderator, user) with view-switching and role badges.
- **WalletConnect v2**: QR-modal wallet connection with signature-based backend authentication.
- **Blockchain**: Ethereum Mainnet integration via Alchemy. ERC-721 `ComiCraftStoryNFT` and ERC-20 `CRAFTS` token contracts.
- **Status Page** (`/status`): Real-time system health dashboard with per-service latency indicators.
- **Blog**: Dynamic blog platform with DEV.to integration and scroll progress indicators.
- **Backend (Express.js)**: Comprehensive REST API with Supabase, Groq, Gemini, Sarvam TTS, Alchemy, and IPFS integrations. Full Swagger/OpenAPI docs.
- **Docker**: Multi-stage Dockerfile with separate frontend (Next.js) and backend (Express) processes.
