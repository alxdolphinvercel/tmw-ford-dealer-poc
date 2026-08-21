"use client";

import { useRef, useState } from "react";
import styles from "./page.module.css";

interface DiffEntry {
  path: string;
  before: string;
  after: string;
  reason: string;
}
interface Preview {
  project: string;
  url: string;
  state: string;
}
interface Event {
  step: string;
  message: string;
  edits?: DiffEntry[];
  pr?: { number: number; url: string };
  previews?: Preview[];
}

const TARGETS = [
  { id: "hendy-ford", name: "Hendy Ford" },
  { id: "lookers-ford", name: "Lookers Ford" },
  { id: "evanshalshaw-ford", name: "Evans Halshaw Ford" },
  { id: "allen-motor-group-ford", name: "Allen Motor Group Ford" },
  { id: "group1-ford", name: "Group 1 Ford" },
  { id: "national", name: "All five sites — Ford national content" },
];

const PRESETS = [
  {
    label: "Dealer edit",
    target: "hendy-ford",
    instruction:
      "Update Hendy's Saturday service hours to 08:30 – 13:00, and change the alert bar to promote the September plate event.",
  },
  {
    label: "National edit — all five sites",
    target: "national",
    instruction:
      "The Ford Power Promise deadline has moved to 31 December 2026. Update the Power Promise copy accordingly.",
  },
];

export default function Page() {
  const [target, setTarget] = useState("hendy-ford");
  const [instruction, setInstruction] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [running, setRunning] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  async function run(overrides?: { target: string; instruction: string }) {
    const body = overrides ?? { target, instruction };
    if (!body.instruction.trim() || running) return;
    if (overrides) {
      setTarget(overrides.target);
      setInstruction(overrides.instruction);
    }

    setRunning(true);
    setEvents([]);

    try {
      const res = await fetch("/api/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.body) throw new Error("No response stream.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as Event;
          setEvents((prev) => {
            // Preview polling updates in place rather than spamming the log.
            if (
              event.step === "previewing" &&
              prev.at(-1)?.step === "previewing"
            ) {
              return [...prev.slice(0, -1), event];
            }
            return [...prev, event];
          });
          requestAnimationFrame(() => {
            logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
          });
        }
      }
    } catch (error) {
      setEvents((prev) => [
        ...prev,
        { step: "error", message: error instanceof Error ? error.message : String(error) },
      ]);
    } finally {
      setRunning(false);
    }
  }

  const final = events.at(-1);
  const diff = events.find((e) => e.step === "diff")?.edits ?? [];
  const pr = events.find((e) => e.pr)?.pr;
  const previews = [...events].reverse().find((e) => e.previews?.length)?.previews ?? [];
  const refused = events.find((e) => e.step === "refused");
  const errored = events.find((e) => e.step === "error");

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.oval} aria-hidden="true">
            <svg viewBox="0 0 100 38" width="52" height="20">
              <ellipse cx="50" cy="19" rx="49" ry="18" fill="#fff" />
              <text
                x="50"
                y="26"
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontStyle="italic"
                fontSize="18"
                fill="var(--ford-blue)"
              >
                Ford
              </text>
            </svg>
          </span>
          <div>
            <h1 className={styles.title}>Dealer Content Agent</h1>
            <p className={styles.subtitle}>
              Natural-language content updates, applied as reviewable pull requests
            </p>
          </div>
        </div>
        <span className={styles.tag}>Proof of concept</span>
      </header>

      <main className={styles.main}>
        <section className={styles.controls}>
          <label className={styles.field}>
            <span className={styles.label}>Target</span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={running}
              className={styles.select}
            >
              {TARGETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Instruction</span>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Update the alert bar to promote the September plate event"
              rows={3}
              disabled={running}
              className={styles.textarea}
            />
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => run()}
              disabled={running || !instruction.trim()}
              className={styles.primary}
            >
              {running ? "Working…" : "Propose change"}
            </button>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => run(preset)}
                disabled={running}
                className={styles.secondary}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <p className={styles.guardrail}>
            The agent may only change content fields — copy, hours, phone
            numbers, accreditations and theming. Page structure, navigation,
            legal text and Ford campaign wording outside these fields are
            governed centrally and cannot be edited here.
          </p>
        </section>

        <section className={styles.output}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Activity</h2>
            {running && <span className={styles.pulse}>running</span>}
          </div>

          <div className={styles.log} ref={logRef} aria-live="polite">
            {events.length === 0 && (
              <p className={styles.empty}>
                No run yet. Choose a target and describe the change.
              </p>
            )}
            {events.map((event, i) => (
              <div key={i} className={styles.logLine} data-step={event.step}>
                <span className={styles.stepName}>{event.step}</span>
                <span>{event.message}</span>
              </div>
            ))}
          </div>

          {(refused || errored) && (
            <div className={styles.notice} data-kind={errored ? "error" : "refused"}>
              <strong>{errored ? "Failed" : "Refused"}</strong>
              <p>{(errored ?? refused)?.message}</p>
            </div>
          )}

          {diff.length > 0 && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Proposed changes</h3>
              <ul className={styles.diffList}>
                {diff.map((entry) => (
                  <li key={entry.path} className={styles.diffItem}>
                    <code className={styles.path}>{entry.path}</code>
                    <div className={styles.before}>{entry.before}</div>
                    <div className={styles.after}>{entry.after}</div>
                    {entry.reason && <p className={styles.reason}>{entry.reason}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pr && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Review</h3>
              <a href={pr.url} target="_blank" rel="noreferrer" className={styles.prLink}>
                Pull request #{pr.number} on GitHub →
              </a>
              <p className={styles.reason}>
                Merge on GitHub to publish. Nothing reaches a live site until a
                person approves it.
              </p>
            </div>
          )}

          {previews.length > 0 && (
            <div className={styles.block}>
              <h3 className={styles.blockTitle}>
                Live previews ({previews.filter((p) => p.state === "success").length}/
                {previews.length} ready)
              </h3>
              <ul className={styles.previewList}>
                {previews.map((preview) => (
                  <li key={preview.project} className={styles.previewItem}>
                    <span className={styles.state} data-state={preview.state} />
                    <span className={styles.project}>{preview.project}</span>
                    {preview.state === "success" ? (
                      <a href={preview.url} target="_blank" rel="noreferrer">
                        Open preview →
                      </a>
                    ) : (
                      <span className={styles.building}>{preview.state}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        Generated content is not reviewed for factual or regulatory accuracy.
        Copy must be checked before merging — finance and offer terms are
        FCA-regulated.
      </footer>
    </div>
  );
}
