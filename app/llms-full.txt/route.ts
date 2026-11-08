import { readFile } from "node:fs/promises";
import path from "node:path";
import { listPosts, postMarkdown } from "../../blog/posts.mjs";
export const dynamic = "force-static";
// The whole site as one Markdown file: the homepage, then every published post.
export async function GET() {
  const home = await readFile(path.join(process.cwd(), "index.md"), "utf8");
  const posts = (await listPosts()).map(post => `---\n\nSource: https://rohanbalkondekar.com/blog/${post.slug}\n\n${postMarkdown(post).replace(/^> Site index: .*\n\n/m, "").replace(/^# /, "## ")}`);
  return new Response(`${home.trim()}\n\n# Blog posts\n\n${posts.join("\n")}`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
