import { dealer } from "@/dealer.config";
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

/**
 * The standardised dealer homepage.
 *
 * Section order is FIXED — it is the same on every one of the ~190 sites, and
 * is what gives Ford a single governed content framework. Everything that
 * differs per dealer arrives through `dealer.config.ts`.
 */
export default function Home() {
  return (
    <>
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
    </>
  );
}
