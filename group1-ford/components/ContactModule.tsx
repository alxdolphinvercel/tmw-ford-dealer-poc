"use client";

import { useState } from "react";
import type { DealerConfig } from "@/lib/types";
import styles from "./ContactModule.module.css";

/**
 * FIND US — tabbed department panels with address, hours and phone.
 * The department set varies per dealer (Sales/Service/Parts/Bodyshop/Corporate),
 * so the tab list is driven entirely by config.
 */
export default function ContactModule({ dealer }: { dealer: DealerConfig }) {
  const { location, brand } = dealer;
  const [active, setActive] = useState(location.departments[0]?.id);

  return (
    <section className="widthHolder sectionSpace" id="contact">
      <div className="contentHolder">
        <h2 className={`display ${styles.heading}`}>Find {brand.name}</h2>

        <div className={styles.tabs} role="tablist" aria-label="Departments">
          {location.departments.map((dept, i) => (
            <button
              key={dept.id}
              type="button"
              role="tab"
              id={`tab-${dept.id}`}
              aria-selected={dept.id === active}
              aria-controls={`panel-${dept.id}`}
              className={`${styles.tab} ${dept.id === active ? styles.tabActive : ""}`}
              onClick={() => setActive(dept.id)}
              data-edit-mirror={`location.departments.${i}.label`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Every department is rendered into the HTML and hidden with the
            `hidden` attribute rather than swapped in on click, so each
            department's phone, hours and address are all crawlable — the whole
            point of the programme is network-wide search performance. */}
        {location.departments.map((dept, i) => (
          <div
            key={dept.id}
            className={styles.box}
            role="tabpanel"
            id={`panel-${dept.id}`}
            aria-labelledby={`tab-${dept.id}`}
            hidden={dept.id !== active}
          >
            <div className={styles.col}>
              <h3 className={styles.colTitle}>Address</h3>
              <address className={styles.address}>
                {(
                  [
                    ["location.address.name", location.address.name],
                    ["location.address.street", location.address.street],
                    ["location.address.locality", location.address.locality],
                    ["location.address.region", location.address.region],
                    ["location.address.postcode", location.address.postcode],
                  ] as const
                )
                  .filter(([, line]) => Boolean(line))
                  .map(([path, line]) => (
                    <span key={path} data-edit-path={path}>
                      {line}
                    </span>
                  ))}
              </address>
            </div>

            <div className={styles.col}>
              <h3 className={styles.colTitle}>Opening Hours</h3>
              <ul className={styles.hours}>
                {dept.hours.map((h, j) => (
                  <li key={j}>
                    <span
                      className={styles.day}
                      data-edit-path={`location.departments.${i}.hours.${j}.day`}
                    >
                      {h.day}
                    </span>
                    <span
                      className={styles.time}
                      data-edit-path={`location.departments.${i}.hours.${j}.time`}
                    >
                      {h.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.col}>
              <h3 className={styles.colTitle}>
                <span data-edit-path={`location.departments.${i}.label`}>
                  {dept.label}
                </span>{" "}
                phone
              </h3>
              <a
                className={styles.phone}
                href={`tel:${dept.phone.replace(/\s/g, "")}`}
                data-edit-path={`location.departments.${i}.phone`}
              >
                {dept.phone}
              </a>

              <h3 className={`${styles.colTitle} ${styles.spaced}`}>Areas served</h3>
              <p className={styles.areas} data-edit-path="location.areasServed">
                {location.areasServed}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
