import type { DealerConfig } from "@/lib/types";
import styles from "./LegalNotes.module.css";

/** WLTP / finance disclaimers keyed to the superscripts used above. */
export default function LegalNotes({ dealer }: { dealer: DealerConfig }) {
  return (
    <section className={styles.section} aria-label="Important information">
      <div className="widthHolder">
        <div className={`contentHolder ${styles.inner}`}>
          {dealer.legalNotes.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
