/**
 * Edge Config writes and consistent reads, via the Vercel REST API.
 *
 * The @vercel/edge-config SDK is read-only and eventually consistent, so the
 * publish flow's read-modify-write goes through the API instead — reads here
 * always see the latest write.
 *
 * Env (content-agent project only):
 *   VERCEL_API_TOKEN  — team-scoped token used for writes
 *   EDGE_CONFIG_ID    — ecfg_… id of the shared store
 *   VERCEL_TEAM_ID    — team_… id that owns it
 */

const API = "https://api.vercel.com";

function config(): { id: string; team: string; token: string } {
  const id = process.env.EDGE_CONFIG_ID;
  const team = process.env.VERCEL_TEAM_ID;
  const token = process.env.VERCEL_API_TOKEN;
  if (!id || !team || !token) {
    throw new Error(
      "Edge Config is not configured — set EDGE_CONFIG_ID, VERCEL_TEAM_ID and VERCEL_API_TOKEN."
    );
  }
  return { id, team, token };
}

async function fail(res: Response, doing: string): Promise<never> {
  const body = await res.text();
  let message = body;
  try {
    message = JSON.parse(body)?.error?.message ?? body;
  } catch {}
  throw new Error(`${doing} failed (${res.status}): ${message}`);
}

/** Latest value of one item; {} if the key does not exist yet. */
export async function readItem(key: string): Promise<Record<string, string>> {
  const { id, team, token } = config();
  const res = await fetch(
    `${API}/v1/edge-config/${id}/item/${key}?teamId=${team}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (res.status === 404) return {};
  if (!res.ok) await fail(res, `Reading "${key}"`);
  const item = await res.json();
  return item?.value ?? {};
}

export interface ItemWrite {
  key: string;
  value: Record<string, string>;
}

/** Upserts whole item values. */
export async function writeItems(items: ItemWrite[]): Promise<void> {
  const { id, team, token } = config();
  const res = await fetch(`${API}/v1/edge-config/${id}/items?teamId=${team}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: items.map(({ key, value }) => ({ operation: "upsert", key, value })),
    }),
  });
  if (!res.ok) await fail(res, `Writing ${items.length} item(s)`);
}
