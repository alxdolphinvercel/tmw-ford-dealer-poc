import type { DealerConfig } from "@/lib/types";
import { nationalBanners, NATIONAL_LEGAL } from "@/lib/content";

/**
 * Group 1 Ford — advisory, "official Ford experts" tone. Palette from
 * group1auto.co.uk, whose live type stack is also Figtree/Nunito.
 */
export const dealer: DealerConfig = {
  brand: {
    name: "Group 1 Ford",
    shortName: "Group 1",
    lockup: ["Group 1", "Ford"],
    accent: "#00A3E0",
    accentDark: "#243A63",
    navy: "#243A63",
  },

  metaTitle: "Group 1 Ford | Official Ford Dealership",
  metaDescription:
    "Group 1 Ford — official Ford dealerships across Berkshire, Hampshire and Surrey. New and used Ford cars and vans, Ford Pro Transit Centres, servicing, MOT and finance.",

  alert: {
    text: "Summer Switch Up: book a Ford test drive this August and unlock up to £1,500 off your next Ford.",
    linkLabel: "Get offer",
    href: "#offers",
  },

  hero: {
    headline: "Discover your perfect Ford.",
    strapline:
      "Your local Ford experts across Berkshire, Hampshire and Surrey — with the full new range, Ford Approved Used, dedicated Ford Pro Transit Centres and Express Service at every site.",
    image: "/assets/vehicles/explorer.jpg",
    imageAlt: "All-electric Ford Explorer at sunset",
    scrimFocus: "72%",
  },

  spotlight: {
    modelName: "The all-electric Ford Capri",
    fuelType: "Electric",
    strap:
      "A legend, reimagined. Up to 390 miles of WLTP range, 0% APR on 4 Year Ford Options, and a £1,500 customer saving that stacks with the Electric Car Grant.",
    stats: [
      { title: "WLTP range", value: "390 miles" },
      { title: "0-62 mph", value: "6.4 secs" },
      { title: "APR", value: "0%" },
    ],
    image: "/assets/vehicles/capri.jpg",
    imageAlt: "All-electric Ford Capri",
  },

  locatorTiles: {
    newImage: "/assets/vehicles/mustang.jpg",
    usedImage: "/assets/vehicles/kuga.jpg",
  },

  newsOffers: {
    quote: {
      name: "The Group 1 Ford team",
      role: "Your local Ford experts",
      initials: "G1",
      quote:
        "Our customers are at the heart of everything we do — which in practice means a personalised video inspection with every service, an honest recommendation on what can wait, and an account manager who picks up the phone if you run a fleet.",
    },
    promo: {
      eyebrow: "Promotion",
      heading: "Win a Ford Puma",
      body:
        "Book and complete a test drive before the end of the month and you'll be entered into our prize draw to win a Ford Puma.",
      linkLabel: "Read more",
      href: "#offers",
      image: "/assets/vehicles/puma.jpg",
      imageAlt: "Ford Puma",
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
    heading: "Welcome to Group 1 Ford.",
    body:
      "Group 1 Automotive represents twenty manufacturer brands across more than 115 UK dealerships, and our Ford business sits along the M3 and M4 corridor south-west of London. You'll find us at Basingstoke, Farnborough, Guildford, Wokingham, Newbury and Bracknell, with dedicated Ford Transit Centres at Basingstoke and Farnborough for Ford Pro customers. Every site offers the full new Ford range, Ford Approved Used, Express Service, Ford SMART cosmetic repair, MOT and free health checks, and Motability specialists.",
    image: "/assets/vehicles/showroom.jpg",
    imageAlt: "Group 1 Ford showroom",
  },

  location: {
    nearbyTowns: ["Farnborough", "Newbury", "Andover", "Alton"],
    address: {
      name: "Group 1 Ford Basingstoke",
      street: "Aldermaston Road",
      locality: "Basingstoke",
      region: "Hampshire",
      postcode: "RG21 6YL",
    },
    phone: "01256 962700",
    areasServed:
      "Basingstoke, Farnborough, Newbury, Andover, Alton, Reading, Winchester and the wider M3 and M4 corridor.",
    departments: [
      {
        id: "sales",
        label: "Sales",
        phone: "01256 962700",
        hours: [
          { day: "Monday – Friday", time: "09:00 – 18:00" },
          { day: "Saturday", time: "09:00 – 17:00" },
          { day: "Sunday", time: "10:00 – 16:00" },
        ],
      },
      {
        id: "service",
        label: "Service",
        phone: "01256 962700",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 18:00" },
          { day: "Saturday", time: "08:00 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "parts",
        label: "Parts",
        phone: "01256 962700",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 17:30" },
          { day: "Saturday", time: "08:30 – 12:30" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "transit",
        label: "Transit Centre",
        phone: "01252 544344",
        hours: [
          { day: "Monday – Friday", time: "08:00 – 18:00" },
          { day: "Saturday", time: "08:30 – 13:00" },
          { day: "Sunday", time: "Closed" },
        ],
      },
      {
        id: "fleet",
        label: "Fleet & Business",
        phone: "01252 544344",
        hours: [
          { day: "Monday – Friday", time: "09:00 – 18:00" },
          { day: "Saturday", time: "Closed" },
          { day: "Sunday", time: "Closed" },
        ],
      },
    ],
  },

  trust: {
    accreditations: [
      "Official Ford Dealership",
      "Ford Pro Authorised",
      "115+ dealerships nationwide",
    ],
  },

  about: {
    helpImage: "/assets/vehicles/tourneo-courier.jpg",
    recruitImage: "/assets/vehicles/parts.jpg",
    links: [
      { label: "About Group 1", href: "#top" },
      { label: "Why choose Group 1 Ford?", href: "#top" },
      { label: "Ford Pro & Transit Centres", href: "#top" },
    ],
  },

  legalNotes: NATIONAL_LEGAL,

  footer: {
    quickLinks: [
      { label: "ford.co.uk", href: "#top" },
      { label: "Group 1 Automotive", href: "#top" },
      { label: "Ford Pro", href: "#top" },
      { label: "Careers at Group 1", href: "#top" },
    ],
    social: ["Facebook", "Instagram", "LinkedIn", "YouTube"],
  },
};
