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
// A full-screen terminal: phosphor green on near-black, scanlines, and a powerline prompt drawn with clip-path (no icon font needed).
const css = `:root{color-scheme:dark;--screen:#0c130e;--fg:#b5f5c4;--dim:#5f8a6b;--green:#4ade80;--yellow:#facc15;--cyan:#22d3ee;--magenta:#e879f9;--blue:#60a5fa;--line:1.65em;--pad:clamp(14px,4.5vw,64px)}
*{box-sizing:border-box}html,body{height:100%}body{margin:0;background:var(--screen);color:var(--fg);font:clamp(13.5px,1.05vw + 8px,17px)/var(--line) ui-monospace,"SF Mono","JetBrains Mono","Cascadia Code",Menlo,Consolas,monospace;-webkit-font-smoothing:antialiased}
.term{display:flex;flex-direction:column;height:100vh;height:100dvh}
.bar{flex:none;display:flex;align-items:center;gap:8px;padding:10px 14px;background:linear-gradient(#19231c,#111812);border-bottom:1px solid #1d2a21;color:var(--dim);font-size:12.5px}
.bar i{width:12px;height:12px;border-radius:50%;background:#ff5f57}.bar i+i{background:#febc2e}.bar i+i+i{background:#28c840}.bar span{flex:1;text-align:center;margin-right:52px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.screen{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:26px var(--pad) 40px;text-shadow:0 0 7px rgba(74,222,128,.3);background:radial-gradient(ellipse at 50% 0,rgba(74,222,128,.09),transparent 60%);scrollbar-color:#1f3a28 transparent}
.screen>*{max-width:1180px}
.fx{position:fixed;inset:0;pointer-events:none;z-index:9;background:repeating-linear-gradient(rgba(0,0,0,0) 0 2px,rgba(0,0,0,.17) 2px 3px),radial-gradient(ellipse at center,transparent 58%,rgba(0,0,0,.45))}
a{color:var(--cyan);text-decoration:none}a:hover{text-decoration:underline}p{margin:0}
.banner{margin:0 0 10px;font:inherit;font-size:clamp(5.6px,1.45vw,13px);line-height:1.15;color:var(--green);white-space:pre;overflow:hidden}
.motd{color:var(--dim)}.stat{color:var(--dim);display:flex;flex-wrap:wrap;gap:0 .6em;align-items:center}.stat b{font-weight:600;color:var(--green)}.stat .on{color:var(--green)}
button{font:inherit;color:var(--dim);background:none;border:1px solid #1f3a28;border-radius:4px;padding:0 .6em;line-height:1.5;cursor:pointer;text-shadow:inherit}button:hover{color:var(--fg);border-color:var(--dim)}button[aria-pressed=true]{color:#06110a;background:var(--green);border-color:var(--green);text-shadow:none}
.filters{display:flex;flex-wrap:wrap;gap:6px;margin-left:auto}
.prompt{display:flex;flex-wrap:wrap;align-items:center;row-gap:4px;margin:var(--line) 0 calc(var(--line)/2);text-shadow:none}
.seg{padding:0 17px 0 21px;margin-right:-8px;color:#06110a;font-weight:600;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 50%,calc(100% - 9px) 100%,0 100%,9px 50%)}
.seg:first-child{padding-left:12px;border-radius:4px 0 0 4px;clip-path:polygon(0 0,calc(100% - 9px) 0,100% 50%,calc(100% - 9px) 100%,0 100%)}
.seg.a{background:var(--green)}.seg.b{background:var(--blue)}.seg.c{background:var(--yellow)}
.cmd{margin-left:20px;color:#eafff0;text-shadow:0 0 7px rgba(74,222,128,.3)}.cmd:before,.type:before{content:'❯ ';color:var(--magenta)}
.type{flex:1;min-width:9em;display:flex;gap:.6em;margin-left:20px;color:#eafff0}.type input{flex:1;min-width:0;font:inherit;color:inherit;background:none;border:0;outline:0;padding:0;caret-color:var(--green);text-shadow:0 0 7px rgba(74,222,128,.3)}.type input::placeholder{color:var(--dim)}
.goals{margin:0;padding:0}.goals div{display:grid;grid-template-columns:7.6em 1fr;column-gap:14px}
.goals dt{color:var(--yellow)}.goals dd{margin:0}.goals small,.by{color:var(--dim);font-size:inherit;font-style:normal}.unset{color:var(--dim)}
h2{font:inherit;color:var(--dim);margin:var(--line) 0 0}.prompt+h2{margin-top:0}
.screen{overflow-x:hidden}.log li span,.goals dd,.motd{min-width:0;overflow-wrap:anywhere}.log{list-style:none;margin:0;padding:0}.log li{display:grid;grid-template-columns:3.4em 4.2em 1fr;column-gap:14px;border-radius:3px}.log li:hover{background:rgba(74,222,128,.06)}.log li:target{background:rgba(250,204,21,.1)}.log time a{color:var(--dim)}.log b{font-weight:600;color:var(--green)}.log .result b{color:var(--yellow)}.log [class^=goal] b{color:var(--magenta)}.log .result span{color:#fff8d6}
[hidden]{display:none!important}.empty,#out{color:var(--dim)}#out{white-space:pre-wrap}#out b{color:var(--fg);font-weight:600}
footer{margin-top:var(--line);color:var(--dim);font-size:.87em}footer a{color:var(--dim);text-decoration:underline;text-underline-offset:3px}
@media(max-width:640px){.bar{padding:8px 12px}.bar span{margin-right:0;text-align:right}.screen{padding:16px 12px 28px}.goals div{grid-template-columns:1fr;margin-bottom:6px}.log li{grid-template-columns:3.4em 1fr;margin-bottom:8px}.log li span{grid-column:1/-1}.seg{padding:0 13px 0 17px}.seg.b{display:none}.cmd,.type{margin-left:16px}.filters{margin-left:0;width:100%;margin-top:4px}}`;
// Filters and a small command line. Everything works without it; the script only hides and shows what is already on the page.
const script = `(()=>{const d=document,$=s=>d.querySelector(s),out=$('#out'),input=$('#cmd'),screen=$('.screen');
const kinds={all:null,updates:'update',results:'result',goals:'goal'};
function show(name){const kind=kinds[name];d.querySelectorAll('.log li').forEach(li=>li.hidden=!!kind&&!li.className.startsWith(kind));
d.querySelectorAll('.log').forEach(ol=>ol.previousElementSibling.hidden=!ol.querySelector('li:not([hidden])'));
d.querySelectorAll('.filters button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.show===name));return d.querySelectorAll('.log li:not([hidden])').length}
d.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>show(b.dataset.show));
const say=html=>{out.innerHTML=html;out.hidden=false;screen.scrollTop=screen.scrollHeight};
const go={home:'/',writing:'/writing','live-log':'/live-log'};
const run=text=>{const c=text.trim().toLowerCase();if(!c)return;
if(c in kinds){const n=show(c);say('showing <b>'+c+'</b>: '+n+(n===1?' entry':' entries'));$('#log').scrollIntoView({behavior:'smooth'})}
else if(c==='help')say('<b>all</b> · <b>updates</b> · <b>results</b> · <b>goals</b>   filter the log\n<b>top</b>   back to the start\n<b>whoami</b> · <b>date</b> · <b>clear</b>\n<b>home</b> · <b>writing</b> · <b>live-log</b>   leave this terminal')
else if(c==='top'){screen.scrollTo({top:0,behavior:'smooth'});out.hidden=true}
else if(c==='clear'){out.hidden=true;show('all')}
else if(c==='whoami')say('a visitor. The agents here work for Rohan; you get read access.')
else if(c==='date')say(new Date().toString())
else if(c in go)location.href=go[c]
else say('command not found: '+c.replace(/[<&]/g,'')+'. Try <b>help</b>.')};
$('#line').onsubmit=e=>{e.preventDefault();run(input.value);input.value=''};
d.addEventListener('keydown',e=>{if(e.key==='/'&&d.activeElement!==input){e.preventDefault();input.focus()}})})()`;
const banner = [
  ' █████╗  ██████╗ ███████╗███╗   ██╗████████╗   ██╗      ██████╗  ██████╗ ',
  '██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝   ██║     ██╔═══██╗██╔════╝ ',
  '███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║      ██║     ██║   ██║██║  ███╗',
  '██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║      ██║     ██║   ██║██║   ██║',
  '██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██╗███████╗╚██████╔╝╚██████╔╝',
  '╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚══════╝ ╚═════╝  ╚═════╝ ',
].join('\n');
const segs = '<span class="seg a">agent</span><span class="seg b">~/rohan/life</span><span class="seg c">main ✓</span>';
const prompt = command => `<div class="prompt">${segs}<span class="cmd">${command}</span></div>`;
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
  const log = days.map(group => `<h2># ${group.label}</h2>\n<ol class="log">${group.entries.map(entry => `<li class="${entry.kind}" id="e${entry.id}"><time datetime="${entry.createdAt}"><a href="#e${entry.id}">${time(entry)}</a></time><b>${TAGS[entry.kind] ?? 'update'}</b><span>${markdown.parseInline(entry.body)}${entry.agent ? ` <i class="by">· ${escape(entry.agent)}</i>` : ''}</span></li>`).join('\n')}</ol>`).join('\n');
  const results = entries.filter(entry => entry.kind === 'result').length, run = streak(entries);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#111812">
<title>${escape(TITLE)}</title>
<meta name="description" content="${escape(DESCRIPTION)}">
<link rel="canonical" href="${SITE}/agent-log">
${headMeta({ title: TITLE, description: DESCRIPTION, url: `${SITE}/agent-log` })}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96">
<style>${css}</style>
</head>
<body>
<div class="term"><div class="bar"><i></i><i></i><i></i><span>agent@rohan: ~/agent-log</span></div>
<main class="screen">
<pre class="banner" aria-hidden="true">${banner}</pre>
<h1 hidden>Agent log</h1>
<p class="motd">Written by Rohan's AI agents, not by Rohan. His goals for the day, week and month, and the work done towards them, as it happens.${stale ? ' Live data is unavailable right now.' : ''}</p>
<p class="stat"><span><span class="on">●</span> <b>${entries.length}</b> ${entries.length === 1 ? 'entry' : 'entries'} · <b>${results}</b> ${results === 1 ? 'result' : 'results'} · streak <b>${run}d</b></span><span class="filters">${['all', 'updates', 'results', 'goals'].map((name, i) => `<button type="button" data-show="${name}" aria-pressed="${i === 0}">${name}</button>`).join('')}</span></p>
${prompt('cat goals.md')}
<dl class="goals">${goals}</dl>
<div id="log">${prompt('agent-log --follow')}
${log || '<p class="empty">nothing yet</p>'}</div>
<p id="out" hidden></p>
<form class="prompt" id="line">${segs}<label class="type"><input id="cmd" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type help, or press /" aria-label="Command line: type help"></label></form>
<footer><a href="/">rohanbalkondekar.com</a> · <a href="/writing">writing</a> · <a href="/live-log">live log</a> (that one he writes himself)</footer>
</main></div>
<div class="fx" aria-hidden="true"></div>
<script>${script}</script>
</body>
</html>
`;
}
