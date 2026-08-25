import type { Metadata } from "next";
import { DM_Sans, Archivo_Narrow } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getDealer } from "@/lib/overrides";
import "./globals.css";

/* Ford Antenna is proprietary; DM Sans + Archivo Narrow are the closest
   freely-licensed substitutes for Antenna and Antenna Condensed. */
const body = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

const display = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const dealer = await getDealer();
  return {
    title: dealer.metaTitle,
    description: dealer.metaDescription,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB">
      <body className={`${body.variable} ${display.variable}`}>
        <a className="skipLink" href="#main-content">
          Skip to main content
        </a>
        {children}
        {/* Real-user Core Web Vitals collection (Vercel Speed Insights) —
            the field-data instrument for these sites while they are too new
            to appear in the Chrome UX Report. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
