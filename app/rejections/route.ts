import { database } from "../../lib/db";
import seed from "../../rejections/data.json";
import { renderPage } from "../../rejections/render.mjs";
import { challenge, readEntries } from "../../rejections/store.mjs";
export const dynamic = "force-dynamic";
export async function GET() {
  let html: string;
  try { html = renderPage({ challenge, entries: await readEntries(database()) }); }
  catch (error) { console.error("rejections: live data unavailable", error); html = renderPage(seed, { stale: true }); }
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
