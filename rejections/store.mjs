import seed from './data.json' with { type: 'json' };
import { validateEntry } from './model.mjs';
export const challenge = seed.challenge;
const toEntry = row => ({ id: row.id, title: row.title, category: row.category, status: row.status, submittedDate: row.submitted_date, note: row.note, version: row.version });
export async function ensureSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS rejection_entries (id text PRIMARY KEY, title text NOT NULL, category text NOT NULL DEFAULT '', status text NOT NULL CHECK (status IN ('in_progress', 'pending', 'accepted', 'rejected')), submitted_date date, note text NOT NULL DEFAULT '', version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`;
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM rejection_entries`;
  if (count === 0) for (const entry of seed.entries) await upsertEntry(sql, entry);
}
export async function readEntries(sql) {
  const select = () => sql`SELECT id, title, category, status, submitted_date::text AS submitted_date, note, version FROM rejection_entries ORDER BY created_at, id`;
  try { return (await select()).map(toEntry); }
  catch (error) { if (error?.code !== '42P01') throw error; }
  await ensureSchema(sql);
  return (await select()).map(toEntry);
}
export async function upsertEntry(sql, input, expectedVersion = null) {
  const entry = validateEntry(input);
  const rows = expectedVersion === null
    ? await sql`INSERT INTO rejection_entries (id, title, category, status, submitted_date, note) VALUES (${entry.id}, ${entry.title}, ${entry.category}, ${entry.status}, ${entry.submittedDate}, ${entry.note})
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, status = EXCLUDED.status, submitted_date = EXCLUDED.submitted_date, note = EXCLUDED.note, version = rejection_entries.version + 1, updated_at = now()
        RETURNING id, title, category, status, submitted_date::text AS submitted_date, note, version`
    : await sql`UPDATE rejection_entries SET title = ${entry.title}, category = ${entry.category}, status = ${entry.status}, submitted_date = ${entry.submittedDate}, note = ${entry.note}, version = version + 1, updated_at = now()
        WHERE id = ${entry.id} AND version = ${expectedVersion} RETURNING id, title, category, status, submitted_date::text AS submitted_date, note, version`;
  if (rows.length !== 1) throw new Error(`Entry ${entry.id} changed since version ${expectedVersion} or does not exist; re-read it and retry`);
  return toEntry(rows[0]);
}
export async function deleteEntry(sql, id) {
  const rows = await sql`DELETE FROM rejection_entries WHERE id = ${id} RETURNING id`;
  return rows.length === 1;
}
