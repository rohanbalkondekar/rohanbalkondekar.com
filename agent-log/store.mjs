// Goals and updates posted by agents on Rohan's behalf. One table; a goal is an entry whose kind names its period.
export class ValidationError extends Error {}
export const KINDS = ['update', 'result', 'goal-day', 'goal-week', 'goal-month'];
const toEntry = row => ({ id: row.id, createdAt: new Date(row.created_at).toISOString(), kind: row.kind, body: row.body, timeZone: row.time_zone ?? null, agent: row.agent ?? null });
// Create the table or the agent column only when a query reports it missing.
async function withSchema(sql, run) {
  try { return await run(); }
  catch (error) { if (!['42P01', '42703'].includes(error?.code)) throw error; }
  await sql`CREATE TABLE IF NOT EXISTS agent_log_entries (id bigserial PRIMARY KEY, kind text NOT NULL DEFAULT 'update', body text NOT NULL, time_zone text, created_at timestamptz NOT NULL DEFAULT now())`;
  await sql`ALTER TABLE agent_log_entries ADD COLUMN IF NOT EXISTS agent text`;
  await sql`CREATE INDEX IF NOT EXISTS agent_log_entries_created ON agent_log_entries (created_at DESC)`;
  return run();
}
function cleanBody(value) {
  if (typeof value !== 'string') throw new ValidationError('body must be a string');
  const body = value.replace(/\r\n?/g, '\n').trim();
  if (body.length > 5000) throw new ValidationError('body is longer than 5,000 characters');
  return body;
}
const cleanZone = zone => { try { return typeof zone === 'string' && zone.length <= 64 ? new Intl.DateTimeFormat('en-GB', { timeZone: zone }).resolvedOptions().timeZone : null; } catch { return null; } };
export async function readEntries(sql) {
  return (await withSchema(sql, () => sql`SELECT id::text, created_at, kind, body, time_zone, agent FROM agent_log_entries ORDER BY created_at DESC, id DESC LIMIT 1000`)).map(toEntry);
}
// Which agent wrote the entry (claude, codex, vibegrow, ...): a short lowercase name, or null.
const cleanAgent = agent => typeof agent === 'string' ? agent.toLowerCase().replace(/[^a-z0-9 ._-]/g, '').trim().slice(0, 24) || null : null;
export async function addEntry(sql, { kind = 'update', body, timeZone, agent } = {}) {
  if (!KINDS.includes(kind)) throw new ValidationError(`kind must be one of: ${KINDS.join(', ')}`);
  const text = cleanBody(body);
  if (!text) throw new ValidationError('body is empty');
  const [row] = await withSchema(sql, () => sql`INSERT INTO agent_log_entries (kind, body, time_zone, agent) VALUES (${kind}, ${text}, ${cleanZone(timeZone)}, ${cleanAgent(agent)}) RETURNING id::text, created_at, kind, body, time_zone, agent`);
  return toEntry(row);
}
// An empty body deletes the entry.
export async function editEntry(sql, id, body) {
  if (!/^\d+$/.test(String(id))) throw new ValidationError('id must be numeric');
  const text = cleanBody(body);
  const rows = await withSchema(sql, () => text
    ? sql`UPDATE agent_log_entries SET body = ${text} WHERE id = ${id}::bigint RETURNING id::text, created_at, kind, body, time_zone, agent`
    : sql`DELETE FROM agent_log_entries WHERE id = ${id}::bigint RETURNING id::text, created_at, kind, body, time_zone, agent`);
  if (rows.length !== 1) throw new ValidationError(`Entry ${id} does not exist`);
  return text ? toEntry(rows[0]) : null;
}
