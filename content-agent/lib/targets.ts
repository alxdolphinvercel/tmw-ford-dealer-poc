/**
 * What the agent is allowed to change, and which files each change must touch.
 *
 * Two things live here because they are the governance surface:
 *
 * 1. The editable-path allowlist. Any path the model proposes that is not here
 *    is refused. This is what stops the agent touching navigation, legal
 *    boilerplate, component code or anything else Ford governs centrally.
 *
 * 2. The file mirroring. The five site directories hold copies stamped by
 *    build-sites.sh, so editing only the source would merge a PR that changes
 *    nothing on the live site. Every target lists all the files an edit must
 *    write.
 */

export type Layer = "Free" | "Flexible" | "Theming" | "National";

export interface EditablePath {
  /** Dotted path, `N` standing in for an array index. */
  path: string;
  layer: Layer;
  /** Shown to the operator and to the model. */
  label: string;
}

/** Per-dealer paths (configs/<site>.ts and <site>/dealer.config.ts). */
export const DEALER_PATHS: EditablePath[] = [
  { path: "alert.text", layer: "Free", label: "Alert bar message" },
  { path: "alert.linkLabel", layer: "Free", label: "Alert bar link label" },
  { path: "hero.headline", layer: "Free", label: "Hero headline" },
  { path: "hero.strapline", layer: "Free", label: "Hero strapline" },
  { path: "newsOffers.promo.eyebrow", layer: "Free", label: "Promo eyebrow" },
  { path: "newsOffers.promo.heading", layer: "Free", label: "Promo heading" },
  { path: "newsOffers.promo.body", layer: "Free", label: "Promo body" },
  { path: "newsOffers.promo.linkLabel", layer: "Free", label: "Promo link label" },
  { path: "newsOffers.quote.name", layer: "Free", label: "Quote attribution name" },
  { path: "newsOffers.quote.role", layer: "Free", label: "Quote attribution role" },
  { path: "newsOffers.quote.quote", layer: "Free", label: "Quote text" },
  { path: "welcome.heading", layer: "Free", label: "Welcome heading" },
  { path: "welcome.body", layer: "Free", label: "Welcome paragraph" },
  { path: "metaTitle", layer: "Free", label: "Page title (SEO)" },
  { path: "metaDescription", layer: "Free", label: "Meta description (SEO)" },

  { path: "location.phone", layer: "Flexible", label: "Main phone number" },
  { path: "location.areasServed", layer: "Flexible", label: "Areas served" },
  { path: "location.address.name", layer: "Flexible", label: "Site name" },
  { path: "location.address.street", layer: "Flexible", label: "Street" },
  { path: "location.address.locality", layer: "Flexible", label: "Town" },
  { path: "location.address.region", layer: "Flexible", label: "County" },
  { path: "location.address.postcode", layer: "Flexible", label: "Postcode" },
  { path: "location.departments.N.label", layer: "Flexible", label: "Department name" },
  { path: "location.departments.N.phone", layer: "Flexible", label: "Department phone" },
  { path: "location.departments.N.hours.N.day", layer: "Flexible", label: "Opening hours — day" },
  { path: "location.departments.N.hours.N.time", layer: "Flexible", label: "Opening hours — time" },
  { path: "trust.accreditations.N", layer: "Flexible", label: "Accreditation" },

  { path: "brand.accent", layer: "Theming", label: "Accent colour" },
  { path: "brand.accentDark", layer: "Theming", label: "Accent colour (dark)" },
  { path: "brand.navy", layer: "Theming", label: "Dark band colour" },
];

/** National paths (template/lib/ford.ts, mirrored into all five sites). */
export const NATIONAL_PATHS: EditablePath[] = [
  "options",
  "electricGrant",
  "powerPromise",
  "service",
  "charging",
  "business",
].flatMap((key) => [
  { path: `FORD_CAMPAIGNS.${key}.heading`, layer: "National" as const, label: `${key} — heading` },
  { path: `FORD_CAMPAIGNS.${key}.body.N`, layer: "National" as const, label: `${key} — body paragraph` },
]);

export interface Target {
  id: string;
  name: string;
  /** Files an edit must write, source first. */
  files: string[];
  paths: EditablePath[];
}

const SITES = [
  { id: "lookers-ford", name: "Lookers Ford" },
  { id: "evanshalshaw-ford", name: "Evans Halshaw Ford" },
  { id: "allen-motor-group-ford", name: "Allen Motor Group Ford" },
  { id: "group1-ford", name: "Group 1 Ford" },
  { id: "hendy-ford", name: "Hendy Ford" },
];

export const TARGETS: Target[] = [
  ...SITES.map((site) => ({
    id: site.id,
    name: site.name,
    files: [`configs/${site.id}.ts`, `${site.id}/dealer.config.ts`],
    paths: DEALER_PATHS,
  })),
  {
    id: "national",
    name: "All five sites — Ford national content",
    files: [
      "template/lib/ford.ts",
      ...SITES.map((site) => `${site.id}/lib/ford.ts`),
    ],
    paths: NATIONAL_PATHS,
  },
];

export function getTarget(id: string): Target | undefined {
  return TARGETS.find((t) => t.id === id);
}

/**
 * True if `path` is allowed for this target. Allowlist entries use `N` for
 * array indices, so `location.departments.1.hours.0.time` matches the entry
 * `location.departments.N.hours.N.time`.
 */
export function isAllowed(target: Target, path: string): boolean {
  const actual = path.split(".");
  return target.paths.some((entry) => {
    const pattern = entry.path.split(".");
    if (pattern.length !== actual.length) return false;
    return pattern.every((segment, i) =>
      segment === "N" ? /^\d+$/.test(actual[i]) : segment === actual[i]
    );
  });
}
