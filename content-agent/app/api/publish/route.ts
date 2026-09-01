import { getTarget, isAllowed, entryFor } from "@/lib/targets";
import { readItem, writeItems } from "@/lib/store";
import { verifyEditToken } from "@/lib/edit-token";
import { IMAGE_SRCS } from "@/lib/image-library";

/**
 * Publishes edits to Edge Config. Live on all visitors' next request —
 * no build, no deployment.
 *
 * Every path is validated against the target's allowlist regardless of where
 * the request came from (form, AI assist, or a hand-crafted POST); one bad
 * path rejects the whole batch.
 *
 * Two callers, two gates: the form editor posts same-origin with no
 * Authorization header and is gated by the team SSO in front of this
 * deployment; the dealer sites' inline-edit proxies post with a Bearer edit
 * token (plus the SSO bypass header) and are gated by the HMAC check below.
 */

interface PublishBody {
  target?: string;
  edits?: { path: string; value: string }[];
}

export async function POST(request: Request) {
  const { target: targetId, edits }: PublishBody = await request.json();

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
    /* A dealer token may publish its own item or the shared national copy —
       the latter is a POC simplification; a scope claim would tighten it. */
    if (session.dealerId !== target.id && target.id !== "national") {
      return Response.json(
        { error: "Edit session is not valid for this target." },
        { status: 403 }
      );
    }
  }
  if (!Array.isArray(edits) || edits.length === 0) {
    return Response.json({ error: "No edits to publish." }, { status: 400 });
  }

  for (const edit of edits) {
    if (
      typeof edit?.path !== "string" ||
      typeof edit?.value !== "string" ||
      !isAllowed(target, edit.path)
    ) {
      return Response.json(
        {
          error: `"${edit?.path}" is not an editable content field. Structure, navigation and legal text are governed centrally.`,
        },
        { status: 403 }
      );
    }
    /* Imagery can only come from the approved library — never a free URL. */
    const entry = entryFor(target, edit.path);
    if (
      entry?.layer === "Imagery" &&
      edit.path.endsWith(".image") &&
      !IMAGE_SRCS.has(edit.value)
    ) {
      return Response.json(
        { error: "Images must be chosen from the approved image library." },
        { status: 403 }
      );
    }
  }

  try {
    const current = await readItem(target.id);
    const value = { ...current };
    for (const { path, value: text } of edits) value[path] = text;
    await writeItems([{ key: target.id, value }]);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, published: edits.length });
}
