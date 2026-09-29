import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { once } from "node:events";
import jwt from "jsonwebtoken";
import { createApp } from "./app.js";
import { createDatabase } from "./database.js";

const secret = "test-only-secret";
const dbPath = path.join(os.tmpdir(), `relay-api-test-${process.pid}.sqlite`);
let db;
let server;
let baseUrl;

before(async () => {
  db = await createDatabase(dbPath);
  server = createApp({
    db,
    config: { jwtSecret: secret, clientOrigin: "http://localhost:5173" },
  }).listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  db?.close();
  fs.rmSync(dbPath, { force: true });
});

test("API protects ticket ownership and validates admin filters", async () => {
  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  assert.equal((await fetch(`${baseUrl}/tickets`)).status, 401);

  const register = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Sample User",
      email: "user@example.com",
      password: "password123",
    }),
  });
  assert.equal(register.status, 201);
  const { token } = await register.json();

  const created = await fetch(`${baseUrl}/tickets`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      title: "Cannot access account",
      description: "Sign-in fails after a password reset.",
      category: "Account",
      priority: "High",
    }),
  });
  assert.equal(created.status, 201);
  const { ticket } = await created.json();

  const secondRegister = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Second User",
      email: "second@example.com",
      password: "password123",
    }),
  });
  const secondToken = (await secondRegister.json()).token;
  const otherUserTicket = await fetch(`${baseUrl}/tickets/${ticket.id}`, {
    headers: { authorization: `Bearer ${secondToken}` },
  });
  assert.equal(otherUserTicket.status, 404);

  const adminToken = jwt.sign({ id: 99, role: "admin" }, secret);
  const invalidFilter = await fetch(`${baseUrl}/admin/tickets?status=bogus`, {
    headers: { authorization: `Bearer ${adminToken}` },
  });
  assert.equal(invalidFilter.status, 400);

  const filteredTickets = await fetch(
    `${baseUrl}/admin/tickets?priority=High`,
    { headers: { authorization: `Bearer ${adminToken}` } },
  );
  assert.equal(filteredTickets.status, 200);
  assert.equal((await filteredTickets.json()).tickets.length, 1);
});
