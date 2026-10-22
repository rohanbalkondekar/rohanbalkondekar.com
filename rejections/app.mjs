import { labels, summarize } from './model.mjs';
const $ = id => document.getElementById(id);
function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}
try {
  const response = await fetch('/rejections/data.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Unable to load data');
  const data = await response.json();
  const stats = summarize(data);
  for (const key of ['attempts', ...Object.keys(labels)]) $(key).textContent = stats[key].toLocaleString('en-US');
  $('percent').textContent = `${Number(stats.percent.toFixed(1))}%`;
  $('progress').max = data.challenge.target;
  $('progress').value = stats.attempts;
  $('tracked').textContent = `${stats.tracked} ${stats.tracked === 1 ? 'opportunity' : 'opportunities'} tracked`;
  $('progress-note').textContent = `${stats.attempts} confirmed ${stats.attempts === 1 ? 'attempt' : 'attempts'} · ${stats.in_progress} in progress. Preparation does not count toward the goal.`;
  function render(filter) {
    const log = $('log');
    log.replaceChildren();
    const entries = data.entries.filter(entry => filter === 'all' || entry.status === filter);
    if (!entries.length) { log.append(element('p', 'empty', `No ${labels[filter].toLowerCase()} entries yet. The log will grow with real actions.`)); return; }
    for (const entry of entries) {
      const article = element('article', 'entry');
      article.append(element('span', 'entry-number', String(data.entries.indexOf(entry) + 1).padStart(2, '0')));
      const body = element('div', 'entry-body');
      body.append(element('h3', '', entry.title), element('p', '', entry.note));
      const date = entry.submittedDate ? new Date(`${entry.submittedDate}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'Date not confirmed';
      body.append(element('p', 'meta', `${entry.category} · ${entry.submittedDate ? 'Submitted ' : ''}${date}`));
      const badge = element('span', 'badge');
      badge.append(element('i', `dot ${entry.status}`), document.createTextNode(labels[entry.status]));
      article.append(body, badge);
      log.append(article);
    }
  }
  for (const button of document.querySelectorAll('[data-filter]')) button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    render(button.dataset.filter);
  });
  render('all');
} catch (error) {
  $('progress-note').textContent = 'The log could not be loaded. Please refresh to try again.';
  $('log').replaceChildren(element('p', 'empty', 'Entries are temporarily unavailable. No counts have been assumed.'));
  document.querySelectorAll('[data-filter]').forEach(button => button.disabled = true);
}
