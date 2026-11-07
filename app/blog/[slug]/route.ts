import { listPosts, renderPost } from "../../../blog/posts.mjs";
export const dynamicParams = false;
export async function generateStaticParams() {
  return (await listPosts()).map(({ slug }) => ({ slug }));
}
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await listPosts()).find(post => post.slug === slug);
  if (!post) return new Response("Not found", { status: 404 });
  return new Response(renderPost(post), { headers: { "content-type": "text/html; charset=utf-8" } });
}
