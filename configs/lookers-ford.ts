import type { DealerConfig } from "@/lib/types";
import { nationalBanners, NATIONAL_LEGAL } from "@/lib/content";

/** Lookers Ford — deal-led national group. Palette from lookers.co.uk. */
export const dealer: DealerConfig = {
  brand: {
    name: "Lookers Ford",
    shortName: "Lookers",
    lockup: ["Lookers", "Ford"],
    accent: "#0374D6",
    accentDark: "#00297A",
    navy: "#051C2C",
  },

  metaTitle: "Lookers Ford | New & Used Ford Cars, Vans and Servicing",
  metaDescription:
    "Lookers Ford — new and used Ford cars and vans, Click & Drive online buying, servicing, MOT and finance across Essex, Suffolk, Yorkshire, the North East and Tyne & Wear.",

  alert: {
    text: "Ready. Set. 76 Plate Ford. Order your new registration Ford with up to £1,500 off this month.",
    linkLabel: "Get offer",
    href: "#offers",
  },

  hero: {
    headline: "Find your perfect Ford.",
    strapline:
      "New, used, big or small. Whatever your next perfect car is, we'll make sure it's a perfect fit — buy online with Click & Drive, or visit any of our 18 Ford centres.",
    image: "/assets/vehicles/kuga.jpg",
    imageAlt: "Ford Kuga outside a modern building",
    scrimFocus: "72%",
  },

  spotlight: {
    modelName: "The all-electric Ford Explorer",
    fuelType: "Electric",
    strap:
      "Built in Europe, engineered around family life — with up to 374 miles of WLTP range, a 5-star Euro NCAP rating and a hidden MegaConsole.",
    stats: [
      { title: "WLTP range", value: "374 miles" },
      { title: "0-62 mph", value: "5.3 secs" },
      { title: "Seats", value: "5" },
    ],
    image: "/assets/vehicles/explorer.jpg",
    imageAlt: "All-electric Ford Explorer at sunset",
  },

  locatorTiles: {
    newImage: "/assets/vehicles/puma.jpg",
    usedImage: "/assets/vehicles/capri.jpg",
  },

  newsOffers: {
    quote: {
      name: "The Lookers Ford team",
      role: "A good deal. Better.",
      initials: "LF",
      quote:
        "Buying a car should be three steps, not thirty: find your next car, decide how to buy, drive away. Do it entirely online with Click & Drive and we'll deliver to your door, or come and see us at any of our eighteen Ford centres.",
    },
    promo: {
      eyebrow: "Promotion",
      heading: "The Summer Switch Up Test Drive Event",
      body:
        "Book and complete a test drive this month for a £500 Test Drive Saving plus a £1,000 Welcome Saving on your next Ford.",
      linkLabel: "Read more",
      href: "#offers",
      image: "/assets/vehicles/mustang.jpg",
      imageAlt: "Ford Mustang",
    },
  },

  splitBanners: nationalBanners({
    offer: "/assets/vehicles/mach-e.jpg",
    offerAlt: "Ford Mustang Mach-E",
    grant: "/assets/vehicles/puma-gen-e.jpg",
    grantAlt: "All-electric Ford Puma Gen-E at a charge point",
    powerPromise: "/assets/vehicles/e-transit-courier.jpg",
    powerPromiseAlt: "All-electric Ford E-Transit Courier charging",
    service: "/assets/vehicles/service-bay.jpg",
    serviceAlt: "Ford-trained technician servicing a vehicle",
    charging: "/assets/vehicles/e-transit.jpg",
    chargingAlt: "All-electric Ford E-Transit charging",
    business: "/assets/vehicles/transit-custom.jpg",
    businessAlt: "Ford Transit Custom for business",
  }),

  welcome: {
    heading: "Welcome to Lookers Ford.",
    body:
      "Lookers has been selling and servicing Ford for decades, and today our Ford centres run from Essex and Suffolk — Braintree, Chelmsford, Colchester, South Woodham Ferrers and Sudbury — up through Yorkshire at Leeds and Sheffield, and on into the North East at Middlesbrough, Sunderland, Gateshead and South Shields. Alongside the full car range we run dedicated Transit Centres and Van Hubs for Ford Pro customers, with RAC Approved service centres, Motability specialists and overnight servicing to fit around your week.",
    image: "/assets/vehicles/showroom.jpg",
    imageAlt: "Lookers Ford showroom",
  },

  location: {
    nearbyTowns: ["Colchester", "Braintree", "Sudbury", "South Woodham Ferrers"],
    address: {
      name: "Lookers Ford Chelmsford",
      street: "2 Argyll Road, Chelmer Village",
      locality: "Chelmsford",
      region: "Essex",
      postcode: "CM2 6PY",
    },
    phone: "01245 247247",
    areasServed:
      "Chelmsford, Colchester, Braintree, Sudbury, South Woodham Ferrers, Basildon, Ipswich and the wider Essex and Suffolk area.",
    departments: [
      {
        id: "sales",
        label: "Sales",
        phone: "01245 247247",
        hours: [
          { day: "Monday – Friday", time: "09:00 – 18:00" },
          { day: "Saturday", time: "09:00 – 17:00" },
          { day: "Sunday", time: "10:00 – 16:00" },
        ],
      },
      {
        id: "service",
        label: "Service",
        phone: "01245 247247",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 18:00" },
          { day: "Saturday", time: "08:00 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "parts",
        label: "Parts",
        phone: "01245 247247",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 17:30" },
          { day: "Saturday", time: "08:00 – 12:30" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "transit",
        label: "Transit Centre",
        phone: "01206 222222",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 18:00" },
          { day: "Saturday", time: "08:30 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
    ],
  },

  trust: {
    // Lookers publishes no score on its Ford pages; these are the badges it does show.
    accreditations: [
      "The Motor Ombudsman",
      "Motability Partner",
      "RAC Approved",
      "Cyber Essentials",
    ],
  },

  about: {
    helpImage: "/assets/vehicles/transit-city.jpg",
    recruitImage: "/assets/vehicles/parts.jpg",
    links: [
      { label: "About Lookers", href: "#top" },
      { label: "Click & Drive explained", href: "#top" },
      { label: "Lookers Privilege", href: "#top" },
    ],
  },

  legalNotes: NATIONAL_LEGAL,

  footer: {
    quickLinks: [
      { label: "ford.co.uk", href: "#top" },
      { label: "Lookers Group", href: "#top" },
      { label: "Charles Hurst", href: "#top" },
      { label: "Taggarts", href: "#top" },
      { label: "Careers at Lookers", href: "#top" },
    ],
    social: ["Facebook", "X", "Instagram", "LinkedIn", "YouTube"],
  },
};
