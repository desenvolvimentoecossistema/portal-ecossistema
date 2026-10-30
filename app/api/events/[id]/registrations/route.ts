import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSiteUser } from "@/app/site-auth";
import { getAppRole } from "@/app/authz";
import { getDb } from "@/db";
import { events, registrations } from "@/db/schema";
import { isEventOwner } from "@/lib/event-ownership";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSiteUser();
    if (!user) {
      return NextResponse.json({ error: "Faça login para consultar as inscrições." }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);

    if (!event) {
      return NextResponse.json({ error: "Experiência não encontrada." }, { status: 404 });
    }

    const canManage = isEventOwner(event, user) || await getAppRole(user) === "admin";
    if (!canManage) {
      return NextResponse.json({ error: "Você não tem permissão para consultar estas inscrições." }, { status: 403 });
    }

    const entries = await db
      .select({
        id: registrations.id,
        name: registrations.name,
        email: registrations.email,
        organization: registrations.organization,
        role: registrations.role,
        createdAt: registrations.createdAt,
      })
      .from(registrations)
      .where(eq(registrations.eventId, id))
      .orderBy(desc(registrations.createdAt));

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Unable to load event registrations", error);
    return NextResponse.json({ error: "Não foi possível carregar as inscrições agora." }, { status: 503 });
  }
}
