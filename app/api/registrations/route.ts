import { isSameOriginMutation } from "@/lib/request-origin";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSqliteDatabase, getDb } from "@/db";
import { events, registrations } from "@/db/schema";
import { DEMO_EVENTS } from "@/lib/event-data";
import { getSiteUser } from "@/app/site-auth";
import { isEventReadyForRegistration, isRegistrationOpen, todayInSaoPaulo } from "@/lib/event-rules";
import { registrationInsert, registrationSchema } from "@/lib/registration-rules";
import { hostNotification, participantConfirmation } from "@/lib/registration-email";

export const dynamic = "force-dynamic";

async function sendRegistrationEmail(payload: ReturnType<typeof hostNotification> | ReturnType<typeof participantConfirmation>) {
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL?.trim();
  const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET?.trim();
  if (!webhookUrl || !webhookSecret) {
    console.warn("Registration email webhook is not configured");
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: webhookSecret, ...payload }),
    });
    const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !result?.ok) {
      console.error("Registration email notification failed", {
        status: response.status,
        error: result?.error ?? "Invalid webhook response",
        notificationType: "notificationType" in payload ? payload.notificationType : "host",
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Registration email notification failed", error);
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  try {
    const user = await getSiteUser();
    if (!user) return NextResponse.json({ error: "Faça login para se inscrever." }, { status: 401 });
    const payload = registrationSchema.parse(await request.json());
    const db = getDb();
    const demoEvent = DEMO_EVENTS.find((event) => event.id === payload.eventId);
    if (demoEvent) {
      return NextResponse.json({ error: "Esta experiência é apenas demonstrativa." }, { status: 400 });
    }
    const [event] = await db.select().from(events).where(eq(events.id, payload.eventId)).limit(1);
    if (!event) return NextResponse.json({ error: "Experiência não encontrada." }, { status: 404 });
    if (!isEventReadyForRegistration(event)) return NextResponse.json({ error: "As inscrições desta atividade ainda não foram abertas." }, { status: 409 });
    const today = todayInSaoPaulo();
    if (!isRegistrationOpen(event.registrationDeadline, today)) {
      return NextResponse.json({ error: "O prazo de inscrição desta experiência foi encerrado." }, { status: 409 });
    }

    const createdAt = new Date().toISOString();
    const insert = registrationInsert(payload.participants, payload.eventId, payload.organization, today, createdAt);
    const result = getSqliteDatabase().prepare(insert.sql).run(...insert.values);

    if (Number(result.changes ?? 0) !== payload.participants.length) {
      const [currentEvent, duplicate, organizationCount, totalCount] = await Promise.all([
        db.select().from(events).where(eq(events.id, payload.eventId)).limit(1),
        db.select({ email: registrations.email }).from(registrations).where(eq(registrations.eventId, payload.eventId)),
        db.select({ count: sql<number>`count(*)` }).from(registrations).where(
          and(
            eq(registrations.eventId, payload.eventId),
            sql`lower(trim(${registrations.organization})) = lower(trim(${payload.organization}))`,
          ),
        ),
        db.select({ count: sql<number>`count(*)` }).from(registrations).where(
          eq(registrations.eventId, payload.eventId),
        ),
      ]);

      if (!currentEvent[0]) {
        return NextResponse.json({ error: "Experiência não encontrada." }, { status: 404 });
      }
      if (!isRegistrationOpen(currentEvent[0].registrationDeadline, today)) {
        return NextResponse.json({ error: "O prazo de inscrição desta experiência foi encerrado." }, { status: 409 });
      }
      if (duplicate.some((entry) => payload.participants.some((participant) => participant.email === entry.email.toLowerCase()))) {
        return NextResponse.json({ error: "Um dos e-mails já está inscrito nesta experiência." }, { status: 409 });
      }
      if (Number(organizationCount[0]?.count ?? 0) + payload.participants.length > 2) {
        return NextResponse.json(
          { error: "Sua organização já atingiu o limite de duas pessoas nesta experiência." },
          { status: 409 },
        );
      }
      if (Number(totalCount[0]?.count ?? 0) + payload.participants.length > currentEvent[0].maxParticipants) {
        return NextResponse.json({ error: "As vagas desta experiência foram preenchidas." }, { status: 409 });
      }
      return NextResponse.json({ error: "Não foi possível confirmar a inscrição. Tente novamente." }, { status: 409 });
    }

    const notices = await Promise.all(payload.participants.map(async (participant) => {
      const entry = { ...participant, organization: payload.organization };
      const [hostSent, confirmationSent] = await Promise.all([
        sendRegistrationEmail(hostNotification(event, entry)),
        sendRegistrationEmail(participantConfirmation(event, entry)),
      ]);
      return { hostSent, confirmationSent };
    }));
    return NextResponse.json({
      status: "confirmed",
      registered: payload.participants.length,
      confirmationsRequested: notices.filter((notice) => notice.confirmationSent).length,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const duplicateEmail = error.issues.some((issue) => issue.message.includes("e-mails diferentes"));
      return NextResponse.json({ error: duplicateEmail ? "Informe e-mails diferentes para as duas pessoas." : "Revise os dados da inscrição e selecione uma organização da lista." }, { status: 400 });
    }
    if (error instanceof Error && /unique|idx_registrations_event_email/i.test(error.message)) {
      return NextResponse.json({ error: "Este e-mail já está inscrito nesta experiência." }, { status: 409 });
    }
    console.error("Unable to create registration", error);
    return NextResponse.json({ error: "Não foi possível concluir a inscrição agora." }, { status: 503 });
  }
}
