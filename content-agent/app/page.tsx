import { getAll } from "@vercel/edge-config";
import { TARGETS, entryFor, type Layer } from "@/lib/targets";
import Editor from "./editor";

/* Always read the latest published content when the editor loads. */
export const dynamic = "force-dynamic";

export interface EditorField {
  path: string;
  label: string;
  layer: Layer;
  value: string;
}

export interface EditorTarget {
  id: string;
  name: string;
  previewUrl?: string;
  fields: EditorField[];
}


/** Segment-wise path order: numeric segments numerically, named siblings in
    on-page order (label → phone → hours; day → time). */
const SEGMENT_RANK: Record<string, number> = { label: 0, phone: 1, hours: 2, day: 0, time: 1 };

function comparePaths(a: string, b: string): number {
  const as = a.split(".");
  const bs = b.split(".");
  for (let i = 0; i < Math.min(as.length, bs.length); i++) {
    if (as[i] === bs[i]) continue;
    if (/^\d+$/.test(as[i]) && /^\d+$/.test(bs[i])) return Number(as[i]) - Number(bs[i]);
    const ra = SEGMENT_RANK[as[i]];
    const rb = SEGMENT_RANK[bs[i]];
    if (ra !== undefined && rb !== undefined) return ra - rb;
    return as[i].localeCompare(bs[i]);
  }
  return as.length - bs.length;
}

export default async function Page() {
  if (!process.env.EDGE_CONFIG) {
    return (
      <Notice>
        The <code>EDGE_CONFIG</code> connection string is not set for this
        project. Connect the shared Edge Config store, then reload.
      </Notice>
    );
  }

  const items = await getAll(TARGETS.map((t) => t.id));

  const targets: EditorTarget[] = [];
  const missing: string[] = [];

  for (const target of TARGETS) {
    const item = items?.[target.id];
    if (!item || typeof item !== "object") {
      missing.push(target.id);
      continue;
    }

    /* Allowlist order first (so the form reads like the page). The four
       department entries share one slot so each department's fields stay
       together, ordered name → phone → hours with day/time pairs adjacent. */
    const departmentSlot = target.paths.findIndex((p) =>
      p.path.startsWith("location.departments.")
    );
    const fields = Object.entries(item as Record<string, unknown>)
      .flatMap(([path, value]) => {
        const entry = entryFor(target, path);
        if (!entry || typeof value !== "string") return [];
        const slot = entry.path.startsWith("location.departments.")
          ? departmentSlot
          : target.paths.indexOf(entry);
        return [{ slot, field: { path, label: entry.label, layer: entry.layer, value } }];
      })
      .sort((a, b) => a.slot - b.slot || comparePaths(a.field.path, b.field.path))
      .map(({ field }) => field);

    targets.push({
      id: target.id,
      name: target.name,
      previewUrl: target.previewUrl,
      fields,
    });
  }

  if (missing.length > 0) {
    return (
      <Notice>
        Edge Config has no content for: <code>{missing.join(", ")}</code>. Seed
        it from the repo — <code>cd content-agent && npx tsx scripts/seed.ts</code>{" "}
        — then reload.
      </Notice>
    );
  }

  return <Editor targets={targets} />;
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: "40rem", margin: "6rem auto", padding: "0 1.5rem" }}>
      <h1 style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>
        Ford Dealer Content Editor
      </h1>
      <p style={{ color: "var(--ink-2)" }}>{children}</p>
    </main>
  );
}
