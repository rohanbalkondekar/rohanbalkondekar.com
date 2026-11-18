<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent access

Agents read this site as much as people do. Keep these true for every public page, old and new:

- Each page has a Markdown version at the same path plus `.md`, with a `> Site index` line and a canonical `Link` header pointing at the HTML page.
- The page is listed in `pages` in `next.config.ts`, so `Accept: text/markdown` returns the Markdown and the HTML response names it in a `Link` header.
- The page is in `llms.txt` (with its `.md` link) and in `app/sitemap.ts`.
- A page backed by data also has a JSON read API that needs no key. Writes always need a key.
- `llms.txt` keeps a working contact address and the "For agents" section.
- Before shipping, fetch the `.md` URL and the page with `Accept: text/markdown`, and check both return `text/markdown`.

`CLAUDE.md` contains only `@AGENTS.md`, so both files always carry the same rules. Edit this file, never that one.
