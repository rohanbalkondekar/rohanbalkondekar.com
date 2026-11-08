import { listPosts, renderPost, postMarkdown } from "../../../blog/posts.mjs";
export const dynamicParams = false;
// Each post is served as HTML at /blog/<slug> and as Markdown at /blog/<slug>.md.
export async function generateStaticParams() {
  return (await listPosts()).flatMap(({ slug }) => [{ slug }, { slug: `${slug}.md` }]);
}
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const markdown = slug.endsWith(".md");
  const post = (await listPosts()).find(post => post.slug === slug.replace(/\.md$/, ""));
  if (!post) return new Response("Not found", { status: 404 });
  return markdown
    ? new Response(postMarkdown(post), { headers: { "content-type": "text/markdown; charset=utf-8", link: `<https://rohanbalkondekar.com/blog/${post.slug}>; rel="canonical"` } })
    : new Response(renderPost(post), { headers: { "content-type": "text/html; charset=utf-8" } });
}
