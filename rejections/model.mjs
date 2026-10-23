export const labels = { in_progress: 'In progress', pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' };
const isDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().startsWith(value);
export function validateEntry(input) {
  const entry = { id: input.id, title: input.title, category: input.category ?? '', status: input.status, submittedDate: input.submittedDate ?? null, note: input.note ?? '' };
  if (typeof entry.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(entry.id)) throw new Error('id must be a lowercase slug');
  if (typeof entry.title !== 'string' || !entry.title.trim() || entry.title.length > 140) throw new Error('title is required (max 140 chars)');
  if (typeof entry.category !== 'string' || entry.category.length > 40) throw new Error('category must be a short string');
  if (typeof entry.note !== 'string' || entry.note.length > 1000) throw new Error('note must be a string (max 1000 chars)');
  if (!Object.hasOwn(labels, entry.status)) throw new Error(`status must be one of ${Object.keys(labels).join(', ')}`);
  if (entry.submittedDate !== null && !isDate(entry.submittedDate)) throw new Error('submittedDate must be YYYY-MM-DD or null');
  if (entry.status === 'in_progress' && entry.submittedDate !== null) throw new Error('an in_progress entry has not been submitted, so submittedDate must be null');
  return entry;
}
export function summarize(data) {
  if (!Number.isInteger(data.challenge.target) || data.challenge.target <= 0) throw new Error('Invalid target');
  const ids = new Set();
  const counts = { in_progress: 0, pending: 0, accepted: 0, rejected: 0 };
  for (const entry of data.entries) {
    if (!entry.id || ids.has(entry.id) || !Object.hasOwn(labels, entry.status)) throw new Error('Invalid or duplicate entry');
    ids.add(entry.id);
    counts[entry.status]++;
  }
  const attempts = counts.pending + counts.accepted + counts.rejected;
  return { ...counts, attempts, tracked: data.entries.length, percent: Math.min(100, attempts / data.challenge.target * 100) };
}
