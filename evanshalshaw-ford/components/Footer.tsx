import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import { FOOTER_LEGAL, FOOTER_CONTACT } from "@/lib/ford";
import styles from "./Footer.module.css";

/**
 * Footer. The legal column is OEM-governed (identical everywhere); quick links
 * and social channels vary per dealer, including how many there are.
 */
export default function Footer({ dealer }: { dealer: DealerConfig }) {
  const { brand, footer } = dealer;

  return (
    <footer className={styles.footer}>
      <div className="widthHolder">
        <div className={`contentHolder ${styles.inner}`}>
          <div className={styles.columns}>
            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Legal Information</h2>
              <ul className={styles.legalLinks}>
                {FOOTER_LEGAL.map((link) => (
                  <li key={link}>
                    <a href="#top">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Contact</h2>
              <ul className={styles.links}>
                {FOOTER_CONTACT.map((link) => (
                  <li key={link}>
                    <a href="#contact">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.block}>
              <h2 className={styles.blockTitle}>Quick links</h2>
              <ul className={styles.links}>
                {footer.quickLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>

              <h2 className={`${styles.blockTitle} ${styles.spaced}`}>Follow us</h2>
              <ul className={styles.social}>
                {footer.social.map((channel) => (
                  <li key={channel}>
                    <a href="#top">{channel}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.finisher}>
            <span className={styles.oval}>
              <Image
                src="/assets/ford/ford-oval.svg"
                alt="Ford"
                width={68}
                height={26}
              />
            </span>
            <p>
              &copy; {brand.name} 2026. {brand.shortName} is an appointed
              representative for insurance and a credit broker, not a lender.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
