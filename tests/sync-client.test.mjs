import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
const source = await readFile(new URL("../app/workout/workout-guide.tsx", import.meta.url), "utf8");
function compile(start, end, context) {
  const code = source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
  vm.runInNewContext(ts.transpile(code, { target: ts.ScriptTarget.ES2022 }), context);
}
test("sync uploads old device records, preserves remote records, retries failure and verifies backup", async () => {
  const local = [{ id: "local", logs: [] }]; const remote = [{ id: "remote", logs: [] }];
  let draft = { id: "active", updatedAt: "2026-09-01T00:00:00.000Z" }; let remoteDraft = null;
  let offline = true;
  const context = {
    APP_BASE_PATH: "/workout", AbortSignal, syncHeaders: () => ({}),
    readHistory: async () => [...local], readCloudHistory: async () => [...remote], readActiveWorkout: async () => draft,
    writeCloudSession: async (_, record) => { if (offline) throw Error("offline"); if (record.id === "active") remoteDraft = record; else remote.push(record); },
    fetch: async () => ({ ok: true, json: async () => ({ sessions: [...remote], draft: remoteDraft }) }),
    cloudHistorySchema: { parse: (value) => value },
    writeSession: async (record) => { if (!local.some((v) => v.id === record.id)) local.push(record); },
    writeActiveWorkout: async (record) => { draft = record; },
  };
  compile("async function syncHistoryWithCloud", "\nfunction getPlanExercises", context);
  await assert.rejects(context.syncHistoryWithCloud("account"), /offline/);
  assert.equal(local.length, 1, "failed upload keeps device records");
  offline = false;
  assert.equal((await context.syncHistoryWithCloud("account")).length, 2);
  assert.equal(remote.length, 2);
  await context.syncHistoryWithCloud("account");
  assert.equal(remote.length, 2, "retry does not duplicate uploads");
  assert.deepEqual(remoteDraft, draft);
});
test("legacy migration preserves originals and imports only into the first account", async () => {
  const values = new Map(); const stores = new Map([["rohan-gym-guide", [{ id: "existing" }]]]);
  let user = "first";
  const context = {
    DB_NAME: "rohan-gym-guide", accountId: "", APP_BASE_PATH: "/workout", SYNC_KEY_STORAGE: "legacy-key", AbortSignal,
    window: { localStorage: { getItem: (k) => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: (k) => values.delete(k) } },
    fetch: async () => ({ ok: true, json: async () => ({ account: { id: user } }) }),
    readHistory: async (name = context.DB_NAME) => stores.get(name) ?? [], readActiveWorkout: async () => null,
    writeSession: async (record) => stores.set(context.DB_NAME, [...(stores.get(context.DB_NAME) ?? []).filter((v) => v.id !== record.id), record]),
    writeActiveWorkout: async () => {},
  };
  compile("async function initializeStorage", "\nfunction isExerciseId", context);
  await context.initializeStorage();
  assert.equal(stores.get("rohan-gym-guide-account-first")[0].id, "existing");
  assert.equal(stores.get("rohan-gym-guide")[0].id, "existing", "original retained");
  stores.get("rohan-gym-guide").push({ id: "after-sign-out" });
  await context.initializeStorage();
  assert.equal(stores.get("rohan-gym-guide-account-first").length, 2, "later device-only records are also imported");
  user = "second"; context.DB_NAME = "rohan-gym-guide";
  await context.initializeStorage();
  assert.equal(stores.get("rohan-gym-guide-account-second"), undefined, "other account cannot acquire legacy history");
});
