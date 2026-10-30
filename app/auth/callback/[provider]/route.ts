import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { oauthSessions, oauthStates } from "@/db/schema";
import { allowedGoogleEmails, allowedGoogleDomains, emailIsAllowed, providerSettings, randomToken, SESSION_COOKIE, siteOrigin, STATE_COOKIE, tokenHash, usesOAuth } from "@/lib/oauth-config";
import { verifyIdentityToken, type OAuthProvider } from "@/lib/oauth-tokens";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider: name } = await context.params;
  if (!usesOAuth() || name !== "google") return new Response("Login indisponível.", { status: 404 });
  const provider = name as OAuthProvider;
  const origin = siteOrigin();
  const settings = providerSettings(provider);
  if (!origin || !settings || new URL(request.url).origin !== origin) return new Response("Endereço de login inválido.", { status: 400 });
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${STATE_COOKIE}=`))?.slice(STATE_COOKIE.length + 1);
  if (!code || !state || !cookie || state !== cookie || !/^[A-Za-z0-9_-]{40,100}$/.test(state)) return NextResponse.redirect(`${origin}/login?error=login`);

  try {
    const db = getDb();
    const id = await tokenHash(state);
    const [attempt] = await db.select().from(oauthStates).where(and(eq(oauthStates.id, id), eq(oauthStates.provider, provider))).limit(1);
    const now = Math.floor(Date.now() / 1000);
    if (!attempt || attempt.consumedAt || attempt.expiresAt < now) throw new Error("Invalid login state");
    const used = await db.update(oauthStates).set({ consumedAt: now }).where(and(eq(oauthStates.id, id), eq(oauthStates.consumedAt, 0))).returning({id:oauthStates.id});
    if (used.length !== 1) throw new Error("Login state already used");

    const tokenResponse = await fetch(settings.token, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: settings.id, client_secret: settings.secret, code, redirect_uri: `${origin}/auth/callback/${provider}`, grant_type: "authorization_code", code_verifier: attempt.verifier }),
    });
    if (!tokenResponse.ok) throw new Error("OAuth code exchange failed");
    const tokens = await tokenResponse.json() as { id_token?: string };
    const identity = await verifyIdentityToken(tokens.id_token ?? "", provider, settings.id, attempt.nonce, allowedGoogleDomains(), undefined, allowedGoogleEmails());
    if (!identity || !emailIsAllowed(identity.email)) throw new Error("Unauthorized identity");

    const session = randomToken();
    await db.insert(oauthSessions).values({ id: await tokenHash(session), ...identity, expiresAt: now + 7 * 24 * 3600 });
    const response = NextResponse.redirect(new URL(attempt.returnTo, origin));
    response.cookies.set(SESSION_COOKIE, session, { httpOnly: true, secure: origin.startsWith("https:"), sameSite: "lax", maxAge: 7 * 24 * 3600, path: "/" });
    response.cookies.delete({ name: STATE_COOKIE, path: "/auth/callback" });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("OAuth login failed", error instanceof Error ? error.message : "Unknown error");
    const response = NextResponse.redirect(`${origin}/login?error=login`);
    response.cookies.delete({ name: STATE_COOKIE, path: "/auth/callback" });
    return response;
  }
}
