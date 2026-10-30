import assert from "node:assert/strict";
import test from "node:test";
import {
  formatEventDateRange,
  formatEventTimeRange,
  isRegistrationOpen,
  normalizeOrganization,
  sortEventsByStartDate,
  todayInSaoPaulo,
} from "../lib/event-rules.ts";
import { eventSchema } from "../lib/event-validation.ts";

const validEvent = {
  title: "Experiência de teste",
  organization: "Fundação Lemann",
  description: "Descrição suficientemente longa para ser válida.",
  startDate: "2026-10-20",
  startTime: "08:30",
  endDate: "2026-10-21",
  endTime: "17:00",
  registrationDeadline: "2026-10-10",
  city: "São Paulo",
  state: "SP",
  dressCode: "",
  additionalNotes: "",
  contactName: "Equipe responsável",
  contactEmail: "contato@example.org",
  maxParticipants: 10,
};

test("normaliza espaços no nome da organização", () => {
  assert.equal(normalizeOrganization("  Fundação   Exemplo  "), "Fundação Exemplo");
});

test("usa a data de São Paulo para controlar o prazo", () => {
  const beforeMidnight = new Date("2026-09-16T02:59:00.000Z");
  const afterMidnight = new Date("2026-09-16T03:01:00.000Z");
  assert.equal(todayInSaoPaulo(beforeMidnight), "2026-09-15");
  assert.equal(todayInSaoPaulo(afterMidnight), "2026-09-16");
  assert.equal(isRegistrationOpen("2026-09-15", "2026-09-15"), true);
  assert.equal(isRegistrationOpen("2026-09-14", "2026-09-15"), false);
});

test("ordena exemplos e eventos cadastrados na mesma cronologia", () => {
  const sorted = sortEventsByStartDate([
    { title: "Terceiro", startDate: "2027-01-01" },
    { title: "Primeiro", startDate: "2026-10-01" },
    { title: "Segundo", startDate: "2026-11-01" },
  ]);
  assert.deepEqual(sorted.map((event) => event.title), ["Primeiro", "Segundo", "Terceiro"]);
});

test("mostra os dois anos quando o intervalo cruza anos no mesmo mês", () => {
  const formatted = formatEventDateRange("2026-12-20", "2027-12-22");
  assert.match(formatted, /2026/);
  assert.match(formatted, /2027/);
});

test("formata o intervalo de horários em português", () => {
  assert.equal(formatEventTimeRange("08:30", "17:00"), "8h30–17h");
  assert.equal(formatEventTimeRange("", ""), "Horário a confirmar");
});

test("aceita local e informações logísticas em branco e restringe a organização anfitriã", () => {
  assert.equal(eventSchema.safeParse(validEvent).success, true);
  assert.equal(eventSchema.safeParse({ ...validEvent, organization: "Outra" }).success, false);
  assert.deepEqual(
    (({ venue, transport, accommodation, meals }) => ({ venue, transport, accommodation, meals }))(eventSchema.parse(validEvent)),
    { venue: "", transport: "", accommodation: "", meals: "" },
  );
  assert.equal(eventSchema.safeParse({ ...validEvent, venue: "", transport: "", accommodation: "", meals: "" }).success, true);
  assert.equal(eventSchema.safeParse({ ...validEvent, dressCode: undefined }).success, true);
  assert.equal(eventSchema.safeParse({ ...validEvent, organization: "Organização inventada" }).success, false);
  assert.equal(eventSchema.safeParse({ ...validEvent, state: "1!" }).success, false);
  assert.equal(eventSchema.safeParse({ ...validEvent, state: "sp" }).success, true);
});
