import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePost, renderPost } from '../blog/posts.mjs';
import { renderPage, logMarkdown } from '../live-log/render.mjs';
import { cleanBody, cleanWhere, whereFrom } from '../live-log/store.mjs';
test('blog frontmatter is required and parsed', () => {
  const post = parsePost('a', '---\ntitle: "Hi: there"\ndate: 2026-11-07\ndraft: true\n---\nBody **bold**');
  assert.deepEqual([post.title, post.date, post.draft], ['Hi: there', '2026-11-07', true]);
  assert.match(renderPost(post), /<strong>bold<\/strong>/);
  assert.throws(() => parsePost('b', 'no frontmatter'), /needs "title"/);
  assert.match(renderPost(post), /<link rel="canonical" href="https:\/\/rohanbalkondekar\.com\/blog\/a">/);
});
test('imported posts stay canonical here and credit the original', () => {
  const html = renderPost(parsePost('m', '---\ntitle: M\ndate: 2024-03-16\nsource: https://medium.com/@rohanbalkondekar/m-8d8794266315\n---\nBody'));
  assert.match(html, /<link rel="canonical" href="https:\/\/rohanbalkondekar\.com\/blog\/m">/);
  assert.match(html, /<a href="https:\/\/medium\.com\/@rohanbalkondekar\/m-8d8794266315">Originally published on Medium<\/a>/);
  assert.equal(parsePost('x', '---\ntitle: X\ndate: 2024-01-01\nsource: javascript:alert(1)\n---\n').source, undefined);
});
test('live log shows each entry in the time zone and place it was written', () => {
  const entry = { id: '3', createdAt: '2026-11-08T09:00:00Z', updatedAt: '2026-11-08T10:30:00Z', body: 'x', timeZone: 'Asia/Kuala_Lumpur', place: 'Kuala Lumpur', editedTimeZone: 'Asia/Taipei', editedPlace: 'Taipei' };
  const html = renderPage([entry]);
  assert.match(html, />17:00<\/a><\/time>/);
  assert.match(html, /<p class="where">Kuala Lumpur · edited 18:30, Taipei<\/p>/);
  assert.match(logMarkdown([entry]), /## Sunday, 8 November 2026, 17:00 \(Kuala Lumpur, GMT\+8\)/);
  assert.deepEqual(cleanWhere({ timeZone: 'Not/AZone', place: '<b>' }), { timeZone: null, place: 'b' });
  assert.deepEqual(cleanWhere({ timeZone: 'Asia/Taipei', place: ' Taipei ' }), { timeZone: 'Asia/Taipei', place: 'Taipei' });
});
test('live log place: IP city only when it is in the device time zone, aliases included', () => {
  const headers = values => name => values[name] ?? '';
  assert.deepEqual(whereFrom(headers({ 'x-vercel-ip-timezone': 'Asia/Kolkata', 'x-vercel-ip-city': 'Pune' }), 'Asia/Calcutta'), { timeZone: 'Asia/Calcutta', place: 'Pune' });
  assert.deepEqual(whereFrom(headers({ 'x-vercel-ip-timezone': 'Europe/Berlin', 'x-vercel-ip-city': 'Frankfurt' }), 'Asia/Kuala_Lumpur'), { timeZone: 'Asia/Kuala_Lumpur', place: 'Kuala Lumpur' }); // VPN
  assert.equal(whereFrom(headers({}), 'Bogus/Zone').place, undefined);
  assert.match(renderPage([{ id: '9', createdAt: '2026-11-08T09:00:00Z', updatedAt: '2026-11-08T09:00:00Z', body: 'x', timeZone: 'Not/AZone' }]), /14:30/); // bad stored zone falls back to IST
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
