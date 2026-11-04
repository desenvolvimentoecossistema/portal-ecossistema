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

test("origem pública configurada funciona atrás do proxy sem aceitar origens forjadas", () => {
  const previous = process.env.SITE_ORIGIN;
  try {
    process.env.SITE_ORIGIN = "https://portal.example.org";
    const request = (origin?: string) => new Request("https://0.0.0.0:3000/api/events", {
      method: "POST",
      headers: { ...(origin ? { origin } : {}), host: "evil.example", "x-forwarded-host": "evil.example", "x-forwarded-proto": "https" },
    });
    assert.equal(isSameOriginMutation(request("https://portal.example.org")), true);
    for (const origin of ["https://0.0.0.0:3000", "https://evil.example", "https://sibling.example.org", "http://portal.example.org", "null", undefined]) {
      assert.equal(isSameOriginMutation(request(origin)), false, String(origin));
    }
    for (const invalid of ["not-a-url", "https://portal.example.org/path", "http://portal.example.org"]) {
      process.env.SITE_ORIGIN = invalid;
      assert.equal(isSameOriginMutation(request("https://0.0.0.0:3000")), false);
    }
  } finally {
    if (previous === undefined) delete process.env.SITE_ORIGIN;
    else process.env.SITE_ORIGIN = previous;
  }
});
