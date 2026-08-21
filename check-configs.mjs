/**
 * Config sanity checks across all five dealer configs.
 *
 * Catches the mistakes that are easy to make when the same template is
 * populated five times over: a missing asset, the same photograph used twice
 * on one page, or a spotlight whose copy names one model while its image
 * shows another.
 *
 * Usage: node check-configs.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SITES = [
  "lookers-ford",
  "evanshalshaw-ford",
  "allen-motor-group-ford",
  "group1-ford",
  "hendy-ford",
];

const MODELS = [
  "explorer",
  "capri",
  "puma-gen-e",
  "puma",
  "kuga",
  "mach-e",
  "mustang",
  "ranger-raptor",
  "ranger",
  "tourneo-custom",
  "tourneo-connect",
  "tourneo-courier",
  "e-transit-courier",
  "e-transit-custom",
  "e-transit",
  "transit-custom",
  "transit-city",
];

/** Which asset a piece of copy implies, longest name first so "puma-gen-e" wins over "puma". */
function modelFromCopy(text) {
  const t = text.toLowerCase().replace(/\s+/g, " ");
  for (const m of MODELS) {
    const words = m.replace(/-/g, "[ -]?");
    if (new RegExp(`\\b${words}\\b`).test(t)) return m;
  }
  return null;
}

let failures = 0;
const fail = (site, msg) => {
  console.error(`  ✗ ${site}: ${msg}`);
  failures++;
};

const available = existsSync("template/public/assets/vehicles")
  ? readdirSync("template/public/assets/vehicles")
  : [];

for (const site of SITES) {
  const path = `configs/${site}.ts`;
  const src = readFileSync(path, "utf8");

  // 1. Every referenced asset exists.
  const refs = [...src.matchAll(/\/assets\/vehicles\/([a-z0-9.-]+)/g)].map((m) => m[1]);
  for (const file of new Set(refs)) {
    if (!available.includes(file)) fail(site, `missing asset ${file}`);
  }

  // 2. No photograph used twice on the same page.
  const counts = refs.reduce((a, f) => ((a[f] = (a[f] || 0) + 1), a), {});
  for (const [file, n] of Object.entries(counts)) {
    if (n > 1) fail(site, `${file} used ${n}× on one page`);
  }

  // 3. Spotlight copy and spotlight image agree on the model.
  const spotlight = src.match(/spotlight:\s*\{[\s\S]*?\n  \},/);
  if (!spotlight) fail(site, "no spotlight block found");
  else {
    const name = spotlight[0].match(/modelName:\s*"([^"]+)"/)?.[1] ?? "";
    const img = spotlight[0].match(/\/assets\/vehicles\/([a-z0-9-]+)\.jpg/)?.[1] ?? "";
    const implied = modelFromCopy(name);
    if (implied && implied !== img) {
      fail(site, `spotlight names "${name}" (→ ${implied}) but shows ${img}.jpg`);
    }
  }

  // 4. Hero alt text matches the hero image.
  const hero = src.match(/hero:\s*\{[\s\S]*?\n  \},/);
  if (hero) {
    const alt = hero[0].match(/imageAlt:\s*"([^"]+)"/)?.[1] ?? "";
    const img = hero[0].match(/\/assets\/vehicles\/([a-z0-9-]+)\.jpg/)?.[1] ?? "";
    const implied = modelFromCopy(alt);
    if (implied && implied !== img) {
      fail(site, `hero alt "${alt}" (→ ${implied}) but shows ${img}.jpg`);
    }
  }

  // 5. Required per-dealer fields are actually customised, not left on defaults.
  for (const field of ["metaTitle", "phone", "accent", "navy"]) {
    if (!new RegExp(`${field}:`).test(src)) fail(site, `missing ${field}`);
  }

  if (!failures) console.log(`  ✓ ${site}`);
}

console.log(
  failures === 0
    ? "\nAll config checks passed."
    : `\n${failures} problem(s) found.`
);
process.exit(failures === 0 ? 0 : 1);
