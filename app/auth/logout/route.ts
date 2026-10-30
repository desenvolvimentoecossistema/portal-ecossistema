import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { oauthSessions } from "@/db/schema";
import { SESSION_COOKIE, siteOrigin, tokenHash, usesOAuth } from "@/lib/oauth-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!usesOAuth()) return new Response("Login indisponível.", { status: 404 });
  const origin = siteOrigin();
  if (!origin) return new Response("Configuração de login pendente.", { status: 503 });
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (session) await getDb().delete(oauthSessions).where(eq(oauthSessions.id, await tokenHash(session)));
  const target = "/login";
  const response = NextResponse.redirect(new URL(target, origin));
  response.cookies.delete(SESSION_COOKIE);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
