import type { MetadataRoute } from "next";
import { listPosts } from "../blog/posts.mjs";
const site = "https://rohanbalkondekar.com";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPosts();
  return [
    { url: `${site}/`, lastModified: "2026-11-08" },
    { url: `${site}/blog`, lastModified: posts[0]?.date },
    ...posts.map(post => ({ url: `${site}/blog/${post.slug}`, lastModified: post.date })),
    { url: `${site}/live-log` },
    { url: `${site}/rejections` },
  ];
}
