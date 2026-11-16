import type { MetadataRoute } from "next";
import { listPosts } from "../blog/posts.mjs";
const site = "https://rohanbalkondekar.com";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPosts();
  return [
    { url: `${site}/`, lastModified: "2026-11-15" },
    { url: `${site}/writing`, lastModified: posts[0]?.date },
    ...posts.map(post => ({ url: `${site}/writing/${post.slug}`, lastModified: post.date })),
    { url: `${site}/live-log` },
    { url: `${site}/rejections` },
  ];
}
