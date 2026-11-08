import type { NextConfig } from "next";
const site = "https://rohanbalkondekar.com";
// Agents that send `Accept: text/markdown` get the Markdown version at the same URL.
const wantsMarkdown = [{ type: "header" as const, key: "accept", value: "(.*)text/markdown(.*)" }];
// HTML page → its Markdown version. Slugs are lowercase words, so .md, .xml and other files never match.
const pages = [
  { html: "/", md: "/index.md" },
  { html: "/blog", md: "/blog.md" },
  { html: "/blog/:slug([a-z0-9-]+)", md: "/blog/:slug.md" },
  { html: "/live-log", md: "/live-log.md" },
];
const config: NextConfig = {
  async redirects() {
    return [{ source: "/blogs/:path*", destination: "/blog/:path*", permanent: true }, { source: "/livelog", destination: "/live-log", permanent: true }];
  },
  async headers() {
    return [
      // Each page advertises its Markdown version and the site index; Vary keeps HTML and Markdown cached separately.
      ...pages.map(({ html, md }) => ({ source: html, headers: [
        { key: "vary", value: "Accept" },
        { key: "link", value: `<${site}${md}>; rel="alternate"; type="text/markdown", <${site}/llms.txt>; rel="describedby"` },
      ] })),
      // Markdown files point search engines at the HTML page.
      { source: "/index.md", headers: [{ key: "link", value: `<${site}/>; rel="canonical"` }] },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: pages.map(({ html, md }) => ({ source: html, has: wantsMarkdown, destination: md })),
      afterFiles: [{ source: "/", destination: "/index.html" }],
      fallback: [],
    };
  },
};
export default config;
