import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import { escape, paper, SITE, AUTHOR } from '../writing/paper.mjs';
import { renderBook } from './book/render.mjs';
const dir = path.join(process.cwd(), 'blog', 'posts');
const longDate = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export function parsePost(slug, source) {
  const [, head = '', body = source] = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/) ?? [];
  const meta = Object.fromEntries(head.split('\n').filter(Boolean).map(line => [line.slice(0, line.indexOf(':')).trim(), line.slice(line.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '')]));
  if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? '')) throw new Error(`blog/posts/${slug}.md needs "title" and "date: YYYY-MM-DD" frontmatter`);
  return { slug, title: meta.title, date: meta.date, description: meta.description ?? '', source: /^https:\/\//.test(meta.source ?? '') ? meta.source : undefined, draft: meta.draft === 'true', book: meta.layout === 'book', image: body.match(/<img src="([^"]+)"/)?.[1], body };
}
export async function listPosts({ drafts = process.env.NODE_ENV !== 'production' } = {}) {
  const files = (await readdir(dir)).filter(file => file.endsWith('.md'));
  const posts = await Promise.all(files.map(async file => parsePost(file.slice(0, -3), await readFile(path.join(dir, file), 'utf8'))));
  return posts.filter(post => drafts || !post.draft).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
const dayMonth = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
export function renderIndex(posts) {
  // The year sits in the paper's margin beside the first post of that year; essays also show their plate and description.
  const list = (items, stories) => `<ul class="posts${stories ? ' stories' : ''}">${items.map((post, i) => `<li${post.date.slice(0, 4) !== items[i - 1]?.date.slice(0, 4) ? ` data-year="${post.date.slice(0, 4)}"` : ''}>${stories && post.image ? `<a class="plate" href="/blog/${post.slug}" tabindex="-1" aria-hidden="true"><img src="${escape(post.image)}" alt="" loading="lazy"></a>` : ''}<span><a href="/blog/${post.slug}">${escape(post.title)}</a>${post.draft ? ' <span class="muted">(draft)</span>' : ''}</span><time datetime="${post.date}">${dayMonth(post.date)}</time>${stories && post.description ? `<small>${escape(post.description)}</small>` : ''}</li>`).join('\n')}</ul>`;
  const books = posts.filter(post => post.book), notes = posts.filter(post => !post.book);
  return paper({ title: 'Blog | Rohan Balkondekar', description: 'Essays and notes by Rohan Balkondekar.', path: '/blog', markdown: '/blog.md',
    extraCss: 'ul.posts{list-style:none;padding:0}ul.posts li{position:relative;display:flex;justify-content:space-between;gap:16px}ul.posts li[data-year]:before{content:attr(data-year);position:absolute;right:100%;margin-right:28px;color:#8a8175;font-size:13px;font-style:italic}ul.posts a{text-decoration:none}ul.posts a:hover{text-decoration:underline}ul.posts:not(.stories) span{text-wrap:balance}ul.posts time{color:#8a8175;font-size:14px;font-style:italic;white-space:nowrap}ul.stories li{display:grid;grid-template-columns:auto 1fr auto;gap:0 16px}ul.stories li+li{margin-top:var(--rule)}ul.stories span{grid-column:2}ul.stories time{grid-column:3}ul.stories small{grid-column:2/4;color:#8a8175;font-size:15px;font-style:italic}ul.stories .plate{grid-row:1/3;width:84px;height:calc(var(--rule)*2)}ul.stories .plate img{display:block;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;opacity:.85;transition:opacity .2s}ul.stories li:hover .plate img{opacity:1}main h2{margin-bottom:0}main h2 small{font-size:14px;color:#8a8175;font-style:italic;margin-left:8px}p.feed{margin-top:calc(var(--rule)*2);font-size:15px}@media(max-width:640px){ul.posts li[data-year]:before{margin-right:22px;font-size:11px}ul.posts:not(.stories) span{text-wrap:wrap}ul.stories li{grid-template-columns:auto 1fr}ul.stories .plate{width:63px;grid-row:1/4}ul.stories small{grid-column:2;grid-row:2}ul.stories time{grid-column:2;grid-row:3}}',
    body: `<main><h1>Blog</h1><p class="muted">Longer thoughts. For the raw stream, see the <a href="/live-log">live log</a>.</p>\n${books.length ? `<h2>Stories &amp; essays<small>read like a book</small></h2>${list(books, true)}<h2>Posts</h2>` : ''}${notes.length ? list(notes) : '<p class="muted">Nothing published yet.</p>'}<p class="muted feed">New posts arrive by <a href="/blog/feed.xml">RSS</a>.</p></main>` });
}
export function renderPost(post) {
  if (post.book) return renderBook(post);
  return paper({ title: `${post.title} | Rohan Balkondekar`, description: post.description, path: `/blog/${post.slug}`, markdown: `/blog/${post.slug}.md`, type: 'article', jsonLd: postJsonLd(post), image: shareImage(post),
    extraCss: 'article img{display:block}article iframe{display:block;width:100%;aspect-ratio:16/9;border:0}',
    // Pad each image to a whole number of ruled lines so the text after it stays on the lines.
    script: "const snap=i=>{i.style.marginBottom=(28-i.getBoundingClientRect().height%28)%28+'px'};document.querySelectorAll('article img,article iframe').forEach(i=>{i.complete?snap(i):i.addEventListener('load',()=>snap(i))});addEventListener('resize',()=>document.querySelectorAll('article img,article iframe').forEach(snap))",
    body: `<main><article><h1>${escape(post.title)}</h1><p class="muted">By <a href="/" rel="author">Rohan Balkondekar</a> · <time datetime="${post.date}">${longDate(post.date)}</time>${post.source ? ` · <a href="${escape(post.source)}">Originally published on Medium</a>` : ''}</p>\n${marked.parse(post.body)}</article><hr><p class="muted"><a href="/blog">← All posts</a></p></main>` });
}
// A post's first picture is its share image; posts without one fall back to the site image.
export const shareImage = post => post.image?.replace(/^\//, `${SITE}/`);
// Plain Markdown versions of the blog, served at /blog.md and /blog/<slug>.md.
export const postMarkdown = post => `# ${post.title}\n\n> Site index: https://rohanbalkondekar.com/llms.txt\n\n${post.date}${post.source ? ` · Originally published on Medium: ${post.source}` : ''}\n\n${post.body.trim().replace(/<figure[^>]*>\s*<img src="([^"]+)" alt="([^"]*)"[^>]*>\s*<figcaption>([\s\S]*?)<\/figcaption>\s*<\/figure>/g, (_m, src, alt, caption) => `![${alt}](${src.startsWith('/') ? `https://rohanbalkondekar.com${src}` : src})\n\n*${caption.replace(/<small>/g, ' ').replace(/<[^>]+>/g, '').trim()}*`)}\n`;
export const indexMarkdown = posts => `# Blog\n\n> Site index: https://rohanbalkondekar.com/llms.txt\n\nEssays and notes by Rohan Balkondekar. Each post is also available as Markdown.\n\n${posts.map(post => `- [${post.title}](https://rohanbalkondekar.com/blog/${post.slug}.md) (${post.date})`).join('\n')}\n`;
export const postJsonLd = post => ({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.description || undefined, datePublished: post.date,
  url: `${SITE}/blog/${post.slug}`, author: AUTHOR, encodingFormat: 'text/html', isBasedOn: post.source });
// Atom feed with each post's full text.
export function feed(posts) {
  const entry = post => `<entry><title>${escape(post.title)}</title><link href="${SITE}/blog/${post.slug}"/><id>${SITE}/blog/${post.slug}</id><updated>${post.date}T00:00:00Z</updated>${post.description ? `<summary>${escape(post.description)}</summary>` : ''}<content type="html">${escape(marked.parse(post.body).replace(/(src|href)="\/(?!\/)/g, `$1="${SITE}/`))}</content></entry>`;
  return `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>Rohan Balkondekar: Blog</title><link href="${SITE}/blog"/><link rel="self" href="${SITE}/blog/feed.xml"/><id>${SITE}/blog</id><updated>${posts[0]?.date ?? '2026-01-01'}T00:00:00Z</updated><author><name>Rohan Balkondekar</name><uri>${SITE}/</uri></author>\n${posts.map(entry).join('\n')}\n</feed>\n`;
}
