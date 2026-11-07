export const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const grain = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
// Every vertical size is a multiple of the 28px rule so text sits on the lines.
const css = `:root{color-scheme:light;--rule:28px;--margin:112px;--hole:11px;--hole-x:16px}*{box-sizing:border-box}html{background:#e8e2d4 ${grain}}body{margin:0;color:#2b2722;font:18px/var(--rule) "Iowan Old Style","Charter","Georgia",serif;-webkit-font-smoothing:antialiased}
.page{position:relative;max-width:748px;min-height:100vh;margin:0 auto;padding:calc(var(--rule)*2) 44px calc(var(--rule)*4) var(--margin);background:${grain},linear-gradient(90deg,transparent calc(var(--margin) - 18px),rgba(196,72,64,.42) calc(var(--margin) - 18px),rgba(196,72,64,.42) calc(var(--margin) - 17px),transparent calc(var(--margin) - 17px)),repeating-linear-gradient(transparent 0 calc(var(--rule) - 1px),rgba(70,110,160,.16) calc(var(--rule) - 1px) var(--rule)),#fdfaf2;box-shadow:0 1px 2px rgba(60,45,20,.12),0 12px 40px rgba(60,45,20,.12)}
.page:after{content:'';position:absolute;left:var(--hole-x);top:0;bottom:0;width:calc(var(--hole)*2 + 4px);pointer-events:none;background:radial-gradient(circle,#e8e2d4 0 var(--hole),rgba(60,45,20,.3) calc(var(--hole) + .5px) calc(var(--hole) + 1.5px),transparent calc(var(--hole) + 2px)) 0 calc(var(--rule)*2.5)/100% calc(var(--rule)*6) repeat-y}
a{color:inherit;text-underline-offset:4px;text-decoration-color:rgba(43,39,34,.3)}a:hover{text-decoration-color:currentColor}
header{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:calc(var(--rule)*2);font-size:15px;color:#8a8175}header .title{color:#2b2722;font-size:19px;text-decoration:none;font-style:italic}nav a{text-decoration:none;margin-left:16px}nav a:hover{text-decoration:underline}
.muted{color:#8a8175}h1,h2,h3{font-weight:normal;margin:0}h1{font-size:32px;line-height:calc(var(--rule)*2)}h2{font-size:22px;line-height:var(--rule);margin-top:var(--rule)}h3{font-size:17px;font-style:italic;color:#7d6f60;margin-top:var(--rule)}p,ul,ol,blockquote,pre{margin:0 0 var(--rule)}ul,ol{padding-left:22px}pre{background:rgba(120,100,60,.06);padding:0 12px;line-height:var(--rule);overflow:auto;font-size:14px}code{font-size:.85em}blockquote{padding-left:16px;border-left:2px solid rgba(120,100,60,.25);color:#5d564c;font-style:italic}img{max-width:100%}hr{border:0;height:var(--rule);margin:0 0 var(--rule)}
::selection{background:rgba(255,214,90,.5)}
@media(max-width:640px){:root{--margin:72px;--hole:8px;--hole-x:4px}body{font-size:17px}.page{padding-right:20px;padding-top:var(--rule)}header{margin-bottom:var(--rule)}nav a{margin-left:10px}}`;
export function paper({ title, description = '', path, canonical = `https://rohanbalkondekar.com${path}`, body, extraCss = '', script = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${escape(canonical)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${css}${extraCss}</style>
</head>
<body>
<div class="page">
<header><a class="title" href="/">Rohan Balkondekar</a><nav><a href="/blog">Blog</a><a href="/live-log">Live log</a></nav></header>
${body}
</div>${script ? `\n<script>${script}</script>` : ''}
</body>
</html>
`;
}
