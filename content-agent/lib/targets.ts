/**
 * What the editor is allowed to change — the governance surface.
 *
 * The editable-path allowlist below is the whole permission model. Any path
 * not listed here is rejected server-side, whether it arrives from the form,
 * the AI assist, or a hand-crafted request. This is what stops content edits
 * touching navigation, legal boilerplate, component code or anything else
 * Ford governs centrally.
 *
 * Each target maps to one Edge Config item (keyed by target id): a flat map
 * of concrete path → published value. Sites merge those items over their
 * baked-in dealer.config.ts at request time (template/lib/overrides.ts).
 */

export type Layer = "Free" | "Imagery" | "Flexible" | "Theming" | "National";

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

  { path: "hero.image", layer: "Imagery", label: "Hero image" },
  { path: "hero.imageAlt", layer: "Imagery", label: "Hero image — alt text" },
  { path: "newsOffers.promo.image", layer: "Imagery", label: "Promo image" },
  { path: "newsOffers.promo.imageAlt", layer: "Imagery", label: "Promo image — alt text" },
  { path: "welcome.image", layer: "Imagery", label: "Welcome image" },
  { path: "welcome.imageAlt", layer: "Imagery", label: "Welcome image — alt text" },
  { path: "splitBanners.N.image", layer: "Imagery", label: "Campaign banner image" },
  { path: "splitBanners.N.imageAlt", layer: "Imagery", label: "Campaign banner image — alt text" },

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

/** National paths (Fixed Ford campaign copy, shared by all five sites). */
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
  /** Live site rendered in the editor's preview pane, if the target has one. */
  previewUrl?: string;
  paths: EditablePath[];
}

export const SITES = [
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
    previewUrl: `https://${site.id}-poc.vercel.app`,
    paths: DEALER_PATHS,
  })),
  {
    id: "national",
    name: "All five sites — Ford national content",
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
  return entryFor(target, path) !== undefined;
}

/** The allowlist entry matching a concrete path — for its label and layer. */
export function entryFor(target: Target, path: string): EditablePath | undefined {
  const actual = path.split(".");
  return target.paths.find((entry) => {
    const pattern = entry.path.split(".");
    if (pattern.length !== actual.length) return false;
    return pattern.every((segment, i) =>
      segment === "N" ? /^\d+$/.test(actual[i]) : segment === actual[i]
    );
  });
}
