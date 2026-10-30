import { isSameOriginMutation } from "@/lib/request-origin";
import { asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { events, registrations, removedDemoEvents } from "@/db/schema";
import { DEMO_EVENTS } from "@/lib/event-data";
import { demoEventsEnabled } from "@/lib/runtime-config";
import { getSiteUser } from "@/app/site-auth";
import { eventSchema, eventValidationMessage } from "@/lib/event-validation";
import { normalizeEventType, sortEventsByStartDate } from "@/lib/event-rules";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSiteUser();
    if (!user) return NextResponse.json({ error: "Faça login para acessar a agenda." }, { status: 401 });
    const db = getDb();
    const [storedEvents, counts, removedDemos] = await Promise.all([
      db.select().from(events).orderBy(asc(events.startDate)),
      db
        .select({ eventId: registrations.eventId, count: sql<number>`count(*)` })
        .from(registrations)
        .groupBy(registrations.eventId),
      db.select({ eventId: removedDemoEvents.eventId }).from(removedDemoEvents),
    ]);
    const registrationsByEvent = new Map(counts.map((row) => [row.eventId, Number(row.count)]));
    const removedDemoIds = new Set(removedDemos.map((row) => row.eventId));
    return NextResponse.json(sortEventsByStartDate([
      ...(demoEventsEnabled() ? DEMO_EVENTS.filter((event) => !removedDemoIds.has(event.id)) : []),
      ...storedEvents.map((event) => ({
        ...event,
        type: normalizeEventType(event.type),
        dateNote: !event.startDate ? event.additionalNotes.match(/^Prevista para[^.]*\./)?.[0] ?? "Data a confirmar" : undefined,
        availableSpots: Math.max(0, event.maxParticipants - (registrationsByEvent.get(event.id) ?? 0)),
      })),
    ]));
  } catch (error) {
    console.error("Unable to load stored events", error);
    return NextResponse.json(
      { error: "Não foi possível carregar a agenda agora." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getSiteUser();
    if (!user) return NextResponse.json({ error: "Faça login para publicar uma experiência." }, { status: 401 });
    const payload = eventSchema.parse(await request.json());
    if (
      payload.endDate < payload.startDate ||
      payload.registrationDeadline > payload.startDate ||
      (payload.endDate === payload.startDate && payload.endTime <= payload.startTime)
    ) {
      return NextResponse.json({ error: "Revise as datas informadas." }, { status: 400 });
    }
    const event = {
      ...payload,
      type: "Evento institucional",
      address: "",
      dressCode: payload.dressCode ?? "",
      meetingPoint: "",
      arrivalGuidance: "",
      preparation: "",
      accessibility: "",
      costs: "",
      state: payload.state.toUpperCase(),
      id: crypto.randomUUID(),
      createdByUserId: user.userId,
      creatorEmail: user.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await getDb().insert(events).values(event);
    return NextResponse.json({ ...event, availableSpots: event.maxParticipants }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: eventValidationMessage(error) }, { status: 400 });
    }
    console.error("Unable to create event", error);
    return NextResponse.json({ error: "Não foi possível publicar a experiência agora." }, { status: 503 });
  }
}
