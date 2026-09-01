"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./EditOverlay.module.css";

/**
 * Inline edit mode. Mounted by app/page.tsx only after the server has
 * verified the signed edit-session cookie, so normal visitors never load
 * this chunk.
 *
 * Elements opt in via data attributes rendered by the components:
 *   data-edit-path    — editable host; its text content IS the value
 *   data-edit-mirror  — display-only duplicate, kept in sync, never editable
 *   data-edit-disable — interactive element neutralised while editing
 *
 * Free-text fields become contentEditable in place. Format-sensitive fields
 * (phones, hours, address) open a small popover instead, and the brand
 * palette is edited from the Theme panel. All previews are direct DOM
 * mutations — derived strings (tel: links, JSON-LD, meta tags) update on
 * publish, not live.
 */

const COOKIE_EXIT_URL = "/api/edit?exit=1";
const STORAGE_TTL_MS = 24 * 60 * 60 * 1000;

/** Popover (rather than contentEditable) fields — format-sensitive. */
function isPopoverPath(path: string): boolean {
  return (
    path === "location.phone" ||
    /^location\.departments\.\d+\.phone$/.test(path) ||
    /^location\.departments\.\d+\.hours\.\d+\.(day|time)$/.test(path) ||
    path.startsWith("location.address.")
  );
}

const LABELS: [RegExp, string][] = [
  [/^location\.phone$/, "Main phone number"],
  [/^location\.departments\.\d+\.phone$/, "Department phone"],
  [/^location\.departments\.\d+\.hours\.\d+\.day$/, "Opening hours — day"],
  [/^location\.departments\.\d+\.hours\.\d+\.time$/, "Opening hours — time"],
  [/^location\.address\.name$/, "Site name"],
  [/^location\.address\.street$/, "Street"],
  [/^location\.address\.locality$/, "Town"],
  [/^location\.address\.region$/, "County"],
  [/^location\.address\.postcode$/, "Postcode"],
];

function labelFor(path: string): string {
  return LABELS.find(([re]) => re.test(path))?.[1] ?? path;
}

function hintFor(path: string): string | null {
  if (/\.hours\.\d+\.time$/.test(path)) {
    return "Keep the format 08:30 – 18:00 (or Closed) — it feeds the opening-hours data search engines read.";
  }
  if (path.endsWith("phone")) {
    return "The click-to-call link updates when you publish.";
  }
  return null;
}

const BRAND_VARS: Record<string, string> = {
  "brand.accent": "--accent",
  "brand.accentDark": "--accent-dark",
  "brand.navy": "--navy",
};

const HEX = /^#[0-9a-fA-F]{6}$/;

type Drafts = Record<string, string>;

interface Popover {
  path: string;
  rect: { top: number; left: number; bottom: number; width: number };
  value: string;
}

export default function EditOverlay({
  dealerId,
  dealerName,
  exp,
}: {
  dealerId: string;
  dealerName: string;
  exp: number;
}) {
  const storageKey = `ford-edit-drafts:${dealerId}`;

  const [drafts, setDrafts] = useState<Drafts>({});
  const draftsRef = useRef<Drafts>({});
  const originalsRef = useRef<Drafts>({});

  const [popover, setPopover] = useState<Popover | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [expired, setExpired] = useState(false);

  /* ---- DOM helpers ------------------------------------------------------ */

  const brandRoot = useCallback(
    (): HTMLElement | null => document.querySelector("[data-edit-brand-root]"),
    []
  );

  const applyToDom = useCallback(
    (path: string, value: string, skip?: Element | null) => {
      if (BRAND_VARS[path]) {
        brandRoot()?.style.setProperty(BRAND_VARS[path], value);
        return;
      }
      document
        .querySelectorAll(`[data-edit-path="${path}"], [data-edit-mirror="${path}"]`)
        .forEach((el) => {
          if (el !== skip) el.textContent = value;
        });
    },
    [brandRoot]
  );

  const markDirty = useCallback((path: string, dirty: boolean) => {
    document.querySelectorAll(`[data-edit-path="${path}"]`).forEach((el) => {
      if (dirty) el.setAttribute("data-edit-dirty", "true");
      else el.removeAttribute("data-edit-dirty");
    });
  }, []);

  const currentValue = useCallback((path: string): string => {
    if (path in draftsRef.current) return draftsRef.current[path];
    if (path in originalsRef.current) return originalsRef.current[path];
    return (
      document.querySelector(`[data-edit-path="${path}"]`)?.textContent ?? ""
    );
  }, []);

  /* ---- Draft state ------------------------------------------------------ */

  const setDraft = useCallback(
    (path: string, value: string, skip?: Element | null) => {
      const next = { ...draftsRef.current };
      if (value === originalsRef.current[path]) delete next[path];
      else next[path] = value;
      draftsRef.current = next;
      setDrafts(next);
      markDirty(path, path in next);
      applyToDom(path, value, skip);
      setStatus(null);
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ savedAt: Date.now(), drafts: next })
        );
      } catch {
        /* private mode etc. — beforeunload warning still covers us */
      }
    },
    [applyToDom, markDirty, storageKey]
  );

  const clearDrafts = useCallback(() => {
    draftsRef.current = {};
    setDrafts({});
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  /* ---- Mount: arm the page ---------------------------------------------- */

  useEffect(() => {
    document.documentElement.classList.add("ford-edit-mode");

    /* Record originals + make free-text hosts editable. */
    document.querySelectorAll<HTMLElement>("[data-edit-path]").forEach((el) => {
      const path = el.getAttribute("data-edit-path")!;
      if (!(path in originalsRef.current)) {
        originalsRef.current[path] = el.textContent ?? "";
      }
      if (!isPopoverPath(path)) {
        try {
          el.contentEditable = "plaintext-only";
        } catch {
          el.contentEditable = "true";
        }
        el.spellcheck = false;
      }
    });
    const root = brandRoot();
    if (root) {
      const style = getComputedStyle(root);
      for (const [path, cssVar] of Object.entries(BRAND_VARS)) {
        originalsRef.current[path] = style.getPropertyValue(cssVar).trim();
      }
    }

    /* Restore drafts from a previous session. */
    let restoredCount = 0;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const { savedAt, drafts: stored } = JSON.parse(raw);
        if (
          typeof savedAt === "number" &&
          Date.now() - savedAt < STORAGE_TTL_MS &&
          stored &&
          typeof stored === "object"
        ) {
          const next: Drafts = {};
          for (const [path, value] of Object.entries(stored)) {
            if (typeof value !== "string") continue;
            if (value === originalsRef.current[path]) continue;
            next[path] = value;
            applyToDom(path, value);
            markDirty(path, true);
          }
          draftsRef.current = next;
          setDrafts(next);
          restoredCount = Object.keys(next).length;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {}
    if (restoredCount > 0) {
      setStatus({ ok: true, text: "Welcome back — your unsaved changes are still here." });
    }

    /* Event delegation. */
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-edit-disable]")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const host = t.closest<HTMLElement>("[data-edit-path]");
      if (!host) return;
      const path = host.getAttribute("data-edit-path")!;
      if (isPopoverPath(path)) {
        e.preventDefault();
        e.stopPropagation();
        const r = host.getBoundingClientRect();
        setPopover({
          path,
          rect: { top: r.top, left: r.left, bottom: r.bottom, width: r.width },
          value:
            path in draftsRef.current
              ? draftsRef.current[path]
              : (host.textContent ?? ""),
        });
        return;
      }
      /* Inline-editable inside a link/button: edit, don't navigate. */
      if (host.closest("a, button")) e.preventDefault();
    };

    const onInput = (e: Event) => {
      const host = (e.target as HTMLElement)?.closest?.<HTMLElement>(
        "[data-edit-path]"
      );
      if (!host || !host.isContentEditable) return;
      const path = host.getAttribute("data-edit-path")!;
      setDraft(path, host.textContent ?? "", host);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const host = (e.target as HTMLElement)?.closest?.<HTMLElement>(
        "[data-edit-path]"
      );
      if (host?.isContentEditable) {
        e.preventDefault();
        host.blur();
      }
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(draftsRef.current).length > 0) e.preventDefault();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.documentElement.classList.remove("ford-edit-mode");
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.querySelectorAll<HTMLElement>("[data-edit-path]").forEach((el) => {
        el.removeAttribute("contenteditable");
      });
    };
  }, [applyToDom, brandRoot, markDirty, setDraft, storageKey]);

  /* ---- Session expiry (checked quietly — no countdown in the UI) -------- */

  useEffect(() => {
    const timer = setInterval(() => {
      if (exp * 1000 < Date.now()) setExpired(true);
    }, 5000);
    return () => clearInterval(timer);
  }, [exp]);

  /* ---- Publish ----------------------------------------------------------- */

  async function publish() {
    setPublishing(true);
    setStatus(null);
    try {
      const edits = Object.entries(draftsRef.current).map(([path, value]) => ({
        path,
        value,
      }));
      const res = await fetch("/api/edit/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setExpired(true);
        return;
      }

      const results: { ok: boolean; paths: string[]; error?: string }[] =
        body?.results ?? [];
      if (results.length > 0) {
        /* Keep only edits whose target failed. */
        const next: Drafts = {};
        for (const r of results.filter((r) => !r.ok)) {
          for (const p of r.paths) {
            if (p in draftsRef.current) next[p] = draftsRef.current[p];
          }
        }
        for (const r of results.filter((r) => r.ok)) {
          for (const p of r.paths) markDirty(p, false);
        }
        draftsRef.current = next;
        setDrafts(next);
        try {
          if (Object.keys(next).length === 0) localStorage.removeItem(storageKey);
          else
            localStorage.setItem(
              storageKey,
              JSON.stringify({ savedAt: Date.now(), drafts: next })
            );
        } catch {}
      }

      if (body?.ok) {
        setStatus({
          ok: true,
          text: `Published — your change${body.published === 1 ? " is" : "s are"} live on the site.`,
        });
      } else {
        const detail = results.find((r) => !r.ok)?.error ?? body?.error;
        console.error("Publish failed:", detail);
        setStatus({
          ok: false,
          text: "Couldn't publish just now — nothing was lost. Please try again.",
        });
      }
    } catch (error) {
      console.error("Publish failed:", error);
      setStatus({
        ok: false,
        text: "Couldn't publish just now — nothing was lost. Please try again.",
      });
    } finally {
      setPublishing(false);
    }
  }

  function discard() {
    if (!confirm("Undo all your changes and put everything back how it was?")) return;
    clearDrafts();
    location.reload();
  }

  function exitEditMode(e: React.MouseEvent) {
    if (
      Object.keys(draftsRef.current).length > 0 &&
      !confirm(
        "You have changes that aren't published yet. They'll be kept for next time. Finish editing?"
      )
    ) {
      e.preventDefault();
    }
  }

  /* ---- Render ------------------------------------------------------------ */

  const dirtyCount = Object.keys(drafts).length;

  return (
    <>
      {/* Attribute-selector affordances can't live in a CSS module. */}
      <style>{`
        html.ford-edit-mode body { padding-bottom: 84px; }
        html.ford-edit-mode [data-edit-path] {
          outline: 1.5px dashed rgba(255, 176, 32, 0.75);
          outline-offset: 3px;
          border-radius: 2px;
          transition: outline-color 0.15s;
          min-width: 1ch;
        }
        html.ford-edit-mode [data-edit-path]:hover {
          outline-style: solid;
          outline-color: rgba(255, 176, 32, 1);
        }
        html.ford-edit-mode [data-edit-path][contenteditable] { cursor: text; }
        html.ford-edit-mode [data-edit-path]:not([contenteditable]) { cursor: pointer; }
        html.ford-edit-mode [data-edit-path]:focus {
          outline: 2px solid rgba(255, 176, 32, 1);
        }
        html.ford-edit-mode [data-edit-path][data-edit-dirty] {
          outline-color: rgba(74, 222, 128, 0.9);
        }
        html.ford-edit-mode [data-edit-disable] {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>

      {popover && (
        <FieldPopover
          key={popover.path}
          popover={popover}
          onApply={(value) => {
            setDraft(popover.path, value);
            setPopover(null);
          }}
          onCancel={() => setPopover(null)}
        />
      )}

      {themeOpen && (
        <ThemePopover
          currentValue={currentValue}
          onChange={(path, value) => setDraft(path, value)}
          onClose={() => setThemeOpen(false)}
        />
      )}

      <div className={styles.bar} role="region" aria-label="Inline editor">
        <div className={styles.barLeft}>
          <span className={styles.badge}>Editing</span>
          <span className={styles.dealer}>{dealerName}</span>
        </div>

        {expired ? (
          <p className={styles.statusError}>
            Your editing session has ended — your changes are safe. Reopen this
            site from the Content Editor to keep going.
          </p>
        ) : (
          status && (
            <p className={status.ok ? styles.statusOk : styles.statusError}>
              {status.text}
            </p>
          )
        )}

        <div className={styles.barRight}>
          <button
            type="button"
            className={styles.themeBtn}
            onClick={() => setThemeOpen((v) => !v)}
          >
            Theme
          </button>
          <span className={styles.count}>
            {dirtyCount === 0
              ? "Click any outlined text to edit it"
              : `${dirtyCount} change${dirtyCount === 1 ? "" : "s"} ready to publish`}
          </span>
          <button
            type="button"
            className={styles.discard}
            onClick={discard}
            disabled={dirtyCount === 0 || publishing}
          >
            Undo all
          </button>
          <button
            type="button"
            className={styles.publish}
            onClick={publish}
            disabled={dirtyCount === 0 || publishing || expired}
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
          <a className={styles.exit} href={COOKIE_EXIT_URL} onClick={exitEditMode}>
            Finish
          </a>
        </div>
      </div>
    </>
  );
}

/* ---- Popovers ------------------------------------------------------------ */

function FieldPopover({
  popover,
  onApply,
  onCancel,
}: {
  popover: Popover;
  onApply: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(popover.value);
  const hint = hintFor(popover.path);

  /* Clamp within the viewport; prefer below the element. */
  const top = Math.min(popover.rect.bottom + 8, window.innerHeight - 180);
  const left = Math.min(Math.max(8, popover.rect.left), window.innerWidth - 328);

  return (
    <div className={styles.popover} style={{ top, left }} role="dialog">
      <label className={styles.popoverLabel}>
        {labelFor(popover.path)}
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply(value);
            if (e.key === "Escape") onCancel();
          }}
        />
      </label>
      {hint && <p className={styles.popoverHint}>{hint}</p>}
      <div className={styles.popoverActions}>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={styles.apply} onClick={() => onApply(value)}>
          Apply
        </button>
      </div>
    </div>
  );
}

function ThemePopover({
  currentValue,
  onChange,
  onClose,
}: {
  currentValue: (path: string) => string;
  onChange: (path: string, value: string) => void;
  onClose: () => void;
}) {
  const fields: { path: string; label: string }[] = [
    { path: "brand.accent", label: "Accent colour" },
    { path: "brand.accentDark", label: "Accent colour (dark)" },
    { path: "brand.navy", label: "Dark band colour" },
  ];

  return (
    <div className={`${styles.popover} ${styles.themePopover}`} role="dialog">
      <p className={styles.popoverTitle}>Dealer palette</p>
      {fields.map(({ path, label }) => {
        const value = currentValue(path);
        return (
          <label key={path} className={styles.swatchRow}>
            <input
              type="color"
              value={HEX.test(value) ? value.toLowerCase() : "#000000"}
              onChange={(e) => onChange(path, e.target.value)}
            />
            {label}
            <code>{value}</code>
          </label>
        );
      })}
      <div className={styles.popoverActions}>
        <button type="button" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
