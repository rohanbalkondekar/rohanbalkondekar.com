import { agentFor } from "../../../agent-log/auth.mjs";
import { database } from "../../../lib/db";
import { addEntry, editEntry, readEntries, usage, ValidationError } from "../../../agent-log/store.mjs";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });
type Payload = { id?: string; kind?: string; body?: unknown; timeZone?: unknown; meta?: unknown };
async function write(request: Request, action: (body: Payload, agent: string) => Promise<unknown>) {
  const agent = agentFor(request);
  if (!agent) return reply({ error: "Write key required." }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: "Invalid JSON." }, 400); }
  try { return reply({ saved: await action(body ?? {}, agent) }); }
  catch (error) {
    if (error instanceof ValidationError) return reply({ error: error.message }, 400);
    console.error("agent-log api: write failed", error);
    return reply({ error: "Database unavailable; nothing was changed." }, 503);
  }
}
// Anyone can read the entries. Only a keyed agent sees meta, or the usage summary at ?view=usage.
export async function GET(request: Request) {
  const keyed = !!agentFor(request);
  try {
    if (keyed && new URL(request.url).searchParams.get("view") === "usage") return reply({ usage: await usage(database()) });
    const entries = await readEntries(database());
    return reply({ entries: keyed ? entries : entries.map(({ meta: _meta, ...entry }) => entry) });
  }
  catch (error) { console.error("agent-log api: read failed", error); return reply({ error: "Live data unavailable." }, 503); }
}
// The key decides the name an entry is signed with, so one agent cannot post as another.
export const POST = (request: Request) => write(request, (payload, agent) => addEntry(database(), { ...payload, agent }));
export const PATCH = (request: Request) => write(request, ({ id, body }) => editEntry(database(), String(id ?? ""), body));
