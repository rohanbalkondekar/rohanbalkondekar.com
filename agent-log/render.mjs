import { Marked } from 'marked';
import { escape, headMeta, SITE } from '../writing/paper.mjs';
const fallbackZone = 'Asia/Kolkata';
const markdown = new Marked({ breaks: true, renderer: { html: ({ text }) => escape(text) } });
const zoneOf = entry => entry.timeZone ?? fallbackZone;
const dayKey = entry => new Date(entry.createdAt).toLocaleDateString('en-CA', { timeZone: zoneOf(entry) });
const day = entry => new Date(entry.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: zoneOf(entry) });
const shortDay = entry => new Date(entry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: zoneOf(entry) });
const time = entry => new Date(entry.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zoneOf(entry) });
const GOALS = [['goal-day', 'today'], ['goal-week', 'this week'], ['goal-month', 'this month']];
const TAGS = { update: 'update', result: 'result', 'goal-day': 'goal', 'goal-week': 'goal', 'goal-month': 'goal' };
const TITLE = 'Agent log | Rohan Balkondekar';
const DESCRIPTION = 'Goals for the day, week and month, and the work done towards them, written by my AI agents as it happens.';
// Days in a row with at least one entry, counting back from the newest entry.
function streak(entries) {
  const days = [...new Set(entries.map(dayKey))];
  let run = days.length ? 1 : 0;
  for (let i = 1; i < days.length; i++) { if ((new Date(days[i - 1]) - new Date(days[i])) / 864e5 !== 1) break; run++; }
  return run;
}
// A terminal window: phosphor green on near-black, scanlines, and a powerline prompt drawn with clip-path (no icon font needed).
const css = `:root{color-scheme:dark;--screen:#0c130e;--fg:#b5f5c4;--dim:#5f8a6b;--green:#4ade80;--yellow:#facc15;--cyan:#22d3ee;--magenta:#e879f9;--blue:#60a5fa;--line:1.65em}
*{box-sizing:border-box}html{background:#040604 radial-gradient(ellipse at 50% -10%,#0f2416,transparent 60%) fixed}body{margin:0;padding:28px 14px 56px;color:var(--fg);font:15px/var(--line) ui-monospace,"SF Mono","JetBrains Mono","Cascadia Code",Menlo,Consolas,monospace;-webkit-font-smoothing:antialiased}
.term{max-width:940px;margin:0 auto;border:1px solid #1d2a21;border-radius:11px;overflow:hidden;background:var(--screen);box-shadow:0 0 0 1px #000,0 30px 80px rgba(0,0,0,.75),0 0 140px rgba(74,222,128,.08)}
.bar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:linear-gradient(#19231c,#111812);border-bottom:1px solid #1d2a21;color:var(--dim);font-size:12.5px}
.bar i{width:12px;height:12px;border-radius:50%;background:#ff5f57}.bar i+i{background:#febc2e}.bar i+i+i{background:#28c840}.bar span{flex:1;text-align:center;margin-right:52px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.screen{display:block;position:relative;padding:22px 24px 28px;text-shadow:0 0 7px rgba(74,222,128,.3);background:radial-gradient(ellipse at 50% 0,rgba(74,222,128,.08),transparent 62%)}
.screen:after{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(rgba(0,0,0,0) 0 2px,rgba(0,0,0,.17) 2px 3px),radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.45))}
a{color:var(--cyan);text-decoration:none}a:hover{text-decoration:underline}p{margin:0}
.banner{margin:0 0 6px;font:inherit;font-size:11px;line-height:1.15;color:var(--green);white-space:pre;overflow:hidden}
.motd{color:var(--dim)}.motd b{color:var(--fg);font-weight:600}.stat{color:var(--dim)}.stat b{font-weight:600;color:var(--green)}.stat .on{color:var(--green)}
.prompt{display:flex;flex-wrap:wrap;align-items:center;row-gap:4px;margin:var(--line) 0 calc(var(--line)/2);text-shadow:none}
.seg{padding:0 17px 0 21px;margin-right:-8px;color:#06110a;font-weight:600;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 50%,calc(100% - 9px) 100%,0 100%,9px 50%)}
.seg:first-child{padding-left:12px;border-radius:4px 0 0 4px;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 50%,calc(100% - 9px) 100%,0 100%)}
.seg.a{background:var(--green)}.seg.b{background:var(--blue)}.seg.c{background:var(--yellow)}
.cmd{margin-left:20px;color:#eafff0;text-shadow:0 0 7px rgba(74,222,128,.3)}.cmd:before{content:'❯ ';color:var(--magenta)}
.goals{margin:0;padding:0}.goals div{display:grid;grid-template-columns:7.6em 1fr;column-gap:14px}
.goals dt{color:var(--yellow)}.goals dd{margin:0}.goals small{color:var(--dim);font-size:inherit}.unset{color:var(--dim)}
h2{font:inherit;color:var(--dim);margin:var(--line) 0 0}.prompt+h2{margin-top:0}
.log{list-style:none;margin:0;padding:0}.log li{display:grid;grid-template-columns:3.4em 4.2em 1fr;column-gap:14px}.log time a{color:var(--dim)}.log b{font-weight:600;color:var(--green)}.log .result b{color:var(--yellow)}.log [class^=goal] b{color:var(--magenta)}.log .result span{color:#fff8d6}
.empty{color:var(--dim)}.cursor{display:inline-block;width:.6em;height:1.1em;margin-left:20px;background:var(--green);box-shadow:0 0 8px rgba(74,222,128,.7);animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}@media(prefers-reduced-motion:reduce){.cursor{animation:none}}
footer{margin-top:var(--line);color:var(--dim);font-size:13px}footer a{color:var(--dim);text-decoration:underline;text-underline-offset:3px}
@media(max-width:640px){body{padding:10px 6px 40px;font-size:13.5px}.screen{padding:14px 12px 20px}.banner{font-size:7.5px}.goals div{grid-template-columns:1fr}.log li{grid-template-columns:3.4em 1fr}.log li span{grid-column:1/-1;padding-left:calc(3.4em + 14px)}.seg.b{display:none}}`;
const banner = [
  ' █████╗  ██████╗ ███████╗███╗   ██╗████████╗   ██╗      ██████╗  ██████╗ ',
  '██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝   ██║     ██╔═══██╗██╔════╝ ',
  '███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║      ██║     ██║   ██║██║  ███╗',
  '██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║      ██║     ██║   ██║██║   ██║',
  '██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██╗███████╗╚██████╔╝╚██████╔╝',
  '╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ',
].join('\n');
const prompt = (command, cursor = false) => `<div class="prompt"><span class="seg a">claude</span><span class="seg b">~/rohan/life</span><span class="seg c">main ✓</span>${cursor ? '<span class="cursor" aria-hidden="true"></span>' : `<span class="cmd">${command}</span>`}</div>`;
export function renderPage(entries, { stale = false } = {}) {
  const goals = GOALS.map(([kind, label]) => {
    const goal = entries.find(entry => entry.kind === kind);
    return `<div><dt>${label}</dt><dd>${goal ? `${markdown.parseInline(goal.body)} <small>· set ${shortDay(goal)}</small>` : '<span class="unset">not set yet</span>'}</dd></div>`;
  }).join('\n');
  const days = [];
  for (const entry of entries) {
    const label = day(entry);
    if (days.at(-1)?.label !== label) days.push({ label, entries: [] });
    days.at(-1).entries.push(entry);
  }
  const log = days.map(group => `<h2># ${group.label}</h2>\n<ol class="log">${group.entries.map(entry => `<li class="${entry.kind}" id="e${entry.id}"><time datetime="${entry.createdAt}"><a href="#e${entry.id}">${time(entry)}</a></time><b>${TAGS[entry.kind] ?? 'update'}</b><span>${markdown.parseInline(entry.body)}</span></li>`).join('\n')}</ol>`).join('\n');
  const results = entries.filter(entry => entry.kind === 'result').length, run = streak(entries);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(TITLE)}</title>
<meta name="description" content="${escape(DESCRIPTION)}">
<link rel="canonical" href="${SITE}/agent-log">
${headMeta({ title: TITLE, description: DESCRIPTION, url: `${SITE}/agent-log` })}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96">
<style>${css}</style>
</head>
<body>
<div class="term"><div class="bar"><i></i><i></i><i></i><span>claude@rohan: ~/agent-log</span></div>
<main class="screen">
<pre class="banner" aria-hidden="true">${banner}</pre>
<h1 hidden>Agent log</h1>
<p class="motd">Written by Rohan's AI agents, not by Rohan. His goals for the day, week and month, and the work done towards them, as it happens.${stale ? ' Live data is unavailable right now.' : ''}</p>
<p class="stat"><span class="on">●</span> <b>${entries.length}</b> ${entries.length === 1 ? 'entry' : 'entries'} · <b>${results}</b> ${results === 1 ? 'result' : 'results'} · streak <b>${run}d</b></p>
${prompt('cat goals.md')}
<dl class="goals">${goals}</dl>
${prompt('agent-log --follow')}
${log || '<p class="empty">nothing yet</p>'}
${prompt('', true)}
<footer><a href="/">rohanbalkondekar.com</a> · <a href="/writing">writing</a> · <a href="/live-log">live log</a> (that one he writes himself)</footer>
</main></div>
</body>
</html>
`;
}
