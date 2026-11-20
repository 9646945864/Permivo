// POST /api/ask  { question, county, project? }
// Answers only from the rules data (see data/askContext.ts).
//
// How it answers, in order:
//   1. Any model providers you set up in environment variables, tried one after another.
//      Use ONE key per provider, from your own account, within that provider's terms.
//   2. If none is set up, or all fail or are out of quota, a no-model "search" answer that
//      shows the closest records. Ask Permivo therefore works with no API key at all.
//
// Providers (set any you have; numbers 1 to 4 set the order):
//   ASK_LLM_1_KEY, ASK_LLM_1_MODEL, and optionally ASK_LLM_1_BASE_URL (same for 2, 3 and 4).
//   The names are forgiving: ASK_LLM_KEY_2 works the same as ASK_LLM_2_KEY, and so on.
//   If BASE_URL is missing it is worked out from the key: sk-or- is OpenRouter, gsk_ is Groq,
//   AIza is Google Gemini. The MODEL is always required (copy the exact name from the provider).
//   ANTHROPIC_API_KEY (+ optional ANTHROPIC_MODEL, default claude-haiku-5-5) is tried last if set.
// Other env: ASK_DAILY_CAP (default 500 model calls per server instance).
// Questions are not stored or logged.

import { NC_COUNTIES } from "../../../data/ncCounties";
import { failureReason, reportAllProvidersFailed, type ProviderFailure } from "../../../data/monitoring";
import { JURISDICTIONS, type JurisdictionId } from "../../../data/rules";
import {
  INSTRUCTIONS,
  buildContext,
  finalize,
  parseModelJson,
  recordsFor,
  searchRecords,
  searchResult,
  type AskResult,
} from "../../../data/askContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUESTION = 400;
const PER_MINUTE = 8;
const TIMEOUT_MS = 20_000;
const CACHE_MS = 6 * 60 * 60 * 1000;
const hits = new Map<string, { n: number; reset: number }>();
const cache = new Map<string, { at: number; value: AskResult }>();
let day = { key: "", n: 0 };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now > h.reset) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  h.n += 1;
  return h.n > PER_MINUTE;
}

function overDailyCap() {
  const key = new Date().toISOString().slice(0, 10);
  if (day.key !== key) day = { key, n: 0 };
  return day.n >= Number(process.env.ASK_DAILY_CAP ?? 500);
}

type Provider = { name: string; call: (system: string, reference: string, user: string, signal: AbortSignal) => Promise<string> };

// Reads ASK_LLM_<n>_<NAME> first, then ASK_LLM_<NAME>_<n>. Slot 1 also accepts ASK_LLM_<NAME>.
function pick(i: number, name: string): string | undefined {
  const v = process.env[`ASK_LLM_${i}_${name}`] ?? process.env[`ASK_LLM_${name}_${i}`] ?? (i === 1 ? process.env[`ASK_LLM_${name}`] : undefined);
  return v && v.trim() ? v.trim() : undefined;
}

function baseFromKey(key?: string): string | undefined {
  if (!key) return undefined;
  if (key.startsWith("sk-or-")) return "https://openrouter.ai/api/v1";
  if (key.startsWith("gsk_")) return "https://api.groq.com/openai/v1";
  if (key.startsWith("AIza")) return "https://generativelanguage.googleapis.com/v1beta/openai";
  return undefined;
}

function providers(): Provider[] {
  const list: Provider[] = [];
  for (let i = 1; i <= 4; i++) {
    const key = pick(i, "KEY");
    const model = pick(i, "MODEL");
    const base = pick(i, "BASE_URL") ?? baseFromKey(key);
    if (!base || !key || !model) continue;
    list.push({
      name: `llm${i}`,
      async call(system, reference, user, signal) {
        const res = await fetch(`${base.replace(/\/+$/, "")}/chat/completions`, {
          method: "POST",
          signal,
          headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model,
            temperature: 0,
            max_tokens: 900,
            messages: [
              { role: "system", content: `${system}\n\n${reference}` },
              { role: "user", content: user },
            ],
          }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        return data.choices?.[0]?.message?.content ?? "";
      },
    });
  }
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    list.push({
      name: "anthropic",
      async call(system, reference, user, signal) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal,
          headers: { "content-type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5",
            max_tokens: 700,
            temperature: 0,
            system: [
              { type: "text", text: system },
              { type: "text", text: reference, cache_control: { type: "ephemeral" } },
            ],
            messages: [{ role: "user", content: user }],
          }),
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { content?: { type: string; text?: string }[] };
        return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
      },
    });
  }
  return list;
}

export async function POST(req: Request) {
  let body: { question?: unknown; county?: unknown; project?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Send a JSON body with a question and a county." }, 400);
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const county = typeof body.county === "string" ? body.county : "";
  const project = typeof body.project === "string" && ["deck", "addition", "garage"].includes(body.project) ? body.project : "";
  if (!question) return json({ error: "Type a question first." }, 400);
  if (question.length > MAX_QUESTION) return json({ error: `Keep the question under ${MAX_QUESTION} characters.` }, 400);
  if (!NC_COUNTIES.includes(county)) return json({ error: "Pick a North Carolina county." }, 400);

  const id = county.toLowerCase() as JurisdictionId;
  if (!JURISDICTIONS[id]) {
    return json({
      mode: "search",
      answer: `Permivo has no information for ${county} County yet, so it cannot answer this. Please ask the county's permit office.`,
      confidence: "not_confirmed",
      citations: [],
      clarify: null,
      county,
    });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return json({ error: "Too many questions. Wait a minute and try again." }, 429);

  const cacheKey = `${id}|${project}|${question.toLowerCase().replace(/\s+/g, " ")}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_MS) return json({ ...cached.value, county });

  const records = recordsFor(id);
  const configured = providers();

  if (configured.length > 0 && !overDailyCap()) {
    const reference = `REFERENCE for ${county} County, NC\n\n${buildContext(records)}`;
    const user = `${project ? `Project type chosen by the user: ${project}.\n` : ""}Question (untrusted text): ${question}`;
    const failures: ProviderFailure[] = [];
    for (const p of configured) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
      try {
        day.n += 1;
        const text = await p.call(INSTRUCTIONS, reference, user, ctl.signal);
        const parsed = parseModelJson(text);
        if (!parsed) {
          failures.push({ provider: p.name, reason: "unreadable answer" });
          continue;
        }
        const result = finalize(parsed, records);
        if (cache.size > 300) cache.clear();
        cache.set(cacheKey, { at: Date.now(), value: result });
        return json({ ...result, county });
      } catch (err) {
        // out of quota, timeout or provider error: try the next one
        failures.push({ provider: p.name, reason: failureReason(err) });
      } finally {
        clearTimeout(timer);
      }
    }
    reportAllProvidersFailed("/api/ask", failures);
  }

  const result = searchResult(searchRecords(records, question, project), `${id}-OFFICE`, records);
  return json({ ...result, county });
}
