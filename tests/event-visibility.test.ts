import assert from "node:assert/strict";
import test from "node:test";
import { eventForViewer } from "../lib/event-ownership.ts";

const event = {
  id: "activity-1",
  title: "Encontro de organizações",
  contactName: "Equipe anfitriã",
  contactEmail: "contato@example.org",
  creatorEmail: "autor@example.org",
  createdByUserId: "author-id",
  availableSpots: 12,
};

test("exibe contato profissional da agenda e preserva o e-mail privado de quem cadastrou", () => {
  const result = eventForViewer(event, { userId: "visitor-id", email: "visitante@example.org" }, false);
  assert.equal(result.contactEmail, event.contactEmail);
  assert.equal(result.creatorEmail, "");
  assert.equal(result.title, event.title);
  assert.equal(result.contactName, event.contactName);
  assert.equal(result.availableSpots, 12);
  assert.equal(event.contactEmail, "contato@example.org");
  assert.equal(event.contactName, "Equipe anfitriã");
  assert.equal(event.creatorEmail, "autor@example.org");
});

test("preserva dados necessários à edição para o autor e os administradores", () => {
  for (const [user, isAdmin] of [
    [{ userId: "author-id", email: "autor@example.org" }, false],
    [{ userId: "admin-id", email: "admin@example.org" }, true],
    [{ userId: "new-author-id", email: "AUTOR@example.org" }, false],
  ] as const) {
    const result = eventForViewer(event, user, isAdmin);
    assert.equal(result.contactName, event.contactName);
    assert.equal(result.contactEmail, event.contactEmail);
    assert.equal(result.creatorEmail, event.creatorEmail);
  }
});

test("não permite que uma identidade Microsoft aposentada herde o e-mail do autor", () => {
  const result = eventForViewer(event, { userId: "microsoft:old-user", email: "autor@example.org" }, false);
  assert.equal(result.contactEmail, event.contactEmail);
  assert.equal(result.creatorEmail, "");
});
