import { generateObject } from "ai";
import { z } from "zod";
import { getTarget, isAllowed, entryFor } from "@/lib/targets";
import { verifyEditToken } from "@/lib/edit-token";

export const maxDuration = 60;

/**
 * AI assist for both editors.
 *
 * Takes the marketer's plain-English instruction plus the current field
 * values (including unsaved ones), and returns proposed values for specific
 * fields. Nothing is published here — proposals are reviewed and published
 * by the marketer.
 *
 * Two callers, two gates (mirroring /api/publish): the form editor posts
 * same-origin with no Authorization header, gated by the team SSO in front
 * of this deployment; the dealer sites' inline-edit proxies post with a
 * Bearer edit token plus the SSO bypass header, gated by the HMAC check.
 *
 * A dealer-target request may include national campaign fields (the inline
 * overlay shows the whole page as one context); returned paths must be in
 * the dealer OR national allowlist AND among the fields the model was shown.
 * Publishing still routes each edit to its true target.
 */

const ProposalSchema = z.object({
  edits: z
    .array(
      z.object({
        path: z.string().describe("Exact field path from the listed fields."),
        value: z.string().describe("The new text for that field."),
        reason: z.string().describe("Why this edit satisfies the instruction."),
      })
    )
    .describe("Only fields that genuinely need to change."),
  refusal: z
    .string()
    .nullable()
    .describe(
      "If the instruction cannot be satisfied with the listed fields, explain why here and return no edits."
    ),
});

interface AssistBody {
  target?: string;
  instruction?: string;
  fields?: { path: string; label?: string; value: string }[];
}

export async function POST(request: Request) {
  const { target: targetId, instruction, fields }: AssistBody = await request.json();

  const target = getTarget(targetId ?? "");
  if (!target) {
    return Response.json({ error: `Unknown target "${targetId}".` }, { status: 400 });
  }

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const session = verifyEditToken(auth.slice(7), process.env.EDIT_SIGNING_SECRET ?? "");
    if (!session) {
      return Response.json(
        { error: "Invalid or expired edit session." },
        { status: 401 }
      );
    }
    if (session.dealerId !== target.id && target.id !== "national") {
      return Response.json(
        { error: "Edit session is not valid for this target." },
        { status: 403 }
      );
    }
  }

  if (!instruction?.trim()) {
    return Response.json({ error: "No instruction given." }, { status: 400 });
  }
  if (!Array.isArray(fields) || fields.length === 0) {
    return Response.json({ error: "No fields supplied." }, { status: 400 });
  }

  /* National campaign fields may ride along with a dealer target. */
  const national = target.id === "national" ? undefined : getTarget("national");
  const entryForUnion = (path: string) =>
    entryFor(target, path) ?? (national ? entryFor(national, path) : undefined);

  /* Labels come from the allowlist, not the caller. */
  const shown = fields.flatMap((f) => {
    const entry = entryForUnion(f.path);
    if (!entry || typeof f.value !== "string") return [];
    const isNational = !isAllowed(target, f.path);
    return [{ path: f.path, label: entry.label, value: f.value, isNational }];
  });
  if (shown.length === 0) {
    return Response.json({ error: "No editable fields supplied." }, { status: 400 });
  }
  const known = new Set(shown.map((f) => f.path));

  const { object: proposal } = await generateObject({
    model: "anthropic/claude-sonnet-4.6",
    schema: ProposalSchema,
    system: [
      "You edit content for Ford dealer websites.",
      "You may only change the fields listed. You cannot add fields, change page structure, navigation, legal text, or code.",
      "Fields marked NATIONAL are shared Ford campaign copy on all five dealer sites — only change them when the instruction is clearly about campaign copy, not this one dealer.",
      "Change as few fields as possible. Preserve each field's existing tone, length and punctuation style.",
      "Never invent prices, APR figures, dates or legal terms that the instruction did not supply.",
      "If the instruction cannot be carried out with these fields alone, set refusal and return no edits.",
    ].join(" "),
    prompt: [
      `Target: ${target.name}`,
      "",
      "Editable fields (path — label — current value):",
      ...shown.map(
        (f) =>
          `${f.path} — ${f.label}${f.isNational ? " — NATIONAL: applies to all five dealer sites" : ""} — ${JSON.stringify(f.value)}`
      ),
      "",
      `Instruction: ${instruction}`,
    ].join("\n"),
  });

  if (proposal.refusal || proposal.edits.length === 0) {
    return Response.json({
      edits: [],
      refusal:
        proposal.refusal ??
        "No listed field can be changed to satisfy that instruction.",
    });
  }

  for (const edit of proposal.edits) {
    if (!entryForUnion(edit.path) || !known.has(edit.path)) {
      return Response.json({
        edits: [],
        refusal: `Refused: "${edit.path}" is not an editable content field. Structure, navigation and legal text are governed centrally.`,
      });
    }
  }

  return Response.json({
    edits: proposal.edits.map((edit) => ({
      ...edit,
      label: entryForUnion(edit.path)?.label ?? edit.path,
    })),
    refusal: null,
  });
}
