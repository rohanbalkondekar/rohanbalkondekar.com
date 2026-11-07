import type { NextConfig } from "next";
const config: NextConfig = {
  async redirects() {
    return [{ source: "/blogs/:path*", destination: "/blog/:path*", permanent: true }, { source: "/livelog", destination: "/live-log", permanent: true }];
  },
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }, { source: "/llms-full.txt", destination: "/index.md" }];
  },
};
export default config;
