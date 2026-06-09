# `<share-mastodon>` Web Component

Accessible, multilingual HTML Web Component that opens a Mastodon instance dialog and remembers your server via `localStorage`.

- No framework dependency — plain JavaScript ES Module
- Progressive enhancement: works as a plain link without JS
- Remembers the user's Mastodon instance across visits
- English built-in; additional languages (nl, fr, de, es) available as optional locale files
- Fully overridable via attributes

## Demo

```bash
npm install    # Install dev dependencies
npm run build  # Build to /dist (source code + locales)
npx serve .    # Run local webserver for index.html demo page
```

## Installation

```bash
# TODO
npm install share-mastodon-component
```

Or use the built file directly:

```html
<script type="module" src="./dist/share-mastodon.min.js"></script>
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
| `lang` | Force the UI language. Supported: `en` (built-in), `nl`, `fr`, `de`, `es` (require loading locale files). Auto-detected from the document by default. |
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

### Force language

```html
<share-mastodon lang="en">Share via Mastodon</share-mastodon>
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

The component ships with English built-in. Additional languages are available as optional locale files that must be explicitly loaded.

### Built-in languages

- `en` — English (built-in, no load needed)

### Optional languages

- `nl` — Dutch
- `fr` — French
- `de` — German
- `es` — Spanish

### Loading a locale

```html
<script type="module" src="./dist/share-mastodon.min.js"></script>
<script type="module" src="./dist/locales/fr.js"></script>

<!-- Now French is available -->
<share-mastodon lang="fr">Partager sur Mastodon</share-mastodon>
```

Or via npm:

```js
import { ShareMastodon } from 'share-mastodon-component';
import 'share-mastodon-component/locales/fr';

// Now French is available
```

### Adding a new language

Contribute a new locale file! Submit a pull request with a file like `src/locales/xx.js` where `xx` is the language code. Use the existing locale files as a template.

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

## Development

**Requirements:** Node.js 20.x or later (22.x LTS recommended)

```bash
npm run build       # Format and bundle component + locales to /dist
npm test            # Run test suite
npm test -- --watch # Watch mode for development
npm run format      # Format source code with Biome
```

## Publishing

This package uses automated releases via GitHub Actions and `release-please`:

1. Merge pull requests to `main` using [Conventional Commits](https://www.conventionalcommits.org/) (`fix:`, `feat:`, `BREAKING CHANGE:`)
2. A "Release PR" is automatically created with updated version and `CHANGELOG.md`
3. Merge the Release PR to trigger automated publication to npm

To publish manually:

```bash
npm publish
```

**Note:** Set the `NPM_TOKEN` secret in your GitHub repository settings to enable automated publishing.

## License

[EUPL-1.2](https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12)
