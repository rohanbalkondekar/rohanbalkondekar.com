export const MERGE_WINDOW = '1 hour';
// Bad input from the client (HTTP 400), as opposed to a database failure.
export class ValidationError extends Error {}
// Create the table or new columns only when a query reports them missing.
async function withSchema(sql, run) {
  try { return await run(); }
  catch (error) { if (!['42P01', '42703'].includes(error?.code)) throw error; }
  await ensureSchema(sql);
  return run();
}
const toEntry = row => ({ id: row.id, createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString(), body: row.body,
  timeZone: row.time_zone ?? null, place: row.place ?? null, editedTimeZone: row.edited_time_zone ?? null, editedPlace: row.edited_place ?? null });
const COLUMNS = 'id::text, created_at, updated_at, body, time_zone, place, edited_time_zone, edited_place';
// Where an entry was written: the device's IANA time zone and a short place name; invalid input becomes null.
export function cleanWhere({ timeZone, place } = {}) {
  let zone = null;
  try { if (typeof timeZone === 'string' && timeZone.length <= 64) zone = new Intl.DateTimeFormat('en-GB', { timeZone }).resolvedOptions().timeZone; } catch {}
  const name = typeof place === 'string' ? place.replace(/[<>]/g, '').replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, 80) : '';
  return { timeZone: zone, place: name || null };
}
export function cleanBody(value) {
  if (typeof value !== 'string') throw new ValidationError('body must be a string');
  const body = value.replace(/\r\n?/g, '\n').trim();
  if (body.length > 20000) throw new ValidationError('body is longer than 20,000 characters');
  return body;
}
// The browser's time zone, plus Vercel's IP city when it is in that same zone (a VPN can put the IP elsewhere).
// Zones are compared by canonical name, so aliases match (browsers may say Asia/Calcutta where Vercel says Asia/Kolkata).
const canonicalZone = zone => { try { return new Intl.DateTimeFormat('en-GB', { timeZone: zone }).resolvedOptions().timeZone; } catch { return null; } };
const renamed = { Calcutta: 'Kolkata', Saigon: 'Ho Chi Minh City', Kiev: 'Kyiv', Rangoon: 'Yangon', Katmandu: 'Kathmandu' };
export const cityOf = zone => (city => renamed[city] ?? city)(zone.split('/').pop().replace(/_/g, ' '));
export function whereFrom(header, timeZone) {
  const ipZone = header('x-vercel-ip-timezone'), zone = typeof timeZone === 'string' && canonicalZone(timeZone) ? timeZone : ipZone;
  const city = header('x-vercel-ip-city'), sameZone = !!canonicalZone(zone) && canonicalZone(ipZone) === canonicalZone(zone);
  return { timeZone: zone, place: city && sameZone ? city : canonicalZone(zone) ? cityOf(zone) : undefined };
}
export async function ensureSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS live_log_entries (id bigserial PRIMARY KEY, body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`;
  await sql`CREATE INDEX IF NOT EXISTS live_log_entries_created ON live_log_entries (created_at DESC)`;
  await sql`ALTER TABLE live_log_entries ADD COLUMN IF NOT EXISTS time_zone text, ADD COLUMN IF NOT EXISTS place text, ADD COLUMN IF NOT EXISTS edited_time_zone text, ADD COLUMN IF NOT EXISTS edited_place text`;
}
export async function readEntries(sql) {
  return (await withSchema(sql, () => sql.query(`SELECT ${COLUMNS} FROM live_log_entries ORDER BY created_at DESC, id DESC`))).map(toEntry);
}
// A thought written within an hour of the latest entry's timestamp joins that entry, so timestamps stay at least an hour apart.
export async function appendThought(sql, input, where = {}) {
  const body = cleanBody(input);
  if (!body) throw new ValidationError('body is empty');
  const { timeZone, place } = cleanWhere(where);
  const [row] = await withSchema(sql, () => sql`WITH latest AS (SELECT id FROM live_log_entries WHERE created_at > now() - ${MERGE_WINDOW}::interval ORDER BY created_at DESC LIMIT 1),
    merged AS (UPDATE live_log_entries SET body = body || E'\n\n' || ${body}, updated_at = now() WHERE id IN (SELECT id FROM latest)
      RETURNING id::text, created_at, updated_at, body, time_zone, place, edited_time_zone, edited_place),
    inserted AS (INSERT INTO live_log_entries (body, time_zone, place) SELECT ${body}, ${timeZone}, ${place} WHERE NOT EXISTS (SELECT 1 FROM merged)
      RETURNING id::text, created_at, updated_at, body, time_zone, place, edited_time_zone, edited_place)
    SELECT * FROM merged UNION ALL SELECT * FROM inserted`);
  return toEntry(row);
}
export async function editEntry(sql, id, input, where = {}) {
  const body = cleanBody(input);
  if (!/^\d+$/.test(String(id))) throw new ValidationError('id must be numeric');
  const { timeZone, place } = cleanWhere(where);
  const rows = await withSchema(sql, () => body
    ? sql`UPDATE live_log_entries SET body = ${body}, updated_at = now(), edited_time_zone = ${timeZone}, edited_place = ${place} WHERE id = ${id}::bigint
        RETURNING id::text, created_at, updated_at, body, time_zone, place, edited_time_zone, edited_place`
    : sql`DELETE FROM live_log_entries WHERE id = ${id}::bigint RETURNING id::text, created_at, updated_at, body, time_zone, place, edited_time_zone, edited_place`);
  if (rows.length !== 1) throw new ValidationError(`Entry ${id} does not exist`);
  return body ? toEntry(rows[0]) : null;
}
