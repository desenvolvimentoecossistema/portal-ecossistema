import assert from "node:assert/strict";
import test from "node:test";
import { hostNotification, participantConfirmation } from "../lib/registration-email.ts";

const event = {
  title: "Visita à escola",
  type: "Evento institucional",
  organization: "Motriz",
  contactName: "Equipe anfitriã",
  contactEmail: "anfitria@example.org",
  startDate: "2026-11-10",
  endDate: "2026-11-10",
  startTime: "09:00",
  endTime: "12:00",
  venue: "",
  city: "São Paulo",
  state: "SP",
};

test("mantém o destinatário do aviso à organização", () => {
  const email = hostNotification(event, { name: "Maria", email: "maria@example.org", organization: "Reúna", role: "Coordenação" });
  assert.equal(email.contactEmail, "anfitria@example.org");
  assert.equal(email.participantEmail, "maria@example.org");
  assert.equal(email.eventLocation, "São Paulo - SP");
});

test("endereça a confirmação a cada pessoa com os dados da própria inscrição", () => {
  for (const participant of [
    { name: "Maria", email: "maria@example.org", organization: "Reúna", role: "Coordenação" },
    { name: "João", email: "joao@example.org", organization: "Reúna", role: "Analista" },
  ]) {
    const email = participantConfirmation(event, participant);
    assert.equal(email.contactEmail, participant.email);
    assert.equal(email.recipientEmail, participant.email);
    assert.equal(email.notificationType, "participant_confirmation");
    assert.match(email.text, new RegExp(participant.name));
    assert.match(email.text, /Sua inscrição em “Visita à escola” foi recebida/);
    assert.match(email.text, /anfitria@example.org/);
  }
});
