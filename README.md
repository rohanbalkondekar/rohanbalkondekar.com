# Personal website and workout tracker

## Rejection project

`/rejections` is a static public page. Edit `rejections/data.json` to maintain its log, then use the existing GitHub main → Vercel deployment. No write endpoint or account is needed. Each distinct ask has a stable unique ID. Keep private application materials and contact details out of this public file.

Use `in_progress` until the ask/submission is confirmed; it does not count toward 1,000 attempts. Use `pending` only for a confirmed ask awaiting an answer, then `accepted` or `rejected` only for an actual decision. Silence is still pending. `submittedDate` is an ISO date when known, otherwise `null`; never substitute the challenge start date. The initial YC entry is unconfirmed. Counters derive from statuses, not dates or row numbers. The build renders the complete page from the data file; it needs no browser JavaScript, font downloads, or runtime data fetch. Run `node scripts/prepare-static.mjs` after local data edits. Run `npm test` and `npm run build` before deploying updates.

The homepage remains plain HTML. Next.js serves `/workout`, the mobile progress dashboard, and authenticated workout APIs. Vercel hosts the app; a dedicated Neon database stores account-owned workouts and paused sessions. Neon manages Google and email sign-in.

Run `npm ci`, `npm run dev`, and open `/workout`. Production uses `npm run build`.

Configure `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and a randomly generated `NEON_AUTH_COOKIE_SECRET` through the personal Vercel project's environment settings. Keep credentials out of source control. Run `node --env-file=.env.local scripts/migrate.mjs` once when provisioning the database.

`npm test` checks legacy browser migration, account separation, offline retry, and backup verification. The app keeps the original browser database intact when importing records into the first signed-in account. Completed sessions are immutable and deduplicated by account and session ID. Paused sessions use the latest update timestamp; avoid editing the same workout on two devices simultaneously.

Open the deployed tracker and sign in on each device with existing records to upload them. Backup status only confirms success after reading the saved records back from the server.

### Live updates: proposed next step, not implemented

The current UI is an approval preview using the verified JSON seed. It does not yet update from a database.

Existing infrastructure: Next.js on Vercel; `lib/db.ts` uses Neon Postgres via the server-only `DATABASE_URL`; `lib/auth.ts` uses Neon Auth. The workout API owns separate tables and must stay unchanged.

Smallest live-data version: add a `rejection_entries` table containing only the public fields already in the JSON, plus a version and update timestamp. Serve an explicit field allowlist from a read-only, uncached GET route. The page fetches that route on load and periodically while visible, recalculating counts and preserving open details. On failure, retain the last successful data and mark it stale rather than showing fabricated zeroes. A DB edit appears on the next fetch, without a deployment.

For the first version, keep all writes out of the public application. Rohan can edit through the existing database console; the authorized agent can use existing database tooling or a local validation/upsert command with the existing server credential supplied privately. Do not put credentials in source, browser assets or URLs. No public POST/PATCH/DELETE handlers or new tokens are needed. Before implementing this route, verify the existing database identity/access without printing secrets. Do not create new roles, grants, accounts or paid services. If existing access is unavailable, leave this proposal pending rather than introducing a new service.

If an owner edit screen is later required, reuse Neon Auth with a verified owner user-ID allowlist checked server-side; an arbitrary signed-in account is insufficient. That is separate from this initial read-only public route.

Required live-data checks before launch: anonymous reads return public fields only; anonymous mutations return 405; a validated authorized DB edit becomes visible without redeploying; preparation stays excluded from waiting/total; errors keep the last valid snapshot; version checks prevent overwriting concurrent edits. None of these database checks have been run yet, because no live-data backend has been implemented or changed.
