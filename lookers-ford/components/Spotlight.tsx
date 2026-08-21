import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import styles from "./Spotlight.module.css";

/**
 * Flagship model spotlight: full-bleed dark image band with a white info card
 * overlapping its lower edge. The card is the one rounded surface in the whole
 * design system (10px), matching the benchmark.
 */
export default function Spotlight({ dealer }: { dealer: DealerConfig }) {
  const { spotlight } = dealer;

  return (
    <section className={styles.section} aria-label={`${spotlight.modelName} spotlight`}>
      <div className={styles.media}>
        <Image
          src={spotlight.image}
          alt={spotlight.imageAlt}
          fill
          sizes="100vw"
          quality={80}
          style={{ objectFit: "cover", objectPosition: "center 40%" }}
        />
      </div>

      <div className="widthHolder">
        <div className={`contentHolder ${styles.cardWrap}`}>
          <div className={`${styles.card} reveal`}>
            <h2 className={`display ${styles.modelName}`}>{spotlight.modelName}</h2>
            <ul className={styles.fuelType}>
              <li>{spotlight.fuelType}</li>
            </ul>
            <p className={styles.strap}>{spotlight.strap}</p>

            <div className={styles.footerRow}>
              <ul className={styles.stats}>
                {spotlight.stats.map((s) => (
                  <li key={s.title}>
                    <span className={styles.statTitle}>{s.title}</span>
                    <span className={styles.statValue}>{s.value}</span>
                  </li>
                ))}
              </ul>
              <a className="arrowLink" href="#locators">
                Model detail
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
