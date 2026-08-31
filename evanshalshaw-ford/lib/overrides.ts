import { getAll } from "@vercel/edge-config";
import { dealer as baked } from "@/dealer.config";
import { CAMPAIGN_ORDER } from "./content";
import type { DealerConfig } from "./types";

/**
 * Runtime content overrides.
 *
 * The dealer config baked into the build is the default. On top of it, two
 * Edge Config items are merged at request time — the dealer's own item
 * (keyed by dealer.id) and the shared "national" item — followed by an
 * optional ?draft= payload used by the content editor's live preview.
 *
 * Every item is a flat map of dotted path → replacement string, e.g.
 *   { "hero.headline": "…", "location.departments.1.hours.0.time": "…" }
 * National paths address the Fixed campaign copy:
 *   { "FORD_CAMPAIGNS.options.heading": "…", "FORD_CAMPAIGNS.options.body.0": "…" }
 *
 * A path is only applied if it is on the editable-content allowlist below AND
 * the baked config already holds a string there — overrides can restyle
 * content but can never touch legal text, navigation or structure, add
 * fields, or inject non-string values. The site enforces this itself rather
 * than trusting whoever wrote the store or crafted a draft link. With no
 * EDGE_CONFIG env (local dev, or a site not yet connected) the baked config
 * renders unchanged.
 */

/**
 * Editable-content allowlist — `N` stands for an array index. Must stay in
 * sync with the labelled master list in content-agent/lib/targets.ts.
 */
const ALLOWED_PATHS = [
  // Free — dealer editorial
  "alert.text",
  "alert.linkLabel",
  "hero.headline",
  "hero.strapline",
  "newsOffers.promo.eyebrow",
  "newsOffers.promo.heading",
  "newsOffers.promo.body",
  "newsOffers.promo.linkLabel",
  "newsOffers.quote.name",
  "newsOffers.quote.role",
  "newsOffers.quote.quote",
  "welcome.heading",
  "welcome.body",
  "metaTitle",
  "metaDescription",
  // Flexible — dealer facts
  "location.phone",
  "location.areasServed",
  "location.address.name",
  "location.address.street",
  "location.address.locality",
  "location.address.region",
  "location.address.postcode",
  "location.departments.N.label",
  "location.departments.N.phone",
  "location.departments.N.hours.N.day",
  "location.departments.N.hours.N.time",
  "trust.accreditations.N",
  // Theming — dealer palette
  "brand.accent",
  "brand.accentDark",
  "brand.navy",
  // National — Ford campaign copy
  ...["options", "electricGrant", "powerPromise", "service", "charging", "business"].flatMap(
    (key) => [`FORD_CAMPAIGNS.${key}.heading`, `FORD_CAMPAIGNS.${key}.body.N`]
  ),
];

export function isAllowedPath(path: string): boolean {
  const actual = path.split(".");
  return ALLOWED_PATHS.some((pattern) => {
    const segments = pattern.split(".");
    if (segments.length !== actual.length) return false;
    return segments.every((segment, i) =>
      segment === "N" ? /^\d+$/.test(actual[i]) : segment === actual[i]
    );
  });
}

export async function getDealer(draftParam?: string): Promise<DealerConfig> {
  const config = structuredClone(baked);

  if (process.env.EDGE_CONFIG) {
    try {
      const items = await getAll([baked.id, "national"]);
      applyFlat(config, items?.["national"]);
      applyFlat(config, items?.[baked.id]);
    } catch (error) {
      console.error("Edge Config read failed; rendering baked config.", error);
    }
  }

  applyFlat(config, parseDraft(draftParam));

  return config;
}

function applyFlat(config: DealerConfig, flat: unknown): void {
  if (!flat || typeof flat !== "object") return;

  for (const [path, value] of Object.entries(flat as Record<string, unknown>)) {
    if (typeof value !== "string" || !isAllowedPath(path)) continue;
    setPath(config, translate(path), value);
  }
}

/**
 * National campaign paths address FORD_CAMPAIGNS, but by the time a config is
 * built that copy lives in the six splitBanners (in CAMPAIGN_ORDER). Rewrite
 * "FORD_CAMPAIGNS.<key>.heading|body.N" to the banner it landed in; only
 * heading and body are editable — links and imagery stay dealer/Fixed.
 */
function translate(path: string): string[] {
  const segments = path.split(".");
  if (segments[0] !== "FORD_CAMPAIGNS") return segments;

  const index = CAMPAIGN_ORDER.indexOf(segments[1]);
  const field = segments[2];
  if (index === -1 || (field !== "heading" && field !== "body")) return [];

  return ["splitBanners", String(index), ...segments.slice(2)];
}

/** Sets a value only where the target is an existing string leaf. */
function setPath(config: DealerConfig, segments: string[], value: string): void {
  if (segments.length === 0) return;

  let node: unknown = config;
  for (const segment of segments.slice(0, -1)) {
    if (node === null || typeof node !== "object") return;
    node = (node as Record<string, unknown>)[segment];
  }

  const leaf = segments[segments.length - 1];
  if (node === null || typeof node !== "object") return;
  const record = node as Record<string, unknown>;
  if (typeof record[leaf] !== "string") return;
  record[leaf] = value;
}

/** base64url → JSON flat map; null on any malformed input. */
function parseDraft(param: string | undefined): Record<string, string> | null {
  if (!param) return null;
  try {
    const json = Buffer.from(param, "base64url").toString("utf8");
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
