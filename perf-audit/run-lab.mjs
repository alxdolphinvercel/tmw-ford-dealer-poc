/**
 * Lab audit runner — Lighthouse, identical settings for every URL.
 *
 * Runs each target N times (mobile) and M times (desktop), keeps every raw
 * report, and writes the median of each metric to lab-summary.json. Medians
 * rather than single runs because Lighthouse is noisy; raw reports are kept so
 * every number in the write-up can be traced back to a specific run.
 *
 * Usage:
 *   node run-lab.mjs                  # every URL in targets.json
 *   node run-lab.mjs incumbent        # only the live dealer sites
 *   node run-lab.mjs poc              # only our deployed sites
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, "data", "raw");
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const only = process.argv[2]; // "incumbent" | "poc" | undefined
const config = JSON.parse(readFileSync(join(HERE, "targets.json"), "utf8"));

mkdirSync(RAW, { recursive: true });

/** The metrics we report on, and how to pull each from a Lighthouse report. */
const METRICS = {
  score: (r) => Math.round(r.categories.performance.score * 100),
  lcp: (r) => r.audits["largest-contentful-paint"].numericValue,
  fcp: (r) => r.audits["first-contentful-paint"].numericValue,
  tbt: (r) => r.audits["total-blocking-time"].numericValue,
  cls: (r) => r.audits["cumulative-layout-shift"].numericValue,
  si: (r) => r.audits["speed-index"].numericValue,
  ttfb: (r) => r.audits["server-response-time"].numericValue,
  bytes: (r) => r.audits["total-byte-weight"].numericValue,
  requests: (r) => r.audits["network-requests"].details.items.length,
};

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const slug = (url) =>
  url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/-+$/, "");

/** One Lighthouse run. Returns the parsed report, or null if it failed. */
async function lighthouse(url, formFactor, attempt) {
  const out = join(RAW, `${slug(url)}--${formFactor}--${attempt}.json`);

  if (existsSync(out)) {
    // Already collected — reuse it so interrupted runs can be resumed.
    return JSON.parse(readFileSync(out, "utf8"));
  }

  const args = [
    "--yes",
    "lighthouse",
    url,
    "--only-categories=performance",
    `--form-factor=${formFactor}`,
    "--output=json",
    `--output-path=${out}`,
    "--quiet",
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
  ];
  // Mobile is Lighthouse's default; desktop needs the preset and its own
  // screen emulation, otherwise it reports desktop throttling on a phone
  // viewport.
  if (formFactor === "desktop") args.push("--preset=desktop");
  else args.push("--screenEmulation.mobile");

  try {
    await run("npx", args, {
      env: { ...process.env, CHROME_PATH: CHROME },
      timeout: 180_000,
      maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(readFileSync(out, "utf8"));
  } catch (err) {
    console.error(`    ! ${formFactor} run ${attempt} failed: ${err.shortMessage || err.message}`);
    return null;
  }
}

/** All runs for one URL on one form factor, reduced to medians. */
async function measure(url, formFactor, times) {
  const rows = [];
  for (let i = 1; i <= times; i++) {
    process.stdout.write(`    ${formFactor} ${i}/${times}… `);
    const report = await lighthouse(url, formFactor, i);
    if (!report) continue;
    const row = Object.fromEntries(
      Object.entries(METRICS).map(([k, get]) => {
        try {
          return [k, get(report)];
        } catch {
          return [k, null];
        }
      })
    );
    rows.push(row);
    console.log(`score ${row.score}`);
  }
  if (!rows.length) return null;

  const summary = { samples: rows.length };
  for (const key of Object.keys(METRICS)) {
    const values = rows.map((r) => r[key]).filter((v) => typeof v === "number");
    summary[key] = values.length ? median(values) : null;
  }
  return summary;
}

const results = [];

for (const pair of config.pairs) {
  console.log(`\n## ${pair.dealer}`);
  const entry = { dealer: pair.dealer };

  for (const kind of ["incumbent", "poc"]) {
    if (only && only !== kind) continue;
    const url = pair[kind];
    if (!url) {
      console.log(`  ${kind}: (not deployed yet — skipped)`);
      continue;
    }
    console.log(`  ${kind}: ${url}`);
    entry[kind] = {
      url,
      mobile: await measure(url, "mobile", config.runs.mobile),
      desktop: await measure(url, "desktop", config.runs.desktop),
    };
  }
  results.push(entry);
}

const outPath = join(HERE, "data", "lab-summary.json");
// Merge with anything already collected so incumbent and POC passes can be run
// separately without losing the earlier half.
let merged = results;
if (existsSync(outPath)) {
  const prev = JSON.parse(readFileSync(outPath, "utf8")).results ?? [];
  merged = results.map((r) => ({
    ...prev.find((p) => p.dealer === r.dealer),
    ...r,
  }));
}

writeFileSync(
  outPath,
  JSON.stringify(
    {
      generated: new Date().toISOString(),
      tool: "Lighthouse CLI (npx lighthouse)",
      runs: config.runs,
      note: "All values are medians across runs. Times in ms, bytes in bytes.",
      results: merged,
    },
    null,
    2
  )
);

console.log(`\nWrote ${outPath}`);
