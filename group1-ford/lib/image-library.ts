/**
 * The approved image library — the only imagery marketers can place on a
 * dealer page. Curated centrally (the Fixed layer applied to photography):
 * dealers choose from this set, so every image is on-brand, licensed, and
 * ships with alt text written once. Picking an image publishes its `src`
 * and its curated `alt` together.
 *
 * Every src must exist in public/assets/vehicles/ at build time. The publish
 * route and the site-side override merge both reject image values outside
 * IMAGE_SRCS, so external or hand-typed URLs can never reach an <img src>.
 *
 * This file is duplicated in content-agent/lib/image-library.ts — the two
 * projects are separate npm packages; keep them in sync.
 */

export interface LibraryImage {
  /** Site-relative path — the value that gets published. */
  src: string;
  /** Human name shown in pickers. */
  label: string;
  /** Curated, dealer-agnostic alt text, published alongside as …imageAlt. */
  alt: string;
}

export const IMAGE_LIBRARY: LibraryImage[] = [
  { src: "/assets/vehicles/capri.jpg", label: "Ford Capri", alt: "All-electric Ford Capri" },
  { src: "/assets/vehicles/explorer.jpg", label: "Ford Explorer", alt: "All-electric Ford Explorer at sunset" },
  { src: "/assets/vehicles/kuga.jpg", label: "Ford Kuga", alt: "Ford Kuga outside a modern building" },
  { src: "/assets/vehicles/mach-e.jpg", label: "Ford Mustang Mach-E", alt: "Ford Mustang Mach-E" },
  { src: "/assets/vehicles/mustang.jpg", label: "Ford Mustang", alt: "Ford Mustang" },
  { src: "/assets/vehicles/puma.jpg", label: "Ford Puma", alt: "Ford Puma" },
  { src: "/assets/vehicles/puma-gen-e.jpg", label: "Ford Puma Gen-E", alt: "All-electric Ford Puma Gen-E at a charge point" },
  { src: "/assets/vehicles/ranger.jpg", label: "Ford Ranger", alt: "Ford Ranger on rough terrain" },
  { src: "/assets/vehicles/ranger-raptor.jpg", label: "Ford Ranger Raptor", alt: "Ford Ranger Raptor" },
  { src: "/assets/vehicles/e-transit.jpg", label: "Ford E-Transit", alt: "All-electric Ford E-Transit charging" },
  { src: "/assets/vehicles/e-transit-courier.jpg", label: "Ford E-Transit Courier", alt: "All-electric Ford E-Transit Courier charging" },
  { src: "/assets/vehicles/e-transit-custom.jpg", label: "Ford E-Transit Custom", alt: "All-electric Ford E-Transit Custom for business" },
  { src: "/assets/vehicles/transit-city.jpg", label: "Ford Transit in the city", alt: "Ford Transit at a Transit Centre" },
  { src: "/assets/vehicles/transit-custom.jpg", label: "Ford Transit Custom", alt: "Ford Transit Custom for business" },
  { src: "/assets/vehicles/tourneo-connect.jpg", label: "Ford Tourneo Connect", alt: "Ford Tourneo Connect" },
  { src: "/assets/vehicles/tourneo-courier.jpg", label: "Ford Tourneo Courier", alt: "Ford Tourneo Courier" },
  { src: "/assets/vehicles/tourneo-custom.jpg", label: "Ford Tourneo Custom", alt: "Ford Tourneo Custom" },
  { src: "/assets/vehicles/showroom.jpg", label: "Showroom", alt: "Ford dealership showroom" },
  { src: "/assets/vehicles/service-bay.jpg", label: "Service bay", alt: "Ford-trained technician servicing a vehicle" },
  { src: "/assets/vehicles/parts.jpg", label: "Parts counter", alt: "Genuine Ford parts and accessories" },
];

export const IMAGE_SRCS: ReadonlySet<string> = new Set(
  IMAGE_LIBRARY.map((image) => image.src)
);

export function libraryEntry(src: string): LibraryImage | undefined {
  return IMAGE_LIBRARY.find((image) => image.src === src);
}
