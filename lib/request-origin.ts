import { siteOrigin } from "./oauth-config.ts";

// Cookie-authenticated writes must originate from this application, including
// when another application is hosted under the same parent domain.
export function isSameOriginMutation(request: Request): boolean {
  try {
    // The standalone server can expose its internal listening address here.
    // Trust the configured public origin, never client-supplied forwarding headers.
    const expected = process.env.SITE_ORIGIN?.trim() ? siteOrigin() : new URL(request.url).origin;
    return expected !== null && request.headers.get("origin") === expected;
  } catch {
    return false;
  }
}
