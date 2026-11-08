import { readFileSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { escape } from '../../writing/paper.mjs';
// Paged, book-like reading view for stories and essays, built on Perfect Edition (see LICENSE here).
const asset = name => readFileSync(path.join(process.cwd(), 'blog', 'book', name), 'utf8');
const extraCss = `:root{--spot-color:hsla(14,62%,42%,1);--selection-color:hsla(40,100%,75%,1)}div.book ul,div.book ol{margin:var(--line-height) 0;padding-left:var(--base-unit)}div.book li{text-align:left}div.book sup{font-size:.62em;line-height:0;color:var(--spot-color)}div.book div.title p{text-indent:0;font-style:italic}div.book div.title p.byline{font-style:normal;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase}div.book code{font-size:.85em}`;
// "[3]" or "[3, 4]" citation markers become superscripts; Markdown links are left alone.
const cite = body => body.replace(/ \[(\d+(?:,\s*\d+)*)\](?!\()/g, '<sup>$1</sup>');
const longDate = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export function renderBook(post) {
  const title = `<div class="title"><h1>${escape(post.title)}</h1>${post.description ? `<p>${escape(post.description)}</p>` : ''}<p class="byline">Rohan Balkondekar · ${longDate(post.date)}</p></div>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(post.title)} | Rohan Balkondekar</title>
<meta name="description" content="${escape(post.description)}">
<link rel="canonical" href="${escape(post.canonical ?? `https://rohanbalkondekar.com/blog/${post.slug}`)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/vollkorn/Vollkorn-Regular.woff2" as="font" type="font/woff2" crossorigin>
<style>${asset('perfect-edition.css')}${extraCss}</style>
<script>${asset('perfect-edition.js')}</script>
</head>
<body>
<div class="print-cover">${title}</div>
<div class="book">
<div class="tutorial">
<h2>How to read</h2>
<p><i>On a phone:</i><br>Tap the edges of the page</p>
<p><i>On a computer:</i><br>Click the edges of the page, or use the arrow keys, the&nbsp;space&nbsp;bar, the&nbsp;trackpad, or&nbsp;the&nbsp;scroll&nbsp;wheel</p>
<p><i>On paper:</i><br>Print it out</p>
</div>
${title}
${marked.parse(cite(post.body))}
<p class="return-page"><a href="/blog">Back to the blog</a></p>
<p class="last-page"></p>
<div class="bookmark"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 40 80"><polygon points="0,0 0,80 20,70 40,80 40,0"/></svg></div>
</div>
</body>
</html>
`;
}
