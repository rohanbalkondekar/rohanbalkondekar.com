import { timingSafeEqual } from "node:crypto";
import { database } from "../../../lib/db";
import { appendThought, editEntry, readEntries } from "../../../live-log/store.mjs";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
function authorized(request: Request) {
  const given = Buffer.from(request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "");
  const expected = Buffer.from(process.env.LIVE_LOG_WRITE_TOKEN ?? "");
  return expected.length >= 32 && given.length === expected.length && timingSafeEqual(given, expected);
}
async function write(request: Request, action: (body: { id?: string; body?: unknown }) => Promise<unknown>) {
  if (!authorized(request)) return reply({ error: "Owner key required." }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: "Invalid JSON." }, 400); }
  try { return reply({ saved: await action(body ?? {}) }); }
  catch (error) {
    const message = (error as Error).message;
    if (/^(body|id|Entry)/.test(message)) return reply({ error: message }, 400);
    console.error("live-log api: write failed", error);
    return reply({ error: "Database unavailable; nothing was changed." }, 503);
  }
}
export async function GET() {
  try { return reply({ entries: await readEntries(database()) }); }
  catch (error) { console.error("live-log api: read failed", error); return reply({ error: "Live data unavailable." }, 503); }
}
export const POST = (request: Request) => write(request, ({ body }) => appendThought(database(), body));
export const PATCH = (request: Request) => write(request, ({ id, body }) => editEntry(database(), String(id ?? ""), body ?? ""));
