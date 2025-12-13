import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

const rootDir = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const csvPath = path.join(rootDir, "translations/ui_strings.csv");
const outputDir = path.join(rootDir, "src/translate");

type TranslationRow = {
  key: string;
  fr: string;
  pt: string;
};

const csvContent = fs.readFileSync(csvPath, "utf-8");
const parsed = Papa.parse<TranslationRow>(csvContent, {
  header: true,
  skipEmptyLines: true,
});

if (parsed.errors.length > 0) {
  console.error("CSV parsing errors:", parsed.errors);
  process.exit(1);
}

const frEntries: [string, string][] = [];
const ptEntries: [string, string][] = [];

for (const row of parsed.data) {
  if (!row.key) continue;
  if (row.fr && row.fr !== row.key) {
    frEntries.push([row.key, row.fr]);
  }
  if (row.pt && row.pt !== row.key) {
    ptEntries.push([row.key, row.pt]);
  }
}

function generateMapFile(entries: [string, string][]): string {
  const mapEntries = entries
    .map(([key, value]) => `  [${JSON.stringify(key)}, ${JSON.stringify(value)}]`)
    .join(",\n");
  return `export const TRANSLATIONS = new Map<string, string>([\n${mapEntries}\n]);\n`;
}

fs.writeFileSync(
  path.join(outputDir, "translations_fr.ts"),
  `export const TRANSLATIONS_FR = new Map<string, string>([\n${frEntries
    .map(([k, v]) => `  [${JSON.stringify(k)}, ${JSON.stringify(v)}]`)
    .join(",\n")}\n]);\n`
);

fs.writeFileSync(
  path.join(outputDir, "translations_pt.ts"),
  `export const TRANSLATIONS_PT = new Map<string, string>([\n${ptEntries
    .map(([k, v]) => `  [${JSON.stringify(k)}, ${JSON.stringify(v)}]`)
    .join(",\n")}\n]);\n`
);

// Generate keys type file
const allKeys = parsed.data.filter(row => row.key).map(row => row.key);
const keysContent = `// Auto-generated from translations/ui_strings.csv
// Do not edit directly - run: npx tsx scripts/build-translations.ts

export type TranslationKey =
${allKeys.map(k => `  | ${JSON.stringify(k)}`).join("\n")};
`;

fs.writeFileSync(path.join(outputDir, "keys.ts"), keysContent);

console.log(`Generated translation files:`);
console.log(`  - translations_fr.ts (${frEntries.length} entries)`);
console.log(`  - translations_pt.ts (${ptEntries.length} entries)`);
console.log(`  - keys.ts (${allKeys.length} keys)`);
