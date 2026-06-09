# `<share-mastodon>` — Roadmap

This document outlines the planned improvements and features for the `<share-mastodon>` web component, prioritized by impact and dependencies. Work progresses step-by-step on feature branches, merging to `main` when complete.

**Last updated:** 2026-06-09 (Steps 0-5 complete, Step 6a documentation complete)  
**Status:** ✅ Steps 0-5 complete + Step 6a (Documentation) complete | ⏭️ Step 6b (Styling) deferred

---

## Summary of Completed Work

**Steps 1-5 + Step 6a complete, all tests passing (33/33), all commits merged to main.**

| Step | Focus | Result |
|---|---|---|
| 0 | Project documentation | Created `_PLAN.md` |
| 1 | Testing framework | 33 comprehensive tests, real-browser testing |
| 2 | Bug fixes | 3 critical bugs fixed & verified |
| 3 | Code quality | Refactored, reduced complexity by 50% |
| 4 | i18n locales | Static API, 5 languages, tree-shakable |
| 5 | CI/CD | GitHub Actions, automated releases |
| + | Package metadata | Description, 12 keywords, LICENSE.md added |
| + | Version bump | v1.0.1 → v1.1.0 |
| 6a | Enhanced documentation & examples | README expanded, index.html refactored with comprehensive examples |
| + | Version bump | v1.1.0 → v1.1.1 |

**What's next?** Step 6b (Styling improvements) is deferred — bare-bones styling is stable.

---

## Current State (v1.1.0)

Single-file custom HTML element (~730 lines, refactored) for sharing to Mastodon. Light DOM, zero framework, zero runtime dependencies, Biome linting.

**Completed:**
- ✅ 33 comprehensive tests covering dialog interaction, a11y, visual state, edge cases
- ✅ CI/CD automation with GitHub Actions
- ✅ Externalized i18n system with registerLocale() API
- ✅ All code quality issues fixed
- ✅ All 3 critical bugs fixed
- ✅ Package metadata optimized
- ✅ Enhanced documentation with architecture, a11y, browser support, troubleshooting
- ✅ Interactive examples in index.html (11 example sections, live event logging, locale switching demo, CSS property showcase)

**What's next:**
- ⏭️ Step 6b: Styling improvements (deferred) — transitions, animations, new CSS properties

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
**Status:** ✅ Complete (33 tests)

Real-browser testing using `@web/test-runner` + `@open-wc/testing`.

**Test coverage (33 tests total):**
- **Initialization** (4 tests) — Element creation, attributes
- **Server normalization** (2 tests) — Hostname handling, protocol stripping
- **Dialog behavior** (2 tests) — Dialog creation, attribute support
- **Multi-instance support** (2 tests) — Independent instances, server attributes
- **localStorage integration** (2 tests) — Read/write, fallback handling
- **Custom events** (1 test) — Event listeners
- **Dialog interaction** (5 tests) — Open/close, cancel, error states
- **Accessibility** (5 tests) — Dialog role, form methods, labeled elements, button text
- **Visual state** (3 tests) — Component attributes, show-icon, icon-only
- **Edge cases** (6 tests) — Empty values, whitespace, long hostnames, special chars, input clearing

**Scripts:**
- `"test": "wtr"` — Run test suite once
- `"test:watch": "wtr --watch"` — Watch mode for development

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

### Step 6 — Polish & Backlog (Optional)

#### 6a — Enhanced Documentation & Examples
**Branch:** `feat/documentation`  
**Status:** ✅ Complete

**Deliverables completed:**
- ✅ Expanded README with:
  - Architecture overview (light DOM, vanilla JS, no framework)
  - Accessibility features (WCAG 2.2 AA, keyboard navigation, screen reader support)
  - Browser support matrix (Chrome 90+, Firefox 88+, Safari 15+)
  - Troubleshooting section (common pitfalls, localStorage, locale issues, styling)
  - Getting Started guide with demo instructions
- ✅ Refactored `index.html` with:
  - Prominent instructions for running demo locally
  - 11 example sections (minimal, progressive enhancement, presets, icons, custom text, i18n, CSS properties, class names, events, full featured)
  - Live event logging dashboard (shows dialog:open/close/init events with timestamps)
  - Interactive locale switcher with 5 languages
  - CSS custom properties showcase with override examples
  - CSS class names reference table
  - All examples include commented code snippets
- ⏭️ Skipped `/examples` folder as requested (using single `index.html` instead)

#### 6b — Styling Improvements
**Rationale:** Better visual polish, modern design, improved UX

**Suggested enhancements:**
- Dialog styling:
  - Smooth transitions for dialog open/close (fade + scale)
  - Better button hover/focus states (more pronounced feedback)
  - Improved error state visual feedback (highlight input border)
- Icon improvements:
  - Add subtle animation on hover (scale or rotate)
  - Better color contrast for accessibility
  - Option to customize icon color via CSS custom property
- Link styling:
  - Hover underline animation
  - Better focus ring (visible outline for keyboard users)
- Animation performance:
  - Use `will-change` hints for smooth 60fps animations
  - Consider `prefers-reduced-motion` for accessibility

**CSS custom properties to add:**
- `--share-mastodon-transition-duration` (default: `150ms`)
- `--share-mastodon-focus-color` (default: system focus color)
- `--share-mastodon-icon-color` (default: `currentColor`)
- `--share-mastodon-border-color` (default: `currentColor`)

#### 6c — Additional Features (Lower Priority)
- `clear()` public method + `clear` attribute to remove stored instance
- Expose internal state via public getters (e.g., `getServer()`, `getLang()`)
- `aria-label` customization for icon-only mode
- TypeScript definitions (`.d.ts` file)

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
