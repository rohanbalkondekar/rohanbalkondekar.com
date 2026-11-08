import { database } from "../../lib/db";
import { logMarkdown } from "../../live-log/render.mjs";
import { readEntries } from "../../live-log/store.mjs";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return new Response(logMarkdown(await readEntries(database())), { headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "no-store", link: '<https://rohanbalkondekar.com/live-log>; rel="canonical"' } }); }
  catch (error) { console.error("live-log.md: data unavailable", error); return new Response("# Live log\n\nLive data is unavailable right now.\n", { status: 503, headers: { "content-type": "text/markdown; charset=utf-8" } }); }
}
