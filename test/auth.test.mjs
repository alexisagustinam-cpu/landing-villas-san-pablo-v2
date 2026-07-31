import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBasicAuthHeader, hashPassword, isAuthorized } from "../auth-core.mjs";

const username = "villas";
const password = "test-only-pass";
const expectedHash = await hashPassword(password);
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const gate = readFileSync(new URL("../access-gate.js", import.meta.url), "utf8");
const middleware = readFileSync(new URL("../middleware.js", import.meta.url), "utf8");

test("rejects requests without credentials", async () => {
  assert.equal(await isAuthorized(null, username, expectedHash), false);
});

test("rejects a wrong username or password", async () => {
  assert.equal(await isAuthorized(createBasicAuthHeader("otro", password), username, expectedHash), false);
  assert.equal(await isAuthorized(createBasicAuthHeader(username, "incorrecta"), username, expectedHash), false);
});

test("accepts the configured username and password", async () => {
  assert.equal(await isAuthorized(createBasicAuthHeader(username, password), username, expectedHash), true);
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
