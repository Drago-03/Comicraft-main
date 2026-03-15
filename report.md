# Comicraft Technical Report

> **Network: Ethereum Mainnet | Chain ID: 1 | Powered by Ethereum**

*This document is a complete technical breakdown of the Comicraft project — everything happening on the surface and under the hood. Written so that someone with no blockchain or AI background can understand it. Updated: 2026-03-15.*

---

## Table of Contents

1. [What Is Comicraft?](#1-what-is-comicraft)
2. [Technology Stack Overview](#2-technology-stack-overview)
3. [Blockchain & Smart Contracts](#3-blockchain--smart-contracts)
4. [ERC Standards Used](#4-erc-standards-used)
5. [Token Economics](#5-token-economics)
6. [AI Architecture (4 Providers)](#6-ai-architecture-4-providers)
7. [Database & Storage](#7-database--storage)
8. [Backend API](#8-backend-api)
9. [Frontend](#9-frontend)
10. [Authentication](#10-authentication)
11. [IPFS & NFT Metadata](#11-ipfs--nft-metadata)
12. [KAVACH — IP Compliance Engine](#12-kavach--ip-compliance-engine)
13. [What's Real vs. What's Mocked](#13-whats-real-vs-whats-mocked)
14. [Key Numbers](#14-key-numbers)
15. [Infrastructure & Deployment](#15-infrastructure--deployment)
16. [Security & Caveats](#16-security--caveats)

---

## 1. What Is Comicraft?

Comicraft is an **AI-powered Web3 storytelling platform** built on Ethereum Mainnet. Here's what it does in plain English:

- **Writers** create stories, comics, and poetry using AI. The AI writes, draws, and narrates their content.
- **Those stories can become NFTs** — digital ownership tokens on the Ethereum blockchain. Think of an NFT as a limited-edition digital trading card that proves who owns a piece of creative work.
- **CRAFTS tokens** are the in-platform currency. Readers earn CRAFTS for reading and engaging. Creators earn CRAFTS from sales, royalties, and licensing their work.
- **Everything creative is protected by KAVACH**, a built-in IP compliance engine that scans content for copyright violations before minting.

---

## 2. Technology Stack Overview

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (React), TypeScript, TailwindCSS |
| **Backend** | Express.js on Render (Node.js) |
| **Database** | Supabase (PostgreSQL with Row Level Security) |
| **Blockchain** | Ethereum Mainnet (Chain ID: 1) |
| **Smart Contracts** | Solidity ^0.8.20, OpenZeppelin v4 |
| **AI (Story/Comic)** | Google Gemini 2.5, Groq LPU, IQai ADK-TS |
| **AI (Voice)** | ElevenLabs (formerly Sarvam AI Bulbul v3) |
| **NFT Storage** | Pinata (IPFS) |
| **Hosting (Frontend)** | Cloudflare Pages |
| **Block Explorer** | [https://etherscan.io](https://etherscan.io) |
| **RPC Endpoint** | Alchemy (Ethereum Mainnet) or `https://eth.llamarpc.com` |

---

## 3. Blockchain & Smart Contracts

### Network Configuration

| Property | Value |
|---|---|
| **Network** | Ethereum Mainnet |
| **Chain ID** | `1` |
| **Currency** | ETH (real mainnet ETH — not testnet) |
| **RPC URL** | Configurable via `ETH_RPC_URL` env var (default: Alchemy endpoint) |
| **Block Explorer** | `https://etherscan.io` |
| **EVM Version** | Shanghai (EVM-compatible, runs on the Ethereum Virtual Machine) |
| **Solidity Version** | ^0.8.20 |
| **OpenZeppelin** | v4 (audited base contracts) |

### The 10 Smart Contracts

> **Plain English primer**: A smart contract is a self-executing program that lives on the blockchain. Once deployed, no one can change it. It runs automatically according to its rules.

---

#### a. `CraftToken.sol` — The CRAFTS Token

- **Type**: ERC-20 (fungible token, like a game coin)
- **Name**: "ComicCraft Tokens"
- **Symbol**: CRAFTS
- **Initial Supply**: 1,000,000 CRAFTS
- **Decimals**: 18 (like ETH, 1 CRAFTS = 10^18 smallest units)
- **Max Cap**: ❌ None — the owner can mint more at any time
- **Features**: Burnable (holders can destroy tokens), owner-mintable
- **Use**: In-platform currency for marketplace, licensing, staking, governance

---

#### b. `ComiCraftStoryNFT.sol` — The Story NFT

- **Type**: ERC-721 (unique digital token — each one is different)
- **Mint Price**: 0.001 ETH (~$3.50 at $3,500/ETH) — **real mainnet ETH**
- **Max Supply**: 10,000 NFTs total (after that, no more can be minted)
- **Metadata**: Stored on IPFS (decentralized storage). The NFT's `tokenURI` points to `ipfs://` where the image and story content are stored permanently.
- **Story Hash**: The IPFS content hash of the story is stored on-chain per token — proof of what story the NFT represents
- **Security**: Protected by `ReentrancyGuard` (blocks hack attacks that try to drain the contract during a transaction)

---

#### c. `CRAFTSStaking.sol` — Governance Staking

- **Purpose**: Lock up CRAFTS tokens to get voting power in the DAO
- **Min Stake**: 1 CRAFTS
- **Unstaking Cooldown**: 7 days (you can't immediately withdraw — prevents vote manipulation)
- **Yield/APY**: ❌ None — staking earns no interest. It's purely for governance.
- **Voting Power**: 1 staked CRAFTS = 1 vote
- **Security**: `ReentrancyGuard` + `SafeERC20` (safe token transfer library)

---

#### d. `CraftsMarketplace.sol` — Primary Marketplace

- **Currency**: CRAFTS tokens (not ETH)
- **Platform Fee**: Up to 10% (1,000 basis points) of each sale
- **Creator Royalty**: Up to 50% (5,000 basis points) on secondary sales
- **Withdrawal**: Pull-based (sellers must claim funds, not auto-sent — safer)
- **Pattern**: CEI (Checks-Effects-Interactions) — industry standard for secure contract coding
- **Security**: `ReentrancyGuard`

---

#### e. `NFTMarketplace.sol` — Legacy ETH Marketplace

- **Currency**: ETH (not CRAFTS)
- **Platform Fee**: None
- **Royalties**: None
- **Purpose**: Kept for backward compatibility with early minted NFTs
- **Status**: Legacy — new features built in `CraftsMarketplace.sol` instead

---

#### f. `RoyaltySplitter.sol` — Royalty Distribution

- **Standard**: ERC-2981 (the official Ethereum royalty standard that OpenSea and other markets respect)
- **Royalty Range**: 5–10% of sale price
- **Default Split**:
  - 70% → Creator
  - 20% → Platform
  - 10% → Agent (AI agent treasury)
- **Settlement**: ETH-based distribution
- **Compliance**: ERC-2981 means any compatible marketplace auto-pays royalties

---

#### g. `LicensingEscrow.sol` — IP Licensing

- **Purpose**: When someone wants to license a creative work (e.g., a film studio wants to use a story), CRAFTS are held in escrow during negotiation
- **Payment**: CRAFTS tokens
- **States**: `Pending → Accepted / Rejected / Cancelled / Expired`
- **License Terms**: Stored as IPFS hash (the actual agreement document is on IPFS, the proof of agreement is on-chain)

---

#### h. `DynamicNFT.sol` — Evolving NFTs

- **Type**: ERC-721 (like Story NFT, but the metadata URI can change)
- **Name**: "Comicraft Dynamic NFT"
- **Symbol**: CDNFT
- **Special Power**: The platform can update the NFT's metadata URI (the image/story it points to can change over time — an NFT that "evolves")
- **Max Evolutions**: Configurable per token (e.g., a poem that adds a stanza every month)

---

#### i. `ComicraftGovernance.sol` (CRAFTSGovernor.sol) — DAO Voting

- **Purpose**: On-chain voting system. CRAFTS holders who stake can vote on platform decisions.
- **Voting Power**: Sourced from `sCRAFTS` (staked CRAFTS) via the staking contract
- **Quorum**: Configurable — a minimum percentage of voters must participate for a vote to be valid
- **Proposal Types**: Configurable — text proposals, parameter changes, etc.

---

#### j. `DistributionVault.sol` — Token Distribution

- **Purpose**: Handles token vesting schedules and airdrops
- **Function**: Distributes CRAFTS tokens to recipients according to preset schedules
- **Safety**: Uses `SafeERC20` (prevents common ERC-20 transfer bugs)

---

## 4. ERC Standards Used

| Standard | Contract(s) | What It Means |
|---|---|---|
| **ERC-20** | `CraftToken.sol` | Fungible token — interchangeable, like cash. Every CRAFTS token is identical. |
| **ERC-721** | `ComiCraftStoryNFT.sol`, `DynamicNFT.sol`, `EthereumStoryNFT.sol` | Non-fungible token — each token is unique. Like a serial-numbered collectible. |
| **ERC-2981** | `RoyaltySplitter.sol` | Royalty standard — tells marketplaces how much royalty to pay and to whom. |

---

## 5. Token Economics

| Parameter | Value |
|---|---|
| **Token Name** | ComicCraft Tokens (CRAFTS) |
| **Initial Supply** | 1,000,000 CRAFTS |
| **Decimals** | 18 |
| **Max Supply Cap** | ❌ None (owner can mint unlimited) |
| **NFT Mint Price** | 0.001 ETH (real Ethereum Mainnet ETH) |
| **NFT Max Supply** | 10,000 Story NFTs |
| **Staking Rewards** | None (governance only) |
| **Unstake Cooldown** | 7 days |
| **Marketplace Platform Fee** | Up to 10% |
| **Creator Royalty** | Up to 50% on secondary sales |
| **Royalty Split (default)** | 70% creator / 20% platform / 10% agent |

### How CRAFTS Flow

```
Reader reads/engages → earns CRAFTS
Creator publishes → earns CRAFTS when work is sold/licensed
Platform → earns % of marketplace sales
Stakers → lock CRAFTS → get governance votes (no yield)
Licensing deals → CRAFTS held in escrow during negotiation
```

---

## 6. AI Architecture (4 Providers)

### a. Google Gemini — Primary Creative AI

- **Model**: Gemini 2.5 (Flash and Pro variants)
- **Role**: Main story generation, comic scripts, dialogue, character creation, MADHAVA help assistant
- **Uses**: AI story parameters (71 parameters), comic panel generation, image generation (`gemini-2.5-flash-image`)

### b. Groq LPU — Fast Inference

- **Role**: Quick classification, lightweight generation tasks, validation
- **Why Groq**: Groq uses custom "Language Processing Units" (LPUs) — hardware optimized for AI that runs 10x faster than GPUs for inference
- **Status**: Secondary/fallback; primary AI tasks now on Gemini

### c. ElevenLabs — Text-to-Speech

- **Role**: Voice narration for stories
- **Features**: 10+ voices (George, Sarah, Daniel, Charlotte, Liam, Lily, etc.), 8 language options, multilingual support
- **Replaced**: Sarvam AI Bulbul v3 (deprecated, preserved in codebase for backward compatibility)

### d. IQai ADK-TS — Agent Orchestration

- **Role**: TypeScript-based agent SDK for multi-step AI workflows
- **Framework**: IQ AI Agent Development Kit
- **Use Case**: When multiple AI steps need to be chained together (e.g., story → script → comic panels → NFT metadata)

### VedaScript Engine — Custom AI Parameter System

The VedaScript engine is Comicraft's custom AI story parameter system. It has **71 tunable "dials"** across **10 categories**:

| Category | Examples |
|---|---|
| **Narrative** | Plot complexity, twist frequency, narrative arc |
| **Dialogue** | Dialogue density, character voice distinctness |
| **Visual** | Panel style, art direction, color palette guidance |
| **Character** | Depth, motivation, arc complexity |
| **Emotional** | Tension, humor, pathos levels |
| **World-Building** | Lore depth, setting specificity |
| **Pacing** | Chapter length, scene transitions |
| **Genre** | Primary/secondary genre mix |
| **Audience** | Age group, reading level, accessibility |
| **Meta** | AI creativity level, originality vs. convention |

All 71 parameters are validated with **Zod schemas** (TypeScript schema validation) to ensure only valid values reach the AI.

### MADHAVA — AI Help Assistant

- Powered by Google Gemini
- Lives in the dashboard as a floating chat assistant
- Carries the full Comicraft platform knowledge as its system prompt
- Available to all logged-in users

---

## 7. Database & Storage

### Supabase (Primary Database)

- **Type**: PostgreSQL with Row Level Security (RLS)
- **RLS**: Every database table has security rules that run at the database level — users can only see/edit their own data even if a bug exists in the API
- **Realtime**: Supabase Realtime subscriptions used for live pipeline dashboards (KAVACH scan progress updates in real-time)
- **4 Storage Buckets**:
  - `avatars` — user profile photos
  - `story-covers` — story cover images
  - `comic-panels` — generated comic panel images
  - `nft-metadata` — NFT metadata files

### MongoDB (Legacy — Deprecated)

- Still referenced in codebase for backward compatibility
- No longer primary storage; kept for historical data during migration period

### Redis (Caching)

- Used for AI response caching (via Upstash Redis, serverless)
- Rate limiting cache for API endpoints

---

## 8. Backend API

- **Framework**: Express.js
- **Hosting**: Render.com (Node.js server)
- **Documentation**: Swagger/OpenAPI (24 API tag groups)
- **Routes**: 30+ API route groups

### API Route Groups

| Route Group | What It Does |
|---|---|
| `/api/v1/auth` | Login, signup, wallet auth, OAuth |
| `/api/v1/stories` | CRUD for stories, mine, by user |
| `/api/v1/comics` | Comic generation, Panelra Engine |
| `/api/v1/users` | Profiles, settings, avatar upload |
| `/api/v1/nft` | NFT minting (Ethereum Mainnet), status |
| `/api/v1/marketplace` | Browse listings, buy, sell, cancel |
| `/api/v1/wallets` | CRAFTS balance, transfers, wallet state |
| `/api/v1/royalty` | ERC-2981 royalty config, earnings |
| `/api/v1/governance` | Stake/unstake CRAFTS, proposals, voting |
| `/api/v1/licensing` | IP licensing listings, negotiations |
| `/api/v1/ai` | AI prompt endpoints, story gen |
| `/api/v1/tts` | ElevenLabs voice generation |
| `/api/v1/helpbot` | MADHAVA chat |
| `/api/v1/rewards` | Reader CRAFTS rewards, streaks |
| `/api/v1/subscriptions` | Serialized content subscriptions |
| `/api/v1/dynamic-nft` | NFT evolution rules and triggers |
| `/api/v1/distribution` | Multi-marketplace NFT distribution |
| `/api/kavach` | KAVACH IP compliance scans |
| `/api/v1/fund` | Creator Fund & Grant applications |

---

## 9. Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript (63.7% of codebase)
- **Styling**: TailwindCSS + custom vintage comic CSS theme
- **Design**: Vintage newspaper/comic editorial aesthetic — warm beige backgrounds, ink-black borders, halftone dot patterns
- **Hosting**: Cloudflare Pages (static export mode)
- **3D**: Spline 3D model on homepage hero

### Wallet Connection

- **MetaMask**: Browser extension wallet (direct integration)
- **WalletConnect v2**: QR-code based (mobile wallet connection)
- **Default Network**: Ethereum Mainnet (Chain ID: 1)
- **Network Switching**: Auto-prompts user to switch to Ethereum Mainnet if on wrong network

---

## 10. Authentication

Comicraft uses **two parallel auth flows**:

### 1. Email/Password + OAuth (Supabase Auth)

- Standard email/password
- Google OAuth (Google Sign-In)
- GitHub OAuth
- Handled by Supabase Auth; sessions stored in localStorage

### 2. Wallet-Based (EIP-191 + JWT)

- User connects their Ethereum wallet (MetaMask or WalletConnect)
- Backend sends a challenge message
- User **signs** the message with their wallet (this is how the blockchain proves "you own this address" — no password needed)
- Backend verifies the signature using `ethers.js`, then issues a JWT session token
- This is called "Sign-In With Ethereum" (SIWE) — it's a Web3 standard (EIP-191/EIP-4361)

---

## 11. IPFS & NFT Metadata

**IPFS** (InterPlanetary File System) is a decentralized storage network — files stored on IPFS don't live on one server. They live on thousands of computers globally.

- **Provider**: Pinata SDK
- **What's Stored**: NFT metadata JSON files (name, description, image URL, story hash, attributes)
- **Format**: `ipfs://bafybeig...` URLs — the `bafybeig...` part is the content hash (if the file changes, the hash changes, so the content is immutable)
- **Smart Contract**: The `tokenURI` in the NFT contract points to the IPFS hash — so the NFT's metadata is permanently linked

**Example NFT metadata structure**:
```json
{
  "name": "My Story Title",
  "description": "A story about...",
  "image": "ipfs://Qm...",
  "attributes": [
    { "trait_type": "genre", "value": "Fantasy" },
    { "trait_type": "author", "value": "0x1234...abcd" }
  ],
  "storyHash": "ipfs://Qm..."
}
```

---

## 12. KAVACH — IP Compliance Engine

KAVACH is Comicraft's built-in IP (Intellectual Property) compliance system. Before any story can be minted as an NFT, it must pass through KAVACH.

### What KAVACH Does

1. **Entity Scan**: Checks if the story contains protected IP names (Marvel, DC, Disney, anime characters, Tolkien, Indian IP, etc.) using substring matching, alias detection, and phonetic matching (catches misspellings like "Spidermaan")
2. **Text Plagiarism Scan**: Copyleaks API integration — compares story text against billions of online documents
3. **Originality Scoring**: Generates a 0-100 originality score
4. **License Tier Assignment**: Auto-assigns the appropriate license tier (4 tiers from "clean" to "high risk")
5. **Audit Hash Chain**: Every scan step generates a SHA-256 hash of the audit log — immutable proof of compliance

### Legal Framework

- Indian Copyright Act 1957
- IT Act 2000 §79
- Trademark Act 1999
- DPIIT 2025 AI guidelines
- International: DMCA §512, Berne Convention, EU Digital Services Act

### KAVACH Database (Supabase)

10 tables: `blocked_entities` (10K+ IP blocklist), `license_tiers`, `kavach_scans`, `dmca_takedowns`, `creator_warranties`, `pipeline_events` (realtime), `scan_audit_log`, `tos_versions`, and more.

---

## 13. What's Real vs. What's Mocked

| Component | Status | Notes |
|---|---|---|
| **10 Smart Contracts** | ✅ Real | Written in real Solidity, using audited OpenZeppelin libraries, fully deployable. |
| **Ethereum Mainnet** | ✅ Real | Chain ID 1, real ETH required, connected via Alchemy RPC |
| **Google Gemini AI** | ✅ Real | Live API integration — actual Gemini 3.1 model |
| **Groq AI** | ✅ Real | Live API integration — actual Groq LPU inference |
| **ElevenLabs TTS** | ✅ Real | Live API integration — real voice generation |
| **IQai ADK** | ✅ Real | Live agent orchestration SDK |
| **IPFS via Pinata** | ✅ Real | Real decentralized NFT metadata storage |
| **Supabase Database** | ✅ Real | Production PostgreSQL with RLS |
| **Express.js Backend** | ✅ Real | Deployed on Render, 30+ API routes |
| **Next.js Frontend** | ✅ Real | Deployed on Cloudflare Pages |
| **ERC-2981 Royalties** | ✅ Real contract | Implemented correctly — but royalty payment depends on marketplaces honoring ERC-2981 |
| **Third-party audit** | ❌ Not done | OpenZeppelin base contracts are audited — **custom logic on top has NOT been audited by a third-party security firm** |
| **Decentralization** | ⚠️ Partial | Most contracts use `Ownable` — one address (the owner) controls minting, fees, pausing. Not "decentralized" in the DeFi sense. |
| **CRAFTS supply cap** | ⚠️ None | Owner can mint unlimited CRAFTS at any time |
| **Copyleaks integration** | ⚠️ Mock fallback | KAVACH text scan falls back to a mock if Copyleaks API key is not configured |
| **Cross-marketplace NFT distribution** | ⚠️ API wired | OpenSea/Rarible/Blur API integration is wired; live listings depend on API keys being set |

---

## 14. Key Numbers

| Metric | Value |
|---|---|
| Smart Contracts | 10 |
| Solidity version | ^0.8.20 |
| OpenZeppelin version | v4 |
| CRAFTS initial supply | 1,000,000 |
| CRAFTS decimals | 18 |
| NFT mint price | 0.001 ETH |
| NFT max supply | 10,000 |
| KAVACH blocked entities | 500+ seeded (10K+ schema-ready) |
| VedaScript AI parameters | 71 across 10 categories |
| Backend API routes | 30+ |
| Supabase tables | 20+ (including 10 KAVACH-specific) |
| Frontend codebase | ~63.7% TypeScript |
| AI providers | 4 (Gemini, Groq, ElevenLabs, IQai) |
| Staking cooldown | 7 days |
| Platform fee max | 10% (1,000 bps) |
| Creator royalty max | 50% (5,000 bps) |
| Default royalty split | 70% creator / 20% platform / 10% agent |

---

## 15. Infrastructure & Deployment

| Service | Provider | URL |
|---|---|---|
| **Frontend** | Cloudflare Pages | `https://comicraft.xyz` |
| **Backend API** | Render.com | `https://comicraft-main.onrender.com` |
| **SDK Service** | Render.com | `https://comicraft-sdk-service.onrender.com` |
| **Database** | Supabase | Project-specific URL |
| **AI Cache** | Upstash Redis | Serverless |
| **Ethereum RPC** | Alchemy | `https://eth-mainnet.g.alchemy.com/v2/...` |
| **Fallback RPC** | LlamaRPC | `https://eth.llamarpc.com` |
| **IPFS** | Pinata | `https://api.pinata.cloud` |
| **Block Explorer** | Etherscan | `https://etherscan.io` |

### Build System

- **Frontend**: `next build` → static export → deployed to Cloudflare Pages
- **Backend**: Node.js Express server, `npm start` → deployed to Render
- **Smart Contracts**: Hardhat (`deploy_mainnet` → `npx hardhat deploy --network ethereum_mainnet`)

---

## 16. Security & Caveats

### What OpenZeppelin Provides (Audited)

The base contracts used (`ERC20`, `ERC721`, `ERC721URIStorage`, `Ownable`, `ReentrancyGuard`, `SafeERC20`) are all from OpenZeppelin v4 — an industry-standard library that has been independently audited multiple times.

### What Has NOT Been Audited

The **custom business logic** on top of these base contracts (fee calculations, royalty splits, staking mechanics, escrow state machine, governance voting) has **not** been audited by a third-party security firm. This is a meaningful risk for any production use that involves significant funds.

### Centralization Risks

| Risk | Detail |
|---|---|
| **Owner key controls everything** | Most contracts use `Ownable`. The private key holding the `owner` role can change mint prices, pause contracts, and upgrade parameters. |
| **Unlimited CRAFTS minting** | The owner address can call `mint()` on `CraftToken.sol` at any time, creating new CRAFTS. There is no programmatic cap. |
| **Platform treasury control** | Platform fees flow to a treasury address controlled by the owner key. |

### Security Features That Are Present

- `ReentrancyGuard` on all value-handling functions (prevents reentrancy attacks — the #1 smart contract exploit)
- `SafeERC20` for all token transfers (prevents ERC-20 edge case bugs)
- CEI pattern (Checks-Effects-Interactions) in marketplace contracts
- Pull-based withdrawals in marketplace (sellers claim funds, not auto-pushed — safer)
- Row Level Security on all Supabase tables (database-level access control)
- JWT-based authentication with short expiry + refresh tokens
- EIP-191 signature verification for wallet authentication
- Rate limiting on all API endpoints
- Zod schema validation on all AI parameter inputs

---

**Powered by Ethereum Mainnet (Chain ID: 1)**

*This document is accurate as of the Ethereum Mainnet migration completed on 2026-03-15.*
