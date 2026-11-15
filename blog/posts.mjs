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
const shortDate = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
export function renderIndex(posts) {
  const books = posts.filter(post => post.book), notes = posts.filter(post => !post.book);
  const draft = post => post.draft ? ' <span class="muted">(draft)</span>' : '';
  // Essays get their plate, description and full date. Posts are grouped by year with the day written in the margin.
  const stories = `<ul class="stories">${books.map(post => `<li>${post.image ? `<a class="plate" href="/blog/${post.slug}" tabindex="-1" aria-hidden="true"><img src="${escape(post.image)}" alt="" loading="lazy"></a>` : ''}<div><a href="/blog/${post.slug}">${escape(post.title)}</a>${draft(post)}${post.description ? `<small>${escape(post.description)}</small>` : ''}<time datetime="${post.date}">${longDate(post.date)}</time></div></li>`).join('\n')}</ul>`;
  const years = [...new Set(notes.map(post => post.date.slice(0, 4)))];
  const list = years.map(year => `<h3 class="year">${year}</h3><ul class="posts">${notes.filter(post => post.date.startsWith(year)).map(post => `<li><time datetime="${post.date}">${shortDate(post.date)}</time><span><a href="/blog/${post.slug}">${escape(post.title)}</a>${draft(post)}</span></li>`).join('\n')}</ul>`).join('\n');
  return paper({ title: 'Blog | Rohan Balkondekar', description: 'Essays and notes by Rohan Balkondekar.', path: '/blog', markdown: '/blog.md',
    extraCss: 'main ul{list-style:none;padding:0;margin:0}main ul a{text-decoration:none}main ul a:hover{text-decoration:underline}main time{color:var(--muted);font-size:13px;font-style:italic;white-space:nowrap}main h2{margin:calc(var(--rule)*2) 0 var(--rule)}main h2 small{font-size:14px;color:var(--muted);font-style:italic;margin-left:8px}ul.stories li{display:grid;grid-template-columns:auto 1fr;gap:0 24px}ul.stories li+li{margin-top:var(--rule)}ul.stories .plate{width:126px;height:calc(var(--rule)*3)}ul.stories .plate img{display:block;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply;opacity:.9;transition:opacity .2s}ul.stories li:hover .plate img{opacity:1}:root[data-theme=dark] ul.stories .plate img{filter:invert(1);mix-blend-mode:screen}ul.stories div>a{font-size:21px}ul.stories small,ul.stories time{display:block}ul.stories small{color:var(--muted);font-size:15px;font-style:italic}h3.year{margin:var(--rule) 0 0}h2+h3.year{margin-top:0}ul.posts li{position:relative}ul.posts time{position:absolute;right:100%;margin-right:30px}p.feed{margin-top:calc(var(--rule)*2);font-size:15px}@media(max-width:640px){ul.stories li{gap:0 14px}ul.stories .plate{width:84px;height:calc(var(--rule)*2)}ul.stories div>a{font-size:19px}ul.posts li{display:flex;justify-content:space-between;gap:12px}ul.posts time{position:static;order:2;margin:0}}',
    body: `<main><h1>Blog</h1><p class="muted">Longer thoughts. For the raw stream, see the <a href="/live-log">live log</a>.</p>\n${books.length ? `<h2>Stories &amp; essays<small>read like a book</small></h2>${stories}<h2>Posts</h2>` : ''}${notes.length ? list : '<p class="muted">Nothing published yet.</p>'}<p class="muted feed">New posts arrive by <a href="/blog/feed.xml">RSS</a>.</p></main>` });
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
