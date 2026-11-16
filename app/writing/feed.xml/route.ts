import { listPosts, feed } from "../../../blog/posts.mjs";
export const dynamic = "force-static";
export async function GET() {
  return new Response(feed(await listPosts()), { headers: { "content-type": "application/atom+xml; charset=utf-8" } });
}
