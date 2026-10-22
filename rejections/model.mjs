export const labels = { in_progress: 'In progress', pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' };
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
