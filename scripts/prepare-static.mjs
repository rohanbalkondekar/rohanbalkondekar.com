import { cp, mkdir } from "node:fs/promises";
await mkdir("public/workout", { recursive: true });
for (const file of ["index.html", "index.md", "favicon-96.png", "icon-rb-96.png", "apple-touch-icon.png", "favicon.svg", "fonts", "llms.txt", "og.png", "resume.pdf", "robots.txt", "sitemap.xml"]) await cp(file, `public/${file}`, { recursive: true });
for (const file of ["gym", "exercises", "icon.svg", "icon-rg-96.png", "apple-touch-icon.png"]) await cp(`workout/${file}`, `public/workout/${file}`, { recursive: true });
