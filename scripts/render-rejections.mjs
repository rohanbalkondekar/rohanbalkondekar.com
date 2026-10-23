import { readFile, writeFile } from 'node:fs/promises';
import { renderPage } from '../rejections/render.mjs';
const data = JSON.parse(await readFile(new URL('../rejections/data.json', import.meta.url)));
await writeFile(new URL('../rejections/index.html', import.meta.url), renderPage(data));
