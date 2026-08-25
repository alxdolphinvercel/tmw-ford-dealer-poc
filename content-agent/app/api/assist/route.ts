import { generateObject } from "ai";
import { z } from "zod";
import { getTarget, isAllowed } from "@/lib/targets";

export const maxDuration = 60;

/**
 * AI assist for the editor.
 *
 * Takes the marketer's plain-English instruction plus the form's current
 * field values (including unsaved ones), and returns proposed values for
 * specific fields. Nothing is published here — proposals land in the form,
 * highlighted, for the marketer to review and publish.
 *
 * The model returns field paths and replacement text, never code, and every
 * returned path must be in the allowlist AND among the fields it was shown.
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
  fields?: { path: string; label: string; value: string }[];
}

export async function POST(request: Request) {
  const { target: targetId, instruction, fields }: AssistBody = await request.json();

  const target = getTarget(targetId ?? "");
  if (!target) {
    return Response.json({ error: `Unknown target "${targetId}".` }, { status: 400 });
  }
  if (!instruction?.trim()) {
    return Response.json({ error: "No instruction given." }, { status: 400 });
  }
  if (!Array.isArray(fields) || fields.length === 0) {
    return Response.json({ error: "No fields supplied." }, { status: 400 });
  }

  const known = new Set(fields.map((f) => f.path));

  const { object: proposal } = await generateObject({
    model: "anthropic/claude-sonnet-4.6",
    schema: ProposalSchema,
    system: [
      "You edit content for Ford dealer websites.",
      "You may only change the fields listed. You cannot add fields, change page structure, navigation, legal text, or code.",
      "Change as few fields as possible. Preserve each field's existing tone, length and punctuation style.",
      "Never invent prices, APR figures, dates or legal terms that the instruction did not supply.",
      "If the instruction cannot be carried out with these fields alone, set refusal and return no edits.",
    ].join(" "),
    prompt: [
      `Target: ${target.name}`,
      "",
      "Editable fields (path — label — current value):",
      ...fields.map((f) => `${f.path} — ${f.label} — ${JSON.stringify(f.value)}`),
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
    if (!isAllowed(target, edit.path) || !known.has(edit.path)) {
      return Response.json({
        edits: [],
        refusal: `Refused: "${edit.path}" is not an editable content field. Structure, navigation and legal text are governed centrally.`,
      });
    }
  }

  return Response.json({ edits: proposal.edits, refusal: null });
}
