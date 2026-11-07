import { listPosts, renderIndex } from "../../blog/posts.mjs";
export const dynamic = "force-static";
export async function GET() {
  return new Response(renderIndex(await listPosts()), { headers: { "content-type": "text/html; charset=utf-8" } });
}
