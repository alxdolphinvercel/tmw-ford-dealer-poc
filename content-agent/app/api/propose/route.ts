import { generateObject } from "ai";
import { z } from "zod";
import { getTarget, isAllowed } from "@/lib/targets";
import { readPath, applyEdits, type Edit } from "@/lib/edit";
import { readFile, openPullRequest, getPreviews } from "@/lib/github";

export const maxDuration = 300;

/**
 * The agent.
 *
 * Streams one JSON event per line so the operator watches the work happen
 * rather than a spinner: read → propose → validate → commit → preview.
 *
 * The model returns field paths and replacement text, never TypeScript, and
 * every path is checked against the target's allowlist before anything is
 * written.
 */

const ProposalSchema = z.object({
  summary: z
    .string()
    .describe("One sentence describing the change, for the PR title."),
  edits: z
    .array(
      z.object({
        path: z.string().describe("Exact field path from the allowed list."),
        value: z.string().describe("The new text for that field."),
        reason: z.string().describe("Why this edit satisfies the instruction."),
      })
    )
    .describe("Only fields that genuinely need to change."),
  refusal: z
    .string()
    .nullable()
    .describe(
      "If the instruction cannot be satisfied with the allowed fields, explain why here and return no edits."
    ),
});

export async function POST(request: Request) {
  const { target: targetId, instruction } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) =>
        controller.enqueue(
          new TextEncoder().encode(JSON.stringify(event) + "\n")
        );

      try {
        const target = getTarget(targetId);
        if (!target) throw new Error(`Unknown target "${targetId}".`);
        if (!instruction?.trim()) throw new Error("No instruction given.");

        // 1. Read the source of truth from GitHub.
        send({ step: "reading", message: `Reading ${target.files[0]}` });
        const source = await readFile(target.files[0]);

        // 2. Show the model only the fields it is allowed to change.
        const current = target.paths.flatMap((entry) => {
          if (entry.path.includes("N")) {
            // Expand indexed paths against what actually exists.
            const found: { path: string; label: string; value: string }[] = [];
            for (let i = 0; i < 12; i++) {
              for (let j = 0; j < 12; j++) {
                const path = entry.path.replace("N", String(i)).replace("N", String(j));
                if (path.includes("N")) continue;
                const value = readPath(source, path);
                if (value !== null) found.push({ path, label: entry.label, value });
              }
            }
            return found;
          }
          const value = readPath(source, entry.path);
          return value === null ? [] : [{ path: entry.path, label: entry.label, value }];
        });

        send({
          step: "proposing",
          message: `Considering ${current.length} editable fields`,
        });

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
            ...current.map((f) => `${f.path} — ${f.label} — ${JSON.stringify(f.value)}`),
            "",
            `Instruction: ${instruction}`,
          ].join("\n"),
        });

        if (proposal.refusal || proposal.edits.length === 0) {
          send({
            step: "refused",
            message:
              proposal.refusal ??
              "The agent found no field it could change for that instruction.",
          });
          controller.close();
          return;
        }

        // 3. Enforce the allowlist, then apply edits to every mirrored file.
        send({ step: "validating", message: `Checking ${proposal.edits.length} proposed edit(s)` });

        for (const edit of proposal.edits) {
          if (!isAllowed(target, edit.path)) {
            send({
              step: "refused",
              message: `Refused: "${edit.path}" is not an editable content field. Structure, navigation and legal text are governed centrally.`,
            });
            controller.close();
            return;
          }
        }

        const edits: Edit[] = proposal.edits.map(({ path, value }) => ({ path, value }));
        const changes = [];
        let applied: { path: string; value: string; before: string }[] = [];

        for (const file of target.files) {
          const fileSource = file === target.files[0] ? source : await readFile(file);
          const result = applyEdits(fileSource, edits);
          changes.push({ path: file, content: result.source });
          if (file === target.files[0]) applied = result.applied;
        }

        send({
          step: "diff",
          message: `Validated. Writing ${changes.length} file(s).`,
          edits: applied.map((a, i) => ({
            path: a.path,
            before: a.before,
            after: a.value,
            reason: proposal.edits[i]?.reason ?? "",
          })),
        });

        // 4. One commit, one PR.
        const branch = `agent/${targetId}-${Date.now().toString(36)}`;
        send({ step: "committing", message: `Opening pull request on ${branch}` });

        const pr = await openPullRequest({
          branch,
          title: proposal.summary,
          body: [
            `**Requested:** ${instruction}`,
            "",
            "**Changes proposed by the Ford Dealer Content Agent:**",
            "",
            ...applied.map(
              (a, i) =>
                `- \`${a.path}\`\n  - before: ${a.before}\n  - after: ${a.value}\n  - why: ${proposal.edits[i]?.reason ?? ""}`
            ),
            "",
            `Files updated: ${target.files.map((f) => `\`${f}\``).join(", ")}`,
            "",
            "_Generated content. Review copy for factual and regulatory accuracy before merging._",
          ].join("\n"),
          changes,
        });

        send({ step: "pr", message: `Pull request #${pr.number} opened`, pr });

        // 5. Wait for Vercel to build the preview(s).
        send({ step: "previewing", message: "Waiting for Vercel preview build" });
        const expected = targetId === "national" ? 5 : 1;
        let previews: Awaited<ReturnType<typeof getPreviews>> = [];

        for (let attempt = 0; attempt < 40; attempt++) {
          await new Promise((r) => setTimeout(r, 5000));
          previews = await getPreviews(branch);
          const ready = previews.filter((p) => p.state === "success");
          send({
            step: "previewing",
            message: `${ready.length}/${expected} preview(s) ready`,
            previews,
          });
          if (ready.length >= expected) break;
        }

        send({ step: "done", message: "Done", pr, previews });
      } catch (error) {
        send({
          step: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
