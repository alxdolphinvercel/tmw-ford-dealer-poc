import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import styles from "./Welcome.module.css";

/**
 * Local-SEO welcome block. Dark text panel overlapping a large image, matching
 * the benchmark's offset "split frame" treatment. The copy names the town and
 * its neighbours — the single highest-value per-dealer field for local search.
 */
export default function Welcome({ dealer }: { dealer: DealerConfig }) {
  const { welcome } = dealer;

  return (
    <section className={styles.section} aria-labelledby="welcome-heading">
      <div className="widthHolder">
        <div className={styles.grid}>
          <div className={styles.imageHolder}>
            <Image
              src={welcome.image}
              alt={welcome.imageAlt}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              quality={78}
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className={`${styles.panel} reveal`}>
            <h2
              id="welcome-heading"
              className={`display ${styles.heading}`}
              data-edit-path="welcome.heading"
            >
              {welcome.heading}
            </h2>
            <p data-edit-path="welcome.body">{welcome.body}</p>
            <a className="arrowLink whiteArrow" href="#contact">
              Find your nearest showroom
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
