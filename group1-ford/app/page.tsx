import { cookies } from "next/headers";
import { getDealer } from "@/lib/overrides";
import { verifyEditToken } from "@/lib/edit-token";
import EditOverlay from "@/components/edit/EditOverlay";
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

  /* Inline edit mode: only when the signed edit-session cookie (set by
     /api/edit from a content-editor handoff link) verifies for THIS dealer.
     Normal visitors never load the overlay's JS. */
  const editSession = verifyEditToken(
    (await cookies()).get("ford_edit")?.value,
    process.env.EDIT_SIGNING_SECRET ?? ""
  );
  const editMode = editSession?.dealerId === dealer.id;

  return (
    <div
      data-edit-brand-root
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

      {editMode && editSession && (
        <EditOverlay
          dealerId={dealer.id}
          dealerName={brand.name}
          exp={editSession.exp}
        />
      )}
    </div>
  );
}
