# `<share-mastodon>` Web Component

Accessible, multilingual HTML Web Component that opens a Mastodon instance dialog and remembers your server via `localStorage`.

- No framework dependency — plain JavaScript ES Module
- Progressive enhancement: works as a plain link without JS
- Remembers the user's Mastodon instance across visits
- Built-in `en` / `nl` i18n; fully overridable via attributes

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

## DEMO

```bash
npx serve .    # Run local webserver for index.html
```

## Development

```bash
npm run build   # format + bundle → dist/share-mastodon.min.js
```

## License

[EUPL-1.2](https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12)
