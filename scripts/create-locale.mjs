import { readFileSync, writeFileSync, existsSync } from "fs";

const code = process.argv[2];

if (!code) {
	console.error("Usage: node scripts/create-locale.mjs <language-code>");
	console.error("Example: node scripts/create-locale.mjs pt");
	process.exit(1);
}

if (!/^[a-z]{2,3}$/.test(code)) {
	console.error(`Invalid language code: '${code}'. Use a 2–3 letter ISO 639 code.`);
	process.exit(1);
}

const outPath = `./src/locales/${code}.js`;

if (existsSync(outPath)) {
	console.error(`${outPath} already exists. Remove it first if you want to regenerate.`);
	process.exit(1);
}

const src = readFileSync("./src/locales/en.js", "utf8");
// Zero-out all string values, keep keys intact
const out = src.replace(/:\s*"[^"]*"/g, ': ""');
writeFileSync(outPath, out);
console.log(`Created ${outPath} — fill in the translations, then run: npm run build`);
