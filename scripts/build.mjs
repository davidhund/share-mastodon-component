import { build } from "esbuild";
import { readdirSync } from "fs";
import path from "path";

const locales = readdirSync("./src/locales")
	.filter((f) => f.endsWith(".js"))
	.map((f) => f.replace(".js", ""));

const sharedOptions = {
	entryPoints: ["src/share-mastodon.js"],
	format: "esm",
	target: "es2020",
	platform: "browser",
	bundle: true,
	minify: true,
	sourcemap: true,
};

for (const locale of locales) {
	const outfile =
		locale === "en"
			? "dist/share-mastodon.min.js"
			: `dist/share-mastodon.${locale}.min.js`;

	await build({
		...sharedOptions,
		outfile,
		plugins:
			locale === "en"
				? []
				: [
						{
							name: "locale-override",
							setup(build) {
								build.onResolve({ filter: /\/locales\/en\.js$/ }, () => ({
									path: path.resolve(`src/locales/${locale}.js`),
								}));
							},
						},
					],
	});

	console.log(`Built: ${outfile}`);
}
