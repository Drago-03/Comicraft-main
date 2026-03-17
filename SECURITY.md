# Security Policy

## Supported Versions

Comicraft follows a rolling support window. The latest release receives full support (features + security). The previous patch receives security and critical bug fixes only.

| Version | Status             | Support Level              |
| ------- | ------------------ | -------------------------- |
| 1.0.106 | ✅ Active (Latest) | Full (features + security) |
| 1.0.105 | ✅ Active          | Security & critical fixes  |

## Current Security Release

- **Current stable release:** 1.0.106
- **Release focus:** homepage navigation consistency, interaction hardening for non-live features, and build/release metadata alignment.
- **Previous security patch line:** 1.0.105

## Reporting a Vulnerability

1. **GitHub Private Reporting (Recommended):** Report vulnerabilities via the **[Security Tab](https://github.com/Drago-03/Comicraft/security/advisories)** on GitHub.
2. **Contact Us Privately:** Email [mantejarora@gmail.com](mailto:mantejarora@gmail.com). For sensitive details, request our PGP public key before sending the full report.

### What to Include in a Report

- Description of the vulnerability and its potential impact
- Steps to reproduce (including environment details)
- Any proof-of-concept code or screenshots
- Suggested fix, if available

### Response Timeline

| Stage               | Target SLA                  |
| ------------------- | --------------------------- |
| Acknowledgement     | 48 hours                    |
| Triage & Severity   | 72 hours                    |
| Fix (Critical/High) | 3–5 days                    |
| Fix (Medium/Low)    | 14–30 days                  |
| Public Disclosure   | Up to 90 days (coordinated) |

## Scope & AI Guidelines

We welcome reports regarding our backend, smart contracts, AI implementation, and frontend security.

### AI Security Scope (OWASP Top 10 for LLMs)

- **Prompt Injection:** Bypassing system prompts to access internal logic or user data.
- **Insecure Output Handling:** AI-generated content that executes malicious scripts (XSS).
- **Sensitive Information Disclosure:** AI outputs that leak API keys, internal paths, or PII.
- **Non-Security Issues:** AI "hallucinations" or generic jailbreaks that don't lead to data exposure are **Out-of-Scope**.

### Severity Classification

| Severity      | Example Impact                                    | Target Fix Window |
| ------------- | ------------------------------------------------- | ----------------- |
| Critical      | RCE, data exfiltration, key compromise            | 24–72 hours       |
| High          | Auth bypass, prompt injection leaking system logs | 3–5 days          |
| Medium        | XSS via AI output, SSRF with limited scope        | < 14 days         |
| Low           | Reflected XSS, minor info disclosure              | < 30 days         |
| Informational | Best practice deviation                           | As capacity       |

## Security Practices

- Dependencies audited via `npm audit` and automated scanning tools
- Helmet.js for HTTP header hardening on all Express routes
- Rate limiting (`express-rate-limit`) on public API endpoints
- Input validation via `express-validator` and Zod schemas
- CORS restricted to known origins
- Environment secrets managed via `.env.local` (never committed to version control)
- Supabase Row Level Security (RLS) enforced on all tables
- WalletConnect signature verification for wallet-based authentication
- Docker health checks using `/healthz` liveness probe
- Outbound AI API calls protected with 30-second `AbortController` timeout

## Current Technology Stack (Security-Relevant)

| Component     | Technology                         | Version  |
|---------------|------------------------------------|----------|
| Runtime       | Node.js                            | ≥ 20.0.0 |
| Framework     | Next.js                            | 14.1.0   |
| Backend       | Express.js                         | 5.1.0    |
| Database      | Supabase (PostgreSQL)              | latest   |
| Auth          | Supabase Auth + Wallet Signatures  | 2.x      |
| AI            | Google Gemini + Groq LPU           | latest   |
| TTS           | Sarvam AI Bulbul v3                | latest   |
| Blockchain    | Ethereum Mainnet via Alchemy       | latest   |
| HTTP Security | Helmet                             | 8.x      |
| Rate Limiting | express-rate-limit                 | 8.x      |
| Validation    | Zod + express-validator            | 3.x / 7.x|
| TypeScript    | TypeScript (strict)                | 5.8.x    |
| Container     | Docker (multi-stage build)         | latest   |

---

Thank you for helping keep Comicraft and our community safe!
