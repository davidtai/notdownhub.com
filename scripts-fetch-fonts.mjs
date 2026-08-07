import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dir, "public/fonts");
mkdirSync(outDir, { recursive: true });

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const families = [
  { css: "Space+Grotesk", weights: [500, 600], slug: "space-grotesk" },
  { css: "IBM+Plex+Sans", weights: [400, 600], slug: "ibm-plex-sans" },
  { css: "IBM+Plex+Mono", weights: [400, 500], slug: "ibm-plex-mono" },
];

const faces = [];
for (const fam of families) {
  const url = `https://fonts.googleapis.com/css2?family=${fam.css}:wght@${fam.weights.join(";")}&display=swap`;
  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  // blocks look like: /* latin */\n@font-face { ... }
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let m;
  const seen = new Set();
  while ((m = re.exec(css))) {
    const subset = m[1];
    if (subset !== "latin") continue;
    const block = m[2];
    const weight = (block.match(/font-weight:\s*(\d+)/) || [])[1];
    const src = (block.match(/url\((https:\/\/[^)]+\.woff2)\)/) || [])[1];
    const family = (block.match(/font-family:\s*'([^']+)'/) || [])[1];
    if (!weight || !src || seen.has(weight)) continue;
    seen.add(weight);
    const file = `${fam.slug}-${weight}.woff2`;
    const buf = Buffer.from(await (await fetch(src, { headers: { "User-Agent": UA } })).arrayBuffer());
    writeFileSync(resolve(outDir, file), buf);
    faces.push({ family, weight, file, bytes: buf.length });
    console.log(`saved ${file}  (${family} ${weight})  ${buf.length} bytes`);
  }
}
console.log("\n--- @font-face ---");
console.log(faces.map((f) => `${f.family} ${f.weight} -> /fonts/${f.file}`).join("\n"));
