// Copy Medium posts into blog/posts/*.md.
// Usage: node scripts/import-medium.mjs [source] [--force]
//   source: feed URL (default https://medium.com/feed/@rohanbalkondekar), a saved feed .xml file,
//           or an unzipped Medium export directory (Settings → Security and apps → Download your information).
import { existsSync } from 'node:fs';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';
const args = process.argv.slice(2), force = args.includes('--force');
const source = args.find(arg => !arg.startsWith('--')) ?? 'https://medium.com/feed/@rohanbalkondekar';
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
turndown.remove(['script', 'style']);
turndown.addRule('pixel', { filter: node => node.nodeName === 'IMG' && /medium\.com\/_\/stat/.test(node.getAttribute('src') ?? ''), replacement: () => '' });
turndown.addRule('figure', { filter: 'figure', replacement: (_content, node) => {
  const img = node.querySelector('img'), caption = node.querySelector('figcaption')?.textContent.trim();
  if (!img) return `\n\n${turndown.turndown(node.innerHTML)}\n\n`;
  return `\n\n![${(img.getAttribute('alt') || caption || '').replace(/[\[\]]/g, '')}](${img.getAttribute('src')})${caption ? `\n*${caption}*` : ''}\n\n`;
} });
// Medium embeds (tweets, gists, videos) are iframes; link to the original instead.
turndown.addRule('embed', { filter: 'iframe', replacement: (_content, node) => {
  const src = node.getAttribute('src') ?? '', original = new URLSearchParams(src.split('?')[1] ?? '').get('url');
  const href = original ? decodeURIComponent(original) : node.querySelector('a')?.getAttribute('href') ?? src;
  return `\n\n[Embedded: ${href.replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '')}](${href})\n\n`;
} });
// Medium exports mark code line breaks with <br>, which textContent drops.
const decode = html => html.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
turndown.addRule('pre', { filter: 'pre', replacement: (_content, node) => `\n\n\`\`\`\n${decode(node.innerHTML).replace(/\n$/, '')}\n\`\`\`\n\n` });
const cdata = value => value?.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim() ?? '';
const tag = (xml, name) => cdata(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1]);
const text = html => html.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const oneLine = value => value.replace(/\s+/g, ' ').trim();
const slugOf = url => new URL(url).pathname.split('/').pop().replace(/-[0-9a-f]{8,12}$/, '').toLowerCase();
function clean(html, title) {
  return html.replace(/<img[^>]+medium\.com\/_\/stat[^>]*>/g, '')
    .replace(/^\s*<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/, (match, heading) => text(heading) === text(title) ? '' : match) // Medium repeats the title as the first heading
    .replace(/<hr[^>]*>\s*<p>\s*<a href="https:\/\/medium\.com\/[^"]*">[\s\S]*?<\/a>\s*was originally published[\s\S]*$/, '');
}
function fromFeed(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const url = tag(item, 'link').split('?')[0], body = tag(item, 'content:encoded'), title = tag(item, 'title');
    return { title, url, date: new Date(tag(item, 'pubDate')).toISOString().slice(0, 10), description: text(body.match(/<p>([\s\S]*?)<\/p>/)?.[1] ?? ''), html: clean(body, title) };
  });
}
async function fromExport(dir) {
  const postsDir = existsSync(path.join(dir, 'posts')) ? path.join(dir, 'posts') : dir;
  const files = (await readdir(postsDir)).filter(file => file.endsWith('.html') && !file.startsWith('draft_'));
  const posts = [];
  for (const file of files) {
    const html = await readFile(path.join(postsDir, file), 'utf8');
    const url = html.match(/<a[^>]+class="p-canonical"[^>]+href="([^"]+)"/)?.[1] ?? html.match(/href="([^"]+)"[^>]+class="p-canonical"/)?.[1];
    const date = html.match(/<time[^>]+class="dt-published"[^>]+datetime="([^"]+)"/)?.[1];
    const body = html.match(/<section data-field="body" class="e-content">([\s\S]*?)<\/section>\s*<footer>/)?.[1] ?? '';
    const title = text(html.match(/<h1 class="p-name">([\s\S]*?)<\/h1>/)?.[1] ?? '');
    if (!url || !date || !title || text(body).length < 400) { console.log(`skip ${file} (unpublished, or a short response)`); continue; }
    const subtitle = text(html.match(/<section data-field="subtitle"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '');
    const inner = body.replace(/<\/?section[^>]*>|<div class="section-(divider|content)">|<div class="section-inner[^"]*">/g, '').replace(/<hr class="section-divider">/g, '');
    posts.push({ title, url, date: date.slice(0, 10), description: subtitle || text(inner.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? ''), html: clean(inner, title) });
  }
  return posts;
}
const isDir = existsSync(source) && (await stat(source)).isDirectory();
const posts = isDir ? await fromExport(source) : fromFeed(/^https?:/.test(source) ? await (await fetch(source, { headers: { 'user-agent': 'Mozilla/5.0 feed-reader' } })).text() : await readFile(source, 'utf8'));
// Medium bodies often open with the title as a heading; the page already shows it.
const dropTitle = (md, title) => md.replace(/^#{1,4} (.+)\n+/, (line, heading) => text(heading) === text(title) ? '' : line);
let written = 0;
for (const post of posts) {
  const file = path.join('blog', 'posts', `${slugOf(post.url)}.md`);
  if (existsSync(file) && !force) { console.log(`exists ${file} (use --force to overwrite)`); continue; }
  const description = oneLine(post.description).slice(0, 200);
  await writeFile(file, `---\ntitle: ${oneLine(post.title)}\ndate: ${post.date}\ndescription: ${description}\nsource: ${post.url}\n---\n\n${dropTitle(turndown.turndown(post.html).trim(), post.title)}\n`);
  console.log(`wrote ${file}`); written++;
}
console.log(`${written} of ${posts.length} posts written.`);
