import test from "node:test";
import assert from "node:assert/strict";
import {isVisitorView, visitorViewKey} from "../lib/visitor-view.ts";
import {isEventOwner, eventForViewer} from "../lib/event-ownership.ts";

test("a visualização de visitante fica vinculada à conta e não é ativada por outro valor", async () => {
  const key = await visitorViewKey("google:admin");
  assert.equal(await isVisitorView(key, "google:admin"), true);
  assert.equal(await isVisitorView(key, "google:other"), false);
  assert.equal(await isVisitorView(undefined, "google:admin"), false);
  assert.equal(await isVisitorView("admin", "google:admin"), false);
});

test("visitante não herda controles de anfitrião; retornar restaura a autoria sem alterá-la", () => {
  const event = {createdByUserId: "google:admin", creatorEmail: "admin@example.org", contactName: "Anfitrião", contactEmail: "host@example.org"};
  const user = {userId: "google:admin", email: "admin@example.org"};
  assert.equal(isEventOwner(event, user), true);
  assert.equal(isEventOwner(event, {...user, visitorView: true}), false);
  assert.equal(eventForViewer(event, {...user, visitorView: true}, false).creatorEmail, "");
  assert.equal(isEventOwner(event, {...user, visitorView: false}), true);
  assert.equal(event.creatorEmail, user.email);
});
