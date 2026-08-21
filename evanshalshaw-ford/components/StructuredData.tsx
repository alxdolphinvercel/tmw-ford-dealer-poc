import type { DealerConfig } from "@/lib/types";

/**
 * LocalBusiness / AutoDealer structured data, generated from the same config
 * that drives the page.
 *
 * This is the clearest expression of the programme's value: because address,
 * hours, phone numbers and geography are structured data rather than prose
 * baked into a dealer-built template, every site in the network emits correct,
 * consistent schema.org markup with no per-dealer effort — which is what makes
 * network-wide search reporting possible in the first place.
 */
export default function StructuredData({ dealer }: { dealer: DealerConfig }) {
  const { brand, location, trust } = dealer;

  const dayMap: Record<string, string[]> = {
    "Monday – Friday": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ],
    Saturday: ["Saturday"],
    Sunday: ["Sunday"],
  };

  const openingHoursSpecification = location.departments[0]?.hours
    .filter((h) => !/closed/i.test(h.time))
    .map((h) => {
      const [opens, closes] = h.time.split("–").map((t) => t.trim());
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: dayMap[h.day] ?? [h.day],
        opens,
        closes,
      };
    });

  const data = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: brand.name,
    description: dealer.metaDescription,
    brand: { "@type": "Brand", name: "Ford" },
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address.street,
      addressLocality: location.address.locality,
      ...(location.address.region
        ? { addressRegion: location.address.region }
        : {}),
      postalCode: location.address.postcode,
      addressCountry: "GB",
    },
    telephone: location.phone,
    areaServed: location.nearbyTowns.map((t) => ({ "@type": "City", name: t })),
    department: location.departments.map((d) => ({
      "@type": "AutoDealer",
      name: `${brand.name} — ${d.label}`,
      telephone: d.phone,
    })),
    openingHoursSpecification,
    ...(trust.review
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: trust.review.score,
            bestRating: "5",
            description: trust.review.detail,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Config-derived, not user input; JSON.stringify output is safe here.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
