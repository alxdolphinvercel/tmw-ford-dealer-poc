"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { DealerConfig } from "@/lib/types";
import { NAV } from "@/lib/ford";
import styles from "./Header.module.css";

/**
 * Alert strip + header + full-screen overlay nav, as one fixed stack.
 *
 * Mirrors the benchmark: no persistent horizontal nav at any breakpoint — a
 * hamburger opens a full-screen menu with one level of drill-down. The header
 * sits transparent over the hero and turns solid once scrolled; the alert strip
 * collapses at the same point so the header settles against the viewport top.
 */
export default function Header({ dealer }: { dealer: DealerConfig }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [alertClosed, setAlertClosed] = useState(false);
  const [drill, setDrill] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the overlay is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setDrill(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { brand, location, alert } = dealer;
  const active = NAV.find((n) => n.label === drill);
  const light = solid || open; // dark text on a white bar

  return (
    <>
      <div className={styles.stack}>
        {!alertClosed && (
          <div className={styles.alert} data-collapsed={solid && !open}>
            <div className="widthHolder">
              <div className={`contentHolder ${styles.alertInner}`}>
                <p>
                  <span data-edit-path="alert.text">{alert.text}</span>{" "}
                  <a href={alert.href} data-edit-path="alert.linkLabel">
                    {alert.linkLabel}
                  </a>
                </p>
                <button
                  type="button"
                  onClick={() => setAlertClosed(true)}
                  aria-label="Close announcement"
                  data-edit-disable
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <header className={`${styles.header} ${light ? styles.solid : ""}`}>
          <div className="widthHolder">
            <div className={`contentHolder ${styles.bar}`}>
              <button
                type="button"
                className={styles.menuButton}
                aria-expanded={open}
                aria-controls="menuOverlay"
                onClick={() => {
                  setOpen((v) => !v);
                  setDrill(null);
                }}
              >
                <span className={styles.menuIcon} data-open={open} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className={styles.menuLabel}>{open ? "Close" : "Menu"}</span>
              </button>

              <ul className={styles.coreLinks}>
                <li>
                  <a href="#contact">Book a test drive</a>
                </li>
                <li>
                  <a href="#contact">Book a service</a>
                </li>
                <li className={styles.call}>
                  <a
                    href={`tel:${location.phone.replace(/\s/g, "")}`}
                    aria-label={`Call us on ${location.phone}`}
                    data-edit-path="location.phone"
                  >
                    {location.phone}
                  </a>
                </li>
              </ul>

              <a className={styles.branchLogo} href="#top">
                <span className={styles.branchText}>
                  <span>{brand.lockup[0]}</span>
                  <span>{brand.lockup[1]}</span>
                </span>
                <span className={styles.oval}>
                  <Image
                    src={
                      light
                        ? "/assets/ford/ford-oval.svg"
                        : "/assets/ford/ford-oval-reversed.svg"
                    }
                    alt="Ford"
                    width={76}
                    height={28}
                    priority
                  />
                </span>
              </a>
            </div>
          </div>
        </header>
      </div>

      <nav
        id="menuOverlay"
        className={styles.overlay}
        data-open={open}
        aria-hidden={!open}
        aria-label="Main navigation"
      >
        <div className="widthHolder">
          <div className={`contentHolder ${styles.overlayInner}`}>
            {!active ? (
              <ul className={styles.mainLinks}>
                {NAV.map((item) => (
                  <li key={item.label}>
                    {item.children ? (
                      <button type="button" onClick={() => setDrill(item.label)}>
                        {item.label}
                        <span className={styles.chevron} aria-hidden="true" />
                      </button>
                    ) : (
                      <a href="#contact" onClick={() => setOpen(false)}>
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.subMenu}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setDrill(null)}
                >
                  <span className={styles.chevronBack} aria-hidden="true" />
                  Back
                </button>
                <p className={styles.menuTitle}>{active.label}</p>
                <ul className={styles.secondaryMenu}>
                  {active.children?.map((child) => (
                    <li key={child}>
                      <a href="#contact" onClick={() => setOpen(false)}>
                        {child}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ul className={styles.keyLinks}>
              <li>
                <a className="btn btnPrimary" href="#contact">
                  Book a test drive
                </a>
              </li>
              <li>
                <a className="btn btnSecondary" href="#contact">
                  Book a service
                </a>
              </li>
              <li>
                <a
                  className={styles.overlayPhone}
                  href={`tel:${location.phone.replace(/\s/g, "")}`}
                  data-edit-mirror="location.phone"
                >
                  {location.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
