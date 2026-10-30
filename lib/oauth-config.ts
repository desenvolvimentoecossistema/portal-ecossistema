import type { OAuthProvider } from "./oauth-tokens.ts";

export const SESSION_COOKIE = "portal_session";
export const STATE_COOKIE = "portal_oauth_state";

export function usesOAuth(): boolean {
  return true;
}

export function siteOrigin(): string | null {
  const raw = process.env.SITE_ORIGIN?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.pathname !== "/" || url.search || url.hash || (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost"))) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function providerSettings(provider: OAuthProvider) {
  if (provider !== "google") return null;
  const id = process.env.GOOGLE_CLIENT_ID?.trim();
  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!id || !secret) return null;
  return {
    id,
    secret,
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
  };
}

export function emailIsAllowed(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const addresses = (process.env.AUTH_ALLOWED_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  const domains = allowedGoogleDomains();
  const domain = normalized.split("@")[1];
  return addresses.includes(normalized) || Boolean(domain && domains.includes(domain));
}

export function allowedGoogleDomains(): string[] {
  return (process.env.AUTH_ALLOWED_DOMAINS ?? "").split(",").map((value) => value.trim().toLowerCase().replace(/^@/, "")).filter(Boolean);
}

export function hasLoginAllowlist(): boolean {
  return Boolean((process.env.AUTH_ALLOWED_EMAILS ?? "").trim() || (process.env.AUTH_ALLOWED_DOMAINS ?? "").trim());
}

export function safeReturnPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  try {
    const url = new URL(path, "https://app.local");
    if (url.origin !== "https://app.local" || url.pathname.startsWith("/auth/") || url.pathname === "/login") return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function randomToken(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function tokenHash(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function challenge(verifier: string): Promise<string> {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
}

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function allowedGoogleEmails():string[]{return (process.env.AUTH_ALLOWED_EMAILS??'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);}
