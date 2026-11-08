import "./render-rejections.mjs";
import { cp, mkdir, rm } from "node:fs/promises";
await mkdir("public/workout", { recursive: true });
await rm("public/rejections", { recursive: true, force: true });
await mkdir("public/rejections", { recursive: true });
await cp("rejections/style.css", "public/rejections/style.css");
for (const file of ["index.html", "index.md", "favicon-96.png", "icon-rb-96.png", "apple-touch-icon.png", "favicon.svg", "fonts", "img", "llms.txt", "og.png", "resume.pdf", "robots.txt", "sitemap.xml"]) await cp(file, `public/${file}`, { recursive: true });
for (const file of ["gym", "exercises", "icon.svg", "icon-rg-96.png", "apple-touch-icon.png"]) await cp(`workout/${file}`, `public/workout/${file}`, { recursive: true });
