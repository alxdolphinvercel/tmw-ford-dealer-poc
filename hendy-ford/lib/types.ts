/**
 * DealerConfig — the single per-dealer content contract.
 *
 * Everything that differs between dealer sites lives here (the Flexible and
 * Free layers of the Fixed/Flexible/Free content model). Section order,
 * layout, and Ford national branding are Fixed in the components and never
 * vary per dealer. At scale this type becomes the Contentful content model.
 */

/** FLEXIBLE — dealer identity & theming */
export interface DealerBrand {
  /** Full trading name, e.g. "Hendy Ford" */
  name: string;
  /** Short group name used in copy, e.g. "Hendy" */
  shortName: string;
  /** Two-line header lockup, e.g. ["Hendy", "Ford"] */
  lockup: [string, string];
  /** Dealer accent (buttons, arrow links, active states) */
  accent: string;
  /** Darker accent for hover states */
  accentDark: string;
  /** Dealer navy used for dark bands (ratings bar, welcome frame, footer) */
  navy: string;
}

export interface Department {
  id: string;
  label: string;
  phone: string;
  hours: { day: string; time: string }[];
}

/**
 * A postal address kept in named parts rather than an array of lines, so the
 * same data can render as prose and emit correct schema.org markup. A flat
 * string[] made locality and region ambiguous between dealers.
 */
export interface DealerAddress {
  /** Site name, e.g. "Hendy FordStore Eastleigh" */
  name: string;
  street: string;
  /** Town or city */
  locality: string;
  /** County, where the dealer publishes one */
  region?: string;
  postcode: string;
}

/** FLEXIBLE — location & contact */
export interface DealerLocation {
  /** Surrounding towns, emitted as schema.org areaServed */
  nearbyTowns: string[];
  /** Primary showroom address */
  address: DealerAddress;
  /** Primary phone shown in the header */
  phone: string;
  departments: Department[];
  areasServed: string;
}

/** FLEXIBLE — trust signals; only real published data */
export interface TrustSignals {
  /** e.g. { label: "Trustpilot", score: "4.2", detail: "over 100,000 reviews", stars: 4.2 } */
  review?: { label: string; score: string; detail: string; stars: number };
  /** Accreditations actually displayed by this dealer */
  accreditations: string[];
}

/** FREE — editorial content slots */
export interface SplitBanner {
  eyebrow?: string;
  heading: string;
  body: string[];
  links: { label: string; href: string }[];
  image: string;
  imageAlt: string;
}

export interface QuotePanel {
  name: string;
  role: string;
  quote: string;
  /** Initials shown in the avatar circle (no fabricated headshots) */
  initials: string;
}

export interface PromoPanel {
  eyebrow: string;
  heading: string;
  body: string;
  linkLabel: string;
  href: string;
  image: string;
  imageAlt: string;
}

export interface ModelSpotlight {
  modelName: string;
  /** Small uppercase label under the model name, e.g. "Electric" */
  fuelType: string;
  strap: string;
  stats: { title: string; value: string }[];
  image: string;
  imageAlt: string;
}

export interface DealerConfig {
  brand: DealerBrand;
  location: DealerLocation;
  trust: TrustSignals;

  /** SEO */
  metaTitle: string;
  metaDescription: string;

  /** FREE — alert strip above the hero */
  alert: { text: string; linkLabel: string; href: string };

  /** FREE — hero */
  hero: {
    headline: string;
    strapline: string;
    image: string;
    imageAlt: string;
    /** Horizontal focus of the radial scrim, e.g. "66%" */
    scrimFocus?: string;
  };

  spotlight: ModelSpotlight;

  locatorTiles: {
    newImage: string;
    usedImage: string;
  };

  newsOffers: {
    quote: QuotePanel;
    promo: PromoPanel;
  };

  splitBanners: SplitBanner[];

  welcome: {
    heading: string;
    body: string;
    image: string;
    imageAlt: string;
  };

  about: {
    helpImage: string;
    recruitImage: string;
    links: { label: string; href: string }[];
  };

  legalNotes: string[];

  footer: {
    quickLinks: { label: string; href: string }[];
    social: string[];
  };
}
