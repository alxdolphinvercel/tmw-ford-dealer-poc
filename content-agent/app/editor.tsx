"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EditorField, EditorTarget } from "./page";
import styles from "./page.module.css";

/**
 * The marketer-facing editor: labelled fields on the left, the live site on
 * the right. Typing shows a draft in the preview via ?draft= (nobody else
 * sees it); Publish writes to Edge Config and is live on every visitor's
 * next request — no build, no deployment, no git.
 */

const LAYER_HEADINGS: Record<string, string> = {
  Free: "Free — dealer editorial",
  Flexible: "Flexible — dealer facts",
  Theming: "Theming — dealer palette",
  National: "National — Ford campaign copy (all five sites)",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

function base64url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

type ValueMap = Record<string, string>;

interface AssistEdit {
  path: string;
  value: string;
  reason: string;
}

export default function Editor({ targets }: { targets: EditorTarget[] }) {
  const dealers = targets.filter((t) => t.previewUrl);

  const [targetId, setTargetId] = useState(targets[0].id);
  const [previewDealerId, setPreviewDealerId] = useState(dealers[0].id);

  /* Per-target current form values and last-published values. */
  const initial = useMemo(() => {
    const map: Record<string, ValueMap> = {};
    for (const t of targets) {
      map[t.id] = Object.fromEntries(t.fields.map((f) => [f.path, f.value]));
    }
    return map;
  }, [targets]);

  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  /* path → why, for values the AI proposed and the marketer hasn't touched. */
  const [reasons, setReasons] = useState<Record<string, ValueMap>>({});

  const [instruction, setInstruction] = useState("");
  const [assisting, setAssisting] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const target = targets.find((t) => t.id === targetId)!;
  const current = values[targetId];
  const dirty = target.fields.filter((f) => current[f.path] !== saved[targetId][f.path]);

  /* ---- Preview -------------------------------------------------------- */

  const previewBase =
    target.previewUrl ?? dealers.find((d) => d.id === previewDealerId)!.previewUrl!;

  const draftedSrc = useMemo(() => {
    if (dirty.length === 0) return previewBase;
    const draft = Object.fromEntries(dirty.map((f) => [f.path, current[f.path]]));
    return `${previewBase}?draft=${base64url(JSON.stringify(draft))}`;
  }, [previewBase, current, dirty]);

  const [iframeSrc, setIframeSrc] = useState(draftedSrc);
  useEffect(() => {
    const timer = setTimeout(() => setIframeSrc(draftedSrc), 800);
    return () => clearTimeout(timer);
  }, [draftedSrc]);

  const reloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
    },
    []
  );

  /* ---- Editing -------------------------------------------------------- */

  function setField(path: string, value: string) {
    setValues((v) => ({ ...v, [targetId]: { ...v[targetId], [path]: value } }));
    setReasons((r) => {
      if (!r[targetId]?.[path]) return r;
      const { [path]: _dropped, ...rest } = r[targetId];
      return { ...r, [targetId]: rest };
    });
    setStatus(null);
  }

  function revert(path: string) {
    setField(path, saved[targetId][path]);
  }

  /* ---- AI assist ------------------------------------------------------ */

  async function assist() {
    setAssisting(true);
    setRefusal(null);
    setStatus(null);
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetId,
          instruction,
          fields: target.fields.map((f) => ({
            path: f.path,
            label: f.label,
            value: current[f.path],
          })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status}).`);
      if (body.refusal) {
        setRefusal(body.refusal);
        return;
      }
      const edits: AssistEdit[] = body.edits;
      setValues((v) => ({
        ...v,
        [targetId]: {
          ...v[targetId],
          ...Object.fromEntries(edits.map((e) => [e.path, e.value])),
        },
      }));
      setReasons((r) => ({
        ...r,
        [targetId]: {
          ...r[targetId],
          ...Object.fromEntries(edits.map((e) => [e.path, e.reason])),
        },
      }));
      setInstruction("");
    } catch (error) {
      setRefusal(error instanceof Error ? error.message : String(error));
    } finally {
      setAssisting(false);
    }
  }

  /* ---- Publish -------------------------------------------------------- */

  async function publish() {
    setPublishing(true);
    setStatus(null);
    try {
      const edits = dirty.map((f) => ({ path: f.path, value: current[f.path] }));
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetId, edits }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status}).`);

      setSaved((s) => ({ ...s, [targetId]: { ...values[targetId] } }));
      setReasons((r) => ({ ...r, [targetId]: {} }));
      setStatus({
        ok: true,
        text: `Published ${body.published} change${body.published === 1 ? "" : "s"} — live on every visitor's next request (allow ~10 s).`,
      });
      /* Give Edge Config a moment to propagate, then show the real thing. */
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(
        () => setIframeSrc(`${previewBase}?published=${Date.now()}`),
        6000
      );
    } catch (error) {
      setStatus({
        ok: false,
        text: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setPublishing(false);
    }
  }

  /* ---- Render --------------------------------------------------------- */

  const groups = Object.keys(LAYER_HEADINGS)
    .map((layer) => ({
      layer,
      heading: LAYER_HEADINGS[layer],
      fields: target.fields.filter((f) => f.layer === layer),
    }))
    .filter((g) => g.fields.length > 0);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>TMW · Accenture Song — proof of concept</p>
          <h1 className={styles.title}>Ford Dealer Content Editor</h1>
        </div>
        <div className={styles.controls}>
          <label className={styles.selectLabel}>
            Editing
            <select
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value);
                setRefusal(null);
                setStatus(null);
              }}
            >
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          {!target.previewUrl && (
            <label className={styles.selectLabel}>
              Preview on
              <select
                value={previewDealerId}
                onChange={(e) => setPreviewDealerId(e.target.value)}
              >
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      <div className={styles.panes}>
        <section className={styles.formPane} aria-label="Editable content">
          <div className={styles.assist}>
            <label className={styles.assistLabel} htmlFor="instruction">
              AI assist — describe a change in plain English
            </label>
            <div className={styles.assistRow}>
              <textarea
                id="instruction"
                rows={2}
                placeholder='e.g. "Saturday service hours are now 08:30 – 13:00"'
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
              />
              <button
                type="button"
                onClick={assist}
                disabled={assisting || !instruction.trim()}
              >
                {assisting ? "Thinking…" : "Suggest edits"}
              </button>
            </div>
            <p className={styles.assistHint}>
              Suggestions only fill in the form — nothing goes live until you
              publish. Structure, navigation and legal text cannot be changed.
            </p>
            {refusal && <p className={styles.refusal}>{refusal}</p>}
          </div>

          {groups.map((group) => (
            <fieldset key={group.layer} className={styles.group}>
              <legend>{group.heading}</legend>
              {group.fields.map((field) => (
                <Field
                  key={field.path}
                  field={field}
                  value={current[field.path]}
                  savedValue={saved[targetId][field.path]}
                  reason={reasons[targetId]?.[field.path]}
                  onChange={(v) => setField(field.path, v)}
                  onRevert={() => revert(field.path)}
                />
              ))}
            </fieldset>
          ))}

          <div className={styles.publishBar}>
            {status && (
              <p className={status.ok ? styles.statusOk : styles.statusError}>
                {status.text}
              </p>
            )}
            <div className={styles.publishRow}>
              <span className={styles.dirtyCount}>
                {dirty.length === 0
                  ? "No unpublished changes"
                  : `${dirty.length} unpublished change${dirty.length === 1 ? "" : "s"}`}
              </span>
              <button
                type="button"
                className={styles.publish}
                onClick={publish}
                disabled={publishing || dirty.length === 0}
              >
                {publishing
                  ? "Publishing…"
                  : `Publish${dirty.length > 0 ? ` ${dirty.length}` : ""}${target.previewUrl ? "" : " to all five sites"}`}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.previewPane} aria-label="Live preview">
          <div className={styles.previewChrome}>
            <span className={dirty.length > 0 ? styles.draftBadge : styles.liveBadge}>
              {dirty.length > 0 ? "Draft preview" : "Live site"}
            </span>
            <a href={iframeSrc} target="_blank" rel="noreferrer">
              Open in new tab ↗
            </a>
          </div>
          <iframe
            className={styles.preview}
            src={iframeSrc}
            title="Site preview"
          />
        </section>
      </div>

      <footer className={styles.footer}>
        Edits publish to Vercel Edge Config and appear on the live site within
        seconds — no deployment. Re-seeding from the repository resets all
        published content to the values in git.
      </footer>
    </div>
  );
}

function Field({
  field,
  value,
  savedValue,
  reason,
  onChange,
  onRevert,
}: {
  field: EditorField;
  value: string;
  savedValue: string;
  reason?: string;
  onChange: (value: string) => void;
  onRevert: () => void;
}) {
  const isDirty = value !== savedValue;
  const isColor = field.layer === "Theming";
  const isHours = field.path.includes(".hours.") && field.path.endsWith(".time");
  const long = savedValue.length > 80;
  const id = `field-${field.path.replaceAll(".", "-")}`;

  return (
    <div className={`${styles.field} ${reason ? styles.aiProposed : ""}`}>
      <div className={styles.fieldHead}>
        <label htmlFor={id}>{field.label}</label>
        {isDirty && (
          <span className={styles.fieldFlags}>
            <span className={styles.dirtyDot} aria-hidden />
            <button type="button" className={styles.revert} onClick={onRevert}>
              Revert
            </button>
          </span>
        )}
      </div>
      <div className={styles.inputRow}>
        {isColor && (
          <input
            type="color"
            aria-label={`${field.label} — colour picker`}
            value={HEX.test(value) ? value.toLowerCase() : "#000000"}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
        {long ? (
          <textarea
            id={id}
            rows={Math.min(6, Math.ceil(value.length / 70))}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
      {isHours && (
        <p className={styles.hint}>
          Keep the format <code>08:30 – 18:00</code> (or <code>Closed</code>) —
          it feeds the opening-hours data search engines read.
        </p>
      )}
      {reason && <p className={styles.reason}>AI suggestion: {reason}</p>}
    </div>
  );
}
