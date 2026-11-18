import { database } from "../../lib/db";
import seed from "../../rejections/data.json";
import { rejectionsMarkdown } from "../../rejections/render.mjs";
import { challenge, readEntries } from "../../rejections/store.mjs";
export const dynamic = "force-dynamic";
const headers = { "content-type": "text/markdown; charset=utf-8", "cache-control": "no-store", link: '<https://rohanbalkondekar.com/rejections>; rel="canonical"' };
export async function GET() {
  try { return new Response(rejectionsMarkdown({ challenge, entries: await readEntries(database()) }), { headers }); }
  catch (error) { console.error("rejections.md: live data unavailable", error); return new Response(rejectionsMarkdown(seed, { stale: true }), { headers }); }
}
