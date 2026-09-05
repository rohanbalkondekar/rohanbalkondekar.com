import type { NextConfig } from "next";
const config: NextConfig = {
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }, { source: "/llms-full.txt", destination: "/index.md" }];
  },
};
export default config;
