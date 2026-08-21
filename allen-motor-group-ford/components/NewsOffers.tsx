import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import styles from "./NewsOffers.module.css";

/**
 * NEWS & OFFERS — a two-panel row: a white quote panel from a named member of
 * dealer staff, and an image promo panel. Both are per-dealer Free content.
 */
export default function NewsOffers({ dealer }: { dealer: DealerConfig }) {
  const { quote, promo } = dealer.newsOffers;

  return (
    <section className="widthHolder sectionSpace" id="news">
      <div className="contentHolder">
        <h2 className={`display sectionTitle`}>News &amp; Offers</h2>

        <div className={styles.row}>
          <div className={`${styles.quotePanel} reveal`}>
            <span className={styles.avatar} aria-hidden="true">
              {quote.initials}
            </span>
            <h3 className={styles.quoteName}>{quote.name}</h3>
            <p className={styles.quoteRole}>{quote.role}</p>
            <blockquote className={styles.quoteText}>{quote.quote}</blockquote>
          </div>

          <div className={`panel panelTint ${styles.promoPanel} reveal`}>
            <div className="panelImage">
              <Image
                src={promo.image}
                alt={promo.imageAlt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                quality={78}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="panelBody">
              <span className="eyebrow">{promo.eyebrow}</span>
              <h3 className={styles.promoHeading}>{promo.heading}</h3>
              <p className={styles.promoBody}>{promo.body}</p>
              <a className="arrowLink whiteArrow" href={promo.href}>
                {promo.linkLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
