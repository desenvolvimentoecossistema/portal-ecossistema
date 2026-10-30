import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { oauthStates } from "@/db/schema";
import { challenge, hasLoginAllowlist, providerSettings, randomToken, safeReturnPath, siteOrigin, STATE_COOKIE, tokenHash, usesOAuth } from "@/lib/oauth-config";
import type { OAuthProvider } from "@/lib/oauth-tokens";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider: name } = await context.params;
  if (!usesOAuth() || name !== "google") return new Response("Login indisponível.", { status: 404 });
  const provider = name as OAuthProvider;
  const settings = providerSettings(provider);
  const origin = siteOrigin();
  if (!settings || !origin || !hasLoginAllowlist()) return new Response("Configuração de login pendente.", { status: 503 });
  if (new URL(request.url).origin !== origin) return new Response("Endereço de login inválido.", { status: 400 });

  const state = randomToken();
  const nonce = randomToken();
  const verifier = randomToken();
  const now = Math.floor(Date.now() / 1000);
  const returnTo = safeReturnPath(new URL(request.url).searchParams.get("return_to") ?? "/");
  try {
    await getDb().insert(oauthStates).values({ id: await tokenHash(state), provider, verifier, nonce, returnTo, expiresAt: now + 600 });
  } catch {
    return new Response("Não foi possível iniciar o login.", { status: 503 });
  }
  const url = new URL(settings.authorize);
  url.searchParams.set("client_id", settings.id);
  url.searchParams.set("redirect_uri", `${origin}/auth/callback/${provider}`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", await challenge(verifier));
  url.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: origin.startsWith("https:"), sameSite: "lax", maxAge: 600, path: "/auth/callback" });
  return response;
}
