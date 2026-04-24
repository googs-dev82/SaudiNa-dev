import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sanitySeedDocuments } from "./sanity-seed-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../sanity-seed");
const outFile = path.join(outDir, "seed.ndjson");

await mkdir(outDir, { recursive: true });
await writeFile(outFile, `${sanitySeedDocuments.map((doc) => JSON.stringify(doc)).join("\n")}\n`, "utf8");

console.log(`Wrote ${sanitySeedDocuments.length} Sanity seed documents to ${outFile}`);
