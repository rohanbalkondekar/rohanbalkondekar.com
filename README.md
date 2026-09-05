# Personal website and workout tracker

The homepage remains plain HTML. Next.js serves `/workout`, the mobile progress dashboard, and authenticated workout APIs. Vercel hosts the app; a dedicated Neon database stores account-owned workouts and paused sessions. Neon manages Google and email sign-in.

Run `npm ci`, `npm run dev`, and open `/workout`. Production uses `npm run build`.

Configure `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and a randomly generated `NEON_AUTH_COOKIE_SECRET` through the personal Vercel project's environment settings. Keep credentials out of source control. Run `node --env-file=.env.local scripts/migrate.mjs` once when provisioning the database.

`npm test` checks legacy browser migration, account separation, offline retry, and backup verification. The app keeps the original browser database intact when importing records into the first signed-in account. Completed sessions are immutable and deduplicated by account and session ID. Paused sessions use the latest update timestamp; avoid editing the same workout on two devices simultaneously.

Open the deployed tracker and sign in on each device with existing records to upload them. Backup status only confirms success after reading the saved records back from the server.
