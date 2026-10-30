import assert from "node:assert/strict";
import test from "node:test";
import { verifyIdentityToken } from "../lib/oauth-tokens.ts";
import { challenge, emailIsAllowed, safeReturnPath } from "../lib/oauth-config.ts";
import { isEventOwner } from "../lib/event-ownership.ts";

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");

test("confere assinatura, nonce, validade e domínio Workspace dos tokens Google", async () => {
  const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const keys = async () => ({ keys: [{ ...jwk, kid: "key-1", alg: "RS256", use: "sig" }] });
  const sign = async (payload: object) => {
    const signed = `${encode({ alg: "RS256", kid: "key-1" })}.${encode(payload)}`;
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(signed));
    return `${signed}.${Buffer.from(signature).toString("base64url")}`;
  };
  const now = Math.floor(Date.now() / 1000);
  const base = { aud: "client-123", nonce: "nonce-123", sub: "account-123", email: "Pessoa@Exemplo.org", iat: now, exp: now + 120 };
  const google = await sign({ ...base, iss: "https://accounts.google.com", email_verified: true });
  assert.deepEqual(await verifyIdentityToken(google, "google", "client-123", "nonce-123", [], keys), { userId: "google:account-123", email: "pessoa@exemplo.org", displayName: "pessoa@exemplo.org" });
  assert.equal(await verifyIdentityToken(google, "google", "client-123", "different-nonce", [], keys), null);
  assert.equal(await verifyIdentityToken(await sign({ ...base, iss: "https://accounts.google.com", email_verified: false }), "google", "client-123", "nonce-123", [], keys), null);
  assert.equal(await verifyIdentityToken(await sign({ ...base, iss: "https://accounts.google.com", email_verified: true, exp: now - 1 }), "google", "client-123", "nonce-123", [], keys), null);
  const [header, , signature] = google.split(".");
  assert.equal(await verifyIdentityToken(`${header}.${encode({ ...base, iss: "https://accounts.google.com", email_verified: true, email: "intruso@exemplo.org" })}.${signature}`, "google", "client-123", "nonce-123", [], keys), null);
  assert.ok(await verifyIdentityToken(google, "google", "client-123", "nonce-123", ["parceira.org"], keys, ["pessoa@exemplo.org"]));
  assert.equal(await verifyIdentityToken(google, "google", "client-123", "nonce-123", ["parceira.org"], keys, ["outra@exemplo.org"]),null);
  const managed = await sign({ ...base, iss: "https://accounts.google.com", email_verified: true, hd: "exemplo.org" });
  assert.ok(await verifyIdentityToken(managed, "google", "client-123", "nonce-123", ["exemplo.org"], keys));
  assert.equal(await verifyIdentityToken(google, "google", "client-123", "nonce-123", ["exemplo.org"], keys), null);
  assert.equal(await verifyIdentityToken(managed, "google", "client-123", "nonce-123", ["outro.org"], keys), null);
  assert.equal(await verifyIdentityToken(await sign({ ...base, iss: "https://accounts.google.com", email_verified: true, hd: "outro.org" }), "google", "client-123", "nonce-123", ["outro.org"], keys), null);
  assert.equal(await verifyIdentityToken(await sign({ ...base, iss: "https://login.microsoftonline.com/tenant/v2.0" }), "google", "client-123", "nonce-123", [], keys), null);
});

test("restringe retornos, e-mails e preserva a edição ao trocar de login", async () => {
  process.env.AUTH_ALLOWED_EMAILS = "pessoa@exemplo.org";
  process.env.AUTH_ALLOWED_DOMAINS = "parceira.org";
  assert.equal(emailIsAllowed("Pessoa@Exemplo.org"), true);
  assert.equal(emailIsAllowed("alguem@parceira.org"), true);
  assert.equal(emailIsAllowed("alguem@parceira.org.evil"), false);
  assert.equal(safeReturnPath("//evil.test/path"), "/");
  assert.equal(safeReturnPath("/auth/callback/google"), "/");
  assert.equal(safeReturnPath("/agenda?filtro=abc"), "/agenda?filtro=abc");
  assert.equal((await challenge("a".repeat(43))).length, 43);
  assert.equal(isEventOwner({ createdByUserId: "old-id", creatorEmail: "pessoa@exemplo.org" }, { userId: "new-oauth-id", email: "Pessoa@Exemplo.org" }), true);
  assert.equal(isEventOwner({ createdByUserId: "old-id", creatorEmail: "pessoa@exemplo.org" }, { userId: "microsoft:12345678-1234-1234-1234-123456789abc:object-123", email: "Pessoa@Exemplo.org" }), false);
  delete process.env.AUTH_ALLOWED_EMAILS;
  delete process.env.AUTH_ALLOWED_DOMAINS;
});

test("a lista institucional aceita apenas os oito domínios exatos", () => {
  const domains = ["fundacaolemann.org.br", "megaedu.org.br", "motriz.org", "abemcomum.org", "novaescola.org.br", "institutoreuna.org.br", "institutotrajetorias.org.br", "centrolemann.org.br"];
  delete process.env.AUTH_ALLOWED_EMAILS;
  process.env.AUTH_ALLOWED_DOMAINS = domains.join(",");
  try {
    for (const domain of domains) {
      assert.equal(emailIsAllowed(`pessoa@${domain}`), true);
      assert.equal(emailIsAllowed(`pessoa@${domain}.evil.test`), false);
      assert.equal(emailIsAllowed(`pessoa@sub.${domain}`), false);
    }
    assert.equal(emailIsAllowed("pessoa@motriz.org.br"), false);
    assert.equal(emailIsAllowed("pessoa@gmail.com"), false);
  } finally {
    delete process.env.AUTH_ALLOWED_DOMAINS;
  }
});
