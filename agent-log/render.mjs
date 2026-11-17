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
// Colour schemes. quiet is the default; the rest follow well-known terminal themes. The theme command or the status bar switches.
const THEMES = {
  quiet: 'bg:#0e100f;panel:#141716;fg:#d4d8d2;dim:#69736b;green:#8fd19e;yellow:#e0c27a;blue:#86b6d9;magenta:#c79bd8;cyan:#8fcfc8;red:#e08a84;glow:transparent;scan:0',
  matrix: 'bg:#0b120d;panel:#101811;fg:#b9f3c6;dim:#5f8a6b;green:#4ade80;yellow:#facc15;blue:#60a5fa;magenta:#e879f9;cyan:#22d3ee;red:#f87171;glow:rgba(74,222,128,.3);scan:.14',
  everforest: 'bg:#1e2326;panel:#272e33;fg:#d3c6aa;dim:#859289;green:#a7c080;yellow:#dbbc7f;blue:#7fbbb3;magenta:#d699b6;cyan:#83c092;red:#e67e80;glow:transparent;scan:0',
  tokyo: 'bg:#1a1b26;panel:#16161e;fg:#c0caf5;dim:#565f89;green:#9ece6a;yellow:#e0af68;blue:#7aa2f7;magenta:#bb9af7;cyan:#7dcfff;red:#f7768e;glow:transparent;scan:0',
  gruvbox: 'bg:#282828;panel:#1d2021;fg:#ebdbb2;dim:#928374;green:#b8bb26;yellow:#fabd2f;blue:#83a598;magenta:#d3869b;cyan:#8ec07c;red:#fb4934;glow:transparent;scan:0',
  catppuccin: 'bg:#1e1e2e;panel:#181825;fg:#cdd6f4;dim:#6c7086;green:#a6e3a1;yellow:#f9e2af;blue:#89b4fa;magenta:#cba6f7;cyan:#94e2d5;red:#f38ba8;glow:transparent;scan:0',
};
const vars = spec => spec.split(';').map(pair => '--' + pair).join(';');
// Layout: a tmux-style window bar on top (the site's navigation), the scrolling screen, a pinned prompt, and a status line.
const css = `:root{color-scheme:dark;${vars(THEMES.quiet)};--line:1.65em;--pad:clamp(14px,4.5vw,64px)}
${Object.entries(THEMES).map(([name, spec]) => `:root[data-theme=${name}]{${vars(spec)}}`).join('')}
*{box-sizing:border-box}html,body{height:100%}body{margin:0;background:var(--bg);color:var(--fg);font:clamp(13.5px,.55vw + 9px,16.5px)/var(--line) "JetBrains Mono","Fira Code","SF Mono",ui-monospace,"Cascadia Code",Menlo,Consolas,monospace;-webkit-font-smoothing:antialiased}
.term{display:flex;flex-direction:column;height:100vh;height:100dvh}
a{color:var(--cyan);text-decoration:none}a:hover{text-decoration:underline}p{margin:0}b{font-weight:600}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.tmux,.status{flex:none;display:flex;align-items:center;gap:0 1.4em;padding:0 var(--pad);background:var(--panel);color:var(--dim);font-size:.86em;line-height:2.1;white-space:nowrap;overflow:hidden}
.tmux .sess{color:var(--bg);background:var(--green);padding:0 .8em;margin-left:calc(-1 * var(--pad));font-weight:600}.tmux a{color:var(--dim)}.tmux a[aria-current]{color:var(--fg);font-weight:600}
.status{gap:0 1.2em}.status .mode{color:var(--bg);background:var(--blue);padding:0 .8em;margin-left:calc(-1 * var(--pad));font-weight:600}.status kbd{font:inherit;color:var(--fg)}.status .right{margin-left:auto}.status .right b{color:var(--green)}.status button{color:var(--yellow)}.status button:hover{text-decoration:underline}
.screen{flex:1;min-height:0;overflow:hidden auto;overscroll-behavior:contain;padding:22px var(--pad) 18px;text-shadow:0 0 7px var(--glow);scrollbar-color:var(--dim) transparent;outline:0}
.screen>*{max-width:1120px}
.fx{position:fixed;inset:0;pointer-events:none;z-index:9;background:repeating-linear-gradient(rgba(0,0,0,0) 0 2px,rgba(0,0,0,var(--scan)) 2px 3px)}
h1{font:inherit;font-weight:600;color:var(--green);margin:0}
.motd{color:var(--dim)}
.prompt{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 .6em;margin:var(--line) 0 .35em}
.ps .u{color:var(--dim);font-weight:400}.ps .c{color:var(--green)}
.cmd{color:var(--fg);font-weight:600}
.filters{display:flex;gap:0 1.1em;margin-left:auto}.filters button{color:var(--dim)}.filters button:hover{color:var(--fg)}.filters button[aria-pressed=true]{color:var(--yellow)}.filters button[aria-pressed=true]:before{content:'['}.filters button[aria-pressed=true]:after{content:']'}
.goals{margin:0;padding:0}.goals div{display:grid;grid-template-columns:7.6em 1fr;column-gap:14px}.goals dt{color:var(--yellow)}.goals dd{margin:0}.goals small,.by{color:var(--dim);font-size:inherit;font-style:normal}.unset{color:var(--dim)}
h2{font:inherit;color:var(--dim);margin:var(--line) 0 0}.prompt+h2{margin-top:0}
.log{list-style:none;margin:0;padding:0}.log li{display:grid;grid-template-columns:3.4em 4.2em 1fr;column-gap:14px;margin-left:-10px;padding-left:8px;border-left:2px solid transparent;cursor:default}
.log li:hover{background:color-mix(in srgb,var(--fg) 5%,transparent)}.log li.sel{background:color-mix(in srgb,var(--green) 13%,transparent);border-left-color:var(--green)}.log li:target{border-left-color:var(--yellow)}
.log li span,.goals dd{min-width:0;overflow-wrap:anywhere}.log time a{color:var(--dim)}.log b{color:var(--green)}.log .result b{color:var(--yellow)}.log [class^=goal] b{color:var(--magenta)}
[hidden]{display:none!important}.empty{color:var(--dim)}
#out .prompt{margin-top:.8em}.res{color:var(--fg)}.res .k{color:var(--yellow)}.res .k:hover{text-decoration:underline}.res .d{color:var(--dim)}.res .err{color:var(--red)}
.cmdline{flex:none;margin:0;padding:.55em var(--pad);border-top:1px solid color-mix(in srgb,var(--dim) 35%,transparent);flex-wrap:nowrap;text-shadow:0 0 7px var(--glow)}
.cmdline .ps{white-space:nowrap}.cmdline input{flex:1;min-width:0;font:inherit;font-weight:600;color:var(--fg);background:none;border:0;outline:0;padding:0;caret-color:var(--green)}.cmdline input::placeholder{color:var(--dim);font-weight:400}
.chips{display:none;flex:none;gap:.5em;padding:0 var(--pad) .6em;overflow-x:auto}.chips button{color:var(--dim);border:1px solid color-mix(in srgb,var(--dim) 45%,transparent);border-radius:4px;padding:0 .7em;white-space:nowrap}
@media(hover:none){.chips{display:flex}.status .hints{display:none}}
@media(max-width:700px){.tmux{gap:0 1em}.status .hints{display:none}.screen{padding-top:14px}.goals div{grid-template-columns:1fr;margin-bottom:6px}.log li{grid-template-columns:3.4em 1fr;margin-bottom:8px}.log li span{grid-column:1/-1}.prompt{gap:0 .5em}.filters{margin-left:0;width:100%}}`;
const ps = '<span class="ps"><b class="u">agent</b> <b class="c">❯</b></span>';
const prompt = (command, extra = '') => `<div class="prompt">${ps}<span class="cmd">${command}</span>${extra}</div>`;
const COMMANDS = [['filter', ['all', 'updates', 'results', 'goals']], ['look', ['theme', 'agents']], ['go', ['home', 'writing', 'live-log']], ['misc', ['top', 'clear', 'whoami', 'date', 'help']]];
// The page reads fine without this script; it adds filters, a command line, arrow-key selection and themes.
const script = `(()=>{const d=document,$=s=>d.querySelector(s),$$=s=>[...d.querySelectorAll(s)];
const screen=$('.screen'),out=$('#out'),input=$('#cmd'),themeBtn=$('#theme'),PS=$('#line .ps').outerHTML;
const kinds={all:'',updates:'update',results:'result',goals:'goal'},themes=${JSON.stringify(Object.keys(THEMES))},cmds=${JSON.stringify(COMMANDS)};
const go={home:'/',writing:'/writing','live-log':'/live-log'},fine=matchMedia('(hover:hover)').matches;
let sel=-1;
const visible=()=>$$('.log li').filter(li=>!li.hidden);
function select(i){const items=visible();$$('.log li.sel').forEach(li=>li.classList.remove('sel'));sel=Math.max(-1,Math.min(i,items.length-1));if(sel>=0){items[sel].classList.add('sel');items[sel].scrollIntoView({block:'nearest'})}}
function show(name){const kind=kinds[name];$$('.log li').forEach(li=>{li.hidden=!!kind&&!li.className.startsWith(kind)});
$$('.log').forEach(ol=>{ol.previousElementSibling.hidden=!ol.querySelector('li:not([hidden])')});
$$('.filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.show===name)));select(-1);return visible().length}
function theme(name){d.documentElement.dataset.theme=name;themeBtn.textContent='theme:'+name;try{localStorage.setItem('agent-log-theme',name)}catch(e){}}
theme(d.documentElement.dataset.theme||themes[0]);
function print(cmd,html){const row=d.createElement('div');row.innerHTML='<div class="prompt">'+PS+'<span class="cmd"></span></div><div class="res">'+html+'</div>';row.querySelector('.cmd').textContent=cmd;out.appendChild(row);screen.scrollTop=screen.scrollHeight}
const tkey=name=>'<button type="button" class="k" data-run="theme '+name+'">'+name+'</button>';
const key=name=>'<button type="button" class="k" data-run="'+name+'">'+name+'</button>';
function run(text){const raw=text.trim();if(!raw)return;const parts=raw.toLowerCase().split(' ').filter(Boolean),c=parts[0],arg=parts[1];let res;
const win=/^[0-9]$/.test(c)?$$('.tmux a')[+c]:null;
if(win){if(!win.hasAttribute('aria-current')){location.href=win.href;return}res='already here: '+win.textContent.replace('*','')}
else if(c in kinds){const n=show(c);res='showing '+c+': '+n+(n===1?' entry':' entries')+'. <span class="d">Arrow keys move through them.</span>'}
else if(c==='help')res=cmds.map(g=>'<span class="d">'+g[0]+'</span> '+g[1].map(key).join(' ')).join('<br>')+'<br><span class="d">keys</span> ↑ ↓ move · enter open · tab complete · esc reset · 0-3 switch window';
else if(c==='theme'){const now=d.documentElement.dataset.theme,pick=arg==='random'?themes.filter(x=>x!==now)[Math.floor(Math.random()*(themes.length-1))]:arg;
if(themes.includes(pick)){theme(pick);res='theme set to '+pick}else res=themes.concat('random').map(tkey).join('  ')}
else if(c==='agents'){const n={};$$('.log li').forEach(li=>{const by=li.querySelector('.by');const who=by?by.textContent.replace('·','').trim():'unsigned';n[who]=(n[who]||0)+1});res=Object.keys(n).map(k=>k+' <span class="d">'+n[k]+'</span>').join('<br>')}
else if(c==='whoami')res='a visitor. The agents here work for Rohan; you get read access.';
else if(c==='date')res=new Date().toString();
else if(c==='top'){screen.scrollTo({top:0});select(-1);return}
else if(c==='clear'){out.textContent='';show('all');return}
else if(c in go){location.href=go[c];return}
else res='<span class="err">command not found: '+c.replace(/[^a-z0-9._-]/g,'')+'</span>. Type '+key('help')+'.';
print(raw,res)}
function open(li){const link=li.querySelector('span a');if(link)location.href=link.href;else{history.replaceState(null,'','#'+li.id);print('open '+li.id,'<span class="d">no link in this entry; its address is now in the address bar</span>')}}
$('#line').addEventListener('submit',e=>{e.preventDefault();const v=input.value;input.value='';if(!v.trim()&&sel>=0)open(visible()[sel]);else run(v)});
d.addEventListener('click',e=>{const b=e.target.closest('[data-run],[data-show]');if(b){if(b.dataset.run)run(b.dataset.run);else show(b.dataset.show);if(fine)input.focus();return}
if(e.target===themeBtn){theme(themes[(themes.indexOf(d.documentElement.dataset.theme)+1)%themes.length]);return}
const li=e.target.closest('.log li');if(li&&!e.target.closest('a')){select(visible().indexOf(li));return}
if(fine&&!e.target.closest('a')&&!String(getSelection()))input.focus()});
d.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const typing=d.activeElement===input,empty=!input.value;
if(e.key==='ArrowDown'||e.key==='ArrowUp'||(empty&&(e.key==='j'||e.key==='k'))){e.preventDefault();select(e.key==='ArrowDown'||e.key==='j'?sel+1:Math.max(sel-1,0));return}
if(e.key==='Escape'){input.value='';select(-1);return}
if(empty&&e.key==='?'){e.preventDefault();run('help');return}
if(e.key==='Tab'&&typing){e.preventDefault();const v=input.value.toLowerCase();if(empty){run('help');return}
if(v.startsWith('theme ')){const th=themes.concat('random').filter(x=>x.startsWith(v.slice(6).trim()));if(th.length===1)input.value='theme '+th[0];else if(th.length)print(v,th.map(tkey).join('  '));return}
const hit=cmds.flatMap(g=>g[1]).filter(n=>n.startsWith(v));if(hit.length===1)input.value=hit[0]+(hit[0]==='theme'?' ':'');else if(hit.length)print(v,hit.map(key).join('  '));return}
if(!typing&&e.key.length===1)input.focus()});
if(location.href.endsWith('?'))history.replaceState(null,'',location.pathname);
if(fine)input.focus()})()`;
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
  const filters = `<span class="filters">${['all', 'updates', 'results', 'goals'].map((name, i) => `<button type="button" data-show="${name}" aria-pressed="${i === 0}">${name}</button>`).join('')}</span>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#141716">
<title>${escape(TITLE)}</title>
<meta name="description" content="${escape(DESCRIPTION)}">
<link rel="canonical" href="${SITE}/agent-log">
${headMeta({ title: TITLE, description: DESCRIPTION, url: `${SITE}/agent-log` })}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96">
<script>try{var t=localStorage.getItem('agent-log-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<style>${css}</style>
</head>
<body>
<div class="term">
<nav class="tmux" aria-label="Site"><span class="sess">rohan</span><a href="/">0:home</a><a href="/writing">1:writing</a><a href="/live-log">2:live-log</a><a href="/agent-log" aria-current="page">3:agent-log*</a></nav>
<main class="screen">
<h1>agent.log</h1>
<p class="motd">Rohan's goals and the work towards them, logged by his AI agents.${stale ? ' Live data is unavailable right now.' : ''}</p>
${prompt('cat goals.md')}
<dl class="goals">${goals}</dl>
<div id="log">${prompt('agent-log --follow', filters)}
${log || '<p class="empty">nothing yet</p>'}</div>
<div id="out" aria-live="polite"></div>
</main>
<form class="prompt cmdline" id="line">${ps}<input id="cmd" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" placeholder="type help" aria-label="Command line. Type help for commands."></form>
<div class="chips">${['help', 'results', 'goals', 'all', 'theme'].map(name => `<button type="button" data-run="${name}">${name}</button>`).join('')}</div>
<footer class="status"><span class="mode">LOG</span><span class="hints"><kbd>↑↓</kbd> move · <kbd>?</kbd> help</span><button type="button" id="theme">theme</button><span class="right"><b>${entries.length}</b> ${entries.length === 1 ? 'entry' : 'entries'} · <b>${results}</b> ${results === 1 ? 'result' : 'results'} · streak <b>${run}d</b></span></footer>
</div>
<div class="fx" aria-hidden="true"></div>
<script>${script}</script>
</body>
</html>
`;
}
