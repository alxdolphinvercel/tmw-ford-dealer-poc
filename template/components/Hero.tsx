import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import styles from "./Hero.module.css";

/**
 * Hero + ratings bar.
 *
 * Full-bleed vehicle image behind a radial scrim, left-aligned copy, two CTAs,
 * with the trust bar anchored to the bottom edge (as on the benchmark).
 */
export default function Hero({ dealer }: { dealer: DealerConfig }) {
  const { hero, trust, brand } = dealer;

  return (
    <section className={styles.hero} id="top">
      <div className={styles.media} data-edit-path="hero.image" data-edit-image={hero.image}>
        <Image
          src={hero.image}
          alt={hero.imageAlt}
          fill
          priority
          sizes="100vw"
          quality={80}
          style={{ objectFit: "cover", objectPosition: "center 45%" }}
        />
        {/* Two-part scrim: a soft radial vignette keeps the vehicle readable,
            a left-to-right wash guarantees contrast under the headline. */}
        <div
          className={styles.scrim}
          style={{
            background: `radial-gradient(ellipse 90% 80% at ${
              hero.scrimFocus ?? "66%"
            } 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 100%),
              linear-gradient(100deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,.55) 42%, rgba(0,0,0,.12) 72%, rgba(0,0,0,.35) 100%)`,
          }}
        />
      </div>

      <div className={`widthHolder ${styles.contentWrap}`}>
        <div className={`contentHolder ${styles.content}`}>
          <h1 className={`display ${styles.headline}`} data-edit-path="hero.headline">
            {hero.headline}
          </h1>
          <p className={styles.strapline} data-edit-path="hero.strapline">
            {hero.strapline}
          </p>
          <div className={styles.buttons}>
            <a className="btn btnPrimary" href="#locators">
              Explore our range
            </a>
            <a className="btn btnSecondary" href="#contact">
              Contact us
            </a>
          </div>
        </div>
      </div>

      <div className={styles.ratingBar}>
        <div className="widthHolder">
          <div className={`contentHolder ${styles.ratingInner}`}>
            {trust.review ? (
              <div className={styles.rating}>
                <h2 className={styles.ratingTitle}>{trust.review.label}</h2>
                <div className={styles.stars} aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} index={i} fill={starFill(trust.review!.stars, i)} />
                  ))}
                </div>
                <span className={styles.score}>{trust.review.score}</span>
                <span className={styles.reviewDetail}>{trust.review.detail}</span>
              </div>
            ) : (
              <div className={styles.rating}>
                <h2 className={styles.ratingTitle}>Ford Authorised</h2>
                <span className={styles.reviewDetail}>
                  Official {brand.shortName} Ford sales &amp; service
                </span>
              </div>
            )}

            <ul className={styles.accreditations}>
              {trust.accreditations.map((a, i) => (
                <li key={i} data-edit-path={`trust.accreditations.${i}`}>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Returns 1 for a full star, 0.5 for a half, 0 for empty. */
function starFill(score: number, index: number): number {
  const remaining = score - index;
  if (remaining >= 1) return 1;
  if (remaining >= 0.5) return 0.5;
  return 0;
}

function Star({ fill, index }: { fill: number; index: number }) {
  const id = `star-half-${index}`;
  return (
    <svg viewBox="0 0 16 15" width="16" height="15" role="presentation">
      {fill === 0.5 && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="rgba(255,255,255,.28)" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M8 0l2.47 5.01L16 5.82l-4 3.9.94 5.5L8 12.62 3.06 15.2 4 9.72 0 5.82l5.53-.81z"
        fill={
          fill === 1
            ? "currentColor"
            : fill === 0.5
              ? `url(#${id})`
              : "rgba(255,255,255,.28)"
        }
      />
    </svg>
  );
}
