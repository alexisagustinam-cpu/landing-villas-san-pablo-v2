import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBasicAuthHeader, hashPassword, isAuthorized } from "../auth-core.mjs";

const username = "villas";
const password = "test-only-pass";
const testPasswordHash = await hashPassword(password);
const configuredHash = "fcccb441e5ee7e85f299907b7d32127a6585c9c6fc9d5896d519426ab65ad564";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const gate = readFileSync(new URL("../access-gate.js", import.meta.url), "utf8");
const middleware = readFileSync(new URL("../middleware.js", import.meta.url), "utf8");

test("rejects requests without credentials", async () => {
  assert.equal(await isAuthorized(null, username, testPasswordHash), false);
});

test("rejects a wrong username or password", async () => {
  assert.equal(await isAuthorized(createBasicAuthHeader("otro", password), username, testPasswordHash), false);
  assert.equal(await isAuthorized(createBasicAuthHeader(username, "incorrecta"), username, testPasswordHash), false);
});

test("accepts the configured username and password", async () => {
  assert.equal(await isAuthorized(createBasicAuthHeader(username, password), username, testPasswordHash), true);
});

test("uses the configured access hash consistently without exposing the password", () => {
  assert.match(gate, new RegExp(configuredHash));
  assert.match(middleware, new RegExp(configuredHash));
  assert.doesNotMatch(gate, /sp2026/);
  assert.doesNotMatch(middleware, /sp2026/);
});

test("ships a no-flash access gate for GitHub Pages", () => {
  assert.match(html, /<html lang="es" class="auth-pending">/);
  assert.match(html, /id="access-form"/);
  assert.match(html, /src="access-gate\.js"/);
  assert.match(gate, /crypto\.subtle\.digest\("SHA-256"/);
  assert.doesNotMatch(gate, /VSP-Llave/);
});

test("ships Basic Auth middleware for Vercel without plaintext credentials", () => {
  assert.match(middleware, /WWW-Authenticate/);
  assert.match(middleware, /isAuthorized/);
  assert.doesNotMatch(middleware, /VSP-Llave/);
});
