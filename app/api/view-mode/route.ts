import {NextResponse} from "next/server";
import {getSiteUser} from "@/app/site-auth";
import {getAccountRole} from "@/app/authz";
import {isSameOriginMutation} from "@/lib/request-origin";
import {VISITOR_VIEW_COOKIE, visitorViewKey} from "@/lib/visitor-view";

export const dynamic = "force-dynamic";
const headers = {"Cache-Control": "private, no-store"};

export async function GET() {
  const user = await getSiteUser();
  if (!user) return NextResponse.json({error: "Faça login para continuar."}, {status: 401, headers});
  const canSwitch = await getAccountRole(user) === "admin";
  return NextResponse.json({canSwitch, mode: canSwitch && !user.visitorView ? "admin" : "visitor"}, {headers});
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({error: "Origem inválida."}, {status: 403, headers});
  const user = await getSiteUser();
  if (!user) return NextResponse.json({error: "Faça login para continuar."}, {status: 401, headers});
  if (await getAccountRole(user) !== "admin") return NextResponse.json({error: "Somente administradores podem alternar a visualização."}, {status: 403, headers});
  let mode: unknown;
  try { mode = (await request.json())?.mode; } catch { /* Validated below. */ }
  if (mode !== "visitor" && mode !== "admin") return NextResponse.json({error: "Escolha uma visualização válida."}, {status: 400, headers});
  const response = NextResponse.json({mode}, {headers});
  response.cookies.set(VISITOR_VIEW_COOKIE, mode === "visitor" ? await visitorViewKey(user.userId) : "", {
    httpOnly: true, secure: new URL(request.headers.get("origin")!).protocol === "https:",
    sameSite: "lax", path: "/", ...(mode === "admin" ? {maxAge: 0} : {}),
  });
  return response;
}
