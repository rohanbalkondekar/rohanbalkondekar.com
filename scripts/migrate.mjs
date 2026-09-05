import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
await sql`CREATE TABLE IF NOT EXISTS workout_sessions (owner text NOT NULL, id text NOT NULL, ended_at timestamptz NOT NULL, payload jsonb NOT NULL, PRIMARY KEY (owner, id))`;
await sql`CREATE INDEX IF NOT EXISTS workout_sessions_owner_ended ON workout_sessions (owner, ended_at DESC)`;
await sql`CREATE TABLE IF NOT EXISTS workout_drafts (owner text PRIMARY KEY, updated_at timestamptz NOT NULL, payload jsonb NOT NULL)`;
console.log("Workout database schema ready.");
