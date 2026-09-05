import { z } from "zod";
import { auth } from "../../../../lib/auth";
import { database } from "../../../../lib/db";
export const dynamic = "force-dynamic";
const set = z.object({ weight: z.string().max(20), reps: z.string().max(20), rir: z.string().max(20), done: z.boolean() });
const sessionSchema = z.object({
  id: z.string().min(1).max(100), planId: z.enum(["A", "B", "C", "R"]), mode: z.enum(["gym", "home"]).optional(),
  startedAt: z.iso.datetime().optional(), endedAt: z.iso.datetime(), durationSeconds: z.number().int().nonnegative().optional(),
  logs: z.array(z.object({ exerciseId: z.string().max(100), sets: z.array(set).max(50) })).max(50),
});
const draftSchema = z.object({
  id: z.literal("active"), planId: z.enum(["A", "B", "C", "R"]), mode: z.enum(["gym", "home"]),
  currentIndex: z.number().int().min(0).max(50), draft: z.record(z.string().max(100), z.array(set).max(50)),
  startedAt: z.iso.datetime().optional(), elapsedSeconds: z.number().nonnegative().optional(),
  recoveryExerciseId: z.enum(["recovery-walk", "recovery-cycle", "recovery-mobility"]).optional(),
  updatedAt: z.iso.datetime(), deleted: z.boolean().optional(),
});
async function owner(request: Request) {
  const { data } = await auth.getSession();
  const id = data?.user?.id;
  return id && request.headers.get("x-workout-account") === id ? id : null;
}
export async function GET(request: Request) {
  const id = await owner(request);
  if (!id) return Response.json({ error: "Sign in to sync your workouts." }, { status: 401 });
  const sql = database();
  const [sessions, drafts] = await Promise.all([
    sql`SELECT payload FROM workout_sessions WHERE owner = ${id} ORDER BY ended_at DESC`,
    sql`SELECT payload FROM workout_drafts WHERE owner = ${id}`,
  ]);
  return Response.json({ sessions: sessions.map((row) => row.payload), draft: drafts[0]?.payload ?? null }, { headers: { "cache-control": "private, no-store" } });
}
export async function POST(request: Request) {
  if (request.headers.get("x-workout-client") !== "1") return Response.json({ error: "Forbidden" }, { status: 403 });
  const id = await owner(request);
  if (!id) return Response.json({ error: "Sign in to sync your workouts." }, { status: 401 });
  const text = await request.text();
  if (text.length > 100_000) return Response.json({ error: "Record too large." }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(text); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const sql = database();
  const draft = draftSchema.safeParse(body);
  if (draft.success) {
    if (Date.parse(draft.data.updatedAt) > Date.now() + 300_000) return Response.json({ error: "Check your device clock." }, { status: 400 });
    await sql`INSERT INTO workout_drafts (owner, updated_at, payload) VALUES (${id}, ${draft.data.updatedAt}, ${JSON.stringify(draft.data)}::jsonb)
      ON CONFLICT (owner) DO UPDATE SET updated_at = EXCLUDED.updated_at, payload = EXCLUDED.payload WHERE workout_drafts.updated_at < EXCLUDED.updated_at`;
    return Response.json({ saved: true }, { status: 201 });
  }
  const session = sessionSchema.safeParse(body);
  if (!session.success) return Response.json({ error: "The workout record is invalid." }, { status: 400 });
  await sql`INSERT INTO workout_sessions (owner, id, ended_at, payload) VALUES (${id}, ${session.data.id}, ${session.data.endedAt}, ${JSON.stringify(session.data)}::jsonb) ON CONFLICT (owner, id) DO NOTHING`;
  return Response.json({ saved: true }, { status: 201 });
}
