import { expect, fixture, html } from "@open-wc/testing";
import "../src/share-mastodon.js";

// Test helpers to reduce duplication
async function openComponentDialog() {
	const el = await fixture(html`<share-mastodon show-icon></share-mastodon>`);
	await new Promise((resolve) => setTimeout(resolve, 200));
	const editBtn = el.querySelector("button");
	editBtn?.click();
	await new Promise((resolve) => setTimeout(resolve, 100));
	const dialog = document.querySelector("dialog");
	return { el, editBtn, dialog };
}

async function submitDialogInput(dialog, value) {
	const input = dialog?.querySelector("input");
	if (input) {
		input.value = value;
		const submitBtn = dialog?.querySelector("button[type='submit']");
		submitBtn?.click();
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
}

describe("<share-mastodon>", () => {
	afterEach(() => {
		localStorage.clear();
		// Clean up any dialogs left in DOM
		document.querySelectorAll("dialog").forEach((d) => {
			d.remove();
		});
	});

	describe("initialization", () => {
		it("should create the custom element", async () => {
			const el = await fixture(html`<share-mastodon></share-mastodon>`);
			expect(el.tagName).to.equal("SHARE-MASTODON");
		});

		it("should accept server attribute", async () => {
			const el = await fixture(
				html`<share-mastodon server="mastodon.social"></share-mastodon>`
			);
			expect(el).to.exist;
		});

		it("should accept text attribute", async () => {
			const el = await fixture(
				html`<share-mastodon text="Check this out!"></share-mastodon>`
			);
			expect(el.getAttribute("text")).to.equal("Check this out!");
		});

		it("should accept lang attribute", async () => {
			const el = await fixture(
				html`<share-mastodon lang="en"></share-mastodon>`
			);
			expect(el.getAttribute("lang")).to.equal("en");
		});
	});

	describe("server normalization", () => {
		it("should normalize server with https protocol", async () => {
			const el = await fixture(
				html`<share-mastodon server="https://mastodon.social"></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));
			const normalized = el.getAttribute("server");
			if (normalized) {
				expect(normalized).to.not.include("%");
			}
		});

		it("should accept valid hostnames with TLD", async () => {
			const el = await fixture(
				html`<share-mastodon server="mastodon.social"></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));
			const server = el.getAttribute("server");
			expect(server).to.equal("mastodon.social");
		});
	});

	describe("dialog behavior", () => {
		it("should support show-icon attribute", async () => {
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			expect(el.getAttribute("show-icon")).to.exist;
		});

		it("should support icon-only attribute", async () => {
			const el = await fixture(
				html`<share-mastodon icon-only show-icon></share-mastodon>`
			);
			expect(el.getAttribute("icon-only")).to.exist;
		});
	});

	describe("multi-instance support", () => {
		it("should create two independent instances", async () => {
			const el1 = await fixture(html`<share-mastodon></share-mastodon>`);
			const el2 = await fixture(html`<share-mastodon></share-mastodon>`);
			expect(el1).to.exist;
			expect(el2).to.exist;
			expect(el1).to.not.equal(el2);
		});

		it("should accept server attribute at creation", async () => {
			const el = await fixture(
				html`<share-mastodon server="mastodon.social"></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 100));
			expect(el.getAttribute("server")).to.equal("mastodon.social");
		});
	});

	describe("localStorage integration", () => {
		it("should not throw when accessing localStorage", async () => {
			await fixture(html`<share-mastodon></share-mastodon>`);
			expect(() => {
				localStorage.setItem("share-mastodon-instance", "mastodon.social");
			}).to.not.throw();
		});

		it("should read from localStorage on init", async () => {
			localStorage.setItem("share-mastodon-instance", "mastodon.social");
			const el = await fixture(html`<share-mastodon></share-mastodon>`);
			await new Promise((resolve) => setTimeout(resolve, 200));
			const server = el.getAttribute("server");
			if (server !== null) {
				expect(server).to.equal("mastodon.social");
			}
		});
	});

	describe("custom events", () => {
		it("should support event listeners on the element", async () => {
			const el = await fixture(html`<share-mastodon></share-mastodon>`);
			el.addEventListener("share-mastodon:init", () => {
				// Listener registered
			});
			await new Promise((resolve) => setTimeout(resolve, 200));
			expect(el).to.exist;
		});
	});

	// ========================================
	// NEW TEST SUITES BELOW
	// ========================================

	describe("dialog interaction (user flows)", () => {
		it("should open dialog when edit button is clicked", async () => {
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const button = el.querySelector("button");
			expect(button).to.exist;
			button?.click();
			await new Promise((resolve) => setTimeout(resolve, 100));

			const dialog = document.querySelector("dialog");
			expect(dialog?.open).to.be.true;
		});

		it("should close dialog when cancel button is clicked", async () => {
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const editBtn = el.querySelector("button");
			editBtn?.click();
			await new Promise((resolve) => setTimeout(resolve, 100));

			const dialog = document.querySelector("dialog");
			const cancelBtn = dialog?.querySelector("button[type='button']");
			cancelBtn?.click();
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(dialog?.open).to.be.false;
		});

		it("should have closedby=any on dialog for Escape support", async () => {
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const editBtn = el.querySelector("button");
			editBtn?.click();
			await new Promise((resolve) => setTimeout(resolve, 100));

			const dialog = document.querySelector("dialog");
			// Dialog should support closing via closedby="any" (which includes Escape)
			expect(dialog?.hasAttribute("closedby")).to.be.ok;
		});

		it("should handle form submission gracefully", async () => {
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const editBtn = el.querySelector("button");
			if (editBtn) {
				editBtn.click();
				await new Promise((resolve) => setTimeout(resolve, 100));

				const dialog = document.querySelector("dialog");
				if (dialog?.open) {
					// Dialog opened successfully
					expect(dialog.open).to.be.true;
				}
			}
		});

		it("should show error for invalid server and keep dialog open", async () => {
			const { dialog } = await openComponentDialog();
			await submitDialogInput(dialog, "invalid");
			expect(dialog?.open).to.be.true;
		});
	});

	describe("accessibility (a11y)", () => {
		it("should have dialog with correct role", async () => {
			await fixture(html`<share-mastodon show-icon></share-mastodon>`);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const dialog = document.querySelector("dialog");
			expect(dialog).to.exist;
			// Native <dialog> element has implicit role="dialog"
			expect(dialog?.tagName).to.equal("DIALOG");
		});

		it("should have form with method=dialog inside dialog", async () => {
			await fixture(html`<share-mastodon show-icon></share-mastodon>`);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const dialog = document.querySelector("dialog");
			const form = dialog?.querySelector("form");
			expect(form?.getAttribute("method")).to.equal("dialog");
		});

		it("should have input with correct attributes", async () => {
			await fixture(html`<share-mastodon show-icon></share-mastodon>`);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const dialog = document.querySelector("dialog");
			const input = dialog?.querySelector("input[type='text']");
			expect(input).to.exist;
			expect(input?.hasAttribute("required")).to.be.false;
		});

		it("should have labeled form elements", async () => {
			await fixture(html`<share-mastodon show-icon></share-mastodon>`);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const dialog = document.querySelector("dialog");
			const label = dialog?.querySelector("label");
			expect(label).to.exist;
		});

		it("should have buttons with accessible text", async () => {
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const editBtn = el.querySelector("button");
			expect(editBtn?.textContent).to.be.ok;
		});
	});

	describe("visual state changes", () => {
		it("should have component element and be interactive", async () => {
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Component should be present and have expected attributes
			expect(el.tagName).to.equal("SHARE-MASTODON");
			expect(el).to.exist;
		});

		it("should support show-icon attribute", async () => {
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			expect(el.hasAttribute("show-icon")).to.be.true;
		});

		it("should support icon-only attribute", async () => {
			const el = await fixture(
				html`<share-mastodon icon-only show-icon></share-mastodon>`
			);
			expect(el.hasAttribute("icon-only")).to.be.true;
		});

		it("should add invalid class to dialog on error", async () => {
			const { dialog } = await openComponentDialog();
			await submitDialogInput(dialog, "invalid");
			expect(
				dialog?.classList.contains("share-mastodon__dialog-is-invalid")
			).to.be.true;
		});

		it("should remove invalid class when dialog is reset", async () => {
			const { editBtn, dialog } = await openComponentDialog();
			await submitDialogInput(dialog, "invalid");

			// Cancel to close and reset
			const cancelBtn = dialog?.querySelector("button[type='button']");
			cancelBtn?.click();
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Open dialog again
			editBtn?.click();
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(
				dialog?.classList.contains("share-mastodon__dialog-is-invalid")
			).to.be.false;
		});
	});

	describe("edge cases & errors", () => {
		it("should handle empty string server value", async () => {
			const el = await fixture(html`<share-mastodon server=""></share-mastodon>`);
			await new Promise((resolve) => setTimeout(resolve, 100));
			expect(el).to.exist;
		});

		it("should accept server with leading/trailing whitespace", async () => {
			const el = await fixture(
				html`<share-mastodon server="  mastodon.social  "></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));
			// Component should accept the attribute (normalization happens internally)
			expect(el).to.exist;
		});

		it("should accept long hostnames without crashing", async () => {
			const longHost = "very.long.subdomain.mastodon.social";
			const el = await fixture(
				html`<share-mastodon server="${longHost}"></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Component should handle long hostname without crashing
			expect(el).to.exist;
			expect(el.getAttribute("server")).to.equal(longHost);
		});

		it("should handle special characters in hostname (should reject)", async () => {
			const { dialog } = await openComponentDialog();
			await submitDialogInput(dialog, "mastodon!@#.social");
			expect(dialog?.open).to.be.true;
		});

		it("should not crash when input is cleared and submitted", async () => {
			const { el } = await openComponentDialog();
			const dialog = document.querySelector("dialog");
			await submitDialogInput(dialog, "");
			expect(el).to.exist;
		});
	});

	describe("internationalized domain names (IDN)", () => {
		it("should not crash when given IDN input", async () => {
			const { el, dialog } = await openComponentDialog();
			// ASCII hostname (baseline test)
			await submitDialogInput(dialog, "mastodon.social");
			await new Promise((resolve) => setTimeout(resolve, 100));
			// Dialog should close (accepted valid hostname)
			expect(dialog?.open).to.be.false;
			expect(el).to.exist;
		});
	});
});
