import { isSameOriginMutation } from "@/lib/request-origin";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSiteUser } from "@/app/site-auth";
import { getAppRole } from "@/app/authz";
import { getDb } from "@/db";
import { events, registrations } from "@/db/schema";
import { isEventOwner } from "@/lib/event-ownership";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; registrationId: string }> },
) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getSiteUser();
    if (!user) {
      return NextResponse.json({ error: "Faça login para excluir uma inscrição." }, { status: 401 });
    }

    const { id, registrationId } = await params;
    const db = getDb();
    const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);

    if (!event) {
      return NextResponse.json({ error: "Experiência não encontrada." }, { status: 404 });
    }

    const canManage = isEventOwner(event, user) || await getAppRole(user) === "admin";
    if (!canManage) {
      return NextResponse.json({ error: "Você não tem permissão para excluir esta inscrição." }, { status: 403 });
    }

    const [registration] = await db
      .select({ id: registrations.id })
      .from(registrations)
      .where(and(eq(registrations.id, registrationId), eq(registrations.eventId, id)))
      .limit(1);

    if (!registration) {
      return NextResponse.json({ error: "Inscrição não encontrada." }, { status: 404 });
    }

    await db
      .delete(registrations)
      .where(and(eq(registrations.id, registrationId), eq(registrations.eventId, id)));

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Unable to delete event registration", error);
    return NextResponse.json({ error: "Não foi possível excluir a inscrição agora." }, { status: 503 });
  }
}
