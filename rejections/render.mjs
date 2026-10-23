import { labels, summarize } from './model.mjs';
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
export function renderPage(data, { stale = false } = {}) {
  const stats = summarize(data);
  const rows = data.entries.map((entry, index) => `<li class="entry"><span class="number">${index + 1}.</span><details><summary><span class="entry-title">${escape(entry.title)}</span><span class="status">${entry.status === 'pending' ? 'Waiting' : labels[entry.status]}</span></summary><div class="detail"><p>${escape(entry.note)}</p>${entry.submittedDate ? `<p class="meta">Asked ${escape(date(entry.submittedDate))}</p>` : ''}</div></details></li>`).join('\n');
  return `<!doctype html>
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
<header><h1><a class="brand" href="/rejections" aria-label="Rejections"><span class="mark" aria-hidden="true">R</span><span aria-hidden="true">ejections</span></a></h1><a class="home" href="/">Rohan Balkondekar</a></header>
<main id="main">
<section class="counts" aria-label="Outcomes">
<div class="rejected"><strong>${stats.rejected}</strong><span>Rejected</span></div>
<div><strong>${stats.accepted}</strong><span>Accepted</span></div>
<div><strong>${stats.pending}</strong><span>Waiting</span></div>
<div class="total"><strong>${stats.attempts}<small> / ${data.challenge.target.toLocaleString('en-US')}</small></strong><span>Total asks</span></div>
</section>
<div class="list-heading"><span>${date(data.challenge.startDate)} – ${date(data.challenge.endDate)}</span><span>${stats.in_progress} in progress</span></div>${stale ? '\n<div class="list-heading"><span>Live data unavailable. Showing the last published snapshot.</span></div>' : ''}
<ol aria-label="Asks and outcomes">${rows}</ol>
</main>
</div>
</body>
</html>
`;
}
