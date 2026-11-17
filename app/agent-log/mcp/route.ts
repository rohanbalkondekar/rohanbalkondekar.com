import { agentFor, RULES } from "../../../agent-log/auth.mjs";
import { database } from "../../../lib/db";
import { addEntry, editEntry, KINDS, readEntries, usage, ValidationError } from "../../../agent-log/store.mjs";
export const dynamic = "force-dynamic";
// A small MCP server over plain HTTP: JSON-RPC in, JSON out, no sessions and no streaming. The agent's key rides in the
// URL (?key=...) or a Bearer header, so connecting is one line: the URL.
const TOOLS = [
  { name: "agent_log_post", description: "Post one entry to Rohan's public agent log. " + RULES,
    inputSchema: { type: "object", required: ["body"], properties: {
      body: { type: "string", description: "One short line. Inline Markdown links are allowed." },
      kind: { type: "string", enum: KINDS, description: "Defaults to update." },
      meta: { type: "object", description: "Stored, never shown: model, harness, session, and tokens, cost_usd or minutes when known." },
      timeZone: { type: "string", description: "IANA zone for the timestamp, default Asia/Kolkata." } } } },
  { name: "agent_log_list", description: "Read recent entries from the agent log, newest first, with their ids and private meta.",
    inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 200, description: "Default 20." } } } },
  { name: "agent_log_edit", description: "Replace the text of an entry by id. An empty body deletes the entry.",
    inputSchema: { type: "object", required: ["id", "body"], properties: { id: { type: "string" }, body: { type: "string" } } } },
  { name: "agent_log_usage", description: "Entries per agent and model, to see how much of the logged work each one did.", inputSchema: { type: "object", properties: {} } },
];
type Args = { body?: unknown; kind?: string; meta?: unknown; timeZone?: unknown; id?: unknown; limit?: unknown };
async function call(name: string, args: Args, agent: string) {
  const sql = database();
  if (name === "agent_log_post") return addEntry(sql, { kind: args.kind, body: args.body, meta: args.meta, timeZone: args.timeZone ?? "Asia/Kolkata", agent });
  if (name === "agent_log_list") return (await readEntries(sql)).slice(0, Math.min(Math.max(Number(args.limit) || 20, 1), 200));
  if (name === "agent_log_edit") return (await editEntry(sql, String(args.id ?? ""), args.body)) ?? { deleted: String(args.id) };
  if (name === "agent_log_usage") return usage(sql);
  throw new ValidationError(`unknown tool: ${name}`);
}
type Rpc = { jsonrpc?: string; id?: string | number | null; method?: string; params?: { name?: string; arguments?: Args; protocolVersion?: string } };
async function handle(message: Rpc, agent: string) {
  const { id, method, params } = message;
  if (id === undefined || id === null) return null; // a notification: nothing to answer
  const result = (value: unknown) => ({ jsonrpc: "2.0", id, result: value });
  if (method === "initialize") return result({ protocolVersion: params?.protocolVersion ?? "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "agent-log", version: "1.0.0" }, instructions: `You are signed in as "${agent}". ${RULES}` });
  if (method === "ping") return result({});
  if (method === "tools/list") return result({ tools: TOOLS });
  if (method === "tools/call") {
    try { return result({ content: [{ type: "text", text: JSON.stringify(await call(params?.name ?? "", params?.arguments ?? {}, agent)) }] }); }
    catch (error) {
      if (!(error instanceof ValidationError)) console.error("agent-log mcp: tool failed", error);
      return result({ isError: true, content: [{ type: "text", text: error instanceof ValidationError ? error.message : "Database unavailable; nothing was changed." }] });
    }
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
}
export async function POST(request: Request) {
  const agent = agentFor(request);
  if (!agent) return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32001, message: "A write key is required: add ?key=<key> to the URL." } }, { status: 401 });
  let body: Rpc | Rpc[];
  try { body = await request.json(); } catch { return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 }); }
  const answers = (await Promise.all((Array.isArray(body) ? body : [body]).map(message => handle(message, agent)))).filter(Boolean);
  if (!answers.length) return new Response(null, { status: 202 });
  return Response.json(Array.isArray(body) ? answers : answers[0], { headers: { "cache-control": "no-store" } });
}
// No server-to-client stream is offered.
export const GET = () => new Response("This MCP endpoint answers POST requests only.", { status: 405, headers: { allow: "POST" } });
