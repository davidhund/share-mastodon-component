# `<share-mastodon>` Web Component

Accessible, multilingual HTML Web Component that opens a Mastodon instance dialog and remembers your server via `localStorage`.

- No framework dependency — plain JavaScript ES Module
- Progressive enhancement: works as a plain link without JS
- Remembers the user's Mastodon instance across visits
- Separate self-contained builds for each language: English (default), Dutch, French, German, Spanish
- Fully overridable via attributes

## Getting Started

### Use in your project

Install from npm:

```bash
npm install @davidhund/share-mastodon-component
```

Then import and use the component in your HTML:

```html
<script type="module" src="https://unpkg.com/@davidhund/share-mastodon-component/dist/share-mastodon.min.js"></script>

<share-mastodon>
  <a href="https://share.joinmastodon.org/#text=Check%20this%20out">Share via Mastodon</a>
</share-mastodon>
```

Or via ES modules:

```js
import { ShareMastodon } from '@davidhund/share-mastodon-component';
```

See [Basic usage](#basic-usage) and [Attributes](#attributes) below for more options.

## Building

For development and contributing:

```bash
npm install    # Install dev dependencies
npm run build  # Build to /dist (source code + locales)
```

Then view the demo page:

```bash
npx serve .    # Start local server, then open http://localhost:3000/index.html
```

The `index.html` file includes interactive examples you can use as a reference for all features and styling options. Open your browser's **Developer Console** to see custom events being logged in real-time.

## Architecture

The component is a **single-file Web Component** (~730 lines) with no external dependencies:

- **Light DOM** — renders directly to the page (no Shadow DOM), so all styles are inherited and all selectors work
- **Vanilla JavaScript** — no framework required; works in any HTML environment
- **Progressive enhancement** — works without JavaScript (graceful fallback to standard link)
- **Storage** — remembers the user's server choice via `localStorage` (shared across all instances on the page)
- **Accessibility-first** — WCAG 2.2 AA compliance with full keyboard navigation and screen reader support

**What it does:**
1. Wraps your link text (or an existing `<a>` element)
2. Intercepts clicks to show a modal dialog
3. Saves the server hostname to `localStorage`
4. Redirects to the official Mastodon share flow
5. Emits custom events for advanced integrations

## Installation

### From npm (recommended)

```bash
npm install @davidhund/share-mastodon-component
```

### From CDN

```html
<script type="module" src="https://unpkg.com/@davidhund/share-mastodon-component/dist/share-mastodon.min.js"></script>
```

### From source

For local development, clone the repository and build:

```bash
git clone https://github.com/davidhund/share-mastodon-component.git
cd share-mastodon-component
npm install
npm run build
```

Then reference the built files:

```html
<script type="module" src="./path/to/dist/share-mastodon.min.js"></script>
```

## Basic usage

Wrap any text (or an existing `<a>`) in `<share-mastodon>`:

```html
<share-mastodon>Share via Mastodon</share-mastodon>
```

Preferably with a no-JS fallback anchor:

```html
<share-mastodon>
  <a href="https://share.joinmastodon.org/#text=Check%20this%20out">Share via Mastodon</a>
</share-mastodon>
```

## Attributes

| Attribute | Description |
|---|---|
| `server` | Preset the Mastodon instance hostname (e.g. `mastodon.social`). Skips the dialog and goes directly to the share page. Also saved to `localStorage` and shared across all instances on the page. |
| `show-icon` | Show the Mastodon SVG logo before the link. The icon has `role="presentation"` and is `1em` in size. |
| `icon-only` | Show only the icon; link text is visually hidden but remains in the accessibility tree. Implies `show-icon`. |
| `text` | Custom share text. Defaults to `document.title`. |
| `via` | Appends a `via` handle to the share text (e.g. `@you@mastodon.social`). |
| `label` | Overrides the link label text. |
| `label-explainer` | Visually hidden explainer shown when no server is set yet. |
| `edit-text` | Label for the "edit server" button (shown after a server is saved). |
| `dialog-label` | Heading label inside the dialog. |
| `dialog-hint` | Hint text inside the dialog input. |
| `dialog-hint-invalid` | Error message for an invalid server. Use `%SERVER%` as a placeholder for the entered value. |
| `dialog-save` | Label for the save button. |
| `dialog-cancel` | Label for the cancel button. |

## Examples

### Preset server

```html
<share-mastodon server="mastodon.social">Share via Mastodon</share-mastodon>
```

### With icon

```html
<share-mastodon show-icon="true">Share via Mastodon</share-mastodon>
```

### Icon only (visually hidden text)

```html
<share-mastodon icon-only="true">Share via Mastodon</share-mastodon>
```

### Custom share text and via handle

```html
<share-mastodon
  text="Check out this article!"
  via="@you@mastodon.social"
  show-icon="true"
>Share via Mastodon</share-mastodon>
```

### Override all i18n strings

```html
<share-mastodon
  label="Share this page"
  label-explainer="Enter your Mastodon server address first."
  edit-text="Change Mastodon server"
  dialog-label="Your Mastodon server:"
  dialog-hint="e.g. mastodon.social, fosstodon.org or mas.to"
  dialog-hint-invalid="'%SERVER%' does not appear to be a valid server."
  dialog-save="Continue"
  dialog-cancel="Cancel"
>Share this page</share-mastodon>
```

## Accessibility

This component is built with accessibility as a core principle:

- **WCAG 2.2 Level AA** — compliant with Web Content Accessibility Guidelines
- **Keyboard navigation** — fully operable with Tab, Enter, Escape keys
- **Screen reader friendly** — semantic HTML with proper ARIA labels and roles
- **Focus management** — visible focus indicators; focus returns to trigger after dialog closes
- **Dialog semantics** — uses native `<dialog>` element with proper role and aria-labelledby
- **Color contrast** — meets minimum AA contrast ratios
- **Respects motion preferences** — no forced animations (future enhancement)

## Browser Support

Requires **modern browsers** with support for:
- ES Modules (`import` / `export`)
- Custom Elements (Web Components)
- `<dialog>` element
- `localStorage`

**Tested on:**
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari 15+, Android Chrome 90+)

**Polyfills:** For older browsers, you'll need polyfills for Custom Elements and the `<dialog>` element.

## Custom events

All events bubble and are cancelable. They are prefixed with the tag name: `share-mastodon:`. Listen on `document` to catch all instances, or on a specific element for one instance.

### `share-mastodon:init`

Fired once when the component is fully initialised. `event.detail` is the component element itself.

```js
document.addEventListener('share-mastodon:init', (event) => {
  console.log('Initialised:', event.detail); // the <share-mastodon> element
});
```

### `share-mastodon:dialog:open`

Fired when the dialog opens. `event.detail` is an empty object.

```js
document.addEventListener('share-mastodon:dialog:open', (event) => {
  console.log('Dialog opened by:', event.target);
});
```

### `share-mastodon:dialog:close`

Fired after the dialog closes. `event.detail` contains the dialog's `returnValue`:

| Value | Meaning |
|---|---|
| `"mastodon.social"` (hostname) | User saved a valid server |
| `"cancel"` | User closed without saving |
| `""` (empty string) | Dialog closed another way (e.g. Escape or `closedby="any"`) |

```js
document.addEventListener('share-mastodon:dialog:close', (event) => {
  const returnValue = event.detail;

  if (!returnValue || returnValue === 'cancel') {
    console.log('Dialog closed without change.');
    return;
  }

  console.log('Server saved:', returnValue); // e.g. "mastodon.social"
});
```

## Localization

The component is available in multiple languages. Each language has its own self-contained build with strings baked in — simply load the appropriate build file.

### Available languages

- **`share-mastodon.min.js`** — English (default)
- **`share-mastodon.nl.min.js`** — Dutch
- **`share-mastodon.fr.min.js`** — French
- **`share-mastodon.de.min.js`** — German
- **`share-mastodon.es.min.js`** — Spanish

### Using a specific language

Choose the build that matches your language. All builds contain identical functionality with only the UI strings changed.

**Via CDN:**

```html
<!-- English (default) -->
<script type="module" src="https://unpkg.com/@davidhund/share-mastodon-component/dist/share-mastodon.min.js"></script>

<!-- Or Dutch -->
<script type="module" src="https://unpkg.com/@davidhund/share-mastodon-component/dist/share-mastodon.nl.min.js"></script>

<!-- Or French -->
<script type="module" src="https://unpkg.com/@davidhund/share-mastodon-component/dist/share-mastodon.fr.min.js"></script>

<share-mastodon>Partager sur Mastodon</share-mastodon>
```

**Via npm:**

```js
// English
import { ShareMastodon } from '@davidhund/share-mastodon-component';

// Or Dutch
import { ShareMastodon } from '@davidhund/share-mastodon-component/nl';

// Or French
import { ShareMastodon } from '@davidhund/share-mastodon-component/fr';
```

### Adding a new language

To contribute a new language, follow these steps:

1. **Scaffold the locale file:**
   ```bash
   npm run build:locale -- pt  # Creates src/locales/pt.js for Portuguese
   ```

2. **Translate the strings** in `src/locales/pt.js`:
   ```js
   export default {
     anchor_text: "Partilhar no Mastodon",
     anchor_text_explainer: "Para partilhar esta página no Mastodon, introduza o seu servidor.",
     // ... translate the remaining 6 strings
   };
   ```

3. **Build and test:**
   ```bash
   npm run build
   ```

4. **Submit a pull request** with your new locale file and updated package.json exports.

## Styles

The component injects a minimal stylesheet once (light DOM — no Shadow DOM). All layout values are exposed as CSS custom properties so you can override them without touching the source.

### CSS custom properties

| Property | Default | Applied to |
|---|---|---|
| `--share-mastodon-display` | `flex` | host element |
| `--share-mastodon-align-items` | `center` | host element |
| `--share-mastodon-gap` | `.25em` | host element; also fallback for fields gap |
| `--share-mastodon-link-display` | `flex` | `.share-mastodon__link` |
| `--share-mastodon-link-gap` | `.25em` | `.share-mastodon__link` |
| `--share-mastodon-padding` | `1.5em` | `.share-mastodon__dialog` |
| `--share-mastodon-dialog-min-width` | `min(calc(100vw - 3em), 40ch)` | `.share-mastodon__dialog` |
| `--share-mastodon-dialog-backdrop-color` | `rgba(0,0,0,.7)` | `::backdrop` |
| `--share-mastodon-fields-display` | `flex` | `.share-mastodon__dialog-fields` |
| `--share-mastodon-fields-justify-content` | `space-between` | `.share-mastodon__dialog-fields` |
| `--share-mastodon-fields-gap` | `var(--share-mastodon-gap)` | `.share-mastodon__dialog-fields` |
| `--share-mastodon-dialog-color-invalid` | `rgb(200,50,50)` | hint text in invalid state |

### CSS classnames

| Classname | Element | Notes |
|---|---|---|
| `share-mastodon__link` | `<a>` | The share anchor |
| `share-mastodon__link-icon` | `<span>` | Icon wrapper; present when `show-icon` or `icon-only` is set |
| `share-mastodon__link-icon-only` | modifier on `<a>` | Added when `icon-only` is set |
| `share-mastodon__text` | `<span>` | Link label text |
| `share-mastodon__explainer` | `<span>` | Visually hidden hint shown before a server is saved |
| `share-mastodon__visually-hidden` | utility | Visually hides content while keeping it in the accessibility tree |
| `share-mastodon__edit` | `<button>` | "Edit server" button; hidden until a server is saved |
| `share-mastodon__edit-text` | `<span>` | Text inside the edit button |
| `share-mastodon__dialog` | `<dialog>` | The instance dialog |
| `share-mastodon__dialog-form` | `<form>` | Form inside the dialog |
| `share-mastodon__dialog-label` | `<label>` | Dialog heading label |
| `share-mastodon__dialog-hint` | `<p>` | Hint / error paragraph |
| `share-mastodon__dialog-fields` | `<div>` | Flex wrapper for input and buttons |
| `share-mastodon__dialog-input` | `<input>` | Server hostname input |
| `share-mastodon__dialog-save` | `<button>` | Save / continue button |
| `share-mastodon__dialog-save-text` | `<span>` | Text inside the save button |
| `share-mastodon__dialog-cancel` | `<button>` | Cancel / close button |
| `share-mastodon__dialog-cancel-text` | `<span>` | Text inside the cancel button |
| `share-mastodon__dialog-is-invalid` | modifier on `<dialog>` | Added when the entered server fails validation |

## Troubleshooting

### Component not showing up
- Ensure you've run `npm run build` to generate the `/dist` folder
- Verify the script tag points to the correct path: `./dist/share-mastodon.min.js`
- Check browser console for errors

### Dialog doesn't open when I click the link
- Verify JavaScript is enabled
- Check that `<share-mastodon>` tag is properly closed
- Open browser console to see any error messages
- For IE11: this component does not support IE11 (requires ES6+ and `<dialog>`)

### localStorage not persisting across page loads
- Ensure the user hasn't disabled cookies/storage in their browser settings
- Check if the app is running in a private/incognito window (localStorage disabled by default)
- Verify the browser isn't configured to clear storage on exit

### Changing languages
- Each language has its own separate build: `share-mastodon.min.js` (English), `share-mastodon.nl.min.js` (Dutch), etc.
- Load the build that matches the desired language. The UI strings are baked into each build at compile time.

### Styling not applying
- Remember: the component uses **light DOM** (not Shadow DOM), so CSS cascade and specificity apply normally
- To override styles, use CSS custom properties or target the BEM classnames (see "Styles" section)
- Avoid using too-specific selectors that might conflict with your page styles

## Development

**Requirements:** Node.js LTS or later

```bash
npm run build       # Format and build all locale variants to /dist
npm test            # Run test suite
npm test -- --watch # Watch mode for development
npm run format      # Format source code with Biome
npm run build:locale -- xx  # Scaffold a new locale (xx = language code)
```

## License

[EUPL-1.2](./LICENSE.txt) — See [LICENSE.txt](./LICENSE.txt) for full details.

**Summary:** Open source with copyleft protection. You can use, modify, and distribute this component freely, but any modifications must also be open source under EUPL-1.2 or a compatible license.
