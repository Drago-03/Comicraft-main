# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.106] - 2026-03-17

Release details:

- Added: Added a second homepage CTA, **Upload to Library**, routing to `/upload`.
- Changed: Set project version metadata to `1.0.106`.
- Changed: Updated **Begin Formatting** CTA to route to `/create` (Forge).
- Changed: Wired engine cards to final destinations: Veda -> `/create/ai-story`, Panelra -> `/create/comic`, KavyaScript -> `/kavyascript`.
- Changed: Locked Mythloom to non-clickable state with clear **Coming Soon** treatment and improved visual layering.
- Fixed: Corrected homepage engines interaction consistency and reduced route confusion between creation and upload flows.

## [1.0.105] - 2026-03-16

Release details:

- Added: Production-grade, multi-step upload experience in `/upload` with structured review and publish flow.
- Changed: Refreshed upload page UI to align with the platform's editorial visual language.
- Fixed: Preserved existing upload/auth API behavior while modernizing the frontend flow.

## [1.0.104] - 2026-03-16

Release details:

- Changed: Complete redesign of `/create/comic` into a richer, step-based creation interface.
- Fixed: Resolved malformed JSX in homepage engines section that caused build parse failure.

## [1.0.103] - 2026-03-16

Release details:

- Changed: Improved homepage top spacing and hero-to-engines blending for cleaner visual transitions.
- Fixed: Removed conflicting scroll optimization behavior that caused intermittent scroll glitches.

## [1.0.102] - 2026-03-16

Release details:

- Changed: Hardened build stability by making experimental turbo behavior opt-in for local dev.
- Changed: Updated build pipeline to clean stale artifacts before build runs.
- Fixed: Mitigated intermittent missing chunk/build resolver failures caused by stale `.next` state.

## [1.0.101] - 2026-03-15

Release details:

- Changed: Migrated text-to-speech flow back to **Sarvam Bulbul v3** as the primary provider.
- Fixed: Removed reliance on the previous ElevenLabs path and aligned TTS behavior across frontend/backend.

## [1.0.100] - 2026-03-15

Release details:

- Added: Baseline 1.0 production release line for Comicraft platform workflows.
