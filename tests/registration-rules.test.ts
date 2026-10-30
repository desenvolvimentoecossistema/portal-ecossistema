import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { registrationInsert, registrationSchema } from "../lib/registration-rules.ts";

const first = { name: "Pessoa Um", email: "um@example.org", role: "Coordenação" };
const second = { name: "Pessoa Dois", email: "dois@example.org", role: "Analista" };

function fixture(capacity = 3) {
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE events (id TEXT PRIMARY KEY, registration_deadline TEXT, max_participants INTEGER);");
  db.exec("CREATE TABLE registrations (id TEXT PRIMARY KEY, event_id TEXT, name TEXT, email TEXT, organization TEXT, role TEXT, accessibility_needs TEXT, created_at TEXT);");
  db.exec("CREATE UNIQUE INDEX idx_registrations_event_email ON registrations(event_id,email);");
  db.prepare("INSERT INTO events VALUES (?,?,?)").run("event-1", "2026-12-31", capacity);
  const insert = (people: typeof first[]) => {
    const { sql, values } = registrationInsert(people, "event-1", "Motriz", "2026-11-01", "2026-11-01T10:00:00.000Z");
    return db.prepare(sql).run(...values).changes;
  };
  const count = () => (db.prepare("SELECT count(*) AS total FROM registrations").get() as { total: number }).total;
  return { db, insert, count };
}

test("a organização vem da lista e as duas pessoas têm e-mails distintos", () => {
  assert.equal(registrationSchema.safeParse({ eventId: "event-1", organization: "Outra", participants: [first] }).success, false);
  assert.equal(registrationSchema.safeParse({ eventId: "event-1", organization: "Motriz", participants: [first, { ...second, email: "UM@EXAMPLE.ORG" }] }).success, false);
  assert.equal(registrationSchema.safeParse({ eventId: "event-1", organization: "Motriz", participants: [first, second] }).success, true);
});

test("grava duas pessoas juntas e respeita o limite por organização", () => {
  const { db, insert, count } = fixture();
  try {
    assert.equal(insert([first, second]), 2);
    assert.equal(count(), 2);
    assert.equal(insert([{ name: "Pessoa Três", email: "tres@example.org", role: "Gerência" }]), 0);
    assert.equal(count(), 2);
  } finally { db.close(); }
});

test("não grava a primeira pessoa quando a segunda excede vagas ou já está inscrita", () => {
  const full = fixture(1);
  try { assert.equal(full.insert([first, second]), 0); assert.equal(full.count(), 0); } finally { full.db.close(); }
  const existing = fixture();
  try {
    assert.equal(existing.insert([first]), 1);
    assert.equal(existing.insert([second, first]), 0);
    assert.equal(existing.count(), 1);
  } finally { existing.db.close(); }
});
