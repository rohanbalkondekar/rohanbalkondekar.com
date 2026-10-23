import { readFile, writeFile } from 'node:fs/promises';
import { labels, summarize } from '../rejections/model.mjs';
const data = JSON.parse(await readFile(new URL('../rejections/data.json', import.meta.url)));
const stats = summarize(data);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const rows = data.entries.map((entry, index) => `<li class="entry"><span class="number">${index + 1}.</span><details><summary><span class="entry-title">${escape(entry.title)}</span><span class="status">${entry.status === 'pending' ? 'Waiting' : labels[entry.status]}</span></summary><div class="detail"><p>${escape(entry.note)}</p><p class="meta">${entry.submittedDate ? `Submitted ${escape(date(entry.submittedDate))}` : 'Submission date unknown'}</p></div></details></li>`).join('\n');
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
<header><a class="mark" href="/" aria-label="Rohan's website">R</a><h1>Rejections</h1><a class="home" href="/">Rohan Balkondekar</a></header>
<main id="main">
<section class="counts" aria-label="Outcomes">
<div class="rejected"><strong>${stats.rejected}</strong><span>Rejected</span></div>
<div><strong>${stats.accepted}</strong><span>Accepted</span></div>
<div><strong>${stats.pending}</strong><span>Waiting</span></div>
<div class="total"><strong>${stats.attempts}<small> / ${data.challenge.target.toLocaleString('en-US')}</small></strong><span>Total asks</span></div>
</section>
<div class="list-heading"><span>${date(data.challenge.startDate)} – ${date(data.challenge.endDate)}</span><span>${stats.in_progress} in progress</span></div>
<ol aria-label="Asks and outcomes">${rows}</ol>
</main>
</div>
</body>
</html>\n`);
