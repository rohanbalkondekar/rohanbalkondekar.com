import { database } from "../../lib/db";
import { renderPage } from "../../live-log/render.mjs";
import { readEntries } from "../../live-log/store.mjs";
export const dynamic = "force-dynamic";
export async function GET() {
  let html: string;
  try { html = renderPage(await readEntries(database())); }
  catch (error) { console.error("live-log: data unavailable", error); html = renderPage([], { stale: true }); }
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
