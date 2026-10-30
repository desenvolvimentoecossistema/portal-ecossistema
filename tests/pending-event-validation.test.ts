import assert from "node:assert/strict";
import test from "node:test";
import { pendingEventSchema } from "../lib/pending-event-validation.ts";
import { eventSchema } from "../lib/event-validation.ts";

test("permite atualizar uma programação incompleta sem abrir inscrições", () => {
  const draft = pendingEventSchema.parse({
    title: "Oficina de IA", organization: "Motriz", description: "Atividade prevista pela Motriz",
    startDate: "", startTime: "", endDate: "", endTime: "", registrationDeadline: "",
    city: "", state: "PI", venue: "", transport: "", accommodation: "", meals: "",
    additionalNotes: "", contactName: "Equipe Motriz", contactEmail: "equipe@motriz.org",
    maxParticipants: "",
  });
  assert.equal(draft.maxParticipants, 0);
  assert.equal(eventSchema.safeParse(draft).success, false);
  assert.equal(pendingEventSchema.safeParse({ ...draft, organization: "Reúna" }).success, true);
  for (const startTime of ["00:00", "09:30", "19:45", "23:59"]) {
    assert.equal(pendingEventSchema.safeParse({ ...draft, startTime, endTime: "23:59" }).success, true);
  }
  for (const startTime of ["24:00", "09:60", "9:30", "texto"]) {
    assert.equal(pendingEventSchema.safeParse({ ...draft, startTime }).success, false);
  }
});
