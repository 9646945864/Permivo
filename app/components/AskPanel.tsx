"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "./analytics";
import { PlaceSelector, jurisdictionFor, usePlace } from "./PlaceSelector";
import { STATUS_LABELS, type Status } from "../../data/rules";
import type { AskResult } from "../../data/askContext";
import { FEEDBACK_URL } from "../../data/site";

// "Ask a question": a helper panel available on every page (was the /ask page).
// Open it with the floating button, with any link to "?ask=1", or by calling openAsk().

const PROJECT_KEY = "permivo-last-project";
const OPEN_EVENT = "permivo:open-ask";

export function rememberProject(project: string) {
  try {
    localStorage.setItem(PROJECT_KEY, project);
  } catch {
    // storage may be unavailable
  }
}

export function openAsk() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

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

function AskBox() {
  const [place, setPlace] = usePlace();
  const [project, setProject] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<(AskResult & { county?: string }) | null>(null);
  const j = jurisdictionFor(place);

  useEffect(() => {
    try {
      const p = localStorage.getItem(PROJECT_KEY);
      if (p && PROJECTS.some((x) => x.value === p)) setProject(p);
    } catch {
      // ignore
    }
  }, []);

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
    <div>
      <p className="text-sm text-gray-600">
        Answers come only from the rules Permivo has checked, with the source and how sure we are. The county&apos;s own
        answer always decides. Not legal advice.
      </p>

      <PlaceSelector place={place} onChange={setPlace} />

      <div className="mt-4" role="group" aria-label="Project type (optional)">
        <p className="text-sm font-medium text-gray-700">Project type (optional)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROJECTS.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={project === p.value}
              onClick={() => setProject(p.value)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                project === p.value ? "border-orange-800 bg-orange-800 text-white" : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form
        className="mt-4"
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
          <span className="text-xs text-gray-500">{question.length}/400. No names or addresses, please.</span>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
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
          <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            {error}
          </p>
        )}

        {result && (
          <section className="mt-4 rounded-lg border border-orange-100 bg-white p-4" aria-labelledby="ask-answer">
            <div className="flex items-start justify-between gap-3">
              <h3 id="ask-answer" className="text-base font-medium text-gray-900">
                {result.mode === "search" ? "Closest matches" : "Answer"}
              </h3>
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
                <h4 className="text-sm font-medium text-gray-900">Sources</h4>
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
    </div>
  );
}

export default function AskPanel() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setTimeout(() => launcherRef.current?.focus(), 0); // after the launcher is shown again
  }, []);

  // Open from ?ask=1 (old /ask links redirect here) or from openAsk().
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("ask") === "1") {
      setOpen(true);
      url.searchParams.delete("ask");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        className="ask-launcher no-print"
        aria-haspopup="dialog"
        hidden={open}
      >
        Ask a question
      </button>
      {open && (
        <div className="ask-overlay no-print">
          <div className="ask-backdrop" onClick={close} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-labelledby="ask-panel-title" className="ask-drawer">
            <div className="flex items-center justify-between gap-3">
              <h2 id="ask-panel-title" className="text-lg font-medium">Ask a question</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mt-3">
              <AskBox />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
