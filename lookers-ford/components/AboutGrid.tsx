import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import styles from "./AboutGrid.module.css";

/** Three-panel link grid: help, about-this-dealer (solid accent), recruitment. */
export default function AboutGrid({ dealer }: { dealer: DealerConfig }) {
  const { about, brand } = dealer;

  return (
    <section className="widthHolder sectionSpace altBg" id="about">
      <div className="contentHolder">
        <h2 className="display sectionTitle">About Us</h2>

        <div className={styles.row}>
          <div className={`panel panelTint ${styles.panel} reveal`}>
            <div className="panelImage">
              <Image
                src={about.helpImage}
                alt={`Speak to the team at ${brand.name}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                quality={78}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="panelBody">
              <h3 className={styles.heading}>
                Online or in person, we&rsquo;re here to help you.
              </h3>
              <div className={styles.links}>
                <a className="arrowLink whiteArrow" href="#contact">
                  Contact us
                </a>
                <a className="arrowLink whiteArrow" href="#contact">
                  Book an appointment
                </a>
              </div>
            </div>
          </div>

          <div className={`panel ${styles.panel} ${styles.solidPanel} reveal`}>
            <div className="panelBody">
              <h3 className={`display ${styles.solidHeading}`}>
                About {brand.shortName}.
              </h3>
              <div className={styles.links}>
                {about.links.map((link) => (
                  <a
                    key={link.label}
                    className="arrowLink whiteArrow"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={`panel panelTint ${styles.panel} reveal`}>
            <div className="panelImage">
              <Image
                src={about.recruitImage}
                alt={`Careers at ${brand.name}`}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                quality={78}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="panelBody">
              <h3 className={styles.heading}>
                Are you ready to join the winning team?
              </h3>
              <a className="arrowLink whiteArrow" href="#contact">
                Current vacancies
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
