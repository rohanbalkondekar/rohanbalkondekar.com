import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { summarize, validateEntry } from '../rejections/model.mjs';
import { renderPage } from '../rejections/render.mjs';
const data = JSON.parse(await readFile(new URL('../rejections/data.json', import.meta.url)));
test('public seed holds one real rejection, two unconfirmed asks, and no fabricated dates', () => {
  assert.equal(data.entries.length, 3);
  assert.ok(data.entries.every(entry => entry.submittedDate === null));
  assert.deepEqual(summarize(data), { in_progress: 2, pending: 0, accepted: 0, rejected: 1, attempts: 1, tracked: 3, percent: 0.1 });
});
test('counts actual asks, excludes preparation, and never treats pending as rejected', () => {
  const entries = ['in_progress', 'pending', 'accepted', 'rejected'].map((status, id) => ({ id: String(id), status }));
  assert.deepEqual(summarize({ challenge: { target: 1000 }, entries }), { in_progress: 1, pending: 1, accepted: 1, rejected: 1, attempts: 3, tracked: 4, percent: 0.3 });
});
test('duplicate IDs and unknown outcomes fail rather than inflate counters', () => {
  assert.throws(() => summarize({ ...data, entries: [...data.entries, ...data.entries] }));
  assert.throws(() => summarize({ ...data, entries: [{ id: 'unknown', status: 'no_response' }] }));
});
test('entry validation blocks invented submissions and malformed writes', () => {
  const base = { id: 'ask-001', title: 'Ask', status: 'pending', submittedDate: '2026-10-24' };
  assert.deepEqual(validateEntry(base), { ...base, category: '', note: '' });
  assert.throws(() => validateEntry({ ...base, status: 'in_progress' }), /in_progress/);
  assert.throws(() => validateEntry({ ...base, status: 'ghosted' }), /status/);
  assert.throws(() => validateEntry({ ...base, submittedDate: '24/10/2026' }), /submittedDate/);
  assert.throws(() => validateEntry({ ...base, submittedDate: '2026-02-30' }), /submittedDate/);
  assert.throws(() => validateEntry({ ...base, id: 'Bad Id' }), /id/);
  assert.throws(() => validateEntry({ ...base, title: '' }), /title/);
  assert.ok(data.entries.every(entry => validateEntry(entry)));
});
test('build renders useful content without JavaScript or a runtime data fetch', async () => {
  await import('../scripts/render-rejections.mjs');
  const html = await readFile(new URL('../rejections/index.html', import.meta.url), 'utf8');
  assert.equal(html, renderPage(data));
  assert.match(html, /1<small> \/ 1,000<\/small>/);
  assert.match(html, /Apply to Y Combinator/);
  assert.match(html, /2 in progress/);
  assert.match(html, /<details><summary>/);
  assert.doesNotMatch(html, /<details open|Live data unavailable/);
  assert.doesNotMatch(html, /<script|@font-face|rel="preload"/);
});
test('fallback rendering labels the snapshot as stale and escapes entry text', () => {
  const html = renderPage({ ...data, entries: [{ id: 'x', title: '<b>x</b>', status: 'rejected', submittedDate: '2026-10-23', note: 'n' }] }, { stale: true });
  assert.match(html, /Live data unavailable/);
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.match(html, /Asked 23 Oct 2026/);
  assert.doesNotMatch(renderPage(data), /class="meta"|unknown/);
});
