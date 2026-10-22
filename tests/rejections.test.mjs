import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { summarize } from '../rejections/model.mjs';
const data = JSON.parse(await readFile(new URL('../rejections/data.json', import.meta.url)));
test('public seed has one unconfirmed opportunity and no fabricated attempts or outcomes', () => {
  assert.equal(data.entries.length, 1);
  assert.equal(data.entries[0].submittedDate, null);
  assert.deepEqual(summarize(data), { in_progress: 1, pending: 0, accepted: 0, rejected: 0, attempts: 0, tracked: 1, percent: 0 });
});
test('counts actual asks, excludes preparation, and never treats pending as rejected', () => {
  const entries = ['in_progress', 'pending', 'accepted', 'rejected'].map((status, id) => ({ id: String(id), status }));
  assert.deepEqual(summarize({ challenge: { target: 1000 }, entries }), { in_progress: 1, pending: 1, accepted: 1, rejected: 1, attempts: 3, tracked: 4, percent: 0.3 });
});
test('duplicate IDs and unknown outcomes fail rather than inflate counters', () => {
  assert.throws(() => summarize({ ...data, entries: [...data.entries, ...data.entries] }));
  assert.throws(() => summarize({ ...data, entries: [{ id: 'unknown', status: 'no_response' }] }));
});
test('build renders useful content without JavaScript or a runtime data fetch', async () => {
  await import('../scripts/render-rejections.mjs');
  const html = await readFile(new URL('../rejections/index.html', import.meta.url), 'utf8');
  assert.match(html, /0<\/strong> \/ 1,000 confirmed attempts/);
  assert.match(html, /Apply to Y Combinator/);
  assert.match(html, /in progress/);
  assert.doesNotMatch(html, /<script|@font-face|rel="preload"/);
});
