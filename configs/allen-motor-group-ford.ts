import type { DealerConfig } from "@/lib/types";
import { nationalBanners, NATIONAL_LEGAL } from "@/lib/content";

/**
 * Allen Motor Group Ford — price-led digital retailer, trading as Allen Ford,
 * Essex Ford and SMC Ford. Palette from allenmotorgroup.co.uk.
 */
export const dealer: DealerConfig = {
  brand: {
    name: "Allen Motor Group Ford",
    shortName: "Allen Motor Group",
    lockup: ["Allen Motor Group", "Ford"],
    accent: "#2096CD",
    accentDark: "#102B4E",
    navy: "#102B4E",
  },

  metaTitle: "Allen Ford, Essex Ford & SMC Ford | Allen Motor Group",
  metaDescription:
    "Allen Motor Group Ford — your new digital dealer. New and used Ford cars, vans and pickups with 72-hour delivery, 14-day Right to Return and Ford Privilege pricing across the South of England and Midlands.",

  alert: {
    text: "Your new digital dealer: buy online with 72-hour delivery and a 14-day Right to Return.",
    linkLabel: "Get offer",
    href: "#offers",
  },

  hero: {
    headline: "Your new digital dealer.",
    strapline:
      "Allen Ford, Essex Ford and SMC Ford — over thirty locations from Bath and Swindon through the Midlands and Berkshire to London, Kent and Essex. Buy online, unaccompanied test drives, and one of the country's largest Ford Privilege dealers.",
    image: "/assets/vehicles/mustang.jpg",
    imageAlt: "Ford Mustang",
    scrimFocus: "74%",
  },

  spotlight: {
    modelName: "The all-electric Puma Gen-E",
    fuelType: "Electric",
    strap:
      "From £167 per month. The Puma you know, now all-electric — with 43 litres of MegaBox storage and the Electric Car Grant already applied.",
    stats: [
      { title: "WLTP range", value: "233 miles" },
      { title: "0-62 mph", value: "8.0 secs" },
      { title: "From", value: "£167/mo" },
    ],
    image: "/assets/vehicles/puma-gen-e.jpg",
    imageAlt: "All-electric Ford Puma Gen-E at a charge point",
  },

  locatorTiles: {
    newImage: "/assets/vehicles/capri.jpg",
    usedImage: "/assets/vehicles/kuga.jpg",
  },

  newsOffers: {
    quote: {
      name: "The Allen Motor Group team",
      role: "Ford retailers since 1897",
      initials: "AF",
      quote:
        "We started out as one of Ford's earliest Model T partners in 1897, and we have never stopped adapting. Today that means buying your Ford entirely online, delivered inside 72 hours, with fourteen days to change your mind — the same reassurance, a lot less waiting.",
    },
    promo: {
      eyebrow: "Promotion",
      heading: "Octopus EV salary sacrifice",
      body:
        "Run a new electric Ford through your salary and cut the cost significantly — we'll handle the paperwork with Octopus EV.",
      linkLabel: "Read more",
      href: "#offers",
      image: "/assets/vehicles/mach-e.jpg",
      imageAlt: "Ford Mustang Mach-E",
    },
  },

  splitBanners: nationalBanners({
    offer: "/assets/vehicles/explorer.jpg",
    offerAlt: "All-electric Ford Explorer at sunset",
    grant: "/assets/vehicles/puma.jpg",
    grantAlt: "Ford Puma",
    powerPromise: "/assets/vehicles/e-transit-courier.jpg",
    powerPromiseAlt: "All-electric Ford E-Transit Courier charging",
    service: "/assets/vehicles/service-bay.jpg",
    serviceAlt: "Ford-trained technician servicing a vehicle",
    charging: "/assets/vehicles/e-transit.jpg",
    chargingAlt: "All-electric Ford E-Transit charging",
    business: "/assets/vehicles/ranger-raptor.jpg",
    businessAlt: "Ford Ranger Raptor",
  }),

  welcome: {
    heading: "Welcome to Allen Ford, Essex Ford & SMC Ford.",
    body:
      "Allen Motor Group has been in the motor trade since 1897, and our Ford business now runs under three names across more than thirty locations. Allen Ford covers Warwick, Coventry, Nuneaton, Northampton, Kettering, Swindon and Bath; Essex Ford serves Basildon, Rayleigh and Romford; and SMC Ford looks after Crayford, Gillingham, Gravesend, Slough and Uxbridge. Across all of them you'll find the full Ford car, van and pickup range, Ford Privilege pricing, accident repair centres and Motability specialists.",
    image: "/assets/vehicles/showroom.jpg",
    imageAlt: "Allen Ford showroom",
  },

  location: {
    nearbyTowns: ["Rayleigh", "Romford", "Chelmsford", "Southend-on-Sea"],
    address: {
      name: "Essex Ford Basildon",
      street: "Cranes Farm Road",
      locality: "Basildon",
      region: "Essex",
      postcode: "SS14 3JD",
    },
    phone: "01268 429039",
    areasServed:
      "Basildon, Rayleigh, Romford, Chelmsford, Southend-on-Sea, Grays, Brentwood and the wider Essex and East London area.",
    departments: [
      {
        id: "sales",
        label: "Sales",
        phone: "01268 429039",
        hours: [
          { day: "Monday – Friday", time: "08:30 – 18:30" },
          { day: "Saturday", time: "08:30 – 17:00" },
          { day: "Sunday", time: "10:00 – 16:00" },
        ],
      },
      {
        id: "service",
        label: "Service",
        phone: "01268 202725",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 18:00" },
          { day: "Saturday", time: "08:00 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "parts",
        label: "Parts",
        phone: "01268 202725",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 17:30" },
          { day: "Saturday", time: "08:30 – 12:30" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "bodyshop",
        label: "Accident Repair",
        phone: "01634 472447",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 17:30" },
          { day: "Saturday", time: "Closed" },
          { day: "Sunday", time: "Closed" },
        ],
      },
    ],
  },

  trust: {
    // No review score is published on the group's Ford pages, so we lead on
    // the credentials it does advertise.
    accreditations: [
      "Ford Privilege Dealer",
      "72-hour delivery",
      "14-day Right to Return",
      "Established 1897",
    ],
  },

  about: {
    helpImage: "/assets/vehicles/transit-custom.jpg",
    recruitImage: "/assets/vehicles/parts.jpg",
    links: [
      { label: "About Allen Motor Group", href: "#top" },
      { label: "Ford Privilege explained", href: "#top" },
      { label: "Our locations", href: "#top" },
    ],
  },

  legalNotes: NATIONAL_LEGAL,

  footer: {
    quickLinks: [
      { label: "ford.co.uk", href: "#top" },
      { label: "Allen Ford", href: "#top" },
      { label: "Essex Ford", href: "#top" },
      { label: "SMC Ford", href: "#top" },
      { label: "Careers", href: "#top" },
    ],
    social: ["Facebook", "Instagram", "LinkedIn"],
  },
};
