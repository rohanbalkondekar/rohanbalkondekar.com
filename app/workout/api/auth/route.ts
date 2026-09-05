import { auth } from "../../../../lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const { data, error } = await auth.getSession();
  if (error) return Response.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  return Response.json({ account: data?.user ? { id: data.user.id, email: data.user.email } : null }, { headers: { "cache-control": "private, no-store" } });
}
