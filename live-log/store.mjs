export const MERGE_WINDOW = '1 hour';
const toEntry = row => ({ id: row.id, createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString(), body: row.body });
export function cleanBody(value) {
  if (typeof value !== 'string') throw new Error('body must be a string');
  const body = value.replace(/\r\n?/g, '\n').trim();
  if (body.length > 20000) throw new Error('body is longer than 20,000 characters');
  return body;
}
export async function ensureSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS live_log_entries (id bigserial PRIMARY KEY, body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`;
  await sql`CREATE INDEX IF NOT EXISTS live_log_entries_created ON live_log_entries (created_at DESC)`;
}
export async function readEntries(sql) {
  const select = () => sql`SELECT id::text, created_at, updated_at, body FROM live_log_entries ORDER BY created_at DESC, id DESC`;
  try { return (await select()).map(toEntry); }
  catch (error) { if (error?.code !== '42P01') throw error; }
  await ensureSchema(sql);
  return (await select()).map(toEntry);
}
// A thought written within an hour of the latest entry's timestamp joins that entry, so timestamps stay at least an hour apart.
export async function appendThought(sql, input) {
  const body = cleanBody(input);
  if (!body) throw new Error('body is empty');
  await ensureSchema(sql);
  const [row] = await sql`WITH latest AS (SELECT id FROM live_log_entries WHERE created_at > now() - ${MERGE_WINDOW}::interval ORDER BY created_at DESC LIMIT 1),
    merged AS (UPDATE live_log_entries SET body = body || E'\n\n' || ${body}, updated_at = now() WHERE id IN (SELECT id FROM latest) RETURNING id::text, created_at, updated_at, body),
    inserted AS (INSERT INTO live_log_entries (body) SELECT ${body} WHERE NOT EXISTS (SELECT 1 FROM merged) RETURNING id::text, created_at, updated_at, body)
    SELECT * FROM merged UNION ALL SELECT * FROM inserted`;
  return toEntry(row);
}
export async function editEntry(sql, id, input) {
  const body = cleanBody(input);
  if (!/^\d+$/.test(String(id))) throw new Error('id must be numeric');
  const rows = body
    ? await sql`UPDATE live_log_entries SET body = ${body}, updated_at = now() WHERE id = ${id}::bigint RETURNING id::text, created_at, updated_at, body`
    : await sql`DELETE FROM live_log_entries WHERE id = ${id}::bigint RETURNING id::text, created_at, updated_at, body`;
  if (rows.length !== 1) throw new Error(`Entry ${id} does not exist`);
  return body ? toEntry(rows[0]) : null;
}
