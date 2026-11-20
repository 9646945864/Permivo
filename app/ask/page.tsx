"use client";

import Link from "next/link";
import { useState } from "react";
import ToolHeader from "../components/ToolHeader";
import { track } from "../components/analytics";
import { PartialNote, PlaceSelector, jurisdictionFor, usePlace } from "../components/PlaceSelector";
import { STATUS_LABELS, type Status } from "../../data/rules";
import type { AskResult } from "../../data/askContext";
import { FEEDBACK_URL } from "../../data/site";

const STATUS_STYLES: Record<Status, string> = {
  verified: "bg-green-100 text-green-900 border-green-300",
  partly: "bg-yellow-100 text-yellow-900 border-yellow-300",
  likely: "bg-blue-100 text-blue-900 border-blue-300",
  unverified: "bg-orange-100 text-orange-900 border-orange-300",
};

const CONFIDENCE: Record<AskResult["confidence"], { label: string; style: string }> = {
  verified: { label: "Based on verified sources", style: STATUS_STYLES.verified },
  partly: { label: "Partly verified. Confirm with the county.", style: STATUS_STYLES.partly },
  not_confirmed: { label: "Not confirmed. Ask the county.", style: STATUS_STYLES.unverified },
};

const PROJECTS = [
  { value: "", label: "Any project" },
  { value: "deck", label: "Deck" },
  { value: "addition", label: "Room addition" },
  { value: "garage", label: "Detached garage" },
];

const EXAMPLES = [
  "Does a deck need plan review?",
  "What do I need before I apply for the permit?",
  "How long will the permit take?",
  "Do I need a license or can the owner pull the permit?",
];

export default function AskPage() {
  const [place, setPlace] = usePlace();
  const [project, setProject] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<(AskResult & { county?: string }) | null>(null);
  const j = jurisdictionFor(place);

  async function ask(q: string) {
    const text = q.trim();
    if (!text || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    track("ask_submitted", { county: place, project: project || "any" });
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text, county: place, project }),
      });
      const data = await res.json();
      if (!res.ok) setError(data?.error ?? "Something went wrong. Try again.");
      else setResult(data);
    } catch {
      setError("Could not reach Permivo. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <ToolHeader />
      <h1 className="tool-title text-3xl text-[#211b18]">Ask Permivo</h1>
      <p className="mt-1 text-gray-600">
        Ask a permit question in plain words. Answers come only from the rules Permivo has checked, with the source and how sure we are.
      </p>

      <div role="note" className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-950">
        This assistant only repeats what is in Permivo&apos;s sources. If a rule is not confirmed, it says so. The county&apos;s own
        answer always decides. Not legal advice.
      </div>

      <PlaceSelector place={place} onChange={setPlace} />
      <PartialNote place={place} />

      <section className="mt-6" aria-labelledby="ask-project">
        <h2 id="ask-project" className="text-sm font-medium text-gray-700">Project type (optional)</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROJECTS.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={project === p.value}
              onClick={() => setProject(p.value)}
              className={`rounded-md border px-3 py-2 text-sm ${
                project === p.value ? "border-orange-800 bg-orange-800 text-white" : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
      >
        <label htmlFor="ask-question" className="text-sm font-medium text-gray-700">Your question</label>
        <textarea
          id="ask-question"
          rows={3}
          maxLength={400}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="For example: Do I need plan review for a 12 by 16 deck?"
          className="mt-2 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading || !question.trim()}
            style={{ opacity: loading || !question.trim() ? 0.6 : 1 }}
            className="rounded-md border border-orange-800 bg-orange-800 px-4 py-2 text-sm text-white"
          >
            {loading ? "Checking the sources..." : "Ask"}
          </button>
          <span className="text-xs text-gray-500">{question.length}/400. Please do not include names or addresses.</span>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setQuestion(ex);
              ask(ex);
            }}
            className="rounded-full border border-orange-200 bg-white px-3 py-1 text-xs text-gray-800"
          >
            {ex}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            {error}
          </p>
        )}

        {result && (
          <section className="mt-6 rounded-lg border border-orange-100 bg-white p-4" aria-labelledby="ask-answer">
            <div className="flex items-start justify-between gap-3">
              <h2 id="ask-answer" className="text-lg font-medium text-gray-900">
                {result.mode === "search" ? "Closest matches" : "Answer"}
              </h2>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${CONFIDENCE[result.confidence].style}`}>
                {result.mode === "search" ? "Search only. Not an answer." : CONFIDENCE[result.confidence].label}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-800">{result.answer}</p>
            {result.clarify && (
              <p className="mt-3 rounded-md border border-orange-100 bg-orange-50 p-3 text-sm text-gray-800">
                To be more precise: {result.clarify}
              </p>
            )}

            {result.confidence !== "verified" && j && (
              <p className="mt-3 text-sm text-gray-700">
                Confirm with {j.confirmWith ?? j.officeLabel}
                {j.officePhone ? ` (${j.officePhone})` : ""}.
              </p>
            )}

            {result.citations.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900">Sources</h3>
                <ul className="mt-2 space-y-2">
                  {result.citations.map((c) => (
                    <li key={c.id} className="rounded-md border border-orange-100 p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-gray-900">{c.title}</span>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[c.status]}`}>
                          {STATUS_LABELS[c.status]}
                        </span>
                      </div>
                      {c.detail && <p className="mt-1 text-gray-700">{c.detail.length > 420 ? `${c.detail.slice(0, 420)}...` : c.detail}</p>}
                      <p className="mt-1">
                        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
                          {c.sourceLabel}
                        </a>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">Checked {c.checkedOn} · Record {c.id}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-4 text-xs text-gray-500">
              Wrong or missing?{" "}
              <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
                Tell us
              </a>
              . Questions are not saved.
            </p>
          </section>
        )}
      </div>

      <p className="mt-8 text-sm text-gray-600">
        Prefer to browse? Use the <Link href="/planner" className="text-orange-800 underline">route planner</Link> or the{" "}
        <Link href="/checklist" className="text-orange-800 underline">readiness checklist</Link>.
      </p>
    </main>
  );
}
