import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import styles from "./LocatorTiles.module.css";

/** Two 16:9 stock-search entry tiles — new and approved used. */
export default function LocatorTiles({ dealer }: { dealer: DealerConfig }) {
  const { locatorTiles, brand } = dealer;

  const tiles = [
    {
      title: "New car locator.",
      image: locatorTiles.newImage,
      alt: `New Ford models at ${brand.name}`,
    },
    {
      title: "Used car locator.",
      image: locatorTiles.usedImage,
      alt: `Ford Approved Used cars at ${brand.name}`,
    },
  ];

  return (
    <section className={styles.section} id="locators" aria-label="Search our stock">
      {tiles.map((tile) => (
        <a key={tile.title} className={styles.tile} href="#contact">
          <Image
            src={tile.image}
            alt={tile.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            quality={78}
            style={{ objectFit: "cover" }}
          />
          <span className={styles.tint} aria-hidden="true" />
          <span className={styles.body}>
            <span className={`display ${styles.title}`}>{tile.title}</span>
            <span className="arrowLink whiteArrow">Search now</span>
          </span>
        </a>
      ))}
    </section>
  );
}
