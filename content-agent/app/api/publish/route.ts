import { getTarget, isAllowed } from "@/lib/targets";
import { readItem, writeItems } from "@/lib/store";

/**
 * Publishes edits to Edge Config. Live on all visitors' next request —
 * no build, no deployment.
 *
 * Every path is validated against the target's allowlist regardless of where
 * the request came from (form, AI assist, or a hand-crafted POST); one bad
 * path rejects the whole batch.
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
