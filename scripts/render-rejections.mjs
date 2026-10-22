import { readFile, writeFile } from 'node:fs/promises';
import { labels, summarize } from '../rejections/model.mjs';
const data = JSON.parse(await readFile(new URL('../rejections/data.json', import.meta.url)));
const stats = summarize(data);
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const rows = data.entries.map((entry, index) => `<li class="entry"><span class="number">${index + 1}.</span><div><div class="entry-heading"><h3>${escape(entry.title)}</h3><span class="status">${labels[entry.status]}</span></div><p>${escape(entry.note)}</p><small>${entry.submittedDate ? `Submitted ${escape(date(entry.submittedDate))}` : 'Submission date unknown'}</small></div></li>`).join('\n');
await writeFile(new URL('../rejections/index.html', import.meta.url), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rejections · Rohan Balkondekar</title>
<meta name="description" content="1,000 genuine asks in six months. A simple public log of what I asked and what happened.">
<link rel="canonical" href="https://rohanbalkondekar.com/rejections">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/rejections/style.css">
<meta property="og:title" content="Rejections · Rohan Balkondekar">
<meta property="og:description" content="1,000 genuine asks in six months. What I asked, and what happened.">
<meta property="og:url" content="https://rohanbalkondekar.com/rejections">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="page">
<header><a href="/">Rohan Balkondekar</a><span>/ rejections</span></header>
<main id="main">
<section class="intro" aria-labelledby="title">
<p class="kicker">A public experiment</p>
<h1 id="title">More asks.<br><em>Less fear.</em></h1>
<p class="description">1,000 genuine asks in six months. I’m keeping a record of what I ask and what happens. The goal is to take action, not manufacture rejection.</p>
<p class="dates">${date(data.challenge.startDate)} – ${date(data.challenge.endDate)} <span>· About six thoughtful asks a day.</span></p>
</section>
<section class="summary" aria-label="Challenge progress">
<div class="progress-label"><p><strong>${stats.attempts.toLocaleString('en-US')}</strong> / ${data.challenge.target.toLocaleString('en-US')} confirmed attempts</p><span>${Number(stats.percent.toFixed(1))}%</span></div>
<progress value="${stats.attempts}" max="${data.challenge.target}" aria-label="Confirmed attempts toward ${data.challenge.target}"></progress>
<p class="counts"><span><b>${stats.accepted}</b> accepted</span><span><b>${stats.rejected}</b> rejected</span><span><b>${stats.pending}</b> pending</span><span><b>${stats.in_progress}</b> in progress</span></p>
</section>
<section class="log" aria-labelledby="log-title"><div class="log-heading"><h2 id="log-title">The asks</h2><span>${stats.tracked} ${stats.tracked === 1 ? 'opportunity' : 'opportunities'} tracked</span></div><ol>${rows}</ol></section>
<aside><p>In progress doesn’t count yet. Pending means submitted, awaiting a decision. Silence isn’t rejection.</p><p>I also want to see how long 1,000 actual rejections takes. That’s a separate count—not the six-month target.</p></aside>
</main>
<footer><a href="/">← Back to my website</a><a href="/rejections/data.json">Public log data ↗</a></footer>
</div>
</body>
</html>\n`);
