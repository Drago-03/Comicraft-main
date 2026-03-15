# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-03-15

### Added — KAVACH Phase 1 (IP Compliance Engine)

- **KAVACH Express Routes** (`server/routes/kavach.js`): 8 endpoints — POST /scan (full pipeline), GET /scan/:id (detail + events), GET /scan/:id/report (formatted report), POST /dmca (public DMCA §512(c)(3)), POST /warranty (creator warranty), GET /blocklist (paginated search), GET /blocklist/stats (category counts), GET /tiers (license tiers).
- **Supabase Schema** (`supabase/kavach-schema.sql`): 10 tables — blocked_entities (10K+ IP blocklist with pg_trgm fuzzy matching), entity_seed_batches, license_tiers (4 tiers), kavach_scans, dmca_takedowns, creator_warranties, pipeline_events (realtime), scan_audit_log (SHA-256 hash chain), tos_versions. All with RLS policies.
- **Scan Pipeline** (`lib/kavach/scan-pipeline.ts`): Entity scan (substring + alias + phonetic), text scan (Copyleaks + mock), scoring algorithm, tier assignment, audit hash chain. Emits realtime pipeline events.
- **Migration Script** (`scripts/kavach-migrate.js`): Seeds license tiers, ToS v1.0, and blocklist data.
- **CORS** (`server/config/cors.js`): Added localhost:5173 and localhost:5174 for Vite dev servers.

### Fixed

- **Build Error** (`app/blogs/[slug]/page.tsx`): Separated inline JSX into `BlogPostContent` client component to resolve "use client" + `generateStaticParams()` conflict.

### Added — CTP (Creativity Tokenization Platform) Backend

- **Secondary Royalty Engine** (`server/routes/royalty.js`): Configure ERC-2981 compliant royalty splits (5-10%) between creator, platform, and agent treasury. View per-NFT royalty config and earnings history. Aggregate creator earnings endpoint.
- **Cross-Platform NFT Distribution** (`server/routes/distribution.js`): Auto-list NFTs on OpenSea, Rarible, and Blur via their APIs. Status tracking, delisting, and aggregated analytics across marketplaces.
- **KavyaScript Poetry Engine** (`server/routes/poetry.js`): Generate 8 poetry forms (haiku, sonnet, ghazal, free verse, spoken word, limerick, tanka, villanelle) via Gemini. Calligraphy-style PNG rendering using sharp/SVG. Revision with iteration endpoint.
- **Dynamic & Evolving NFTs** (`server/routes/dynamic-nft.js`): Configure evolution rules (timed, voted, seasonal, milestone). Trigger evolutions, record history. Holder voting with round-based tallying.
- **IP Licensing Marketplace** (`server/routes/licensing.js`): Create listings, browse with filters, submit/accept/reject offers. License agreement lifecycle with exclusive/non-exclusive/time-limited types.
- **DAO Governance Layer** (`server/routes/governance.js`): Stake/unstake CRAFTS with 7-day cooldown. Create proposals with voting periods. Weighted voting by staked amount. Execute passed proposals with quorum enforcement.
- **Creator Fund & Grants** (`server/routes/fund.js`): Admin fund configuration. Balance tracking via aggregations. Grant application lifecycle (apply → review → approve/reject).
- **Reader Rewards** (`server/routes/rewards.js`): Action tracking (read, review, share, collect, login, streak) earning CRAFTS. 9 badge definitions with auto-awarding. Streak management. Leaderboards (weekly, monthly, all-time). Claim system.
- **Serialized Subscriptions** (`server/routes/subscriptions.js`): Create/browse series. Subscribe/unsubscribe. Episode release with free preview support.
- **FanPay Tipping** (`server/routes/fanpay.js`): Tip creators in CRAFTS with messages. View received/sent history. Top supporter leaderboards.
- **White-Label Creative Studio SDK** (`server/routes/sdk.js`): API key management (create, list, deactivate). White-label story, comic, and poetry generation behind API key auth. Usage statistics. Billing placeholder.
- **API Key Middleware** (`server/middleware/apiKey.js`): Tier-based daily rate limits (free: 100, pro: 10K, enterprise: unlimited). Async usage tracking. Key validation.
- **21 Mongoose Models** (`server/models/ctp-models.js`): DistributionListing, EvolutionConfig, EvolutionHistory, EvolutionVote, LicenseListing, LicenseOffer, LicenseAgreement, ApiKey, ApiUsage, GovernanceStake, GovernanceProposal, GovernanceVoteRecord, FundTransaction, GrantApplication, RewardEvent, RewardBadge, UserStreak, Series, Subscription, Episode, Tip.
- **5 Solidity Smart Contracts**:
  - `RoyaltySplitter.sol`: ERC-2981 compliant royalty distribution with per-token splits.
  - `DynamicNFT.sol`: ERC-721 with mutable tokenURI for evolving NFTs.
  - `LicensingEscrow.sol`: CRAFTS escrow for IP licensing deals.
  - `CRAFTSStaking.sol`: Staking with 7-day unstaking cooldown.
  - `CRAFTSGovernor.sol`: Governor-style DAO with weighted voting.

### Changed

- **Backend routes expanded**: 10 new route groups registered under `/api/v1/` (royalty, dynamic, distribution, poetry, licensing, governance, fund, rewards, subscriptions, fanpay).
- **Swagger tags**: Extended from 14 to 24 tags covering all CTP features.
- **Welcome endpoint**: Updated to list all new CTP endpoints.
- **SDK rewrite**: Full white-label creative studio with API key auth, generation endpoints, usage tracking.
- **Package version**: Bumped from 1.3.102 to 3.0.0.
- **VERSION file**: Updated to 3.0.0.

## [2.1.0] - 2026-03-15

### Changed

- **Navbar Restructuring** (`components/header.tsx`, `components/footer.tsx`): Renamed "Get CRAFTS" → "CRAFTS". Removed KAVACH, Governance, and Trading from the header nav — these are now footer-only links. Added KAVACH to footer Explore section.
- **KavyaScript Rename**: Renamed "Shakti Spark" engine to "KavyaScript" across 6 files: `app/create/page.tsx`, `app/create/spark/page.tsx`, `app/page.tsx`, `app/api/helpbot/chat/route.ts`, `app/create/ai-story/page.tsx`.
- **Kavach UI Overhaul** (`app/kavach/page.tsx`, `app/kavach/blocklist/page.tsx`, `app/kavach/kavach.css`): Complete redesign from dark zinc glassmorphism theme to vintage comic theme matching the home page — bold 4px borders, comic card shadows, halftone dot overlays, uppercase typography, warm color palette.
- **Text Color Fixes** (`app/globals.css`): Changed all `#F0F0F5` references (7 locations) to `#E0E0E8` for improved contrast in dark mode and Madhava helpbot styles.
- **TTS Model Switch** (`hooks/use-tts.ts`): Replaced Sarvam AI Bulbul v3 TTS with Eleven Labs integration. 10 voice options (George, Sarah, Daniel, Charlotte, Liam, Lily, etc.), 8 language options. Legacy `BULBUL_SPEAKERS` and `BULBUL_LANGUAGES` exports maintained for backward compatibility.

### Added

- **KAVACH Prompt Validator** (`lib/kavach/prompt-validator.ts`) [NEW]: IP compliance checker that validates user prompts against the `blocked_entities` Supabase table. Case-insensitive matching with leet-speak normalization, n-gram generation, and structured compliance error messages with IP owner attribution.

### Fixed

- **Navbar Overlap** (`app/layout.tsx`): Added `pt-20` to main content container to provide global 80px clearance for the fixed navbar across all pages.
- **AbortError: Lock broken** (`lib/supabase/client.ts`): Configured Supabase browser client with `auth.flowType: 'implicit'` and a unique `auth.storageKey` to avoid `navigator.locks` conflicts that caused the runtime `AbortError`.

## [2.0.0] - 2026-03-15

### Added

- **KavyaScript Poetry Engine** (`app/kavyascript/page.tsx`): Renamed Shakti Spark to KavyaScript — a dedicated poetry creation engine supporting haiku, sonnets, ghazals, free verse, and spoken word. Calligraphy-style visual rendering for display-worthy minted NFTs. Homepage typewriter and engine card updated to reflect the new identity.

- **Secondary Royalty Engine**: Smart contract-enforced royalties (5–10%) on every NFT resale, split between original creator, platform (in CRAFTS), and agent treasury. Royalty percentages and earnings displayed in the creator dashboard.

- **Cross-Platform NFT Distribution**: Auto-list Comicraft NFTs on OpenSea, Rarible, and Blur. Distribution status shown on each NFT detail page. Comicraft is the creation studio; external marketplaces become additional storefronts.

- **Dynamic & Evolving NFTs** (`app/dynamic-nfts/page.tsx`): Support for NFTs that change over time — poems that add stanzas monthly, comics that release new panels based on holder votes, stories with seasonal endings. Evolution history timeline and upcoming change display included.

- **IP Licensing Marketplace** (`app/ip-licensing/page.tsx`): Brands, game studios, film producers, and publishers can license creative works directly on-chain. On-chain negotiation flow and automatic royalty distribution. Filterable by use case (film, gaming, publishing, brand).

- **White-Label Creative Studio** (`app/whitelabel/page.tsx`): VedaScript, Panelra, and KavyaScript offered as a white-label API. API endpoint reference, use case matrix (education, marketing, gaming, publishing), and three pricing tiers payable in CRAFTS or fiat.

- **DAO Governance Layer** (`app/governance/page.tsx`): CRAFTS holders vote on platform decisions using a staked CRAFTS model. Active proposals with vote progress bars, quorum tracking, and proposal history. Governance power = 1 CRAFTS staked = 1 vote.

- **Creator Fund & Grants** (`app/creator-fund/page.tsx`): Percentage of platform fees flows to Creator Fund. Top Creator Grants (8,000–15,000 CRAFTS) awarded monthly to top 10 creators. Emerging Creator Grants (4,000–9,000 CRAFTS) awarded via quarterly application cycle. Fund balance, grant history, and application CTA displayed.

- **Reader Rewards & Collect-to-Earn** (`app/reader-rewards/page.tsx`): Readers earn CRAFTS for reading (verified 5+ min sessions), reviews, shares, collections, and reading streaks. Collection milestone rewards, top collectors leaderboard, gamified badges.

- **Serialized Subscriptions & FanPay** (`app/subscriptions/page.tsx`): Creator-launched serialized content with subscriber-only access and CRAFTS pricing. Weekly comic drops and ongoing story chapters. Inline FanPay tipping system allowing readers to tip creators directly in CRAFTS.

- **Serum DEX Trading Space** (`app/trading/page.tsx`): On-platform trading space for CRAFTS tokens integrated with Project Serum's decentralized exchange on Solana via self-hosted `serum-rest-server`. Full orderbook display, buy/sell order form (limit/market), market selector, and recent trades. Documentation banner explaining self-hosting setup.

- **Comparison Table** (`app/page.tsx`): New homepage section showing how Comicraft stacks up against OpenSea, Readl, and IQ AI ATP across 15 platform features.

- **Blog System** (`app/blogs/page.tsx`, `app/blogs/[slug]/page.tsx`): New `/blogs` route with three full editorial posts:
  1. "Why Comicraft Is the Only True Creativity Tokenization Platform"
  2. "The Creator Economy Is Broken — Here's How Comicraft Fixes It"
  3. "From Static JPEGs to Living Art: How Dynamic NFTs Change Everything"

- **About Us Page** (`app/aboutus/page.tsx`): Comprehensive page covering what Comicraft built (12 existing features), what's new in 2026 (11 new features), a company timeline, and a mission statement.

### Changed

- **Navigation** (`components/header.tsx`, `components/footer.tsx`): Added Governance, Trading, and About Us links to the main header navigation. Footer Explore section: replaced "Prime" with "About Us", added Blogs, Governance, and Trading Space links. Footer Resources section: added IP Licensing, White Label API, Creator Fund, and Reader Rewards links.

- **Homepage** (`app/page.tsx`): KavyaScript Engine card now links to `/kavyascript` and uses updated poetry-focused description. Hero typewriter updated from "Spark ideas with Shakti Spark" to "Compose poetry with KavyaScript".

### Fixed

- **KAVACH Scan Static Export** (`app/kavach/scan/[id]/page.tsx`): Added `generateStaticParams()` export returning an empty array so the dynamic route works with `output: 'export'` (Cloudflare Pages). All scan data is fetched client-side via `useEffect`, so no pre-rendering is required.

## [1.2.0] - 2026-03-14

### Added

- **KAVACH Phase 1 — IP Compliance Engine**: Complete intellectual property scanning, licensing, and compliance system built on Supabase with real-time pipeline dashboard. Legal compliance with Indian law (Copyright Act 1957, IT Act 2000 §79, Trademark Act 1999, DPIIT 2025 guidelines) and international law (DMCA §512, Berne Convention, EU Digital Services Act).

### Fixed

- **Authentication Error in Preview Builds**: Added missing `signUp`, `verifyOtp`, and `resend` methods to the Supabase no-op client proxy to prevent "signup is not a function" crashes when static environment variables are temporarily unavailable.


#### Database
- **10 New Tables** (`supabase/kavach-schema.sql`): `blocked_entities`, `entity_seed_batches`, `license_tiers`, `kavach_scans`, `dmca_takedowns`, `creator_warranties`, `pipeline_events`, `scan_audit_log`, `tos_versions`, plus ALTER to existing `stories` table. All with RLS policies, indexes, pg_trgm trigram extension for fuzzy matching, and Supabase Realtime publications.
- **Seed Data** (`supabase/kavach-seed.sql`): 4-tier license system with full legal basis, ToS v1.0 with IP warranty, indemnification, AI disclosure, DMCA policy, and Indian/international law provisions.
- **Entity Blocklist Generator** (`lib/kavach/seed-data.ts`): 500+ named IP entities across 7 categories (Marvel, DC, Disney, Anime, Tolkien, Indian IP, Other) with Soundex phonetic hashing, normalization, and alias expansion.

#### Backend — API Routes
- **`POST /api/kavach/scan`** (`app/api/kavach/scan/route.ts`): Full 5-step KAVACH scan pipeline — entity scan (substring + alias + Soundex phonetic matching), text plagiarism scan (Copyleaks API with mock fallback), originality scoring, license tier assignment, and SHA-256 audit hash chain.
- **`GET /api/kavach/scan/[id]`** (`app/api/kavach/scan/[id]/route.ts`): Scan status with pipeline events, audit log, and story details.
- **`POST /api/kavach/dmca`** (`app/api/kavach/dmca/route.ts`): DMCA takedown processing with §512(c)(3) validation and 48-hour response deadline.
- **`POST /api/kavach/warranty`** (`app/api/kavach/warranty/route.ts`): Creator warranty acceptance with Indian law human authorship requirement.
- **`GET /api/kavach/blocklist`** (`app/api/kavach/blocklist/route.ts`): Searchable, filterable, paginated blocklist API with category stats.

#### Frontend — KAVACH Pages
- **`/kavach`** (`app/kavach/page.tsx`): Live Pipeline Dashboard with stats bar, real-time scan pipeline view using Supabase Realtime, recent scans table, entity blocklist stats by category, and quick action cards.
- **`/kavach/scan/[id]`** (`app/kavach/scan/[id]/page.tsx`): Scan Detail & Originality Report — big originality score, license tier rights breakdown, entity/text match issues list with risk levels, legal compliance badges, and audit trail with hash chain display.
- **`/kavach/submit`** (`app/kavach/submit/page.tsx`): Story Submission with Creator Warranty — two-step flow with content entry and legal warranty modal (4 declarations, human author info per DPIIT 2025).
- **`/kavach/dmca`** (`app/kavach/dmca/page.tsx`): Public DMCA Takedown Form — claimant info, claim details, jurisdiction selector, 3 legal declarations per DMCA §512(c)(3), digital signature.
- **`/kavach/blocklist`** (`app/kavach/blocklist/page.tsx`): Entity Blocklist Explorer — searchable, filterable table with category pills, entity type/risk level filters, and pagination.

#### Shared Libraries
- **Types** (`lib/kavach/types.ts`): Complete TypeScript type definitions for all KAVACH entities.
- **Constants** (`lib/kavach/constants.ts`): Pipeline steps, risk levels, license tiers, entity categories, legal references, compliance badges, warranty/indemnification/AI disclosure text.
- **Scan Pipeline** (`lib/kavach/scan-pipeline.ts`): Full orchestration engine with entity matching, text scanning, scoring algorithm, and audit hash chain.
- **Realtime Hook** (`hooks/use-kavach-realtime.ts`): Supabase Realtime subscription hook for live pipeline event streaming.
- **Navigation** (`components/header.tsx`): Added KAVACH link to main navigation.

## [1.1.5] - 2026-03-14

### Fixed

- **Dashboard Stories Filter** (`app/dashboard/page.tsx`): The stories tab was fetching all platform stories (`/api/v1/stories`) including other users' content like "The Birth of Blockchain". Changed to `/api/v1/stories/mine` so only the authenticated user's own stories are displayed.
- **Wallet Connection State** (`app/dashboard/page.tsx`): Replaced the disconnected `useWallet` hook with the centralized `useWeb3` context from `Web3Provider`. The dashboard wallet tab, collectibles tab, and portfolio now correctly reflect the wallet connection state set by the navbar `WalletConnect` component.
- **Story Preview Page** (`app/stories/[id]/client.tsx`): Fixed story preview at `/stories/<id>` — the Supabase response field `likes_count` was not mapped to the component's `likes` prop. Also added a redirect for the static export dummy `id=default` page to prevent a broken empty page.
- **IQai ADK Peer Dependencies** (`server/.npmrc`): Fixed malformed `.npmrc` file (had literal `\n` in cache/store paths) and added `legacy-peer-deps=true` to resolve the `@iqai/adk@0.8.1` vs `@opentelemetry/instrumentation-express` peer dependency conflict on Render deployment.
- **Server Lockfile** (`server/yarn.lock`): Removed stale `yarn.lock` since the project uses npm. The corrected `.npmrc` allows `npm install` to complete without errors and generate a proper `package-lock.json`.

## [1.1.4] - 2026-03-14

### Fixed

- **OAuth Callback Flow** (`app/auth/callback/page.tsx`): Completely rewrote to handle three auth flows — PKCE code exchange (server builds), implicit hash-fragment flow (Cloudflare static export), and existing session fallback. Google and GitHub OAuth buttons now work correctly on production (comicraft.xyz).
- **Navbar Auth State** (`components/user-nav.tsx`): Added `storage` event listener so UserNav immediately refreshes the Supabase session when OAuth callback saves tokens to localStorage. The navbar now correctly shows the user avatar instead of "Login" after signing in.
- **Server npm Peer Dependencies** (`server/.npmrc`): Added `legacy-peer-deps=true` to resolve `@iqai/adk` peer dependency conflict with `@opentelemetry/instrumentation-express`.

## [1.1.3] - 2026-03-14

### Fixed

- **Footer Health Status** (`components/footer.tsx`): The health check now tries two endpoints sequentially — the Next.js proxy `/api/health` first, then the backend directly — so the footer correctly shows "System Operational" even when the proxy has a cold-start delay on Render.
- **OAuth Redirect URL** (`components/auth/sign-in-form.tsx`, `components/auth/sign-up-form.tsx`): Fixed Google and GitHub OAuth buttons not working. The `redirectTo` URL was previously hardcoded to `NEXT_PUBLIC_URL` (which is `http://localhost:3000` locally), causing callbacks to fail in production. It now always uses `window.location.origin` so it works correctly on both `localhost` and `comicraft.xyz`.
- **Backend MongoDB Warning** (`server/config/db.js`, `.env.local`): Added real `MONGODB_URI` to `.env.local` so MongoDB connects silently without a warning on startup.
- **Backend Supabase Login** (`server/config/supabase.js`, `server/routes/auth.js`): Added `supabaseAnon` client and used it for all `signInWithPassword` calls so email/wallet logins work correctly.

### Changed

- **Footer — Atlas in Resources** (`components/footer.tsx`): Moved the "Atlas" link from the Explore section into the Resources section where it belongs.
- **Footer — Google Sign-In** (`components/auth/sign-in-form.tsx`): Added `queryParams: { access_type: 'offline', prompt: 'consent' }` to Google OAuth to ensure tokens are always refreshed.


## [1.1.2] - 2026-03-14

### Fixed

- **Cloudflare Static Generation** (`app/auth/callback/page.tsx`): Migrated the `/auth/callback` route from a Next.js API Route Handler (`route.ts`) to a client-side page (`page.tsx`) wrapped in `<Suspense>`. This resolves the `export const dynamic = "force-dynamic"` build crash, allowing Cloudflare Pages to correctly perform a static export while still successfully exchanging the OAuth code for a session on the frontend.
- **Backend Supabase Email Login** (`server/config/supabase.js`, `server/routes/auth.js`): Fixed the "invalid credentials" error during email and username login. The backend was previously attempting to call `signInWithPassword` using the `supabaseAdmin` client initialized with the Service Role Key, which Supabase intentionally blocks. A secondary `supabaseAnon` client has been added specifically for verifying passwords.
- **Frontend Health Status** (`components/footer.tsx`): Improved `/api/health` proxy parsing logic to correctly display "System Operational" instead of "System Offline" when the backend is live.

### Changed

- **Footer UI** (`components/footer.tsx`): Removed Alchemy reference from the footer credits.
- **Documentation**: Integrated IQai ADK-TS Tokenization Platform into `README.md` and `docs/ARCHITECTURE.md`.
- **Community & Legal**: Created a new `COOKIE_POLICY.md` and `CODE_OF_CONDUCT.md` from scratch.

### Added

- **GitHub Authentication** (`components/auth/sign-in-form.tsx`, `components/auth/sign-up-form.tsx`): Added GitHub OAuth buttons and logic to the sign in and sign up forms.

## [1.1.1] - 2026-03-14

### Changed

- **Navigation & UI Updates** (`components/header.tsx`, `components/footer.tsx`): Removed the `Upload Story` buttons, as well as the `Atlas` and `Prime` links from both the main navigation header and the footer.

### Added

- **Global Live Search** (`components/global-search.tsx`, `components/header.tsx`): Implemented a new global search component live in the header. Placed right next to the `Create` button, allowing users to search for stories across the platform seamlessly.

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
