import { timingSafeEqual } from "node:crypto";
import { database } from "../../../../lib/db";
import { summarize, validateEntry } from "../../../../rejections/model.mjs";
import { challenge, deleteEntry, readEntries, upsertEntry } from "../../../../rejections/store.mjs";
export const dynamic = "force-dynamic";
const headers = { "cache-control": "no-store" };
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
function failed(error: unknown) {
  if (/changed since version/.test((error as Error).message)) return reply({ error: (error as Error).message }, 409);
  console.error("rejections api: write failed", error);
  return reply({ error: "Database unavailable; nothing was changed." }, 503);
}
function authorized(request: Request) {
  const token = process.env.REJECTIONS_WRITE_TOKEN ?? "";
  const given = Buffer.from(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
  const expected = Buffer.from(token);
  return expected.length >= 32 && given.length === expected.length && timingSafeEqual(given, expected);
}
async function snapshot() {
  const entries = await readEntries(database());
  return { challenge, summary: summarize({ challenge, entries }), entries };
}
export async function GET() {
  try { return reply(await snapshot()); }
  catch (error) { console.error("rejections api: read failed", error); return reply({ error: "Live data unavailable." }, 503); }
}
export async function POST(request: Request) {
  if (!authorized(request)) return reply({ error: "Owner token required." }, 401);
  let body: { entry?: unknown; expectedVersion?: number };
  try { body = await request.json(); } catch { return reply({ error: "Invalid JSON." }, 400); }
  if (!body || typeof body !== "object" || !body.entry) return reply({ error: 'Send {"entry": {...}, "expectedVersion"?: n}.' }, 400);
  const version = body.expectedVersion ?? null;
  if (version !== null && !Number.isInteger(version)) return reply({ error: "expectedVersion must be an integer." }, 400);
  let entry;
  try { entry = validateEntry(body.entry); } catch (error) { return reply({ error: (error as Error).message }, 400); }
  try { return reply({ saved: await upsertEntry(database(), entry, version), ...(await snapshot()) }); }
  catch (error) { return failed(error); }
}
export async function DELETE(request: Request) {
  if (!authorized(request)) return reply({ error: "Owner token required." }, 401);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return reply({ error: "Pass ?id=<entry id>." }, 400);
  try { return reply({ deleted: await deleteEntry(database(), id), ...(await snapshot()) }); }
  catch (error) { return failed(error); }
}
