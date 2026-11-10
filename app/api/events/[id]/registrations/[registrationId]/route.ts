import { isSameOriginMutation } from "@/lib/request-origin";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {getPortalUser as getSiteUser} from "@/app/portal-access";
import { getAppRole } from "@/app/authz";
import { getDb, getSqliteDatabase } from "@/db";
import { events, registrations } from "@/db/schema";
import { isEventOwner } from "@/lib/event-ownership";
import {registrationCancellation} from '@/lib/registration-email';
import {queueNotification,flushNotifications} from '@/lib/email-notifications.mjs';

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

    const [registration] = await db
      .select()
      .from(registrations)
      .where(and(eq(registrations.id, registrationId), eq(registrations.eventId, id)))
      .limit(1);

    const canManage = isEventOwner(event, user) || await getAppRole(user) === "admin";
    const isParticipant = registration?.email.trim().toLowerCase() === user.email.trim().toLowerCase();
    if (!canManage && !isParticipant) {
      return NextResponse.json({ error: "Você só pode cancelar a inscrição vinculada ao seu próprio e-mail." }, { status: 403 });
    }

    if (!registration) {
      return NextResponse.json({ error: "Inscrição não encontrada." }, { status: 404 });
    }

    const storage=getSqliteDatabase();
    storage.exec('BEGIN IMMEDIATE');
    try {
      const deleted=storage.prepare('DELETE FROM registrations WHERE id=? AND event_id=?'+(canManage?'':' AND lower(trim(email))=?')).run(registrationId,id,...(canManage?[]:[user.email.trim().toLowerCase()]));
      if(!deleted.changes){storage.exec('ROLLBACK');return NextResponse.json({error:'Esta inscrição já foi cancelada.'},{status:404});}
      if(isParticipant)queueNotification(storage,registrationCancellation(event,registration));
      storage.exec('COMMIT');
    } catch(error){storage.exec('ROLLBACK');throw error;}
    if(isParticipant)await flushNotifications();

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Unable to delete event registration", error);
    return NextResponse.json({ error: "Não foi possível excluir a inscrição agora." }, { status: 503 });
  }
}
