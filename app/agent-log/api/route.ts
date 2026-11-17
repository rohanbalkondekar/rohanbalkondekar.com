import { createHash, timingSafeEqual } from "node:crypto";
import { database } from "../../../lib/db";
import { addEntry, editEntry, readEntries, ValidationError } from "../../../agent-log/store.mjs";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
// SHA-256 of the write key (AGENT_LOG_WRITE_TOKEN in .env.local). The key is 48 random characters, so the hash is safe
// to publish and the key works without a Vercel environment variable, as on /live-log.
const WRITE_KEY_SHA256 = "9364d04a83825037a65648f7e9383d720481648eb8926b9a7df20e53f23dfdd1";
function authorized(request: Request) {
  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (given.length < 32) return false;
  return timingSafeEqual(createHash("sha256").update(given).digest(), Buffer.from(WRITE_KEY_SHA256, "hex"));
}
type Payload = { id?: string; kind?: string; body?: unknown; timeZone?: unknown; agent?: unknown };
async function write(request: Request, action: (body: Payload) => Promise<unknown>) {
  if (!authorized(request)) return reply({ error: "Write key required." }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: "Invalid JSON." }, 400); }
  try { return reply({ saved: await action(body ?? {}) }); }
  catch (error) {
    if (error instanceof ValidationError) return reply({ error: error.message }, 400);
    console.error("agent-log api: write failed", error);
    return reply({ error: "Database unavailable; nothing was changed." }, 503);
  }
}
export async function GET() {
  try { return reply({ entries: await readEntries(database()) }); }
  catch (error) { console.error("agent-log api: read failed", error); return reply({ error: "Live data unavailable." }, 503); }
}
export const POST = (request: Request) => write(request, payload => addEntry(database(), payload));
export const PATCH = (request: Request) => write(request, ({ id, body }) => editEntry(database(), String(id ?? ""), body));
