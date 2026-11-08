// Tell IndexNow search engines (Bing, Yandex, Naver, Seznam, Yep) that the site changed.
// Run after a deploy: node scripts/indexnow.mjs [url ...]  (no URLs = every URL in the live sitemap)
import { readFile } from 'node:fs/promises';
const host = 'rohanbalkondekar.com', key = (await readFile(new URL('../indexnow-key.txt', import.meta.url), 'utf8')).trim();
const urls = process.argv.slice(2).length ? process.argv.slice(2)
  : [...(await (await fetch(`https://${host}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const response = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/indexnow-key.txt`, urlList: urls }) });
console.log(`IndexNow: ${response.status} ${response.statusText} for ${urls.length} URLs`);
if (!response.ok && response.status !== 202) process.exit(1);
