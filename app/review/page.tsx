"use client";

import Link from "next/link";
import { useState } from "react";
import ToolHeader from "../components/ToolHeader";
import { track } from "../components/analytics";
import { NotCovered, PartialNote, PlaceSelector, isCovered, usePlace } from "../components/PlaceSelector";
import { STATUS_LABELS, type Status } from "../../data/rules";
import type { ReviewResult, ReviewState } from "../../data/reviewContext";
import { FEEDBACK_URL } from "../../data/site";

const STATE_STYLE: Record<ReviewState, { label: string; style: string }> = {
  missing: { label: "Missing", style: "bg-red-50 text-red-900 border-red-300" },
  unclear: { label: "Unclear", style: "bg-yellow-100 text-yellow-900 border-yellow-300" },
  not_checked: { label: "Not checked", style: "bg-gray-100 text-gray-800 border-gray-300" },
  covered: { label: "Covered", style: "bg-green-100 text-green-900 border-green-300" },
};
const STATUS_STYLES: Record<Status, string> = {
  verified: "bg-green-100 text-green-900 border-green-300",
  partly: "bg-yellow-100 text-yellow-900 border-yellow-300",
  likely: "bg-blue-100 text-blue-900 border-blue-300",
  unverified: "bg-orange-100 text-orange-900 border-orange-300",
};
const PROJECTS = [
  { value: "deck", label: "Deck" },
  { value: "addition", label: "Room addition" },
  { value: "garage", label: "Detached garage" },
];
const SAMPLE =
  "Build a 12 by 16 ground-level deck on the rear of a single-family home. Pressure-treated framing, 6x6 posts on poured concrete footings, ledger bolted to the house band board. Owner is acting as the contractor.";

export default function ReviewPage() {
  const [place, setPlace] = usePlace();
  const [project, setProject] = useState("deck");
  const [location, setLocation] = useState<"city" | "outside">("city");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    if (loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    track("review_submitted", { county: place, project, location });
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ draft, county: place, project, location }),
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

  async function copyRewrite() {
    if (!result?.rewrite) return;
    try {
      await navigator.clipboard.writeText(result.rewrite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const covered = result?.items.filter((i) => i.state === "covered").length ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <ToolHeader />
      <p className="text-xs font-medium uppercase tracking-wide text-orange-800">Step 2 of 3</p>
      <h1 className="tool-title text-3xl text-[#211b18]">Is your application ready?</h1>
      <p className="mt-1 text-gray-600">
        Before you submit, paste your permit application description. Permivo checks it against the county&apos;s checklist and shows what is covered, missing or unclear, so you can fix gaps before a reviewer sends it back.
      </p>

      <div role="note" className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-950">
        This is a completeness check against Permivo&apos;s checklist, not an approval or legal advice. The county decides. Your draft is sent to an AI service to
        be reviewed and is not saved. Please leave out names, phone numbers and addresses.
      </div>

      <PlaceSelector place={place} onChange={setPlace} />
      <PartialNote place={place} />

      {!isCovered(place) ? (
        <NotCovered place={place} />
      ) : (
        <>
          <section className="mt-6" aria-labelledby="rv-project">
            <h2 id="rv-project" className="text-sm font-medium text-gray-700">Project</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {PROJECTS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={project === p.value}
                  onClick={() => setProject(p.value)}
                  className={`rounded-md border px-3 py-2 text-sm ${project === p.value ? "border-orange-800 bg-orange-800 text-white" : "border-gray-300 bg-white text-gray-800"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { v: "city", l: "Inside a city or town" },
                { v: "outside", l: "Outside a city or town" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  aria-pressed={location === o.v}
                  onClick={() => setLocation(o.v as "city" | "outside")}
                  className={`rounded-md border px-3 py-2 text-sm ${location === o.v ? "border-orange-800 bg-orange-800 text-white" : "border-gray-300 bg-white text-gray-800"}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </section>

          <form
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              run();
            }}
          >
            <label htmlFor="rv-draft" className="text-sm font-medium text-gray-700">Your application description</label>
            <textarea
              id="rv-draft"
              rows={10}
              maxLength={4000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Describe the work: what you are building, size, materials, structure, who is doing the work, and what plans you will attach."
              className="mt-2 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading || draft.trim().length < 40}
                style={{ opacity: loading || draft.trim().length < 40 ? 0.6 : 1 }}
                className="rounded-md border border-orange-800 bg-orange-800 px-4 py-2 text-sm text-white"
              >
                {loading ? "Reviewing your draft..." : "Review my draft"}
              </button>
              <button type="button" onClick={() => setDraft(SAMPLE)} className="rounded-md border border-orange-200 bg-white px-3 py-2 text-sm text-gray-800">
                Use a sample
              </button>
              <span className="text-xs text-gray-500">{draft.length}/4000</span>
            </div>
          </form>

          <div aria-live="polite">
            {error && (
              <p role="alert" className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>
            )}

            {result && (
              <section className="mt-6 rounded-lg border border-orange-100 bg-white p-4" aria-labelledby="rv-result">
                <h2 id="rv-result" className="text-lg font-medium text-gray-900">
                  {result.mode === "ai" ? `Review: ${covered} of ${result.items.length} covered` : "Items to check by hand"}
                </h2>
                {result.summary && <p className="mt-2 text-sm text-gray-800">{result.summary}</p>}

                <ul className="mt-4 space-y-2">
                  {result.items.map((i) => (
                    <li key={i.id} className="rounded-md border border-orange-100 p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-gray-900">{i.title}</span>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATE_STYLE[i.state].style}`}>{STATE_STYLE[i.state].label}</span>
                      </div>
                      {i.note && <p className="mt-1 text-gray-700">{i.note}</p>}
                      <p className="mt-1 text-xs text-gray-500">
                        <span className={`mr-2 rounded-full border px-2 py-0.5 ${STATUS_STYLES[i.status]}`}>{STATUS_LABELS[i.status]}</span>
                        <a href={i.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">{i.sourceLabel}</a>
                      </p>
                    </li>
                  ))}
                </ul>

                {result.suggestions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900">Suggested edits</h3>
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-800">
                      {result.suggestions.map((s, k) => <li key={k}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {result.rewrite && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900">Cleaner version of your description</h3>
                    <p className="mt-1 text-xs text-gray-500">Uses only what you wrote. Fill in each [add: ...] yourself and check it before you submit.</p>
                    <p className="mt-2 whitespace-pre-line rounded-md border border-orange-100 bg-orange-50 p-3 text-sm text-gray-800">{result.rewrite}</p>
                    <button type="button" onClick={copyRewrite} className="mt-2 rounded border border-orange-800 px-3 py-1 text-sm text-orange-800">
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}

                <p className="mt-4 text-xs text-gray-500">
                  Wrong or missing? <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">Tell us</a>.
                </p>
              </section>
            )}
          </div>
        </>
      )}

      <p className="mt-8 text-sm text-gray-600">
        Need the full list first? See <Link href="/plan#ready" className="text-orange-800 underline">what to have ready</Link> in Plan.
        Submitted? Log each step in <Link href="/tracker" className="text-orange-800 underline">Track</Link>.
      </p>
    </main>
  );
}
