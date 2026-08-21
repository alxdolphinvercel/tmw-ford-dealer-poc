import type { DealerConfig } from "@/lib/types";
import { nationalBanners, NATIONAL_LEGAL } from "@/lib/content";

/** Hendy Ford — family South-Coast group, heritage since 1859. Palette from hendy.co.uk. */
export const dealer: DealerConfig = {
  brand: {
    name: "Hendy Ford",
    shortName: "Hendy",
    lockup: ["Hendy", "Ford"],
    accent: "#56C4B7",
    accentDark: "#1E2E5C",
    navy: "#1E2E5C",
  },

  metaTitle: "Hendy Ford | New & Used Ford Cars, Vans and Servicing",
  metaDescription:
    "Hendy Ford — new and used Ford cars and vans, servicing, MOT and finance across the South Coast, Kent, Surrey, Sussex and Hampshire. Family-run since 1859.",

  alert: {
    text: "Book a Ford test drive this month and unlock up to £1,500 off your next Ford.",
    linkLabel: "Get offer",
    href: "#offers",
  },

  hero: {
    headline: "Welcome to Hendy Ford.",
    strapline:
      "Let's find your perfect vehicle. With Hendy Ford dealerships across the South Coast, Kent, Surrey, Sussex and Hampshire, you're never far from one of our welcoming sites — family-run since 1859.",
    image: "/assets/vehicles/explorer.jpg",
    imageAlt: "All-electric Ford Explorer at sunset",
    scrimFocus: "70%",
  },

  spotlight: {
    modelName: "The all-electric Puma Gen-E",
    fuelType: "Electric",
    strap:
      "The Puma you know, now all-electric — with 43 litres of MegaBox storage, up to 233 miles of WLTP range, and the Electric Car Grant already applied.",
    stats: [
      { title: "WLTP range", value: "233 miles" },
      { title: "0-62 mph", value: "8.0 secs" },
      { title: "Seats", value: "5" },
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
      name: "The Hendy Ford team",
      role: "Serving drivers since 1859",
      initials: "HF",
      quote:
        "Six generations on, we still judge ourselves the same way — on whether people come back. Whether you're collecting your first electric Ford or booking a Transit in for a service, you'll deal with people who live locally and expect to see you again.",
    },
    promo: {
      eyebrow: "Promotion",
      heading: "Ford Power Promise",
      body:
        "A free home charger with standard installation, plus up to 10,000 miles of free charging credit when you buy a new all-electric Ford.",
      linkLabel: "Read more",
      href: "#offers",
      image: "/assets/vehicles/mach-e.jpg",
      imageAlt: "Ford Mustang Mach-E",
    },
  },

  splitBanners: nationalBanners({
    offer: "/assets/vehicles/mustang.jpg",
    offerAlt: "Ford Mustang",
    grant: "/assets/vehicles/puma.jpg",
    grantAlt: "Ford Puma",
    powerPromise: "/assets/vehicles/e-transit-courier.jpg",
    powerPromiseAlt: "All-electric Ford E-Transit Courier charging",
    service: "/assets/vehicles/service-bay.jpg",
    serviceAlt: "Ford-trained technician servicing a vehicle",
    charging: "/assets/vehicles/e-transit.jpg",
    chargingAlt: "All-electric Ford E-Transit charging",
    business: "/assets/vehicles/tourneo-custom.jpg",
    businessAlt: "Ford Transit Custom for business",
  }),

  welcome: {
    heading: "Welcome to Hendy Ford on the South Coast.",
    body:
      "Hendy has been looking after drivers since 1859, and today our Ford dealerships span Hampshire, West Sussex, Surrey and Kent — including FordStores at Eastleigh and Portsmouth, plus sites at Chichester, Fareham, Horsham, Redhill, Tonbridge and Tunbridge Wells. Whether you're after the all-electric Puma Gen-E, a Kuga for the family, or a Transit for the business, you'll find the full Ford range, Ford Options finance, Motability specialists, and Ford-trained technicians for servicing, MOTs and repairs.",
    image: "/assets/vehicles/showroom.jpg",
    imageAlt: "Hendy Ford showroom",
  },

  location: {
    nearbyTowns: ["Southampton", "Winchester", "Fareham", "Chandler's Ford"],
    address: {
      name: "Hendy FordStore Eastleigh",
      street: "Leigh Road",
      locality: "Eastleigh",
      region: "Hampshire",
      postcode: "SO50 9PT",
    },
    phone: "02380 242612",
    areasServed:
      "Eastleigh, Southampton, Winchester, Fareham, Chandler's Ford, Portsmouth, Romsey and the wider South Coast.",
    departments: [
      {
        id: "sales",
        label: "Sales",
        phone: "02380 242612",
        hours: [
          { day: "Monday – Friday", time: "08:30 – 18:00" },
          { day: "Saturday", time: "08:30 – 17:00" },
          { day: "Sunday", time: "10:00 – 16:00" },
        ],
      },
      {
        id: "service",
        label: "Service",
        phone: "02380 981680",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 18:00" },
          { day: "Saturday", time: "08:30 – 12:30" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "parts",
        label: "Parts",
        phone: "02380 988085",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 17:30" },
          { day: "Saturday", time: "08:30 – 14:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "motability",
        label: "Motability",
        phone: "02380 988097",
        hours: [
          { day: "Monday – Friday", time: "09:00 – 17:30" },
          { day: "Saturday", time: "09:00 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
    ],
  },

  trust: {
    // Hendy publishes no numeric review score on its Ford pages — so we show
    // only the accreditation it does display.
    accreditations: ["The Motor Ombudsman", "Established 1859", "FCA reg. 311625"],
  },

  about: {
    helpImage: "/assets/vehicles/transit-city.jpg",
    recruitImage: "/assets/vehicles/parts.jpg",
    links: [
      { label: "Our history since 1859", href: "#top" },
      { label: "Hendy Advantage", href: "#top" },
      { label: "Meet the team", href: "#top" },
    ],
  },

  legalNotes: NATIONAL_LEGAL,

  footer: {
    quickLinks: [
      { label: "ford.co.uk", href: "#top" },
      { label: "Hendy Group", href: "#top" },
      { label: "Careers at Hendy", href: "#top" },
      { label: "Hendy Ford Transit Centre", href: "#top" },
    ],
    social: ["Facebook", "Instagram", "LinkedIn", "YouTube"],
  },
};
