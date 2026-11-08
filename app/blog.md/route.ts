import { listPosts, indexMarkdown } from "../../blog/posts.mjs";
export const dynamic = "force-static";
export async function GET() {
  return new Response(indexMarkdown(await listPosts()), { headers: { "content-type": "text/markdown; charset=utf-8", link: '<https://rohanbalkondekar.com/blog>; rel="canonical"' } });
}
