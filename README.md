# `<share-mastodon>` Web Component

Accessible, multilingual HTML Web Component that opens a Mastodon instance dialog and remembers your server via `localStorage`.

- No framework dependency — plain JavaScript ES Module
- Progressive enhancement: works as a plain link without JS
- Remembers the user's Mastodon instance across visits
- Built-in `en` / `nl` i18n; fully overridable via attributes

## DEMO

```bash
npm install.   # Installs dev dependencies (only needed for building)
npm run build  # Build to /dist
npx serve .    # Run local webserver for index.html Demo-page
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
| `lang` | Force the UI language (`en` / `nl`). Auto-detected from the document by default; falls back to `nl` with a console warning for unknown languages. |
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

```bash
npm run build   # format + bundle → dist/share-mastodon.min.js
```

## License

[EUPL-1.2](https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12)
