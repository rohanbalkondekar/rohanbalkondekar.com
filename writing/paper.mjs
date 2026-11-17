export const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
// Torn-paper edges: the sheet is cut out with SVG masks. A fixed seed keeps the tear identical on every render.
const rand = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647)(11);
const svg = (w, h, d) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' preserveAspectRatio='none'><path d='${d}'/></svg>`)}")`;
const walk = (from, to, step, lo, hi, jitter, point) => { let out = '', v = (lo + hi) / 2; for (let at = from; at <= to; at += step * (.5 + rand())) { v = Math.min(hi, Math.max(lo, v + (rand() - .5) * jitter)); out += point(at, v); } return out; };
const tornBottom = svg(1200, 24, `M0 0H1200V12${walk(0, 1200, 9, 5, 23, 9, (x, y) => `L${(1200 - x).toFixed(0)} ${y.toFixed(1)}`)}L0 12Z`);
const deckle = side => svg(6, 2400, `M${side ? 0 : 6} 0${walk(0, 2400, 12, 0, 3.2, 1.6, (y, x) => `L${(side ? 6 - x : x).toFixed(1)} ${y.toFixed(0)}`)}L${side ? 0 : 6} 2400Z`);
const mask = `${tornBottom} left bottom/100% 24px no-repeat,${deckle(0)} left top/6px calc(100% - 24px) no-repeat,${deckle(1)} right top/6px calc(100% - 24px) no-repeat,linear-gradient(#000,#000) 6px 0/calc(100% - 12px) calc(100% - 24px) no-repeat`;
// Light and dark themes. The head script picks the saved choice, else dark, before first paint.
export const THEME_HEAD = `<script>try{document.documentElement.dataset.theme=localStorage.getItem('theme')||'dark'}catch(e){}</script>`;
export const THEME_TOGGLE = `<button class="theme" type="button" aria-label="Switch between light and dark" title="Light / dark" onclick="event.stopPropagation();var d=document.documentElement,t=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}">◐</button>`;
// Every vertical size is a multiple of the 28px rule so text sits on the lines.
const css = `:root{color-scheme:light;--rule:28px;--margin:128px;--hole:11px;--hole-x:22px;--desk:#e8e2d4;--paper:#fdfaf2;--ink:#2b2722;--muted:#8a8175;--soft:#5d564c;--line:rgba(70,110,160,.16);--red:rgba(196,72,64,.42);--shadow:rgba(60,45,20,.14);--ring:rgba(60,45,20,.32)}
:root[data-theme=dark]{color-scheme:dark;--desk:#100f0d;--paper:#23211c;--ink:#e4ddcd;--muted:#978e7d;--soft:#bdb4a2;--line:rgba(150,180,220,.085);--red:rgba(224,112,100,.3);--shadow:rgba(0,0,0,.55);--ring:rgba(0,0,0,.7)}
*{box-sizing:border-box}html{background:var(--desk) ${grain}}body{margin:0;padding:calc(var(--rule)*1.5) 16px calc(var(--rule)*2.5);color:var(--ink);font:18px/var(--rule) "Iowan Old Style","Charter","Georgia",serif;-webkit-font-smoothing:antialiased}
.sheet{max-width:880px;margin:0 auto;filter:drop-shadow(0 1px 1px var(--shadow)) drop-shadow(0 16px 30px var(--shadow))}
.page{position:relative;min-height:calc(100vh - var(--rule)*4);padding:calc(var(--rule)*2) 64px calc(var(--rule)*4) var(--margin);background:${grain},linear-gradient(90deg,transparent calc(var(--margin) - 18px),var(--red) calc(var(--margin) - 18px),var(--red) calc(var(--margin) - 17px),transparent calc(var(--margin) - 17px)),repeating-linear-gradient(transparent 0 calc(var(--rule) - 1px),var(--line) calc(var(--rule) - 1px) var(--rule)),var(--paper);-webkit-mask:${mask};mask:${mask}}
.page:after{content:'';position:absolute;left:var(--hole-x);top:0;bottom:0;width:calc(var(--hole)*2 + 4px);pointer-events:none;background:radial-gradient(circle,var(--desk) 0 var(--hole),var(--ring) calc(var(--hole) + .5px) calc(var(--hole) + 1.5px),transparent calc(var(--hole) + 2px)) 0 calc(var(--rule)*2.5)/100% calc(var(--rule)*6) repeat-y}
a{color:inherit;text-underline-offset:4px;text-decoration-color:color-mix(in srgb,currentColor 30%,transparent)}a:hover{text-decoration-color:currentColor}
header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:calc(var(--rule)*2);font-size:15px;color:var(--muted)}header .title{color:var(--ink);font-size:19px;text-decoration:none;font-style:italic}nav a{text-decoration:none;margin-left:16px}nav a:hover{text-decoration:underline}nav a[aria-current]{color:var(--ink)}
button.theme{margin-left:16px;padding:0;border:0;background:none;color:inherit;font:inherit;line-height:1;cursor:pointer}button.theme:hover{color:var(--ink)}
.muted{color:var(--muted)}h1,h2,h3{font-weight:normal;margin:0}h1{font-size:32px;line-height:calc(var(--rule)*2)}h2{font-size:22px;line-height:var(--rule);margin-top:var(--rule)}h3{font-size:17px;font-style:italic;color:var(--muted);margin-top:var(--rule)}p,ul,ol,blockquote,pre{margin:0 0 var(--rule)}ul,ol{padding-left:22px}pre{background:rgba(120,100,60,.08);padding:0 12px;line-height:var(--rule);overflow:auto;font-size:14px}code{font-size:.85em}blockquote{padding-left:16px;border-left:2px solid rgba(120,100,60,.3);color:var(--soft);font-style:italic}img{max-width:100%}hr{border:0;height:var(--rule);margin:0 0 var(--rule)}main{overflow-wrap:break-word}main article{max-width:660px}
::selection{background:rgba(255,214,90,.5)}:root[data-theme=dark] ::selection{background:rgba(255,214,90,.28)}
@media(max-width:640px){:root{--margin:46px;--hole:7px;--hole-x:5px}body{padding:var(--rule) 8px calc(var(--rule)*2);font-size:17px}.page{padding-right:22px;padding-top:var(--rule)}header{margin-bottom:var(--rule)}nav a,button.theme{margin-left:10px}}`;
// Head tags that help crawlers and agents: Open Graph, structured data, and the Markdown and feed versions.
export const SITE = 'https://rohanbalkondekar.com';
export const AUTHOR = { '@type': 'Person', '@id': `${SITE}/#person`, name: 'Rohan Balkondekar', url: `${SITE}/` };
export function headMeta({ title, description = '', url, type = 'website', markdown, jsonLd, image = `${SITE}/og.png` }) {
  return [`<meta property="og:type" content="${type}">`, `<meta property="og:title" content="${escape(title)}">`, `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${escape(url)}">`, `<meta property="og:image" content="${escape(image)}">`, '<meta name="twitter:card" content="summary_large_image">', `<meta name="twitter:image" content="${escape(image)}">`,
    markdown && `<link rel="alternate" type="text/markdown" href="${escape(markdown)}">`, `<link rel="alternate" type="application/atom+xml" title="Rohan Balkondekar: Writing" href="/writing/feed.xml">`,
    jsonLd && `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`].filter(Boolean).join('\n');
}
export function paper({ title, description = '', path, canonical = `https://rohanbalkondekar.com${path}`, body, extraCss = '', script = '', markdown, type, jsonLd, image }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${escape(canonical)}">
${headMeta({ title, description, url: `${SITE}${path}`, type, markdown, jsonLd, image })}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96">
<link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=peacock" sizes="180x180">
${THEME_HEAD}
<style>${css}${extraCss}</style>
</head>
<body>
<div class="sheet"><div class="page">
<header><a class="title" href="/">Rohan Balkondekar</a><nav>${[['/writing', 'Writing'], ['/live-log', 'Live log'], ['/agent-log', 'Agent log']].map(([href, label]) => `<a href="${href}"${String(path).startsWith(href) ? ' aria-current="page"' : ''}>${label}</a>`).join('')}${THEME_TOGGLE}</nav></header>
${body}
</div></div>${script ? `\n<script>${script}</script>` : ''}
</body>
</html>
`;
}
