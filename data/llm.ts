// Shared model-provider helper for /api/ask and /api/review.
//
// Settings, for n = 1..4 (lower numbers are tried first):
//   ASK_LLM_<n>_KEY       required. ASK_LLM_KEY_<n> works too, and slot 1 also accepts ASK_LLM_KEY.
//   ASK_LLM_<n>_MODEL     optional. When missing, a model is chosen from the provider's own model list.
//   ASK_LLM_<n>_BASE_URL  optional. When missing, it is worked out from the key:
//                           AIza...        Google Gemini
//                           sk-or-...      OpenRouter
//                           gsk_...        Groq
//                           sk- + 32 hex   DeepSeek
// Then ANTHROPIC_API_KEY (+ optional ANTHROPIC_MODEL) is tried last if set.

export type Provider = { name: string; call: (system: string, user: string, signal: AbortSignal) => Promise<string> };
export type Kind = "gemini" | "openrouter" | "groq" | "deepseek" | "custom";
export type Slot = { n: number; key: string; base: string; model?: string; kind: Kind };

const BASES: Record<Exclude<Kind, "custom">, string> = {
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
  openrouter: "https://openrouter.ai/api/v1",
  groq: "https://api.groq.com/openai/v1",
  deepseek: "https://api.deepseek.com",
};

// Used only if the provider's model list cannot be read.
const FALLBACK_MODEL: Record<Kind, string | undefined> = {
  gemini: "gemini-2.5-flash",
  openrouter: "openrouter/auto",
  groq: "llama-3.3-70b-versatile",
  deepseek: "deepseek-chat",
  custom: undefined,
};

function pick(i: number, name: string): string | undefined {
  const v = process.env[`ASK_LLM_${i}_${name}`] ?? process.env[`ASK_LLM_${name}_${i}`] ?? (i === 1 ? process.env[`ASK_LLM_${name}`] : undefined);
  return v && v.trim() ? v.trim() : undefined;
}

export function kindOf(key: string, base?: string): Kind {
  if (base) {
    if (base.includes("generativelanguage.googleapis.com")) return "gemini";
    if (base.includes("openrouter.ai")) return "openrouter";
    if (base.includes("groq.com")) return "groq";
    if (base.includes("deepseek.com")) return "deepseek";
  }
  if (key.startsWith("AIza")) return "gemini";
  if (key.startsWith("sk-or-")) return "openrouter";
  if (key.startsWith("gsk_")) return "groq";
  if (/^sk-[a-f0-9]{32}$/i.test(key)) return "deepseek";
  return "custom";
}

/** Every slot that has a key and an address. The model may still be missing; see modelFor. */
export function slots(): Slot[] {
  const list: Slot[] = [];
  for (let n = 1; n <= 4; n++) {
    const key = pick(n, "KEY");
    if (!key) continue;
    const setBase = pick(n, "BASE_URL");
    const kind = kindOf(key, setBase);
    const base = setBase ?? (kind === "custom" ? undefined : BASES[kind]);
    if (!base) continue;
    list.push({ n, key, base: base.replace(/\/+$/, ""), model: pick(n, "MODEL"), kind });
  }
  return list;
}

/** Picks a model from a provider's list when none is set. Prefers fast, general chat models. */
export function chooseModel(kind: Kind, ids: string[]): string | undefined {
  const clean = ids.map((id) => id.replace(/^models\//, ""));
  const skip = /(lite|image|tts|audio|live|embed|vision|exp|preview|thinking|search|guard|whisper|vl)/i;
  if (kind === "gemini") {
    const flash = clean
      .map((id) => ({ id, v: Number(/^gemini-(\d+(?:\.\d+)?)-flash$/.exec(id)?.[1]) }))
      .filter((x) => Number.isFinite(x.v))
      .sort((a, b) => b.v - a.v);
    if (flash.length) return flash[0].id;
    return clean.find((id) => id.startsWith("gemini") && id.includes("flash") && !skip.test(id)) ?? clean.find((id) => id.startsWith("gemini") && !skip.test(id));
  }
  if (kind === "deepseek") return clean.find((id) => id === "deepseek-chat") ?? clean.find((id) => !/reasoner/.test(id)) ?? clean[0];
  if (kind === "openrouter") {
    return (
      clean.find((id) => id === "deepseek/deepseek-chat") ??
      clean.find((id) => /^google\/gemini-[\d.]+-flash$/.test(id)) ??
      clean.find((id) => id === "openrouter/auto")
    );
  }
  if (kind === "groq") return clean.find((id) => id === "llama-3.3-70b-versatile") ?? clean.find((id) => id.includes("llama") && !skip.test(id));
  return undefined;
}

const chosen = new Map<number, string>();

/** The model to use for a slot: the one set in settings, else one chosen from the provider's list (cached). */
export async function modelFor(slot: Slot, signal?: AbortSignal): Promise<string> {
  if (slot.model) return slot.model;
  const cached = chosen.get(slot.n);
  if (cached) return cached;
  let model: string | undefined;
  try {
    const res = await fetch(`${slot.base}/models`, { headers: { authorization: `Bearer ${slot.key}` }, signal });
    if (res.ok) {
      const data = (await res.json()) as { data?: { id?: string }[]; models?: { name?: string }[] };
      const ids = [...(data.data ?? []).map((m) => m.id ?? ""), ...(data.models ?? []).map((m) => m.name ?? "")].filter(Boolean);
      model = chooseModel(slot.kind, ids);
    }
  } catch {
    // fall back below
  }
  model ??= FALLBACK_MODEL[slot.kind];
  if (!model) throw new Error("no model set");
  chosen.set(slot.n, model);
  return model;
}

/** Calls an OpenAI-compatible chat endpoint. */
export async function chat(slot: Slot, messages: { role: string; content: string }[], maxTokens: number, signal: AbortSignal): Promise<string> {
  const model = await modelFor(slot, signal);
  const res = await fetch(`${slot.base}/chat/completions`, {
    method: "POST",
    signal,
    headers: { "content-type": "application/json", authorization: `Bearer ${slot.key}` },
    body: JSON.stringify({ model, temperature: 0, max_tokens: maxTokens, messages }),
  });
  if (!res.ok) {
    if (!slot.model && (res.status === 400 || res.status === 404)) chosen.delete(slot.n); // chosen model rejected: pick again next time
    throw new Error(`status ${res.status}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

export function providers(maxTokens = 1400): Provider[] {
  const list: Provider[] = slots().map((slot) => ({
    name: `llm${slot.n}`,
    call: (system, user, signal) =>
      chat(
        slot,
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        maxTokens,
        signal
      ),
  }));
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    list.push({
      name: "anthropic",
      async call(system, user, signal) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          signal,
          headers: { "content-type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5",
            max_tokens: maxTokens,
            temperature: 0,
            system,
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
