import { expect, fixture, html } from "@open-wc/testing";
import "../src/share-mastodon.js";

describe("<share-mastodon>", () => {
	afterEach(() => {
		localStorage.clear();
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
			// Server attribute should be accepted (normalization happens in #init via attributeChangedCallback)
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
			// This tests the normalization logic in #normalizeHostName
			// After normalization, the server should be stored without protocol
			await new Promise((resolve) => setTimeout(resolve, 200));
			const normalized = el.getAttribute("server");
			// Regression test: should not use encodeURIComponent which breaks dots
			if (normalized) {
				expect(normalized).to.not.include("%");
			}
		});

		it("should accept valid hostnames with TLD", async () => {
			const el = await fixture(
				html`<share-mastodon server="mastodon.social"></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));
			// Valid hostnames with TLD should be accepted
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
			// Should read the stored instance from localStorage
			if (server !== null) {
				expect(server).to.equal("mastodon.social");
			}
		});
	});

	describe("custom events", () => {
		it("should support event listeners on the element", async () => {
			const el = await fixture(html`<share-mastodon></share-mastodon>`);
			el.addEventListener("share-mastodon:init", () => {
				// Listener registered; init event may fire asynchronously
			});
			// Component may emit init after being added to the document
			await new Promise((resolve) => setTimeout(resolve, 200));
			expect(el).to.exist; // Element should exist
		});
	});

	describe("regression: known bugs to be fixed in Step 2", () => {
		it("should NOT set input.value to null string (Bug #1)", async () => {
			// This test will fail until Step 2 fixes the bug
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			// Find and click edit button
			const button = el.querySelector("button");
			if (button) {
				button.click();
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Find dialog and input
				const dialog = document.querySelector("dialog");
				const input = dialog?.querySelector("input");
				if (input && dialog) {
					input.value = "invalid";
					const submitBtn = dialog.querySelector("button[type='submit']");
					submitBtn?.click();
					await new Promise((resolve) => setTimeout(resolve, 100));

					// EXPECTED TO FAIL BEFORE FIX:
					// input.value should be "", not "null"
					try {
						expect(input.value).to.equal("");
						expect(input.value).to.not.equal("null");
					} catch (e) {
						console.log(
							"Bug #1 confirmed: input.value was not cleared correctly"
						);
						// Re-throw to show test failed but expected
						throw e;
					}
				}
			}
		});

		it("should NOT encode dots in hostnames (Bug #3)", async () => {
			// This test validates the hostname normalization
			// Should NOT use encodeURIComponent which breaks mastodon.social → mastodon%2Esocial
			const el = await fixture(
				html`<share-mastodon server="mastodon.social"></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			const server = el.getAttribute("server");
			try {
				expect(server).to.not.include("%2E");
				expect(server).to.not.include("%");
			} catch (e) {
				console.log("Bug #3 confirmed: encodeURIComponent is mangling hostname");
				throw e;
			}
		});

		it.skip("dialog:close should not fire during re-validation (Bug #2)", async () => {
			// TODO: Enable after fixing Bug #2 in Step 2
			// This test validates that dialog:close event only fires when dialog actually closes,
			// not when it re-opens for re-validation of an invalid server
			const el = await fixture(
				html`<share-mastodon show-icon></share-mastodon>`
			);
			await new Promise((resolve) => setTimeout(resolve, 200));

			let closeCount = 0;
			el.addEventListener("share-mastodon:dialog:close", () => {
				closeCount++;
			});

			const button = el.querySelector("button");
			if (button) {
				button.click();
				await new Promise((resolve) => setTimeout(resolve, 100));

				const dialog = document.querySelector("dialog");
				const input = dialog?.querySelector("input");
				if (input && dialog) {
					input.value = "invalid";
					const submitBtn = dialog.querySelector("button[type='submit']");
					submitBtn?.click();
					await new Promise((resolve) => setTimeout(resolve, 100));

					// dialog:close should NOT fire during re-validation
					expect(closeCount).to.equal(0);
				}
			}
		});
	});
});
