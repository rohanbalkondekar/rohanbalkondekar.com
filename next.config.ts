import type { NextConfig } from "next";
const config: NextConfig = {
  async redirects() {
    return [{ source: "/blogs/:path*", destination: "/blog/:path*", permanent: true }, { source: "/livelog", destination: "/live-log", permanent: true }];
  },
  // Markdown mirrors point search engines at the HTML page.
  async headers() {
    return [{ source: "/index.md", headers: [{ key: "link", value: '<https://rohanbalkondekar.com/>; rel="canonical"' }] }];
  },
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
};
export default config;
