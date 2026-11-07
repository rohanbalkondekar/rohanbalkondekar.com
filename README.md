# Personal website and workout tracker

## Writing

`/blog` is built from Markdown files in `blog/posts/`. The file name is the URL slug, and each file starts with frontmatter: `title`, `date: YYYY-MM-DD`, an optional `description`, and an optional `draft: true`. Drafts show in `npm run dev` but are left out of production builds. Publishing a post means committing the file and deploying. `/blogs/*` redirects to `/blog/*`.

Medium posts are copied in with `node scripts/import-medium.mjs`. With no argument it reads the Medium RSS feed, which only carries the 10 most recent posts. For everything, download the export (Medium → Settings → Security and apps → Download your information), unzip it, and run `node scripts/import-medium.mjs ~/Downloads/medium-export`. Drafts and short responses are skipped, and existing files are kept unless you pass `--force`. Imported posts set `canonical:` to the Medium URL, so search engines treat Medium as the original, and they show an "Originally published on Medium" link.

`/live-log` is a journal stored in the `live_log_entries` table and rendered on each request. To write, click the faint ✎ at the bottom right of the page and paste `LIVE_LOG_WRITE_TOKEN` (32+ characters, set in Vercel and `.env.local`). The page saves it in that browser's localStorage and shows the composer. ⌘↵ posts. If the newest entry is less than an hour old, the new thought is appended to it, so timestamps are always at least an hour apart. Double-click an entry to edit it, and save an empty entry to delete it. The same writes are available at `POST /live-log/api {"body"}` and `PATCH /live-log/api {"id","body"}` with `Authorization: Bearer $LIVE_LOG_WRITE_TOKEN`.

## Rejection project

`/rejections` is a public, read-only page rendered on each request from the `rejection_entries` table in the existing Neon database. No browser JavaScript, no redeploy for data changes. If the database is unreachable the page serves the committed snapshot in `rejections/index.html` and says so; it never shows fabricated zeroes. `rejections/data.json` is the seed used only when the table is first created, plus the challenge dates and target.

Statuses: `in_progress` until the ask is actually made (not counted); `pending` for a confirmed ask with no answer yet (silence stays pending); `accepted` or `rejected` only for an actual decision. `submittedDate` is `YYYY-MM-DD` when known, else `null`; an `in_progress` entry must have `null`. Each entry has a stable lowercase slug `id`. Keep private details out of titles and notes. Counts derive from statuses only.

### Updating entries (owner only)

Public: `GET /rejections/api/entries` returns the challenge, counts and entries. Writes need `Authorization: Bearer $REJECTIONS_WRITE_TOKEN`, a random secret (at least 32 characters) set only in the Vercel project's environment; any missing, short or wrong token gets 401, and the HTML page returns 405 for every write method.

```sh
# add or update (upsert by id); optional expectedVersion returns 409 if someone else changed it first
curl -X POST https://rohanbalkondekar.com/rejections/api/entries \
  -H "Authorization: Bearer $REJECTIONS_WRITE_TOKEN" -H "Content-Type: application/json" \
  -d '{"entry":{"id":"example-001","title":"Ask X for Y","category":"Work","status":"pending","submittedDate":"2026-10-24","note":"Short public note."}}'
# remove
curl -X DELETE "https://rohanbalkondekar.com/rejections/api/entries?id=example-001" -H "Authorization: Bearer $REJECTIONS_WRITE_TOKEN"
```

Every write response echoes the saved entry plus the fresh counts, so an agent can confirm the result. The same writes work locally with the database credential instead of the token: `node --env-file=.env.production.local scripts/rejections.mjs list | upsert '<entry json>' [--expect-version N] | delete <id>`. Never put the token or database URL in source, browser assets, URLs or chat logs.

Run `npm test` (set `DATABASE_URL` to also run the store round-trip) and `npm run build` before deploying code changes.

The homepage remains plain HTML. Next.js serves `/workout`, the mobile progress dashboard, and authenticated workout APIs. Vercel hosts the app; a dedicated Neon database stores account-owned workouts and paused sessions. Neon manages Google and email sign-in.

Run `npm ci`, `npm run dev`, and open `/workout`. Production uses `npm run build`.

Configure `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and a randomly generated `NEON_AUTH_COOKIE_SECRET` through the personal Vercel project's environment settings. Keep credentials out of source control. Run `node --env-file=.env.local scripts/migrate.mjs` once when provisioning the database.

`npm test` checks legacy browser migration, account separation, offline retry, and backup verification. The app keeps the original browser database intact when importing records into the first signed-in account. Completed sessions are immutable and deduplicated by account and session ID. Paused sessions use the latest update timestamp; avoid editing the same workout on two devices simultaneously.

Open the deployed tracker and sign in on each device with existing records to upload them. Backup status only confirms success after reading the saved records back from the server.
