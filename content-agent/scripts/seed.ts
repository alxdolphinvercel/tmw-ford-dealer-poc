/**
 * Seeds (or RESETS) the shared Edge Config from the values in git.
 *
 *   cd content-agent && npx tsx scripts/seed.ts
 *
 * Reads every editable field out of configs/<site>.ts and template/lib/ford.ts
 * and upserts one flat path→value item per target. Re-running OVERWRITES any
 * edits published through the editor since — that is the demo reset story.
 *
 * Needs VERCEL_API_TOKEN, EDGE_CONFIG_ID and VERCEL_TEAM_ID (read from the
 * environment, falling back to content-agent/.env.local).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { DEALER_PATHS, NATIONAL_PATHS, SITES } from "../lib/targets";
import { expandPath, readPath } from "../lib/edit";
import { writeItems, type ItemWrite } from "../lib/store";

const ROOT = resolve(__dirname, "../..");

function loadEnvLocal(): void {
  const file = resolve(__dirname, "../.env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

function extract(
  file: string,
  patterns: { path: string }[]
): Record<string, string> {
  const source = readFileSync(resolve(ROOT, file), "utf8");
  const flat: Record<string, string> = {};
  for (const entry of patterns) {
    for (const path of expandPath(source, entry.path)) {
      const value = readPath(source, path);
      if (value !== null) flat[path] = value;
    }
  }
  return flat;
}

/**
 * Banner imagery hides inside the nationalBanners({...}) call, keyed by
 * campaign argument rather than slot index, so the generic extractor can't
 * see it. Map each argument to the built config's splitBanners.<i> slot —
 * order matches CAMPAIGN_ORDER / nationalBanners() in template/lib/content.ts.
 */
const BANNER_ARG_KEYS = [
  "offer",
  "grant",
  "powerPromise",
  "service",
  "charging",
  "business",
];

function extractBannerImages(file: string): Record<string, string> {
  const source = readFileSync(resolve(ROOT, file), "utf8");
  const flat: Record<string, string> = {};
  BANNER_ARG_KEYS.forEach((key, i) => {
    const image = readPath(source, `splitBanners.${key}`);
    const alt = readPath(source, `splitBanners.${key}Alt`);
    if (image !== null) flat[`splitBanners.${i}.image`] = image;
    if (alt !== null) flat[`splitBanners.${i}.imageAlt`] = alt;
  });
  return flat;
}

async function main() {
  loadEnvLocal();

  const items: ItemWrite[] = [
    ...SITES.map((site) => ({
      key: site.id,
      value: {
        ...extract(`configs/${site.id}.ts`, DEALER_PATHS),
        ...extractBannerImages(`configs/${site.id}.ts`),
      },
    })),
    { key: "national", value: extract("template/lib/ford.ts", NATIONAL_PATHS) },
  ];

  let total = 0;
  for (const item of items) {
    const bytes = Buffer.byteLength(JSON.stringify(item.value));
    total += bytes;
    console.log(
      `${item.key.padEnd(24)} ${Object.keys(item.value).length} fields, ${(bytes / 1024).toFixed(1)} kB`
    );
  }
  console.log(`${"total".padEnd(24)} ${(total / 1024).toFixed(1)} kB\n`);

  await writeItems(items);
  console.log("Seeded. Published edits made since the last seed are gone.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
