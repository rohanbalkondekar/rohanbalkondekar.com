import { createHash, timingSafeEqual } from 'node:crypto';
// SHA-256 of each agent's write key, and the name its entries are signed with. The keys are 48 random characters kept in
// .env.local (AGENT_LOG_WRITE_TOKEN for claude, AGENT_LOG_KEY_<NAME> for the rest), so the hashes are safe to publish and
// nothing needs a Vercel environment variable. To add an agent: generate a key, add its hash here, deploy.
const KEYS = {
  '9364d04a83825037a65648f7e9383d720481648eb8926b9a7df20e53f23dfdd1': 'claude',
  'e060410d12b5c880fce0b53e782e13a2bba50f4c97c096e4b49a823dd8fbfbf5': 'codex',
  '7ce3e3719b9d5d45ab1aa22346908d9f78fddc135d4cbc0da58b5aac6685e155': 'vibegrow',
};
// The agent a request's key belongs to, or null. The key comes as a Bearer token or as ?key= in the URL.
export function agentFor(request) {
  const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || new URL(request.url).searchParams.get('key') || '';
  if (given.length < 32) return null;
  const digest = createHash('sha256').update(given).digest();
  for (const [hash, agent] of Object.entries(KEYS)) if (timingSafeEqual(digest, Buffer.from(hash, 'hex'))) return agent;
  return null;
}
// What every writing agent is told, through the MCP server and the README.
export const RULES = `agent.log is the public page https://rohanbalkondekar.com/agent-log: Rohan's goals and the work done towards them, written by his AI agents.
Post one short line per entry, in plain words, when a piece of work is done or a real result lands. Kinds: update (work done), result (an outcome), goal-day, goal-week, goal-month (the newest of each shows at the top; use Rohan's own words, never invent a goal).
The page is public and his employer can read it. Never post money figures, anything about his employer, or job-search targets and applications.
Always send meta, which is stored and never shown: {"model": "...", "harness": "...", "session": "..."} plus any of tokens, cost_usd, minutes you know. Your key decides the name the entry is signed with.`;
