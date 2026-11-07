import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import { escape, paper } from '../writing/paper.mjs';
const dir = path.join(process.cwd(), 'blog', 'posts');
const longDate = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export function parsePost(slug, source) {
  const [, head = '', body = source] = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/) ?? [];
  const meta = Object.fromEntries(head.split('\n').filter(Boolean).map(line => [line.slice(0, line.indexOf(':')).trim(), line.slice(line.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '')]));
  if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? '')) throw new Error(`blog/posts/${slug}.md needs "title" and "date: YYYY-MM-DD" frontmatter`);
  return { slug, title: meta.title, date: meta.date, description: meta.description ?? '', canonical: /^https:\/\//.test(meta.canonical ?? '') ? meta.canonical : undefined, draft: meta.draft === 'true', body };
}
export async function listPosts({ drafts = process.env.NODE_ENV !== 'production' } = {}) {
  const files = (await readdir(dir)).filter(file => file.endsWith('.md'));
  const posts = await Promise.all(files.map(async file => parsePost(file.slice(0, -3), await readFile(path.join(dir, file), 'utf8'))));
  return posts.filter(post => drafts || !post.draft).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
export function renderIndex(posts) {
  const items = posts.map(post => `<li><span><a href="/blog/${post.slug}">${escape(post.title)}</a>${post.draft ? ' <span class="muted">(draft)</span>' : ''}</span><time datetime="${post.date}">${longDate(post.date)}</time></li>`).join('\n');
  return paper({ title: 'Blog | Rohan Balkondekar', description: 'Essays and notes by Rohan Balkondekar.', path: '/blog',
    extraCss: 'ul.posts{list-style:none;padding:0}ul.posts li{display:flex;justify-content:space-between;gap:16px}ul.posts a{text-decoration:none}ul.posts a:hover{text-decoration:underline}ul.posts time{color:#8a8175;font-size:14px;font-style:italic;white-space:nowrap}',
    body: `<main><h1>Blog</h1><p class="muted">Longer thoughts. For the raw stream, see the <a href="/live-log">live log</a>.</p>\n<ul class="posts">${items || '<li class="muted">Nothing published yet.</li>'}</ul></main>` });
}
export function renderPost(post) {
  return paper({ title: `${post.title} | Rohan Balkondekar`, description: post.description, path: `/blog/${post.slug}`, canonical: post.canonical,
    extraCss: 'article img{display:block}article iframe{display:block;width:100%;aspect-ratio:16/9;border:0}',
    // Pad each image to a whole number of ruled lines so the text after it stays on the lines.
    script: "const snap=i=>{i.style.marginBottom=(28-i.getBoundingClientRect().height%28)%28+'px'};document.querySelectorAll('article img,article iframe').forEach(i=>{i.complete?snap(i):i.addEventListener('load',()=>snap(i))});addEventListener('resize',()=>document.querySelectorAll('article img,article iframe').forEach(snap))",
    body: `<main><article><h1>${escape(post.title)}</h1><p class="muted"><time datetime="${post.date}">${longDate(post.date)}</time>${post.canonical ? ` · <a href="${escape(post.canonical)}">Originally published on Medium</a>` : ''}</p>\n${marked.parse(post.body)}</article><hr><p class="muted"><a href="/blog">← All posts</a></p></main>` });
}
