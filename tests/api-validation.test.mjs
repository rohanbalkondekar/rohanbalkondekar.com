import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import { z } from "zod";
const source = (await readFile(new URL("../app/workout/api/workouts/route.ts", import.meta.url), "utf8")).replace(/^import .*;\n/gm, "");
test("workout API rejects unauthenticated, cross-account, CSRF and malformed writes before storage", async () => {
  let user = null; const writes = [];
  const context = {
    exports: {}, z, Response, Date,
    auth: { getSession: async () => ({ data: user ? { user: { id: user } } : null }) },
    database: () => async (_, ...values) => { writes.push(values); return []; },
  };
  vm.runInNewContext(ts.transpile(source, { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }), context);
  const api = context.exports;
  assert.equal((await api.GET(new Request("https://example.test/workout/api/workouts"))).status, 401);
  user = "account-one";
  const headers = { "x-workout-account": "account-two", "x-workout-client": "1" };
  const post = (body, h = headers) => api.POST(new Request("https://example.test/workout/api/workouts", { method: "POST", headers: h, body }));
  assert.equal((await post("{}")).status, 401);
  headers["x-workout-account"] = user;
  assert.equal((await post("{}", { "x-workout-account": user })).status, 403);
  assert.equal((await post("{")).status, 400);
  assert.equal((await post("{}")).status, 400);
  assert.equal((await post("x".repeat(100001))).status, 413);
  assert.equal(writes.length, 0);
  const record = { id: "session-one", planId: "A", endedAt: new Date().toISOString(), logs: [] };
  assert.equal((await post(JSON.stringify(record))).status, 201);
  assert.equal(writes[0][0], user, "storage owner always comes from the verified session");
});
