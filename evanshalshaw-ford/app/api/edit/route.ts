import { NextRequest, NextResponse } from "next/server";
import { dealer as baked } from "@/dealer.config";
import { verifyEditToken } from "@/lib/edit-token";

/**
 * Enter/exit inline edit mode.
 *
 *   GET /api/edit?token=…   verify the signed handoff token from the content
 *                           editor, keep it in an httpOnly cookie, land on /
 *   GET /api/edit?exit=1    drop the cookie, back to the public page
 *
 * The cookie stores the token itself, so it expires with the session and the
 * publish proxy can forward it verbatim — there is no second credential.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const home = new URL("/", request.url);

  if (request.nextUrl.searchParams.get("exit")) {
    const res = NextResponse.redirect(home, 307);
    res.cookies.delete("ford_edit");
    return res;
  }

  const token = request.nextUrl.searchParams.get("token") ?? undefined;
  const session = verifyEditToken(token, process.env.EDIT_SIGNING_SECRET ?? "");
  if (!session || session.dealerId !== baked.id) {
    return NextResponse.redirect(home, 307);
  }

  const res = NextResponse.redirect(home, 307);
  res.cookies.set("ford_edit", token!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: session.exp - Math.floor(Date.now() / 1000),
    path: "/",
  });
  return res;
}
