import { FORD_CAMPAIGNS } from "./ford";
import type { SplitBanner } from "./types";

/**
 * The campaign occupying each banner slot, in the order nationalBanners()
 * builds them. Overrides and the inline editor use it to translate between
 * national FORD_CAMPAIGNS paths and a dealer's splitBanners indices.
 */
export const CAMPAIGN_ORDER: readonly string[] = [
  "options",
  "electricGrant",
  "powerPromise",
  "service",
  "charging",
  "business",
];

/**
 * Builds the six national campaign banners from the Fixed Ford campaign copy,
 * given the imagery a dealer has chosen for each slot.
 *
 * This is the heart of the standardisation argument: the copy, order and legal
 * wording are OEM-governed and identical on all ~190 sites; the dealer only
 * supplies imagery and (optionally) a single local offer in slot 0.
 */
export function nationalBanners(images: {
  offer: string;
  offerAlt: string;
  grant: string;
  grantAlt: string;
  powerPromise: string;
  powerPromiseAlt: string;
  service: string;
  serviceAlt: string;
  charging: string;
  chargingAlt: string;
  business: string;
  businessAlt: string;
}): SplitBanner[] {
  const c = FORD_CAMPAIGNS;

  return [
    {
      eyebrow: "Offer",
      heading: c.options.heading,
      body: [...c.options.body],
      links: [{ label: c.options.link, href: "#offers" }],
      image: images.offer,
      imageAlt: images.offerAlt,
    },
    {
      eyebrow: "Electric",
      heading: c.electricGrant.heading,
      body: [...c.electricGrant.body],
      links: [{ label: c.electricGrant.link, href: "#offers" }],
      image: images.grant,
      imageAlt: images.grantAlt,
    },
    {
      eyebrow: "Ford Power Promise",
      heading: c.powerPromise.heading,
      body: [...c.powerPromise.body],
      links: [{ label: c.powerPromise.link, href: "#offers" }],
      image: images.powerPromise,
      imageAlt: images.powerPromiseAlt,
    },
    {
      eyebrow: "Aftersales",
      heading: c.service.heading,
      body: [...c.service.body],
      links: [{ label: c.service.link, href: "#contact" }],
      image: images.service,
      imageAlt: images.serviceAlt,
    },
    {
      eyebrow: "Charging",
      heading: c.charging.heading,
      body: [...c.charging.body],
      links: c.charging.links.map((label) => ({ label, href: "#offers" })),
      image: images.charging,
      imageAlt: images.chargingAlt,
    },
    {
      eyebrow: "Ford Pro",
      heading: c.business.heading,
      body: [...c.business.body],
      links: [{ label: c.business.link, href: "#contact" }],
      image: images.business,
      imageAlt: images.businessAlt,
    },
  ];
}

/** The WLTP / finance disclaimers that must appear on every dealer page. */
export const NATIONAL_LEGAL = [
  "[1] Electric range and energy consumption figures are determined according to the WLTP test procedure. Figures shown are for comparison purposes and should only be compared with other vehicles tested to the same technical procedures. Actual real-world range and consumption depend on driving style, route, weather, load, and the use of vehicle systems, and may differ from the figures quoted.",
  "[2] Finance subject to status. Guarantees may be required. Ford Credit Europe Bank plc, trading as Ford Credit, registered in England, Ford Credit is a credit broker and not a lender. Ford Power Promise home charger offer applies to eligible new all-electric Ford passenger vehicles ordered by 30 September 2026 and is subject to eligibility, survey, and standard installation terms. Charging credit is provided by Octopus Energy on the Intelligent Octopus Go tariff and is subject to their terms and conditions.",
];
