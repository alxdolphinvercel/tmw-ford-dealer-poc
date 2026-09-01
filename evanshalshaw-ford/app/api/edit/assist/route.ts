import { cookies } from "next/headers";
import { dealer as baked } from "@/dealer.config";
import { verifyEditToken } from "@/lib/edit-token";
import { isAllowedPath } from "@/lib/overrides";
import { contentAgentOrigin } from "@/lib/content-agent-origin";

/**
 * Same-origin AI-assist proxy for the inline editor — the sibling of
 * ./publish. The overlay can't reach content-agent directly (its SSO layer
 * eats cross-origin requests), so this route verifies the edit-session
 * cookie and forwards server-to-server with the token as a Bearer credential
 * plus the protection bypass header. National campaign fields ride along in
 * the same call; content-agent validates them against its own allowlists.
 */

interface AssistField {
  path: string;
  value: string;
}

export async function POST(request: Request): Promise<Response> {
  const token = (await cookies()).get("ford_edit")?.value;
  const session = verifyEditToken(token, process.env.EDIT_SIGNING_SECRET ?? "");
  if (!session || session.dealerId !== baked.id) {
    return Response.json({ error: "edit-session-expired" }, { status: 401 });
  }

  let instruction: unknown;
  let fields: AssistField[];
  try {
    const body = await request.json();
    instruction = body?.instruction;
    fields = body?.fields;
  } catch {
    return Response.json({ error: "Malformed request." }, { status: 400 });
  }
  if (typeof instruction !== "string" || !instruction.trim()) {
    return Response.json({ error: "No instruction given." }, { status: 400 });
  }
  if (!Array.isArray(fields) || fields.length === 0) {
    return Response.json({ error: "No fields supplied." }, { status: 400 });
  }
  for (const field of fields) {
    if (
      typeof field?.path !== "string" ||
      typeof field?.value !== "string" ||
      !isAllowedPath(field.path)
    ) {
      return Response.json(
        { error: `"${field?.path}" is not an editable content field.` },
        { status: 403 }
      );
    }
  }

  const origin = contentAgentOrigin();
  if (!origin) {
    return Response.json(
      { error: "CONTENT_AGENT_ORIGIN is not configured on this site." },
      { status: 500 }
    );
  }

  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  try {
    const res = await fetch(`${origin}/api/assist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(bypass ? { "x-vercel-protection-bypass": bypass } : {}),
      },
      body: JSON.stringify({ target: baked.id, instruction, fields }),
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    return Response.json(body, { status: res.status });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }
}
