# `<share-mastodon>` — Roadmap

This document outlines the planned improvements and features for the `<share-mastodon>` web component, prioritized by impact and dependencies. Work progresses step-by-step on feature branches, merging to `main` when complete.

**Last updated:** 2026-06-09

---

## Current State (v1.0.1)

Single-file custom HTML element (~759 lines) for sharing to Mastodon. Light DOM, zero framework, zero runtime dependencies, Biome linting.

**What's missing:**
- Tests (0 test cases)
- CI/CD automation
- External i18n system
- Several code quality issues and 3 known bugs

---

## Bugs (High Priority)

| Bug | Impact | Branch | Status |
|---|---|---|---|
| `input.value = null` coerces to string `"null"` instead of clearing (line 471) | Dialog input not cleared after invalid submission | `fix/bugs` | Pending |
| `dialog:close` event fires even when dialog re-opens for re-validation (line 500) | Event consumers get wrong signal about dialog state | `fix/bugs` | Pending |
| `encodeURIComponent()` mangles hostnames with dots (line 352) | `mastodon.social` becomes `mastodon%2Esocial`, breaks normalization | `fix/bugs` | Pending |

---

## Implementation Roadmap

### Step 0 — Project Documentation
**Status:** ✅ Complete  
Created `_PLAN.md` (this file) as a persistent team artifact.

---

### Step 1 — Testing Framework
**Branch:** `feat/testing`  
**Status:** Not started

Add test infrastructure using `@web/test-runner`. Real-browser testing, purpose-built for web components.

**Coverage targets:**
- `#normalizeHostName()` — valid/invalid hostnames, dots handling, protocol stripping
- Dialog lifecycle — open, cancel, save-valid, save-invalid (re-open), Escape key
- Custom events — `init`, `dialog:open`, `dialog:close` (conditional emit)
- `localStorage` — read, write, unavailable fallback
- i18n — language detection (attribute, ancestor, `navigator.language`), unknown-lang fallback
- Multi-instance sync — `#globalServer` sharing across page instances

**Scripts added:**
- `"test": "wtr"`
- `"test:watch": "wtr --watch"`

---

### Step 2 — Bug Fixes
**Branch:** `fix/bugs`  
**Status:** Awaiting Step 1 (tests)

Fix the 3 bugs identified above. Verified by Step 1 tests.

---

### Step 3 — Code Quality & Cleanup
**Branch:** `fix/code-quality`  
**Status:** Awaiting Step 2

- Change default language `"nl"` → `"en"` (more conventional for international component)
- Standardize `innerText` → `textContent` (avoids layout reflow, works in SSR)
- Fix `connectedCallback`: only attach `DOMContentLoaded` listener when needed
- Split `#init()` (92 lines, CRAP 210) into focused helpers: `#readConfig()`, `#buildDOM()`, `#attachListeners()`
- Remove dead code (commented line 573, redundant guards, unnecessary optional chaining)

---

### Step 4 — i18n Language Packs
**Branch:** `feat/i18n-locales`  
**Status:** Awaiting Step 3

Externalize translations into tree-shakable, CDN-friendly language packs.

**Mechanism:** `static ShareMastodon.registerLocale(code, strings)` API.

**Usage:**
```html
<script type="module" src="./dist/share-mastodon.min.js"></script>
<script type="module" src="./dist/locales/fr.js"></script>
```

**Locales included:**
- `en` (English)
- `nl` (Dutch)
- `fr`, `de`, `es` (stubs, crowd-sourceable)

---

### Step 5 — CI/CD (GitHub Actions)
**Branch:** `feat/ci-cd`  
**Status:** Awaiting Step 4

Two workflows:

**`ci.yml`** — Every push/PR to `main`:
1. Run `npm ci`
2. Lint: `biome check ./src`
3. Test: `npm test`
4. Build: `npm run build`

**`release.yml`** — Automated versioning via `release-please`:
- Reads Conventional Commit messages
- Opens Release PR with auto-generated `CHANGELOG.md`
- On merge: GitHub Release + tag + npm publish

---

### Step 6 — Polish & Backlog
**Branch:** per feature  
**Status:** TBD

Potential items:
- `clear()` method + `clear` attribute to remove stored instance
- Additional CSS custom properties for dialog button styling
- ARIA improvements (dialog announce on open)
- `prefers-reduced-motion` support
- README: fix `npm install.` typo; document npm package name once published

---

## Quick Links

- **Source:** `src/share-mastodon.js`
- **Demo:** `index.html`
- **Config:** `biome.json`, `package.json`
- **Built artifact:** `dist/share-mastodon.min.js`

---

## Contributing

Before starting a new step:
1. Check the dependency column above
2. Create a feature branch from `main`
3. Run tests after each change: `npm test`
4. Run lint: `npx biome check ./src`
5. Merge to `main` when green
6. Update this file with status

---

*Generated 2026-06-09 from comprehensive codebase audit.*
