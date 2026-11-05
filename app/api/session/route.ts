import {getSiteUser} from "@/app/site-auth";
import {hasPortalConsent} from "@/lib/portal-consent-store";
export const dynamic = "force-dynamic";
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const user = await getSiteUser();
    return Response.json({ authenticated: Boolean(user), consentRequired: user ? !await hasPortalConsent(user.userId) : false }, { status: user ? 200 : 401, headers });
  } catch { return Response.json({ error: "Sessão temporariamente indisponível." }, { status: 503, headers }); }
}
