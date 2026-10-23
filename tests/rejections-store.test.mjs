import test from 'node:test';
import assert from 'node:assert/strict';
const url = process.env.DATABASE_URL;
test('owner CLI store round-trips an entry with version checks', { skip: !url && 'DATABASE_URL not set' }, async () => {
  const { neon } = await import('@neondatabase/serverless');
  const { readEntries, upsertEntry, deleteEntry } = await import('../rejections/store.mjs');
  const sql = neon(url);
  const id = `test-${Date.now()}`;
  try {
    const saved = await upsertEntry(sql, { id, title: 'Test ask', status: 'pending', submittedDate: '2026-10-24' });
    assert.equal(saved.version, 1);
    await assert.rejects(upsertEntry(sql, { ...saved, status: 'rejected' }, 99), /changed since version/);
    await assert.rejects(upsertEntry(sql, { ...saved, id: `${id}-typo`, status: 'rejected' }, 1), /does not exist/);
    const updated = await upsertEntry(sql, { ...saved, status: 'rejected' }, 1);
    assert.equal(updated.version, 2);
    assert.equal(updated.submittedDate, '2026-10-24');
    assert.equal((await readEntries(sql)).find(entry => entry.id === id).status, 'rejected');
  } finally { await deleteEntry(sql, id); }
  assert.equal((await readEntries(sql)).some(entry => entry.id === id), false);
});
