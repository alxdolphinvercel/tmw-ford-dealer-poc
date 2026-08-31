import { signEditToken } from "@/lib/edit-token";
import { getTarget } from "@/lib/targets";

/**
 * Mints a signed inline-edit handoff link for a dealer site.
 *
 * This route lives behind the same Vercel team SSO as the rest of the
 * editor, so reaching it at all is the "logged into the team" check. The
 * token it signs is scoped to one dealer and expires; the site verifies it
 * before enabling edit mode, and again on every publish.
 */

const TTL_SECONDS = 30 * 60;

/** Local dev servers, per .claude/launch.json. */
const DEV_PORTS: Record<string, number> = {
  "lookers-ford": 3011,
  "evanshalshaw-ford": 3012,
  "allen-motor-group-ford": 3013,
  "group1-ford": 3014,
  "hendy-ford": 3015,
};

export async function POST(request: Request): Promise<Response> {
  const { target: targetId } = await request.json().catch(() => ({}));

  const target = getTarget(targetId ?? "");
  if (!target || !target.previewUrl) {
    return Response.json(
      { error: "Inline editing needs a single dealer site." },
      { status: 400 }
    );
  }

  const secret = process.env.EDIT_SIGNING_SECRET;
  if (!secret) {
    return Response.json(
      { error: "EDIT_SIGNING_SECRET is not configured." },
      { status: 500 }
    );
  }

  /* When the editor itself runs locally, hand off to the local site. */
  const host = request.headers.get("host") ?? "";
  const base =
    host.startsWith("localhost") && DEV_PORTS[target.id]
      ? `http://localhost:${DEV_PORTS[target.id]}`
      : target.previewUrl;

  const token = signEditToken(target.id, TTL_SECONDS, secret);
  return Response.json({
    url: `${base}/api/edit?token=${encodeURIComponent(token)}`,
  });
}
