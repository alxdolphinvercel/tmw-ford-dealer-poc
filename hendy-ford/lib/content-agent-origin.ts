/**
 * Where content-agent lives, from this deployment's point of view. Explicit
 * CONTENT_AGENT_ORIGIN wins (local dev). On a Vercel preview, use the same
 * branch's content-agent preview; on production, the production URL.
 * Shared by the edit-mode publish and assist proxies.
 */

const TEAM_SLUG = "tmw-ford-poc";

export function contentAgentOrigin(): string | undefined {
  if (process.env.CONTENT_AGENT_ORIGIN) return process.env.CONTENT_AGENT_ORIGIN;
  if (!process.env.VERCEL) return undefined;
  const ref = process.env.VERCEL_GIT_COMMIT_REF;
  if (ref && ref !== "main") {
    const slug = ref.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `https://content-agent-git-${slug}-${TEAM_SLUG}.vercel.app`;
  }
  return `https://content-agent-${TEAM_SLUG}.vercel.app`;
}
