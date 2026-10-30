import assert from "node:assert/strict";
import test from "node:test";
import { bootstrapAdminEmails, demoEventsEnabled } from "../lib/runtime-config.ts";
import { isSameOriginMutation } from "../lib/request-origin.ts";

test("uma réplica não herda administradores nem eventos demonstrativos", () => {
  const admins = process.env.BOOTSTRAP_ADMIN_EMAILS;
  const demos = process.env.INCLUDE_DEMO_EVENTS;
  try {
    delete process.env.BOOTSTRAP_ADMIN_EMAILS;
    delete process.env.INCLUDE_DEMO_EVENTS;
    assert.equal(bootstrapAdminEmails().size, 0);
    assert.equal(demoEventsEnabled(), false);
    process.env.BOOTSTRAP_ADMIN_EMAILS = " Admin@Example.org, outro@example.org, inválido ";
    assert.deepEqual([...bootstrapAdminEmails()], ["admin@example.org", "outro@example.org"]);
    process.env.INCLUDE_DEMO_EVENTS = "true";
    assert.equal(demoEventsEnabled(), true);
  } finally {
    if (admins === undefined) delete process.env.BOOTSTRAP_ADMIN_EMAILS;
    else process.env.BOOTSTRAP_ADMIN_EMAILS = admins;
    if (demos === undefined) delete process.env.INCLUDE_DEMO_EVENTS;
    else process.env.INCLUDE_DEMO_EVENTS = demos;
  }
});

test("escritas com cookies recusam outra origem, inclusive sites irmãos", () => {
  const url = "https://agenda.example.org/api/events";
  const request = (origin?: string) => new Request(url, { method: "POST", headers: origin ? { origin } : {} });
  assert.equal(isSameOriginMutation(request("https://agenda.example.org")), true);
  assert.equal(isSameOriginMutation(request("https://outro.example.org")), false);
  assert.equal(isSameOriginMutation(request("http://agenda.example.org")), false);
  assert.equal(isSameOriginMutation(request("null")), false);
  assert.equal(isSameOriginMutation(request()), false);
});
