import { readFile, writeFile } from 'node:fs/promises';
import { labels, summarize } from '../rejections/model.mjs';
const data = JSON.parse(await readFile(new URL('../rejections/data.json', import.meta.url)));
const stats = summarize(data);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const rows = data.entries.map((entry, index) => `<li class="entry"><span class="number">${index + 1}.</span><div><h2>${escape(entry.title)}</h2> <span class="status">(${labels[entry.status].toLowerCase()})</span><div class="meta">${escape(entry.category)} | ${entry.submittedDate ? `submitted ${escape(date(entry.submittedDate))}` : 'submission date unknown'}</div><p class="note">${escape(entry.note)}</p></div></li>`).join('\n');
await writeFile(new URL('../rejections/index.html', import.meta.url), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rejections | Rohan Balkondekar</title>
<meta name="description" content="1,000 genuine asks in six months. A public log of asks, acceptances, rejections and pending decisions.">
<link rel="canonical" href="https://rohanbalkondekar.com/rejections">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/rejections/style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="page">
<header><a class="mark" href="/" aria-label="Rohan's website">R</a><h1>Rohan’s Rejections</h1><nav aria-label="Site"><a href="/">home</a> | <a href="/rejections/data.json">data</a></nav></header>
<main id="main">
<section class="summary" aria-label="Challenge progress">
<p><strong>${stats.attempts.toLocaleString('en-US')}</strong> / ${data.challenge.target.toLocaleString('en-US')} confirmed attempts (${Number(stats.percent.toFixed(1))}%) <span class="counts">| ${stats.accepted} accepted | ${stats.rejected} rejected | ${stats.pending} pending | ${stats.in_progress} in progress</span></p>
<p class="meta">${date(data.challenge.startDate)} – ${date(data.challenge.endDate)} · About six genuine asks a day. Success is taking action, not manufacturing rejection.</p>
</section>
<ol aria-label="Asks and outcomes">${rows}</ol>
<aside><p>In progress doesn’t count yet. Pending means submitted and awaiting a decision. Silence isn’t rejection.</p><p>The six-month goal is 1,000 attempts. I’m also tracking how long it takes to reach 1,000 actual rejections.</p></aside>
</main>
<footer><a href="/">Rohan Balkondekar</a> | <a href="/rejections/data.json">public log data</a></footer>
</div>
</body>
</html>\n`);
