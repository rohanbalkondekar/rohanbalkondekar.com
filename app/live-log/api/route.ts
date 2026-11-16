import { createHash, timingSafeEqual } from "node:crypto";
import { database } from "../../../lib/db";
import { appendThought, editEntry, readEntries, ValidationError, whereFrom } from "../../../live-log/store.mjs";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
// SHA-256 of the owner key. The key is 48 random characters, so the hash is safe to publish and the key works
// without a Vercel environment variable. LIVE_LOG_WRITE_TOKEN, when set, is accepted as well.
const OWNER_KEY_SHA256 = "6e0a7215481d19802453747c359ca3b9b1afbdad082cbac137ba2ed089a51a22";
const same = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);
function authorized(request: Request) {
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (given.length < 32) return false;
  return same(createHash("sha256").update(given).digest(), Buffer.from(OWNER_KEY_SHA256, "hex")) || same(Buffer.from(given), Buffer.from(process.env.LIVE_LOG_WRITE_TOKEN ?? ""));
}
// Where the owner is writing from (see whereFrom in live-log/store.mjs).
function where(request: Request, timeZone: unknown) {
  return whereFrom((name: string) => { try { return decodeURIComponent(request.headers.get(name) ?? ""); } catch { return ""; } }, timeZone);
}
type Payload = { id?: string; body?: unknown; timeZone?: unknown };
async function write(request: Request, action: (body: Payload) => Promise<unknown>) {
  if (!authorized(request)) return reply({ error: "Owner key required." }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: "Invalid JSON." }, 400); }
  try { return reply({ saved: await action(body ?? {}) }); }
  catch (error) {
    if (error instanceof ValidationError) return reply({ error: error.message }, 400);
    console.error("live-log api: write failed", error);
    return reply({ error: "Database unavailable; nothing was changed." }, 503);
  }
}
export async function GET() {
  try { return reply({ entries: await readEntries(database()) }); }
  catch (error) { console.error("live-log api: read failed", error); return reply({ error: "Live data unavailable." }, 503); }
}
export const POST = (request: Request) => write(request, ({ body, timeZone }) => appendThought(database(), body, where(request, timeZone)));
export const PATCH = (request: Request) => write(request, ({ id, body, timeZone }) => editEntry(database(), String(id ?? ""), body, where(request, timeZone)));
