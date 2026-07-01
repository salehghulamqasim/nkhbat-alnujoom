/**
 * @file version.js
 * @description Single source of truth for the application version.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * AI AGENT INSTRUCTIONS — SEMANTIC VERSIONING (SemVer)
 * ─────────────────────────────────────────────────────────────────────────────
 * When you make ANY changes to this codebase, increment APP_VERSION here
 * following standard Semantic Versioning rules (https://semver.org):
 *
 *   MAJOR (X.0.0) — Breaking changes or complete feature overhauls
 *                    e.g. complete redesign, new routing architecture,
 *                         database schema breaking change
 *
 *   MINOR (0.X.0) — New backwards-compatible features or significant
 *                    UI/UX additions
 *                    e.g. new page, new component, new data field,
 *                         new bottom sheet, animation system added
 *
 *   PATCH (0.0.X) — Backwards-compatible bug fixes or minor tweaks
 *                    e.g. typo fix, colour tweak, minor layout adjustment,
 *                         fixing a broken edge case
 *
 * Examples:
 *   Bug fix only           → 2.0.0 → 2.0.1
 *   New SelectBottomSheet  → 2.0.1 → 2.1.0
 *   Full redesign          → 2.1.0 → 3.0.0
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ⚠️  AI AGENTS: Update this string on EVERY change set you make.
export const APP_VERSION = 'v2.0.0'
