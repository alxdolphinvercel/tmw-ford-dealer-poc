import { getDealer } from "@/lib/overrides";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Spotlight from "@/components/Spotlight";
import LocatorTiles from "@/components/LocatorTiles";
import NewsOffers from "@/components/NewsOffers";
import SplitBanners from "@/components/SplitBanners";
import Welcome from "@/components/Welcome";
import AboutGrid from "@/components/AboutGrid";
import LegalNotes from "@/components/LegalNotes";
import ContactModule from "@/components/ContactModule";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";

/* Rendered per request so published Edge Config overrides appear without a
   redeploy, and so the content editor can preview drafts via ?draft=. */
export const dynamic = "force-dynamic";

/**
 * The standardised dealer homepage.
 *
 * Section order is FIXED — it is the same on every one of the ~190 sites, and
 * is what gives Ford a single governed content framework. Everything that
 * differs per dealer arrives through `dealer.config.ts`, overlaid at request
 * time with published overrides from Edge Config (see lib/overrides.ts).
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const { draft } = await searchParams;
  const dealer = await getDealer(draft);
  const { brand } = dealer;

  return (
    <div
      style={
        {
          "--accent": brand.accent,
          "--accent-dark": brand.accentDark,
          "--navy": brand.navy,
        } as React.CSSProperties
      }
    >
      <StructuredData dealer={dealer} />
      <Header dealer={dealer} />

      <main id="main-content">
        <Hero dealer={dealer} />
        <Spotlight dealer={dealer} />
        <LocatorTiles dealer={dealer} />
        <NewsOffers dealer={dealer} />
        <SplitBanners dealer={dealer} />
        <Welcome dealer={dealer} />
        <AboutGrid dealer={dealer} />
        <LegalNotes dealer={dealer} />
        <ContactModule dealer={dealer} />
      </main>

      <Footer dealer={dealer} />
    </div>
  );
}
