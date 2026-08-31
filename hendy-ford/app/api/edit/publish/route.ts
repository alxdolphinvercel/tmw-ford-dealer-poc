import { cookies } from "next/headers";
import { dealer as baked } from "@/dealer.config";
import { verifyEditToken } from "@/lib/edit-token";
import { isAllowedPath } from "@/lib/overrides";

/**
 * Same-origin publish proxy for the inline editor.
 *
 * The browser can't POST to content-agent directly — its deployment sits
 * behind Vercel team SSO, which eats the CORS preflight. So the overlay posts
 * here, and this route forwards server-to-server, carrying the edit token as
 * a Bearer credential (verified again by content-agent) and the protection
 * bypass header that gets us past the SSO layer. VERCEL_API_TOKEN stays on
 * content-agent only.
 *
 * Edits are split by target: FORD_CAMPAIGNS.* paths publish to the shared
 * "national" item; everything else to this dealer's own item.
 */

interface Edit {
  path: string;
  value: string;
}

interface TargetResult {
  target: string;
  ok: boolean;
  published?: number;
  error?: string;
  paths: string[];
}

export async function POST(request: Request): Promise<Response> {
  const token = (await cookies()).get("ford_edit")?.value;
  const session = verifyEditToken(token, process.env.EDIT_SIGNING_SECRET ?? "");
  if (!session || session.dealerId !== baked.id) {
    return Response.json({ error: "edit-session-expired" }, { status: 401 });
  }

  let edits: Edit[];
  try {
    const body = await request.json();
    edits = body?.edits;
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }
  if (!Array.isArray(edits) || edits.length === 0) {
    return Response.json({ error: "No edits to publish." }, { status: 400 });
  }

  /* Friendly pre-check; content-agent's allowlist remains the authority. */
  for (const edit of edits) {
    if (
      typeof edit?.path !== "string" ||
      typeof edit?.value !== "string" ||
      !isAllowedPath(edit.path)
    ) {
      return Response.json(
        { error: `"${edit?.path}" is not an editable content field.` },
        { status: 403 }
      );
    }
  }

  const origin = process.env.CONTENT_AGENT_ORIGIN;
  if (!origin) {
    return Response.json(
      { error: "CONTENT_AGENT_ORIGIN is not configured on this site." },
      { status: 500 }
    );
  }

  const groups = new Map<string, Edit[]>();
  for (const edit of edits) {
    const target = edit.path.startsWith("FORD_CAMPAIGNS.") ? "national" : baked.id;
    groups.set(target, [...(groups.get(target) ?? []), edit]);
  }

  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const results: TargetResult[] = await Promise.all(
    [...groups.entries()].map(async ([target, group]): Promise<TargetResult> => {
      const paths = group.map((e) => e.path);
      try {
        const res = await fetch(`${origin}/api/publish`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(bypass ? { "x-vercel-protection-bypass": bypass } : {}),
          },
          body: JSON.stringify({ target, edits: group }),
          cache: "no-store",
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          return {
            target,
            ok: false,
            error: body?.error ?? `Publish failed (${res.status}).`,
            paths,
          };
        }
        return { target, ok: true, published: body.published, paths };
      } catch (error) {
        return {
          target,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
          paths,
        };
      }
    })
  );

  const ok = results.every((r) => r.ok);
  const published = results.reduce((n, r) => n + (r.published ?? 0), 0);
  return Response.json({ ok, published, results }, { status: ok ? 200 : 502 });
}
