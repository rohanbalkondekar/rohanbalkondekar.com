import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePost, renderPost } from '../blog/posts.mjs';
import { renderPage } from '../live-log/render.mjs';
import { cleanBody } from '../live-log/store.mjs';
test('blog frontmatter is required and parsed', () => {
  const post = parsePost('a', '---\ntitle: "Hi: there"\ndate: 2026-11-07\ndraft: true\n---\nBody **bold**');
  assert.deepEqual([post.title, post.date, post.draft], ['Hi: there', '2026-11-07', true]);
  assert.match(renderPost(post), /<strong>bold<\/strong>/);
  assert.throws(() => parsePost('b', 'no frontmatter'), /needs "title"/);
  assert.match(renderPost(post), /<link rel="canonical" href="https:\/\/rohanbalkondekar\.com\/blog\/a">/);
});
test('imported posts point canonical at the original', () => {
  const html = renderPost(parsePost('m', '---\ntitle: M\ndate: 2024-03-16\ncanonical: https://medium.com/@rohanbalkondekar/m-8d8794266315\n---\nBody'));
  assert.match(html, /<link rel="canonical" href="https:\/\/medium\.com\/@rohanbalkondekar\/m-8d8794266315">/);
  assert.match(html, /Originally published on Medium/);
  assert.equal(parsePost('x', '---\ntitle: X\ndate: 2024-01-01\ncanonical: javascript:alert(1)\n---\n').canonical, undefined);
});
test('live log groups by IST day and escapes raw HTML', () => {
  const html = renderPage([
    { id: '2', createdAt: '2026-11-07T20:00:00Z', body: '<script>x</script> late' },
    { id: '1', createdAt: '2026-11-07T17:00:00Z', body: 'evening' },
  ]);
  assert.equal((html.match(/<section class="day">/g) ?? []).length, 2); // 01:30 on the 8th and 22:30 on the 7th, IST
  assert.match(html, /Sunday, 8 November 2026[\s\S]*01:30[\s\S]*Saturday, 7 November 2026[\s\S]*22:30/);
  assert.doesNotMatch(html, /<script>x<\/script>/);
  assert.equal(cleanBody('  a\r\nb  '), 'a\nb');
});
const url = process.env.DATABASE_URL;
test('thoughts within an hour join the latest entry', { skip: !url && 'DATABASE_URL not set' }, async t => {
  const { neon } = await import('@neondatabase/serverless');
  const { appendThought, editEntry, readEntries } = await import('../live-log/store.mjs');
  const sql = neon(url);
  if ((await readEntries(sql)).some(entry => Date.now() - Date.parse(entry.createdAt) < 3600e3)) return t.skip('a real entry from the last hour would absorb the test thought');
  const [{ id: oldId }] = await sql`INSERT INTO live_log_entries (body, created_at) VALUES ('old', now() - interval '2 hours') RETURNING id::text AS id`;
  let id;
  try {
    const first = await appendThought(sql, 'test first');
    id = first.id;
    assert.notEqual(first.id, oldId);
    const second = await appendThought(sql, 'test second');
    assert.equal(second.id, first.id);
    assert.equal(second.body, 'test first\n\ntest second');
    assert.equal((await editEntry(sql, id, 'edited')).body, 'edited');
  } finally {
    if (id) await editEntry(sql, id, '');
    await editEntry(sql, oldId, '');
  }
  assert.equal((await readEntries(sql)).some(entry => [id, oldId].includes(entry.id)), false);
});
