import type { DealerConfig } from "@/lib/types";
import { nationalBanners, NATIONAL_LEGAL } from "@/lib/content";

/** Evans Halshaw Ford — nationwide scale/value. Palette from evanshalshaw.com. */
export const dealer: DealerConfig = {
  brand: {
    name: "Evans Halshaw Ford",
    shortName: "Evans Halshaw",
    lockup: ["Evans Halshaw", "Ford"],
    accent: "#00A0DC",
    accentDark: "#0F3456",
    navy: "#0F3456",
  },

  metaTitle:
    "Evans Halshaw Ford | New & Used Car and Van Sales, Servicing and more",
  metaDescription:
    "Evans Halshaw Ford — new and used Ford cars and vans, Click & Collect, servicing, MOT and Motability from 32 Ford dealerships nationwide.",

  alert: {
    text: "Click & Collect on thousands of Ford cars and vans — reserve online today from any of our 32 Ford dealerships.",
    linkLabel: "Get offer",
    href: "#offers",
  },

  hero: {
    headline: "Your national Ford dealer.",
    strapline:
      "Thirty-two Ford dealerships, dedicated Transit Centres and a nationwide aftersales network — with Click & Collect, mobile servicing and Ford LiiVE wherever you are in the UK.",
    image: "/assets/vehicles/ranger.jpg",
    imageAlt: "Ford Ranger on rough terrain",
    scrimFocus: "70%",
  },

  spotlight: {
    modelName: "The all-electric Ford Explorer",
    fuelType: "Electric",
    strap:
      "European-built, family-focused and packed with technology — up to 374 miles of WLTP range and Ford BlueCruise-ready.",
    stats: [
      { title: "WLTP range", value: "374 miles" },
      { title: "0-62 mph", value: "5.3 secs" },
      { title: "Seats", value: "5" },
    ],
    image: "/assets/vehicles/explorer.jpg",
    imageAlt: "All-electric Ford Explorer at sunset",
  },

  locatorTiles: {
    newImage: "/assets/vehicles/kuga.jpg",
    usedImage: "/assets/vehicles/puma.jpg",
  },

  newsOffers: {
    quote: {
      name: "The Evans Halshaw Ford team",
      role: "32 Ford dealerships nationwide",
      initials: "EH",
      quote:
        "Scale should mean convenience, not distance. Whichever of our thirty-two Ford sites you use, you get the same Approved Used standards, the same Vehicle Health Check and the same aftersales promise — plus Pick Up & Delivery servicing if you'd rather not leave the house.",
    },
    promo: {
      eyebrow: "News",
      heading: "New Ford Transit Centre, Darlington",
      body:
        "Our newest dedicated Ford Pro Transit Centre brings specialist van sales, servicing and parts to the North East.",
      linkLabel: "Read more",
      href: "#offers",
      image: "/assets/vehicles/transit-city.jpg",
      imageAlt: "Ford Transit at a Transit Centre",
    },
  },

  splitBanners: nationalBanners({
    offer: "/assets/vehicles/mustang.jpg",
    offerAlt: "Ford Mustang",
    grant: "/assets/vehicles/puma-gen-e.jpg",
    grantAlt: "All-electric Ford Puma Gen-E at a charge point",
    powerPromise: "/assets/vehicles/capri.jpg",
    powerPromiseAlt: "All-electric Ford Capri",
    service: "/assets/vehicles/service-bay.jpg",
    serviceAlt: "Ford-trained technician servicing a vehicle",
    charging: "/assets/vehicles/mach-e.jpg",
    chargingAlt: "Ford Mustang Mach-E",
    business: "/assets/vehicles/e-transit-custom.jpg",
    businessAlt: "All-electric Ford E-Transit Custom for business",
  }),

  welcome: {
    heading: "Welcome to Evans Halshaw Ford.",
    body:
      "Evans Halshaw is one of the UK's largest Ford retailers, with thirty-two Ford dealerships from Glasgow, Motherwell, East Kilbride and Coatbridge in Scotland, through Preston, Blackpool, Burnley, Altrincham, Old Trafford and Chester in the North West, across to Hull, Lincoln, Darlington and Middlesbrough, down to Walsall, Wolverhampton, Bedford and Milton Keynes, and into Wales at Cardiff, Merthyr Tydfil and Wrexham. Add dedicated Transit Centres, Authorised Repairers and a Motability specialist at every site, and there is always a Ford expert nearby.",
    image: "/assets/vehicles/showroom.jpg",
    imageAlt: "Evans Halshaw Ford showroom",
  },

  location: {
    nearbyTowns: ["Motherwell", "Coatbridge", "East Kilbride", "Cumbernauld"],
    address: {
      name: "Evans Halshaw Ford Glasgow",
      street: "694 Cumbernauld Road",
      locality: "Glasgow",
      postcode: "G33 2ET",
    },
    phone: "0141 770 1100",
    areasServed:
      "Glasgow, Motherwell, Coatbridge, East Kilbride, Cumbernauld, Paisley, Hamilton and the wider Central Belt.",
    departments: [
      {
        id: "sales",
        label: "Sales",
        phone: "0141 770 1100",
        hours: [
          { day: "Monday – Friday", time: "09:00 – 18:00" },
          { day: "Saturday", time: "09:00 – 17:00" },
          { day: "Sunday", time: "11:00 – 17:00" },
        ],
      },
      {
        id: "service",
        label: "Service",
        phone: "0141 770 1103",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 18:00" },
          { day: "Saturday", time: "08:00 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "parts",
        label: "Parts",
        phone: "0141 770 1103",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 17:30" },
          { day: "Saturday", time: "08:30 – 12:30" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "motability",
        label: "Motability",
        phone: "0141 770 1100",
        hours: [
          { day: "Monday – Friday", time: "09:00 – 17:30" },
          { day: "Saturday", time: "09:00 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "transit",
        label: "Transit Centre",
        phone: "0141 770 1100",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 18:00" },
          { day: "Saturday", time: "08:30 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
    ],
  },

  trust: {
    // Evans Halshaw is the one group in this set that publishes a score on-page.
    review: {
      label: "Trustpilot",
      score: "4.2",
      detail: "over 100,000 reviews",
      stars: 4.2,
    },
    accreditations: ["The Motor Ombudsman", "Motability Partner", "Ford Pro Authorised"],
  },

  about: {
    helpImage: "/assets/vehicles/tourneo-connect.jpg",
    recruitImage: "/assets/vehicles/parts.jpg",
    links: [
      { label: "About Evans Halshaw", href: "#top" },
      { label: "Click & Collect explained", href: "#top" },
      { label: "Drive 4 UR Community", href: "#top" },
    ],
  },

  legalNotes: NATIONAL_LEGAL,

  footer: {
    quickLinks: [
      { label: "ford.co.uk", href: "#top" },
      { label: "Pendragon PLC", href: "#top" },
      { label: "Ford Transit Centres", href: "#top" },
      { label: "Careers at Evans Halshaw", href: "#top" },
    ],
    social: ["Facebook", "X", "Instagram", "YouTube"],
  },
};
