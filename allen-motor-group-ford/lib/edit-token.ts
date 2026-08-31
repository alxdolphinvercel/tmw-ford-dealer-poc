import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signed edit-session tokens for the inline editor.
 *
 * The content editor (behind Vercel team SSO) mints a token scoped to one
 * dealer site; the site verifies it before enabling edit mode, and the
 * publish path verifies it again before writing. HMAC-SHA256 over
 * `v1.<dealerId>.<exp>` with the shared EDIT_SIGNING_SECRET — no session
 * store, nothing to revoke; tokens simply expire.
 *
 * Dealer ids contain hyphens and never dots, so dot-delimiting is safe.
 * This file is duplicated in content-agent/lib/edit-token.ts — the two
 * projects are separate npm packages; keep them in sync.
 */

export interface EditSession {
  dealerId: string;
  /** Expiry, unix seconds. */
  exp: number;
}

function sig(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signEditToken(
  dealerId: string,
  ttlSeconds: number,
  secret: string
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `v1.${dealerId}.${exp}`;
  return `${payload}.${sig(payload, secret)}`;
}

export function verifyEditToken(
  token: string | undefined,
  secret: string
): EditSession | null {
  if (!token || !secret) return null;

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;

  const [, dealerId, expStr, mac] = parts;
  const exp = Number(expStr);
  if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return null;

  const expected = sig(`v1.${dealerId}.${exp}`, secret);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return { dealerId, exp };
}
