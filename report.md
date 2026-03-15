# Comicraft — Full Technical Report

> **Version**: 3.2.0 · **Network**: Ethereum Mainnet (Chain ID 1) · **Generated**: March 2026

---

## 1. What Is Comicraft?

Comicraft (ComicCrafts) is a **Creativity Tokenization Platform** — a full-stack Web3 application that lets anyone create AI-generated stories & comics, mint them as NFTs on Ethereum, trade them on an on-chain marketplace, and earn royalties in perpetuity. It blends AI narrative generation with blockchain-verified ownership.

---

## 2. Technology Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion |
| **Backend** | Express.js (Node 20+) on Render |
| **Database** | Supabase (PostgreSQL + Row-Level Security) |
| **Cache** | Redis (via Upstash) |
| **Blockchain** | Ethereum Mainnet (Solidity ^0.8.20, Hardhat, ethers.js v6, Alchemy RPC) |
| **AI — Text** | Google Gemini 2.5 Flash, Groq LPU (LLaMA 3), IQai ADK-TS |
| **AI — Image** | Google Imagen (via Gemini API) |
| **AI — Voice** | ElevenLabs TTS |
| **IPFS** | Pinata (NFT metadata & assets) |
| **Auth** | Supabase Auth (email/password, Google OAuth, wallet SIWE) |
| **Hosting** | Cloudflare Pages (frontend), Render (backend) |

---

## 3. Smart Contracts & Decentralization

### 3.1 Contract Inventory (12 contracts)

| # | Contract | Standard | Purpose |
|---|---|---|---|
| 1 | `CraftToken.sol` | ERC-20 | CRAFTS utility token — **100M hard supply cap** |
| 2 | `CRAFTSStaking.sol` | Custom | Stake CRAFTS → governance voting power (sCRAFTS). **Pausable** for emergencies |
| 3 | `CRAFTSGovernor.sol` | Custom | DAO proposals: create, vote, finalize, execute |
| 4 | **`ComiCraftTimelock.sol`** ★ NEW | OZ TimelockController | **48-hour delay** on all privileged operations. Prevents rug-pulls |
| 5 | `ComiCraftStoryNFT.sol` | ERC-721 | Story NFT minting with IPFS metadata |
| 6 | `EthereumStoryNFT.sol` | ERC-721 | Ethereum Mainnet story NFT (migrated from Monad) |
| 7 | `DynamicNFT.sol` | ERC-721 | Evolving NFTs — metadata changes based on reader engagement |
| 8 | `NFTMarketplace.sol` | Custom | Buy/sell/auction NFTs with royalty distribution |
| 9 | `CraftsMarketplace.sol` | Custom | CRAFTS-denominated marketplace |
| 10 | `RoyaltySplitter.sol` | Custom | EIP-2981 royalty splitting between creators and collaborators |
| 11 | `LicensingEscrow.sol` | Custom | Escrow-based IP licensing with milestone release |
| 12 | `MonadStoryNFT.sol` | ERC-721 | Legacy (deprecated) — kept for historical reference |

### 3.2 Decentralization Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TOKEN HOLDERS                            │
│                  (CRAFTS owners)                            │
└──────────────┬──────────────────────────────────────────────┘
               │ 1. Stake CRAFTS → get sCRAFTS voting power
               ▼
┌──────────────────────────────┐
│     CRAFTSStaking.sol        │ ← Pausable (emergency stop)
│  1 CRAFTS = 1 vote           │
│  7-day unstake cooldown      │
│  Min 1 CRAFTS to stake       │
└──────────────┬───────────────┘
               │ 2. Vote on proposals
               ▼
┌──────────────────────────────┐
│     CRAFTSGovernor.sol       │
│  Create proposals (100+ stk) │
│  Weighted voting (For/Against│
│  /Abstain) + quorum          │
│  1-30 day voting periods     │
└──────────────┬───────────────┘
               │ 3. Passed proposals → schedule on timelock
               ▼
┌──────────────────────────────┐
│   ComiCraftTimelock.sol ★    │ ← NEW: 48-hour mandatory delay
│  Proposers = DAO multisig    │
│  Executors = anyone (after   │
│  delay)                      │
│  Admin = renounced           │
└──────────────┬───────────────┘
               │ 4. Execute after 48h
               ▼
┌──────────────────────────────┐
│     CraftToken.sol           │ ← Owner = Timelock
│  100M MAX_SUPPLY cap         │
│  mint() checks supply limit  │
│  Burnable (deflationary)     │
└──────────────────────────────┘
```

### 3.3 Key Decentralization Features

| Feature | Before (v3.1) | After (v3.2) |
|---|---|---|
| **CRAFTS Supply** | Unlimited minting (owner) | **100M hard cap** — enforced in contract |
| **Privileged Operations** | Instant owner execution | **48-hour timelock** delay |
| **Emergency Stops** | None | **Pausable** staking (owner/timelock) |
| **Governance Pipeline** | Governor only | Governor → Timelock → Execution |
| **Withdrawal Safety** | Could be paused | `completeUnstake()` **always works** (not pausable) |

### 3.4 Token Economics

- **Symbol**: CRAFTS (ERC-20)
- **Max Supply**: 100,000,000 (100M)
- **Initial Mint**: 1,000,000 (1% of max)
- **Remaining Mintable**: 99,000,000 (via DAO governance only)
- **Burn**: Anyone can burn their own tokens
- **Staking**: 1 CRAFTS = 1 sCRAFTS = 1 governance vote

---

## 4. Authentication & Session Persistence

### 4.1 Auth Flow (Fixed in v3.2)

```
User enters email + password
        │
        ▼
SignInForm → POST /api/v1/auth/login-username
        │
        ▼
Backend looks up email (by username if needed)
        │
        ▼
Supabase Auth → returns access_token + refresh_token
        │
        ▼
★ FIX: supabase.auth.setSession({ access_token, refresh_token })
        │
        ▼
onAuthStateChange fires → UserNav updates → avatar shows
        │
        ▼
Tokens persisted to localStorage for API calls
```

### 4.2 Session Persistence Across Navigation

| Mechanism | Purpose |
|---|---|
| `supabase.auth.setSession()` | Injects tokens into browser Supabase client |
| `onAuthStateChange` | Real-time listener in UserNav |
| `visibilitychange` event | Re-checks session when tab regains focus |
| `focus` event | Re-checks session on window focus |
| `StorageEvent` | Cross-tab token synchronization |

### 4.3 Auth Methods Supported

1. **Email + Password** — via backend BFF pattern (`/api/v1/auth/login-username`)
2. **Google OAuth** — via Supabase Auth (implicit flow)
3. **Wallet (SIWE)** — EIP-191 signature → nonce verification → Supabase user creation

---

## 5. AI Architecture

### 5.1 AI Providers

| Provider | Use | Model |
|---|---|---|
| **Google Gemini** | Story generation, parameter synthesis | Gemini 2.5 Flash |
| **Groq LPU** | Fast story generation, chat | LLaMA 3 70B |
| **IQai ADK-TS** | Agent-based story orchestration | IQai ADK |
| **Google Imagen** | Panel-by-panel comic illustration | Imagen |
| **ElevenLabs** | Text-to-speech narration | ElevenLabs TTS |

### 5.2 Story Generation Pipeline

1. **User configures VedaScript parameters** (71 parameters in `.toon` profile format)
2. **AI Orchestrator** selects provider (Gemini/Groq/IQai) based on mode
3. **Prompt Builder** assembles a structured prompt from all 71 parameters
4. **Story generation** → returned to frontend with chapter structure
5. **Optional**: Comic mode → Imagen generates panel illustrations
6. **Optional**: TTS mode → ElevenLabs narrates the story

### 5.3 KavyaScript Engine (Poetry)

Dedicated poetry engine with 20+ parameters: form, meter, rhyme scheme, tone, mood, calligraphy style, imagery, vocabulary level, cultural context, etc. Generates formatted poetry with downloadable `.toon` profiles.

---

## 6. KAVACH IP Compliance Engine

- **Purpose**: Enforce IP compliance for all AI-generated content
- **Blocklist**: 10,000+ trademarked/copyrighted entries
- **Legal Frameworks**: Indian Copyright Act 1957, IT Act 2000, TRIPS
- **Database**: Supabase with `kavach_scans`, `kavach_quarantine`, `kavach_blocklist`, `kavach_dmca_requests`
- **Pipeline**: Real-time scan → quarantine flagged content → DMCA request handling

---

## 7. Database Architecture (Supabase)

### Key Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles (username, avatar, wallet, role) |
| `stories` | AI-generated stories with metadata |
| `user_stories` | User-story relationship mapping |
| `nft_metadata` | On-chain NFT metadata cache |
| `kavach_*` | IP compliance scan results |
| `governance_proposals` | Off-chain proposal mirror |

### Security

- **Row-Level Security (RLS)** enabled on all tables
- **Role-based access**: user, moderator, admin
- **Auth**: Supabase Auth with JWT verification middleware

---

## 8. Backend API (Express.js)

### Route Groups (32 route files)

| Route | Purpose |
|---|---|
| `/auth` | Login, signup, wallet login, refresh, SIWE nonce |
| `/stories` | CRUD for stories, AI generation triggers |
| `/nft` | Mint, metadata, ownership queries |
| `/marketplace` | List, buy, auction, offers |
| `/kavach` | IP compliance scans, blocklist, DMCA |
| `/governance` | Proposals, votes |
| `/wallets` | Balance, transfer, token operations |
| `/royalty` | Royalty splits, payout history |
| `/tts` | Text-to-speech via ElevenLabs |
| `/groq`, `/ai` | AI generation endpoints |
| `/feed` | Social feed, notifications |
| `/admin` | Admin panel operations |
| + 20 more | Settings, rewards, subscriptions, etc. |

---

## 9. Frontend Pages (56 pages)

### Key Pages

| Page | Description |
|---|---|
| `/` (Prime) | Hero landing with vintage comic theme |
| `/create` (Forge) | Story creation hub — AI Story, Spark, KavyaScript |
| `/gallery` | Public story gallery with filters |
| `/marketplace` (Bazaar) | NFT marketplace with listings |
| `/governance` | DAO proposals and voting |
| `/kavach` | IP compliance dashboard |
| `/dashboard` | User dashboard with stories, NFTs, earnings |
| `/sign-in` / `/sign-up` | Authentication pages |
| `/docs` (Atlas) | Documentation hub |
| `/community` (Commons) | Creator community |

### Design System

- **Theme**: Vintage 1950s comic book aesthetic
- **Background**: `#EEDFCA` (aged paper) with halftone dot textures
- **Borders**: 3px solid black with box shadows (`shadow-[4px_4px_0_0_#000]`)
- **Accent**: `#cc3333` (comic red) for CTAs
- **Typography**: Font-black uppercase tracking-widest

---

## 10. Infrastructure & Deployment

| Component | Provider |
|---|---|
| Frontend | Cloudflare Pages (static export) |
| Backend API | Render (Node.js service) |
| Database | Supabase (managed PostgreSQL) |
| Blockchain RPC | Alchemy (Ethereum Mainnet) |
| IPFS | Pinata |
| Cache | Upstash Redis |
| Domain | Custom domain via Cloudflare |

---

## 11. Security Considerations

### Strengths
- ✅ OpenZeppelin contracts (battle-tested)
- ✅ ReentrancyGuard on all token-transferring functions
- ✅ 48-hour timelock on privileged operations
- ✅ 100M supply cap (prevents inflation)
- ✅ Pausable staking for emergencies
- ✅ 7-day unstake cooldown (prevents flash-loan governance attacks)
- ✅ RLS on all database tables
- ✅ SIWE (Sign In With Ethereum) for wallet auth
- ✅ JWT auth middleware on all protected routes

### Risks & Mitigations
- ⚠️ **Custom contracts not audited** — Recommend formal audit before mainnet launch
- ⚠️ **Owner key control** — Should be transferred to Timelock ASAP
- ⚠️ **Backend centralization** — API server is centralized (Render); consider decentralized alternatives
- ⚠️ **AI provider dependency** — Gemini/Groq outages affect generation

---

## 12. Real vs. Mocked Components

| Component | Status |
|---|---|
| Supabase Auth (email/Google/wallet) | ✅ Live |
| Story Generation (Gemini/Groq) | ✅ Live |
| NFT Minting (Pinata + Ethereum) | ✅ Live (requires ETH gas) |
| KAVACH IP Compliance | ✅ Live (Supabase + Edge Functions) |
| KavyaScript Poetry Engine | ✅ Live |
| Marketplace Trading | ⚠️ Contracts deployed, UI functional, not audited |
| Governance Voting | ⚠️ Contracts deployed, UI functional |
| Dynamic NFTs | ⚠️ Contract ready, evolution triggers mock |
| Royalty Distribution | ⚠️ Splitter deployed, auto-distribution not live |
| ElevenLabs TTS | ✅ Live (API key required) |

---

## 13. Key Numbers

| Metric | Value |
|---|---|
| Smart Contracts | 12 (Solidity ^0.8.20) |
| Frontend Pages | 56 |
| Backend Routes | 32 route files |
| Backend Services | 16 service files |
| AI Parameters (VedaScript) | 71 |
| KavyaScript Parameters | 20+ |
| KAVACH Blocklist | 10,000+ entries |
| Max CRAFTS Supply | 100,000,000 |
| Timelock Delay | 48 hours |
| Staking Cooldown | 7 days |
| Min Stake to Propose | 100 CRAFTS |

---

## 14. Version History (Recent)

| Version | Date | Changes |
|---|---|---|
| 3.2.0 | Mar 15, 2026 | Decentralization: TimelockController, 100M supply cap, Pausable staking. Auth fix: setSession persistence. Updated report |
| 3.1.0 | Mar 15, 2026 | Monad → Ethereum Mainnet migration |
| 3.0.1 | Mar 14, 2026 | KAVACH Phase 1, KavyaScript engine, blocklist |
| 3.0.0 | Mar 13, 2026 | Vintage comic theme redesign, MetaMask integration |
