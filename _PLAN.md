# `<share-mastodon>` — Roadmap

This document outlines the planned improvements and features for the `<share-mastodon>` web component, prioritized by impact and dependencies. Work progresses step-by-step on feature branches, merging to `main` when complete.

**Last updated:** 2026-06-09  
**Status:** ✅ Steps 0-5 complete | 🚀 Ready for next phase

---

## Summary of Completed Work

**Steps 1-5 are complete!** All tests passing (16/16), all commits merged to main.

| Step | Focus | Result |
|---|---|---|
| 0 | Project documentation | Created `_PLAN.md` |
| 1 | Testing framework | 16 test cases, real-browser testing |
| 2 | Bug fixes | 3 critical bugs fixed & verified |
| 3 | Code quality | Refactored, reduced complexity by 50% |
| 4 | i18n locales | Static API, 5 languages, tree-shakable |
| 5 | CI/CD | GitHub Actions, automated releases |

**What's next?** Step 6 (Polish & Backlog) and beyond — see below.

---

## Current State (v1.0.1 → v1.1.0+)

Single-file custom HTML element (~759 lines) for sharing to Mastodon. Light DOM, zero framework, zero runtime dependencies, Biome linting.

**What's missing:**
- Tests (0 test cases)
- CI/CD automation
- External i18n system
- Several code quality issues and 3 known bugs

---

## Bugs (All Fixed in Step 2)

| Bug | Impact | Branch | Status |
|---|---|---|---|
| `input.value = null` coerces to string `"null"` instead of clearing (line 471) | Dialog input not cleared after invalid submission | `fix/bugs` | ✅ Fixed |
| `dialog:close` event fires even when dialog re-opens for re-validation (line 500) | Event consumers get wrong signal about dialog state | `fix/bugs` | ✅ Fixed |
| `encodeURIComponent()` mangles hostnames with dots (line 352) | `mastodon.social` becomes `mastodon%2Esocial`, breaks normalization | `fix/bugs` | ✅ Fixed |

---

## Implementation Roadmap

### Step 0 — Project Documentation
**Status:** ✅ Complete  
Created `_PLAN.md` (this file) as a persistent team artifact.

---

### Step 1 — Testing Framework
**Branch:** `feat/testing`  
**Status:** ✅ Complete

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
**Status:** ✅ Complete

Fix the 3 bugs identified above. Verified by Step 1 tests.

---

### Step 3 — Code Quality & Cleanup
**Branch:** `fix/code-quality`  
**Status:** ✅ Complete

- Change default language `"nl"` → `"en"` (more conventional for international component)
- Standardize `innerText` → `textContent` (avoids layout reflow, works in SSR)
- Fix `connectedCallback`: only attach `DOMContentLoaded` listener when needed
- Split `#init()` (92 lines, CRAP 210) into focused helpers: `#readConfig()`, `#buildDOM()`, `#attachListeners()`
- Remove dead code (commented line 573, redundant guards, unnecessary optional chaining)

---

### Step 4 — i18n Language Packs
**Branch:** `feat/i18n-locales`  
**Status:** ✅ Complete

Externalize translations into tree-shakable, CDN-friendly language packs.

**Mechanism:** `static ShareMastodon.registerLocale(code, strings)` API.

**Usage:**
```html
<script type="module" src="./dist/share-mastodon.min.js"></script>
<script type="module" src="./dist/locales/fr.js"></script>
```

**Locales included:**
- `en` (English, built-in)
- `nl` (Dutch, optional)
- `fr`, `de`, `es` (French, German, Spanish, optional & crowd-sourceable)

---

### Step 5 — CI/CD (GitHub Actions)
**Branch:** `feat/ci-cd`  
**Status:** ✅ Complete

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
