/**
 * FIXED layer — Ford national content, identical across every dealer site.
 *
 * This is the OEM-governed material: navigation tree, Ford brand colours,
 * legal boilerplate and footer legal links. No dealer may vary these, which
 * is the point of the standardisation programme.
 */

export const FORD = {
  blue: "#00095B", // Ford Blue, Pantone 294C
  skyview: "#066FEF", // Ford Skyview — interactive blue
  ink: "#00142E",
} as const;

/** Primary navigation — served from one place for all ~190 sites. */
export const NAV: { label: string; children?: string[] }[] = [
  {
    label: "New Cars",
    children: [
      "View all models",
      "Puma",
      "Puma Gen-E",
      "Focus",
      "Kuga",
      "Explorer",
      "Capri",
      "Mustang Mach-E",
      "Mustang",
      "Ranger",
    ],
  },
  {
    label: "Used Cars",
    children: ["Search used stock", "Ford Approved Used", "Value my car", "Finance options"],
  },
  {
    label: "Ford Electric",
    children: [
      "Electric range",
      "Ford Power Promise",
      "Electric Car Grant",
      "Charging & savings",
      "Hybrid explained",
    ],
  },
  {
    label: "Servicing & Parts",
    children: [
      "Book a service",
      "MOT booking",
      "Service plans",
      "Genuine parts & accessories",
      "Ford Assistance",
    ],
  },
  {
    label: "Finance & Offers",
    children: [
      "Current offers",
      "Ford Options (PCP)",
      "Request a finance quote",
      "Part exchange",
    ],
  },
  {
    label: "Ford Pro & Fleet",
    children: ["Vans & pickups", "Transit Centre", "Business leasing", "Ford Pro services"],
  },
  { label: "Motability" },
  { label: "Contact Us" },
];

/**
 * FREE-but-national: the Q3 2026 Ford campaigns every dealer runs.
 * Dealers pick from these rather than authoring their own — this is exactly
 * the procurement/integration cost the programme removes.
 */
export const FORD_CAMPAIGNS = {
  powerPromise: {
    heading: "FORD POWER PROMISE.",
    body: [
      "Buy any new all-electric Ford and we'll give you a home charger with free standard installation, plus up to 10,000 miles of free charging credit on Intelligent Octopus Go.",
      "Add Ford Dynamic Charging and you could save up to 70% on your home energy costs, with roadside assistance included as standard.",
    ],
    link: "Discover Ford Power Promise",
  },
  electricGrant: {
    heading: "THE ELECTRIC CAR GRANT.",
    body: [
      "The UK Government's Electric Car Grant takes up to £3,750 off the price of selected all-electric models, including the all-electric Puma Gen-E.",
      "Grant eligibility and banding are set by the Government and applied at the point of order. Terms and conditions apply.",
    ],
    link: "Find out more about the Electric Car Grant",
  },
  options: {
    heading: "0% APR ACROSS THE ALL-ELECTRIC RANGE.",
    body: [
      "Take a new all-electric Capri or Explorer on 4 Year Ford Options with 0% APR Representative, plus a customer saving of up to £7,000 on selected models.",
      "Finance subject to status. Ford Credit Europe Bank plc, trading as Ford Credit. We can introduce you to a limited number of lenders and their finance products. We are a credit broker, not a lender.",
    ],
    link: "View finance offers",
  },
  service: {
    heading: "FORD SERVICE, DONE PROPERLY.",
    body: [
      "Ford-trained technicians, Ford Genuine Parts and a free Vehicle Health Check every time. Spread the cost with a Ford Service Plan from a fixed monthly amount.",
      "Book online in under two minutes and choose while-you-wait, collection and delivery, or a courtesy vehicle.",
    ],
    link: "Book a service",
  },
  charging: {
    heading: "EXPLORE CHARGING & SAVINGS.",
    body: [
      "See every public charge point near you, then use the savings calculator to compare running an electric Ford against your current car.",
      "Most drivers charge at home overnight on a smart tariff — where the savings are largest.",
    ],
    links: ["Explore charging points", "Discover cost savings"],
  },
  business: {
    heading: "BUSINESS AND FLEET.",
    body: [
      "From a single van to a national fleet, Ford Pro brings vehicles, servicing, telematics and charging together under one account manager.",
      "Business contract hire, contract purchase and Ford Options for Business are all available, with dedicated Transit Centre support.",
    ],
    link: "Find out more about Ford Pro",
  },
} as const;

/** Footer legal links — OEM/network governed, identical on every site. */
export const FOOTER_LEGAL = [
  "Terms and Conditions",
  "Cookies",
  "Complaints Procedure",
  "Modern slavery statement",
  "Compliance & Whistleblowing",
  "Privacy Policy",
  "Company Information",
  "Motor industry code of practice",
  "Product safety enquiry",
];

export const FOOTER_CONTACT = [
  "Contact us form",
  "Book an appointment",
  "Sell your Ford",
];
