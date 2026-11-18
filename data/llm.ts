// Shared model-provider helper (same env variables as /api/ask). Used by /api/review.
// ASK_LLM_<n>_KEY / _MODEL / _BASE_URL for n = 1..4, then optional ANTHROPIC_API_KEY.

export type Provider = { name: string; call: (system: string, user: string, signal: AbortSignal) => Promise<string> };

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

export function providers(maxTokens = 1400): Provider[] {
  const list: Provider[] = [];
  for (let i = 1; i <= 4; i++) {
    const key = pick(i, "KEY");
    const model = pick(i, "MODEL");
    const base = pick(i, "BASE_URL") ?? baseFromKey(key);
    if (!base || !key || !model) continue;
    list.push({
      name: `llm${i}`,
      async call(system, user, signal) {
        const res = await fetch(`${base.replace(/\/+$/, "")}/chat/completions`, {
          method: "POST",
          signal,
          headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model,
            temperature: 0,
            max_tokens: maxTokens,
            messages: [
              { role: "system", content: system },
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
