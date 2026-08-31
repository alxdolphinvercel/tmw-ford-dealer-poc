import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import { CAMPAIGN_ORDER } from "@/lib/content";
import styles from "./SplitBanners.module.css";

/**
 * The repeating editorial module — six alternating image/text splits carrying
 * the Ford national campaigns. On the benchmark these are CMS rich-text blocks;
 * here they come from config, which is the same separation of concerns.
 */
export default function SplitBanners({ dealer }: { dealer: DealerConfig }) {
  return (
    <div id="offers">
      {dealer.splitBanners.map((banner, i) => (
        <section
          key={i}
          className={`${styles.banner} ${i % 2 === 1 ? styles.alt : ""} ${
            i % 2 === 1 ? "altBg" : ""
          }`}
        >
          <div className="widthHolder">
            <div className={`contentHolder ${styles.inner}`}>
              <div className={`${styles.imageHolder} reveal`}>
                <Image
                  src={banner.image}
                  alt={banner.imageAlt}
                  width={800}
                  height={534}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={78}
                />
              </div>

              <div className={styles.text}>
                {banner.eyebrow && (
                  <span className={styles.eyebrowDark}>{banner.eyebrow}</span>
                )}
                {/* Campaign copy is national: edits address FORD_CAMPAIGNS
                    paths so a publish reaches all five sites at once. */}
                <h2
                  className={`display ${styles.heading}`}
                  data-edit-path={`FORD_CAMPAIGNS.${CAMPAIGN_ORDER[i]}.heading`}
                >
                  {banner.heading}
                </h2>
                {banner.body.map((para, j) => (
                  <p key={j} data-edit-path={`FORD_CAMPAIGNS.${CAMPAIGN_ORDER[i]}.body.${j}`}>
                    {para}
                  </p>
                ))}
                <div className={styles.links}>
                  {banner.links.map((link) => (
                    <a key={link.label} className="arrowLink" href={link.href}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
