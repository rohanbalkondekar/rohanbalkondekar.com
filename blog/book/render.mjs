import { readFileSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { escape, headMeta, SITE } from '../../writing/paper.mjs';
import { postJsonLd } from '../posts.mjs';
// Paged, book-like reading view for stories and essays, built on Perfect Edition (see LICENSE here).
const asset = name => readFileSync(path.join(process.cwd(), 'blog', 'book', name), 'utf8');
const extraCss = `:root{--spot-color:hsla(14,62%,42%,1);--selection-color:hsla(40,100%,75%,1)}div.book ul,div.book ol{margin:var(--line-height) 0;padding-left:var(--base-unit)}div.book li{text-align:left}div.book sup{font-size:.62em;line-height:0;color:var(--spot-color)}div.book div.title p{text-indent:0;font-style:italic}div.book div.title p.byline{font-style:normal;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase}div.book code{font-size:.85em}div.book p,div.book li{orphans:2;widows:2}div.book h1,div.book h2,div.book h3,div.book div.title p,div.book li,div.book p.aside{hyphens:manual}div.book>h2:not(.notes){margin:calc(var(--line-height)*2) 0 var(--line-height);text-align:center;break-before:auto;break-after:avoid-column;break-inside:avoid-column}div.book hr{break-before:avoid-column;break-after:auto}div.book hr+h2{margin-top:0}div.book h3{font-style:italic;font-weight:400;text-align:center;margin:var(--line-height) 0}div.book p.aside{text-indent:0;text-align:center;font-style:italic;margin:var(--line-height) 0}div.book figure.plate{break-before:column;break-after:column;break-inside:avoid;margin:0;padding-top:calc(var(--column-height)*.18)}div.book figure.plate img{display:block;width:100%;height:auto;max-height:none;break-before:auto;break-after:auto;margin-bottom:var(--line-height);mix-blend-mode:multiply}div.book figure.plate figcaption{text-align:center;font-style:italic;font-size:.85rem;line-height:1.3}div.book figure.plate figcaption small{display:block;margin-top:.8em;font-style:normal;font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:#8a8175}div.book figure.plate figcaption small i{font-style:italic;text-transform:none;letter-spacing:.02em;font-size:.75rem}div.book h2.notes{break-before:column;font-size:1rem}div.book h2.notes+ul{list-style:none;padding:0;font-size:.8rem;line-height:1.3}div.book h2.notes+ul li{padding-left:1.2em;text-indent:-1.2em;margin-bottom:.5em}`;
// "[3]" or "[3, 4]" citation markers become superscripts; Markdown links are left alone.
const cite = body => body.replace(/ \[(\d+(?:,\s*\d+)*)\](?!\()/g, '<sup>$1</sup>');
// Book typography: curly quotes, dashes and ellipses in text (never inside tags or code).
const typeset = html => html.split(/(<code>[\s\S]*?<\/code>|<[^>]+>)/).map((part, i) => i % 2 ? part : part.replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/(\w)'(\w)/g, '$1’$2').replace(/(^|[\s(—])'/g, '$1‘').replace(/'/g, '’')
  .replace(/(^|[\s(—])"/g, '$1“').replace(/"/g, '”').replace(/ -- /g, ' — ').replace(/\.\.\./g, '…')).join('')
  .replace(/<h2>(Further reading|Notes|Sources)<\/h2>/, '<h2 class="notes">$1</h2>');
const longDate = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export function renderBook(post) {
  const title = `<div class="title"><h1>${escape(post.title)}</h1>${post.description ? `<p>${typeset(escape(post.description))}</p>` : ''}<p class="byline">Rohan Balkondekar · ${longDate(post.date)}</p></div>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(post.title)} | Rohan Balkondekar</title>
<meta name="description" content="${escape(post.description)}">
<link rel="canonical" href="https://rohanbalkondekar.com/blog/${post.slug}">
${headMeta({ title: post.title, description: post.description, url: `${SITE}/blog/${post.slug}`, type: 'article', markdown: `/blog/${post.slug}.md`, jsonLd: postJsonLd(post) })}
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
${typeset(marked.parse(cite(post.body)))}
<p class="return-page"><a href="/blog">Back to the blog</a></p>
<p class="last-page"></p>
<div class="bookmark"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 40 80"><polygon points="0,0 0,80 20,70 40,80 40,0"/></svg></div>
</div>
</body>
</html>
`;
}
