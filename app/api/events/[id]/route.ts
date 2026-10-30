import { isSameOriginMutation } from "@/lib/request-origin";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppRole } from "@/app/authz";
import { getSiteUser } from "@/app/site-auth";
import { getDb } from "@/db";
import { events, registrations, removedDemoEvents } from "@/db/schema";
import { DEMO_EVENTS } from "@/lib/event-data";
import { pendingEventSchema } from "@/lib/pending-event-validation";
import { isEventReadyForRegistration } from "@/lib/event-rules";
import { eventSchema, eventValidationMessage } from "@/lib/event-validation";
import { isEventOwner } from "@/lib/event-ownership";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getSiteUser();
    if (!user) return NextResponse.json({ error: "Faça login para editar a experiência." }, { status: 401 });

    const { id } = await context.params;
    const db = getDb();
    const [existing] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "Experiência não encontrada." }, { status: 404 });

    const isCreator = isEventOwner(existing, user);
    if (!isCreator && await getAppRole(user) !== "admin") {
      return NextResponse.json({ error: "Somente quem publicou esta experiência pode editá-la." }, { status: 403 });
    }

    const input = await request.json();
    const pending = pendingEventSchema.parse(input);
    const ready = isEventReadyForRegistration(pending);
    if (!ready && isEventReadyForRegistration(existing)) {
      return NextResponse.json({ error: "Uma atividade com inscrições abertas precisa manter datas, horários, cidade, prazo e vagas." }, { status: 400 });
    }
    const payload = ready ? eventSchema.parse(input) : pending;
    if (Boolean(payload.startDate) !== Boolean(payload.endDate)) {
      return NextResponse.json({ error: "Informe as duas datas ou deixe ambas em branco enquanto estiverem em confirmação." }, { status: 400 });
    }
    if (
      (payload.startDate && payload.endDate && payload.endDate < payload.startDate) ||
      (payload.startDate && payload.registrationDeadline && payload.registrationDeadline > payload.startDate) ||
      (payload.startDate && payload.endDate === payload.startDate && payload.startTime && payload.endTime && payload.endTime <= payload.startTime)
    ) {
      return NextResponse.json({ error: "Revise as datas informadas." }, { status: 400 });
    }

    const [registrationCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(registrations)
      .where(eq(registrations.eventId, id));
    const confirmed = Number(registrationCount?.count ?? 0);
    if (payload.maxParticipants < confirmed) {
      return NextResponse.json({ error: `O total de vagas não pode ser menor que as ${confirmed} inscrições já confirmadas.` }, { status: 400 });
    }

    const updated = {
      ...payload,
      type: existing.type,
      address: existing.address,
      dressCode: payload.dressCode ?? existing.dressCode,
      meetingPoint: existing.meetingPoint,
      arrivalGuidance: existing.arrivalGuidance,
      preparation: existing.preparation,
      accessibility: existing.accessibility,
      costs: existing.costs,
      state: payload.state.toUpperCase(),
      updatedAt: new Date().toISOString(),
    };
    const changed=await db.update(events).set(updated).where(and(eq(events.id,id),sql`(SELECT count(*) FROM registrations WHERE event_id = ${id}) <= ${payload.maxParticipants}`)).returning({id:events.id});
    if(!changed.length)return NextResponse.json({error:'As inscrições mudaram durante a edição. Recarregue a atividade e confira as vagas.'},{status:409});

    return NextResponse.json({
      ...existing,
      ...updated,
      availableSpots: Math.max(0, payload.maxParticipants - confirmed),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: eventValidationMessage(error) }, { status: 400 });
    }
    console.error("Unable to update event", error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações agora." }, { status: 503 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getSiteUser();
    if (!user) return NextResponse.json({ error: "Faça login para excluir a experiência." }, { status: 401 });

    const { id } = await context.params;
    const db = getDb();
    const isAdmin = await getAppRole(user) === "admin";
    const demoEvent = DEMO_EVENTS.find((event) => event.id === id);

    if (demoEvent) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Somente administradores podem excluir exemplos." }, { status: 403 });
      }
      await db.insert(removedDemoEvents).values({
        eventId: id,
        removedByUserId: user.userId,
        removedAt: new Date().toISOString(),
      }).onConflictDoNothing();
      return NextResponse.json({ status: "deleted" });
    }

    const [existing] = await db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: "Experiência não encontrada." }, { status: 404 });

    if (!isAdmin && !isEventOwner(existing, user)) {
      return NextResponse.json({ error: "Somente quem publicou esta experiência pode excluí-la." }, { status: 403 });
    }

    await db.batch([
      db.delete(registrations).where(eq(registrations.eventId, id)),
      db.delete(events).where(eq(events.id, id)),
    ]);

    return NextResponse.json({ status: "deleted" });
  } catch (error) {
    console.error("Unable to delete event", error);
    return NextResponse.json({ error: "Não foi possível excluir a experiência agora." }, { status: 503 });
  }
}
