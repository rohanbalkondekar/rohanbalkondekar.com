import { Marked } from 'marked';
import { escape, paper } from '../writing/paper.mjs';
import { cityOf } from './store.mjs';
const fallbackZone = 'Asia/Kolkata'; // entries written before places were recorded
const markdown = new Marked({ breaks: true, renderer: { html: ({ text }) => escape(text) } });
const zoneOf = timeZone => { try { new Intl.DateTimeFormat('en-GB', { timeZone }); return timeZone; } catch { return fallbackZone; } };
const day = (iso, timeZone = fallbackZone) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: zoneOf(timeZone) });
const time = (iso, timeZone = fallbackZone) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zoneOf(timeZone) });
const offset = (iso, timeZone = fallbackZone) => new Intl.DateTimeFormat('en-GB', { timeZone: zoneOf(timeZone), timeZoneName: 'shortOffset' }).formatToParts(new Date(iso)).find(part => part.type === 'timeZoneName')?.value ?? '';
const placeOf = entry => entry.place ?? (entry.timeZone && zoneOf(entry.timeZone) === entry.timeZone ? cityOf(entry.timeZone) : 'India');
// Shown after the text when an entry changed well after it was written.
const editedNote = entry => (entry.editedTimeZone || entry.editedPlace) && new Date(entry.updatedAt) - new Date(entry.createdAt) > 10 * 60 * 1000
  ? { time: time(entry.updatedAt, entry.editedTimeZone ?? entry.timeZone ?? undefined), place: entry.editedPlace ?? placeOf(entry) } : null;
const css = `.intro{color:#8a8175;font-size:15px;font-style:italic;margin-bottom:var(--rule)}.day{margin:0}.day h2{font-size:15px;font-style:italic;color:#9a5a3c;margin:var(--rule) 0 0}.entry{position:relative}.entry time{position:absolute;left:calc(-1 * var(--margin));width:calc(var(--margin) - 26px);text-align:right;font-size:13px;color:#a69c8e;font-variant-numeric:tabular-nums}.entry time a{text-decoration:none}.entry .text>p.where{margin-top:calc(-1 * var(--rule));font-size:13px;font-style:italic;color:#a69c8e}.entry .text>*{margin-bottom:var(--rule)}.empty{color:#a69c8e;font-style:italic}footer{margin-top:calc(var(--rule)*2);font-size:13px;color:#cfc6b6;text-align:right;line-height:var(--rule)}footer button{all:unset;cursor:pointer}footer button:hover{color:#8a8175}
#composer{display:none;margin-bottom:var(--rule)}.owner #composer{display:block}textarea{display:block;width:100%;min-height:calc(var(--rule)*4);border:0;padding:0;margin:0;font:inherit;line-height:var(--rule);color:inherit;resize:vertical;outline:none;background:transparent;caret-color:#9a5a3c}textarea::placeholder{color:#b8ae9f;font-style:italic}.entry textarea{margin-bottom:var(--rule)}.hint{font-size:13px;color:#a69c8e;display:flex;justify-content:space-between;gap:12px;line-height:var(--rule)}.hint button{all:unset;cursor:pointer;color:#9a5a3c}.owner .entry .text{cursor:text}#key{display:none;font:13px system-ui;padding:2px 6px;border:1px solid #ddd3c2;background:#fffdf7;width:220px}
@media(max-width:640px){.entry time{font-size:11px;width:calc(var(--margin) - 22px)}}`;
const script = `(()=>{const K='live-log-token',d=document,api='/live-log/api',hint=d.getElementById('hint');let token=localStorage.getItem(K);
const owner=()=>d.body.classList.toggle('owner',!!token);owner();
let busy=false;async function send(method,payload){if(busy)return;busy=true;hint.textContent='Saving…';try{const r=await fetch(api,{method,headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify({...payload,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone})});
if(r.status===401){localStorage.removeItem(K);token=null;owner();hint.textContent='Key rejected.';return}const j=await r.json().catch(()=>({}));if(!r.ok){hint.textContent=j.error||'Not saved: server error '+r.status;return}location.reload()}catch{hint.textContent='Not saved: network error. Try again.'}finally{busy=false}}
const box=d.getElementById('thought');box.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)&&box.value.trim())send('POST',{body:box.value})});
d.getElementById('post').onclick=()=>box.value.trim()&&send('POST',{body:box.value});
const key=d.getElementById('key');d.getElementById('write').onclick=()=>{if(token){localStorage.removeItem(K);token=null;owner();return}key.style.display='inline-block';key.focus()};
key.addEventListener('keydown',e=>{if(e.key==='Enter'&&key.value){token=key.value;localStorage.setItem(K,token);key.value='';key.style.display='none';owner();box.focus()}});
d.querySelectorAll('.entry').forEach(el=>el.querySelector('.text').addEventListener('dblclick',()=>{if(!token||el.querySelector('textarea'))return;const t=d.createElement('textarea'),text=el.querySelector('.text');t.value=el.dataset.body;text.replaceWith(t);t.style.height=t.scrollHeight+'px';t.focus();
t.addEventListener('keydown',e=>{if(e.key==='Escape')t.replaceWith(text);if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))send('PATCH',{id:el.dataset.id,body:t.value})})}));if(token)box.focus()})()`;
export function renderPage(entries, { stale = false } = {}) {
  const days = [];
  for (const entry of entries) {
    const label = day(entry.createdAt, entry.timeZone ?? undefined);
    if (days.at(-1)?.label !== label) days.push({ label, entries: [] });
    days.at(-1).entries.push(entry);
  }
  const log = days.map(group => `<section class="day"><h2>${group.label}</h2>\n${group.entries.map(entry => `<div class="entry" id="t${entry.id}" data-id="${entry.id}" data-body="${escape(entry.body)}"><time datetime="${entry.createdAt}" title="${escape(`${placeOf(entry)}, ${offset(entry.createdAt, entry.timeZone ?? undefined)}`)}"><a href="#t${entry.id}">${time(entry.createdAt, entry.timeZone ?? undefined)}</a></time><div class="text">${markdown.parse(entry.body)}<p class="where">${escape(placeOf(entry))}${(note => note ? ` · edited ${note.time}${note.place === placeOf(entry) ? '' : `, ${escape(note.place)}`}` : '')(editedNote(entry))}</p></div></div>`).join('\n')}</section>`).join('\n');
  return paper({ title: 'Live log | Rohan Balkondekar', description: 'A living journal of thoughts as they happen.', path: '/live-log', markdown: '/live-log.md', extraCss: css, script,
    body: `<main><h1>Live log</h1><p class="intro">Thoughts as they happen, unedited. Each one carries the local time and place it was written.${stale ? ' Live data is unavailable right now.' : ''}</p>
<div id="composer"><textarea id="thought" placeholder="What's on your mind?" aria-label="New thought"></textarea><div class="hint"><span id="hint">Within an hour of the last entry, it joins that entry. Double-click any entry to edit; ⌘↵ saves, Esc cancels, empty deletes.</span><button id="post">Post ⌘↵</button></div></div>
${log || '<p class="empty">Nothing yet.</p>'}</main>
<footer><input id="key" type="password" placeholder="Owner key, then Enter" aria-label="Owner key"> <button id="write" aria-label="Owner mode">✎</button></footer>` });
}
// Markdown version for agents: newest first, IST timestamps.
export const logMarkdown = entries => `# Live log\n\n> Site index: https://rohanbalkondekar.com/llms.txt\n\nThoughts by Rohan Balkondekar as they happen, unedited. Each entry shows the local time and place it was written. Newest first.\n\n${entries.map(entry => {
  const zone = entry.timeZone ?? undefined, note = editedNote(entry);
  return `## ${day(entry.createdAt, zone)}, ${time(entry.createdAt, zone)} (${placeOf(entry)}, ${offset(entry.createdAt, zone)})\n\n${entry.body.trim()}${note ? `\n\n*Edited ${note.time}, ${note.place}*` : ''}`;
}).join('\n\n') || 'Nothing yet.'}\n`;
