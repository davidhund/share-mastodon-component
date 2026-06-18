/**
 * A <share-mastodon> HTML Web Component
 * ------------------------------------
 * Functionality inspired by https://github.com/codepo8/share-mastodon
 * (Some) code inspired by https://gomakethings.com/snippets/boilerplates/web-component/
 */
import strings from "./locales/en.js";

export class ShareMastodon extends HTMLElement {
	/** localStorage key for the shared server (same for all instances) */
	static #storageKey = "share-mastodon-instance";
	/** Shared Mastodon host for every <share-mastodon> on the page */
	/** @type {string | null} */
	static #globalServer = null;
	/** @type {Set<ShareMastodon>} */
	static #instances = new Set();
	/** @type {object} */
	static #strings = strings;

	/** Sync UI for all instances when global server is updated */
	static #syncAllInstances() {
		for (const el of ShareMastodon.#instances) {
			if (el.#isInitialized) {
				el.#applyGlobalServerToUi();
			}
		}
	}

	// Declare private instance properties
	// These get defined inside the init() method
	/** @type {boolean} */ #isInitialized = false;
	/** @type {string} */ #id = Math.random().toString(36).slice(2);
	/** @type {string} */ #name;
	/** @type {HTMLAnchorElement | null} */ #anchor;
	/** @type {string} */ #anchor_original_href;
	/** @type {HTMLElement | null} */ #explainer;
	/** @type {HTMLButtonElement} */ #edit;
	/** @type {HTMLDialogElement} */ #dialog;
	/** @type {(ev: Event) => void} */ #onDialogClose; // `this` is the Event
	/** @type {boolean} */ #showIcon = false;
	/** @type {boolean} */ #iconOnly = false;
	/** @type {boolean} */ #isLocalStorageAvailable = false;
	/** @type {string} */ #text;
	/** @type {string} */ #via;

	/**
	 * Initialize on connect
	 * Checks for DOM status first, ensuring code doesn't
	 * run before required elements exist in the DOM.
	 * ----------------------------- */
	connectedCallback() {
		if (document.readyState !== "loading") {
			this.#init();
		} else {
			document.addEventListener("DOMContentLoaded", () => this.#init(), {
				once: true,
			});
		}
	}

	// Cleanup per-instance dialog listeners
	disconnectedCallback() {
		ShareMastodon.#instances.delete(this);
		if (this.#dialog && this.#onDialogClose) {
			this.#dialog.removeEventListener("close", this.#onDialogClose);
		}
	}

	// An array of 'reactive' attributes to observe
	/** @todo Currently only `server` is reactive */
	static observedAttributes = ["server"];

	/**
	 * Runs when the value of an attribute is changed on the component
	 * @requires static observedAttributes property
	 * @param  {String} name The attribute name
	 * @param  {String} old  The old attribute value
	 * @param  {String} new  The new attribute value
	 * ----------------------------- */
	attributeChangedCallback(name, old, cur) {
		if (!this.#isInitialized) return;
		if (old === cur) return;
		if (name === "server") {
			this.#setInstance(cur || null);
		}
	}

	/**
	 * @private read server from attributes, global state, or storage
	 * ----------------------------- */
	#readServerConfig() {
		let server = this.getAttribute("server");

		if (!server && ShareMastodon.#globalServer) {
			server = ShareMastodon.#globalServer;
		}
		// Try and read from storage
		if (!server) {
			server = this.#readLocalStorage(ShareMastodon.#storageKey);
			this.#isLocalStorageAvailable = server !== -1;
		}

		// Something went wrong reading/writing from LS
		if (server === -1) {
			this.#isLocalStorageAvailable = false;
		} else if (server) {
			ShareMastodon.#globalServer = server;
			this.#isLocalStorageAvailable =
				this.#writeLocalStorage(ShareMastodon.#storageKey, server) !== -1;
		}

		return server;
	}

	/**
	 * @private build DOM elements (anchor, icon, edit button, dialog, stylesheet)
	 * ----------------------------- */
	#buildDOM() {
		if (!this.#anchor) {
			this.#createAnchor(this.textContent);
		} else {
			this.#updateAnchor();
		}

		// Add Icon before link
		if (this.#showIcon === true) {
			this.#createIcon();
		}

		// Add Edit Link
		this.#createEditButton();

		// Add Dialog
		this.#createDialog();

		// Add default stylesheet
		if (!document.getElementById(`${this.#name}-css`)) {
			this.#createStyleSheet();
		}
	}

	/**
	 * @private initialize the component
	 * @returns {ThisType}
	 * ----------------------------- */
	#init() {
		if (this.#isInitialized) return;

		// Read server from attributes, global state, and storage
		this.#readServerConfig();

		// Setup component properties
		this.#name = this.tagName.toLowerCase();
		this.#anchor = this.querySelector("a");
		this.#text = this.getAttribute("text");
		this.#via = this.getAttribute("via");

		const showIcon = this.getAttribute("show-icon");
		const iconOnly = this.getAttribute("icon-only");
		this.#showIcon = showIcon ? showIcon !== "false" : false;
		this.#iconOnly = iconOnly ? iconOnly !== "false" : false;
		if (this.#iconOnly) {
			this.#showIcon = true;
		}

		// Setup translatable strings
		this.#setString("anchor_text", this.getAttribute("label"));
		this.#setString(
			"anchor_text_explainer",
			this.getAttribute("label-explainer"),
		);
		this.#setString("edit_text", this.getAttribute("edit-text"));
		this.#setString("dialog_label", this.getAttribute("dialog-label"));
		this.#setString("dialog_hint", this.getAttribute("dialog-hint"));
		this.#setString(
			"dialog_hint_invalid",
			this.getAttribute("dialog-hint-invalid"),
		);
		this.#setString("dialog_save", this.getAttribute("dialog-save"));
		this.#setString("dialog_cancel", this.getAttribute("dialog-cancel"));

		if (!this.getAttribute("id")) {
			this.setAttribute("id", `${this.#name}-${this.#id}`);
		}

		// Build DOM elements
		this.#buildDOM();

		// Attach event listeners
		this.addEventListener("click", this);

		ShareMastodon.#instances.add(this);
		// Fire a Custom Event
		this.#isInitialized = true;
		ShareMastodon.#syncAllInstances();
		this.#emit("init", this);
	}

	/**
	 * @private
	 * Emit a custom event
	 * @param  {String} type   The event type
	 * @param  {Object} detail Any details to pass along with the event
	 * ----------------------------- */
	#emit(type, detail = {}) {
		return this.dispatchEvent(
			new CustomEvent(`${this.#name}:${type}`, {
				bubbles: true,
				cancelable: true,
				detail,
			}),
		);
	}


	/**
	 * @private
	 * @param {string} phrase key of i18n strings
	 * @returns {string}
	 * ----------------------------- */
	#getString(phrase) {
		if (!phrase) return "";
		return ShareMastodon.#strings[phrase] ?? "";
	}

	/**
	 * @private
	 * @param {string} phrase key of i18n strings
	 * @param {string} value override value
	 * @returns {string} value
	 * ----------------------------- */
	#setString(phrase, value) {
		if (!phrase || !value) return "";
		ShareMastodon.#strings[phrase] = value;
		return value;
	}

	/**
	 * Try and read localstorage key value, returns -1 when unavailable
	 * @private
	 * @param {string} key           localstorage key
	 * @returns {string | null | -1} localstorage value
	 * ----------------------------- */
	#readLocalStorage(key) {
		if (!key) {
			return null;
		}
		try {
			const val = localStorage.getItem(key);
			return val || null;
		} catch {
			return -1;
		}
	}

	/**
	 * Try and write localstorage key value, returns -1 when unavailable
	 * @private
	 * @param {string} key           localstorage key
	 * @param {string} val           localstorage value
	 * @returns {string | null | -1} localstorage value
	 * ----------------------------- */
	#writeLocalStorage(key, val) {
		if (!key || !val) {
			return null;
		}
		try {
			localStorage.setItem(key, val);
			return val;
		} catch {
			return -1;
		}
	}

	/**
	 * Try and delete localstorage key, returns -1 when unavailable
	 * @private
	 * @param {string} key           localstorage key
	 * @returns {string | null | -1} localstorage value
	 * ----------------------------- */
	#deleteLocalStorage(key) {
		if (!key) {
			return null;
		}
		try {
			localStorage.removeItem(key);
			return key;
		} catch {
			return -1;
		}
	}

	/**
	 * Normalize user input to hostname only (no protocol/path)
	 * @private
	 * @param {string} rawInput
	 * @returns {string | null}
	 * ----------------------------- */
	#normalizeHostName(rawInput) {
		// Remove:
		// - protocol
		// - whitespace
		// - trailing slash
		const trimmed = String(rawInput)
			.replace(/https?:\/\//gi, "")
			.replace(/\s/g, "")
			.replace(/\/$/g, "")
			.trim();

		if (!trimmed) return null;
		// Test for tld-ness
		if (!trimmed.match(/\.\w{2,}/)) return null;
		// No weird punctuation: this might be too strict...
		if (trimmed.match(/[!)(]/)) return null;
		if (encodeURIComponent(trimmed).match(/%\d/)) return null;
		try {
			const instanceUrl = new URL(`https://${trimmed}`);
			return instanceUrl.hostname;
		} catch {
			return null;
		}
	}

	/**
	 * Handle events for the web component
	 * `this` is the web-component!
	 * @param  {Event} event
	 * ----------------------------- */
	handleEvent(event) {
		const { type, target } = event;
		if (type === "click") {
			const anchor = target.closest("a");
			const button = target.closest("button");
			if (anchor && anchor === this.#anchor) {
				// clicked link anchor
				// Instance (hostname) is set, follow link
				if (ShareMastodon.#globalServer) {
					return event;
				}

				// .. no instance: open Dialog to set
				event.preventDefault();
				this.#openDialog();
			} else if (button && button === this.#edit) {
				// clicked Edit button ?
				event.preventDefault();
				this.#openDialog();
			}
		}
	}

	/**
	 * Create a <dialog> for our instance question
	 * As last-child to body.
	 * Singleton: 1 <dialog> is re-used between
	 * <web-component> instances!
	 * `this` is the web-component!
	 * ----------------------------- */
	#createDialog() {
		if (this.#dialog) return;

		const identifier = `${this.#name}__dialog-${this.#id}`;
		const labelId = `${identifier}-label`;
		const hintId = `${identifier}-hint`;
		const inputId = `${identifier}-input`;

		this.insertAdjacentHTML(
			"beforeend",
			`
				<dialog id="${identifier}" class="${this.#name}__dialog" aria-labelledby="${labelId}" closedby="any">
					<form class="${this.#name}__dialog-form" method="dialog">
						<label id="${labelId}" class="${this.#name}__dialog-label" for="${inputId}">${this.#getString("dialog_label")}</label>
						<p id="${hintId}" class="${this.#name}__dialog-hint">${this.#getString("dialog_hint")}</p>
						<div class="${this.#name}__dialog-fields">
							<input name="instance" data-1p-ignore data-bwignore data-lpignore="true" data-form-type="other" id="${inputId}" class="${this.#name}__dialog-input" type="text" value="" aria-describedby="${hintId}" autofocus="" autocomplete="url">
							<button type="submit" value="save" class="${this.#name}__dialog-save"><span class="${this.#name}__dialog-save-text">${this.#getString("dialog_save")}</span></button>
							<button type="button" value="cancel" class="${this.#name}__dialog-cancel"><span class="${this.#name}__dialog-cancel-text">${this.#getString("dialog_cancel")}</span></button>
						</div>
					</form>
				</dialog>`,
		);

		const dialog = this.querySelector(`#${identifier}`);
		if (!dialog) return;

		const dialogCloseButton = dialog.querySelector('button[value="cancel"]');
		if (dialogCloseButton) {
			dialogCloseButton.addEventListener("click", () => {
				dialog.close("cancel");
			});
		}

		this.#dialog = dialog;
		this.#onDialogClose = () => this.#closeDialog();
		dialog.addEventListener("close", this.#onDialogClose);
	}

	/**
	 * Open the dialog: `this` is the web-component!
	 * ----------------------------- */
	#openDialog() {
		const dialog = this.#dialog;
		if (!dialog) return;
		this.#emit("dialog:open");

		if (ShareMastodon.#globalServer) {
			const input = dialog.querySelector('input[type="text"]');
			if (input) {
				input.value = ShareMastodon.#globalServer;
			}
		}

		dialog.returnValue = "";
		dialog.showModal();
	}

	/**
	 * Close the dialog: `this` is the web-component!
	 * ----------------------------- */
	#closeDialog() {
		const dialog = this.#dialog;
		if (!dialog) return;

		this.#resetDialogState();
		let shouldEmitClose = true;
		if (dialog.returnValue === "save") {
			// save: update instance value
			const input = dialog.querySelector('input[type="text"]');
			if (!input) return;

			let updated = null;
			if (input?.value) {
				// normalize hostname
				updated = this.#normalizeHostName(input.value);
				if (!updated) {
					this.#setDialogInvalidState(encodeURIComponent(input.value));
					input.value = "";
					shouldEmitClose = false;
				} else {
					input.value = updated;
					dialog.returnValue = updated;
				}
			}

			if (shouldEmitClose && updated !== ShareMastodon.#globalServer) {
				if (updated) {
					this.#setInstance(updated);

					// Finally open a new window programatically
					// - this is not ideal but not *required*
					// because the anchor href is changed anyway.
					// It simply *directly* opens the window
					// (if possible). Otherwise the user could/should
					// click the updated share-anchor
					// ---
					window?.open(
						this.#anchor.getAttribute("href"),
						"mastodon",
						"noopener, noreferrer",
					);
				} else {
					this.#removeInstance();
				}
			}
		}

		if (shouldEmitClose) {
			this.#emit("dialog:close", dialog.returnValue);
		}
	}

	/**
	 * Set dialog invalid UI state
	 * @param {string} detail
	 * ----------------------------- */
	#setDialogInvalidState(detail) {
		const dialog = this.#dialog;
		if (!dialog) return;
		dialog.classList.add(`${this.#name}__dialog-is-invalid`);
		const hint = dialog.querySelector(`.${this.#name}__dialog-hint`);
		if (hint) {
			hint.textContent = this.#getString("dialog_hint_invalid").replace(
				"%SERVER%",
				detail,
			);
		}
		// Error: re-open dialog
		this.#openDialog();
	}

	/**
	 * Reset dialog error UI state
	 * ----------------------------- */
	#resetDialogState() {
		const dialog = this.#dialog;
		if (!dialog) return;
		dialog.classList.remove(`${this.#name}__dialog-is-invalid`);
		const hint = dialog.querySelector(`.${this.#name}__dialog-hint`);
		if (hint) {
			hint.textContent = this.#getString("dialog_hint");
		}
	}

	/**
	 * Create an <a> anchor for our instance
	 * @param {string} _textContent
	 * ----------------------------- */
	#createAnchor(_textContent) {
		if (!_textContent) return;
		const text = [
			`${this.#text || document.title}`,
			location.href,
			`${this.#via || ""}`,
		]
			.filter(Boolean)
			.join("\n");
		this.#anchor = document.createElement("a");
		this.#anchor.setAttribute(
			"href",
			`https://share.joinmastodon.org/#text=${encodeURIComponent(text)}`,
		);
		this.#anchor.classList.add(`${this.#name}__link`);
		this.#anchor.textContent = _textContent;
		this.#updateAnchor();
		this.innerHTML = "";
		this.append(this.#anchor);
	}

	/**
	 * Update anchor props and create
	 * visually hidden explanation.
	 * ----------------------------- */
	#updateAnchor() {
		this.#anchor_original_href = this.#anchor.getAttribute("href");
		if (ShareMastodon.#globalServer) {
			this.#anchor.setAttribute("href", this.#buildMastodonShareUrl());
		}
		this.#anchor.setAttribute("target", "_blank");
		this.#anchor.setAttribute("rel", "noreferrer noopener");
		this.#anchor.classList.add(`${this.#name}__link`);

		// Clear any existing text nodes before adding the span
		this.#anchor.innerHTML = "";

		const textContent = document.createElement("span");
		textContent.classList.add(`${this.#name}__text`);
		textContent.textContent = this.#getString("anchor_text");
		this.#anchor.append(textContent);

		// Create Explainer
		this.#explainer = document.createElement("span");
		this.#explainer.classList.add(
			`${this.#name}__explainer`,
			`${this.#name}__visually-hidden`,
		);
		this.#explainer.textContent = ShareMastodon.#globalServer
			? ``
			: `. ${this.#getString("anchor_text_explainer")}`;
		this.#anchor.insertAdjacentElement("beforeend", this.#explainer);
	}

	/**
	 * Construct the Mastodon Share URL
	 * @returns {string}
	 * ----------------------------- */
	#buildMastodonShareUrl() {
		if (!ShareMastodon.#globalServer) {
			return "";
		}
		const text = [
			`${this.#text || document.title}`,
			location.href,
			`${this.#via || ""}`,
		]
			.filter(Boolean)
			.join("\n");
		return `https://${ShareMastodon.#globalServer}/share?text=${encodeURIComponent(text)}`;
	}

	/**
	 * Create icon markup
	 * ----------------------------- */
	#createIcon() {
		if (!this.#anchor) return;
		const _icon = document.createElement("span");
		_icon.innerHTML = `<svg role="presentation" height="1em" viewBox="0 0 74 79" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M73.7014 17.4323C72.5616 9.05152 65.1774 2.4469 56.424 1.1671C54.9472 0.950843 49.3518 0.163818 36.3901 0.163818H36.2933C23.3281 0.163818 20.5465 0.950843 19.0697 1.1671C10.56 2.41145 2.78877 8.34604 0.903306 16.826C-0.00357854 21.0022 -0.100361 25.6322 0.068112 29.8793C0.308275 35.9699 0.354874 42.0498 0.91406 48.1156C1.30064 52.1448 1.97502 56.1419 2.93215 60.0769C4.72441 67.3445 11.9795 73.3925 19.0876 75.86C26.6979 78.4332 34.8821 78.8603 42.724 77.0937C43.5866 76.8952 44.4398 76.6647 45.2833 76.4024C47.1867 75.8033 49.4199 75.1332 51.0616 73.9562C51.0841 73.9397 51.1026 73.9184 51.1156 73.8938C51.1286 73.8693 51.1359 73.8421 51.1368 73.8144V67.9366C51.1364 67.9107 51.1302 67.8852 51.1186 67.862C51.1069 67.8388 51.0902 67.8184 51.0695 67.8025C51.0489 67.7865 51.0249 67.7753 50.9994 67.7696C50.9738 67.764 50.9473 67.7641 50.9218 67.7699C45.8976 68.9569 40.7491 69.5519 35.5836 69.5425C26.694 69.5425 24.3031 65.3699 23.6184 63.6327C23.0681 62.1314 22.7186 60.5654 22.5789 58.9744C22.5775 58.9477 22.5825 58.921 22.5934 58.8965C22.6043 58.8721 22.621 58.8505 22.6419 58.8336C22.6629 58.8167 22.6876 58.8049 22.714 58.7992C22.7404 58.7934 22.7678 58.794 22.794 58.8007C27.7345 59.9796 32.799 60.5746 37.8813 60.5733C39.1036 60.5733 40.3223 60.5733 41.5447 60.5414C46.6562 60.3996 52.0437 60.1408 57.0728 59.1694C57.1983 59.1446 57.3237 59.1233 57.4313 59.0914C65.3638 57.5847 72.9128 52.8555 73.6799 40.8799C73.7086 40.4084 73.7803 35.9415 73.7803 35.4523C73.7839 33.7896 74.3216 23.6576 73.7014 17.4323ZM61.4925 47.3144H53.1514V27.107C53.1514 22.8528 51.3591 20.6832 47.7136 20.6832C43.7061 20.6832 41.6988 23.2499 41.6988 28.3194V39.3803H33.4078V28.3194C33.4078 23.2499 31.3969 20.6832 27.3894 20.6832C23.7654 20.6832 21.9552 22.8528 21.9516 27.107V47.3144H13.6176V26.4937C13.6176 22.2395 14.7157 18.8598 16.9118 16.3545C19.1772 13.8552 22.1488 12.5719 25.8373 12.5719C30.1064 12.5719 33.3325 14.1955 35.4832 17.4394L37.5587 20.8853L39.6377 17.4394C41.7884 14.1955 45.0145 12.5719 49.2765 12.5719C52.9614 12.5719 55.9329 13.8552 58.2055 16.3545C60.4017 18.8574 61.4997 22.2371 61.4997 26.4937L61.4925 47.3144Z" fill="inherit"/></svg>`;
		_icon.classList.add(`${this.#name}__link-icon`, "icon");
		this.#anchor.prepend(_icon);
		if (this.#iconOnly) {
			this.#anchor.classList.add(`${this.#name}__link-icon-only`);
			const _text = this.#anchor.querySelector(`.${this.#name}__text`);
			if (_text) {
				_text.classList.add(`${this.#name}__visually-hidden`);
			}
		}
	}

	/**
	 * Create Edit Instance Button
	 * ----------------------------- */
	#createEditButton() {
		const editBtn = document.createElement("button");
		const editTxt = document.createElement("span");
		editBtn.classList.add(`${this.#name}__edit`);
		editBtn.setAttribute("type", "button");
		if (!ShareMastodon.#globalServer) {
			editBtn.setAttribute("hidden", true);
		}
		editTxt.classList.add(`${this.#name}__edit-text`);
		editTxt.textContent = this.#getString("edit_text");
		editBtn.append(editTxt);
		this.append(editBtn);
		this.#edit = editBtn;
	}

	/**
	 * Create default stylesheet once.
	 * ----------------------------- */
	#createStyleSheet() {
		const styles = document.getElementById(`${this.#name}-css`);
		if (!styles) {
			document.body.insertAdjacentHTML(
				"beforeend",
				`
					<style id="${this.#name}-css">
					share-mastodon {
						display: var(--share-mastodon-display, flex);
						align-items: var(--share-mastodon-align-items, center);
						gap: var(--share-mastodon-gap, .25em);
					}

					.share-mastodon__link {
						display: var(--share-mastodon-link-display, flex);
						gap: var(--share-mastodon-link-gap, .25em);
					}
					.share-mastodon__link-icon { display: flex; }
					.share-mastodon__link-icon > svg { margin: auto; }

					.share-mastodon__dialog {
						position: relative;
						padding: var(--share-mastodon-padding, 1.5em);
						min-width: var(--share-mastodon-dialog-min-width, min(calc(100vw - var(--share-mastodon-padding, 1.5em) * 2), 40ch));
					}
					.share-mastodon__dialog::backdrop {
						background-color: var(--share-mastodon-dialog-backdrop-color, rgba(0,0,0,.7));
					}

					.share-mastodon__dialog-fields {
						display: var(--share-mastodon-fields-display, flex);
						justify-content: var(--share-mastodon-fields-justify-content, space-between);
						gap: var(--share-mastodon-fields-gap, var(--share-mastodon-gap, .25em));
					}

					.share-mastodon__dialog-input {
						flex-basis: max(50%, 30ch);
					}

					.share-mastodon__dialog-cancel {
						position: absolute;
						top: var(--share-mastodon-padding, 1.5em);
						right: var(--share-mastodon-padding, 1.5em);
					}

					.share-mastodon__dialog-is-invalid .share-mastodon__dialog-hint {
						color: var(--share-mastodon-dialog-color-invalid, rgb(200,50,50));
					}

					.share-mastodon__visually-hidden {
						position: absolute;
						clip: rect(0 0 0 0);
						clip-path: inset(50%);
						height: 1px;
						width: 1px;
						overflow: hidden;
						white-space: nowrap;
					}
					</style>`,
			);
		}
	}

	/**
	 * Set Instance and update UI
	 * ----------------------------- */
	#setInstance(val) {
		const server = val || null;
		ShareMastodon.#globalServer = server;
		if (this.#isLocalStorageAvailable) {
			if (server) {
				this.#writeLocalStorage(ShareMastodon.#storageKey, server);
			} else {
				this.#deleteLocalStorage(ShareMastodon.#storageKey);
			}
		}
		ShareMastodon.#syncAllInstances();
	}

	/**
	 * Apply the shared global server to this instance's DOM (anchor, explainer, edit).
	 * @private
	 * ----------------------------- */
	#applyGlobalServerToUi() {
		if (!this.#anchor) return;
		if (ShareMastodon.#globalServer) {
			this.#anchor.setAttribute("href", this.#buildMastodonShareUrl());
			if (this.#explainer) {
				this.#explainer.textContent = "";
			}
			if (this.#edit) {
				this.#edit.removeAttribute("hidden");
			}
		} else {
			this.#anchor.setAttribute("href", this.#anchor_original_href);
			if (this.#explainer) {
				this.#explainer.textContent = `. ${this.#getString("anchor_text_explainer")}`;
			}
			if (this.#edit) {
				this.#edit.setAttribute("hidden", true);
			}
		}
	}

	/**
	 * Remove Instance and update UI
	 * ----------------------------- */
	#removeInstance() {
		this.#setInstance(null);
	}
}

customElements.define("share-mastodon", ShareMastodon);
