"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ToolHeader from "../components/ToolHeader";
import { NotCovered, PartialNote, PlaceSelector, ReportLink, StatewideRules, isCovered, jurisdictionFor, usePlace } from "../components/PlaceSelector";
import { syncMessage, useSyncedState } from "../components/useSyncedState";
import { useAuthInfo } from "../components/AuthState";
import { track } from "../components/analytics";
import { rememberProject } from "../components/AskPanel";
import {
  PROJECT_LABELS,
  STATUS_LABELS,
  rulesFor,
  type JurisdictionId,
  type Location,
  type ProjectType,
  type Rule,
  type Status,
} from "../../data/rules";
import { GROUP_LABELS, GROUP_ORDER, itemsFor } from "../../data/checklist";

// Step 1 of the route: which reviews apply (was /planner) and what to have ready (was /checklist).

const CHECKLIST_KEY = "permivo-checklist-v1"; // same key as the old checklist, so saved ticks carry over
const PROJECTS = Object.keys(PROJECT_LABELS) as ProjectType[];

const STATUS_STYLES: Record<Status, string> = {
  verified: "bg-green-100 text-green-900 border-green-300",
  partly: "bg-yellow-100 text-yellow-900 border-yellow-300",
  likely: "bg-blue-100 text-blue-900 border-blue-300",
  unverified: "bg-red-100 text-red-900 border-red-300",
};

function RuleCard({ rule }: { rule: Rule }) {
  return (
    <li className="rounded-lg border border-orange-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-medium text-gray-900">{rule.title}</h4>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[rule.status]}`}>
          {STATUS_LABELS[rule.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-700">
        <span className="font-medium">Stated time:</span> {rule.statedTime}
      </p>
      <p className="mt-1 text-sm text-gray-600">{rule.note}</p>
      <p className="mt-2 text-sm">
        <a href={rule.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
          {rule.sourceLabel}
        </a>
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Checked {rule.checkedOn} · <ReportLink id={rule.id} />
      </p>
    </li>
  );
}

function Choice<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <section className="mt-6" aria-labelledby={id}>
      <h2 id={id} className="text-sm font-medium text-gray-700">{label}</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md border px-3 py-2 text-sm ${
              value === o.value
                ? "border-orange-800 bg-orange-800 text-white"
                : "border-orange-200 bg-white text-gray-800 hover:border-orange-400"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function PlanPage() {
  const [project, setProject] = useState<ProjectType>("deck");
  const [location, setLocation] = useState<Location>("city");
  const [place, setPlace] = usePlace();
  const auth = useAuthInfo();
  const [done, setDone, syncStatus] = useSyncedState<Record<string, boolean>>({
    localKey: CHECKLIST_KEY,
    api: "/api/checklist",
    field: "done",
    initial: {},
    parse: (raw) => (raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, boolean>) : null),
    isEmpty: (v) => Object.keys(v).length === 0,
  });
  const covered = isCovered(place);
  const j = jurisdictionFor(place);
  const labels = j?.locationLabels ?? { city: "Inside the city or town", outside: "Elsewhere in the county" };
  const agency = j?.agencyLabels ?? { city: "City or town", county: "County" };

  useEffect(() => {
    const d = jurisdictionFor(place)?.defaultLocation;
    if (d) setLocation(d);
  }, [place]);

  useEffect(() => {
    rememberProject(project); // so "Ask a question" starts with the same project
  }, [project]);

  // Reviews that apply
  const rules = rulesFor(project, location, place.toLowerCase() as JurisdictionId);
  const steps = rules.filter((r) => r.kind === "step");
  const questions = rules.filter((r) => r.kind === "question");
  const citySteps = steps.filter((r) => r.where === "city");
  const countySteps = steps.filter((r) => r.where !== "city");
  const hasCountyStep = steps.some((r) => r.where === "county");

  // What to have ready
  const items = useMemo(
    () => itemsFor(project, location, place.toLowerCase() as JurisdictionId),
    [project, location, place]
  );
  const keyFor = (id: string) => `${project}:${location}:${id}`;
  const doneCount = items.filter((i) => done[keyFor(i.id)]).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  function toggle(id: string) {
    track("checklist_item_toggled", { project, location, done: !done[keyFor(id)] });
    setDone((prev) => ({ ...prev, [keyFor(id)]: !prev[keyFor(id)] }));
  }

  function resetTicks() {
    const prefix = `${project}:${location}:`;
    setDone((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !k.startsWith(prefix))));
  }

  return (
    <main className="route-wide mx-auto max-w-2xl px-4 py-8">
      <ToolHeader />
      <p className="text-xs font-medium uppercase tracking-wide text-orange-800">Step 1 of 3</p>
      <h1 className="tool-title text-3xl text-[#211b18]">Plan your permit</h1>
      <p className="mt-1 text-gray-600">
        Pick your project once. See which reviews may apply, then tick off what to have ready before you submit.
      </p>

      <div role="note" className="mt-4 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-950">
        Draft rules. Nothing here is confirmed unless marked verified. The county&apos;s own requirements decide what you
        must submit, and a finished list does not guarantee approval. Always confirm with {j?.confirmWith ?? "your county"}.
        Not legal advice.
      </div>

      <PlaceSelector place={place} onChange={setPlace} />
      {!covered && <NotCovered place={place} />}
      {covered && <PartialNote place={place} />}
      {covered && (
        <>
          <Choice
            id="project-heading"
            label="Project type"
            options={PROJECTS.map((p) => ({ value: p, label: PROJECT_LABELS[p] }))}
            value={project}
            onChange={setProject}
          />
          <Choice
            id="location-heading"
            label="Where is the property?"
            options={[
              { value: "city" as Location, label: labels.city },
              { value: "outside" as Location, label: labels.outside },
            ]}
            value={location}
            onChange={setLocation}
          />

          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
            <a href="#reviews" className="rounded-full border border-orange-200 bg-white px-3 py-1 text-orange-800">
              Reviews that apply
            </a>
            <a href="#ready" className="rounded-full border border-orange-200 bg-white px-3 py-1 text-orange-800">
              What to have ready{items.length ? ` · ${doneCount}/${items.length}` : ""}
            </a>
          </nav>

          <section id="reviews" className="mt-8 scroll-mt-4" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="text-xl font-medium text-gray-900">Reviews that may apply</h2>
            <p className="mt-1 text-sm text-gray-600">
              Grouped by agency. The order, and whether reviews can run at the same time, is not confirmed unless a step says so.
            </p>
            {j?.statedDays && (
              <p className="mt-3 rounded-lg border border-orange-100 bg-white p-3 text-sm text-gray-700">
                <span className="font-medium">What the agencies say about total time:</span> {j.statedDays.label}
              </p>
            )}
            <div className={`route-grid mt-4${location === "city" ? " two" : ""}`}>
              {location === "city" && (
                <div>
                  <h3 className="text-base font-medium text-gray-900">{agency.city}</h3>
                  <ul className="mt-2 space-y-3">
                    {citySteps.map((r) => (
                      <RuleCard key={r.id} rule={r} />
                    ))}
                  </ul>
                  {citySteps.length === 0 && (
                    <p className="mt-2 text-sm text-gray-600">No steps for this agency have been researched yet.</p>
                  )}
                </div>
              )}
              <div>
                <h3 className="text-base font-medium text-gray-900">{agency.county}</h3>
                <ul className="mt-2 space-y-3">
                  {countySteps.map((r) => (
                    <RuleCard key={r.id} rule={r} />
                  ))}
                </ul>
                {!hasCountyStep && (
                  <p className="mt-2 text-sm text-gray-600">County steps for this project type have not been researched yet.</p>
                )}
              </div>
            </div>

            {questions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-base font-medium text-gray-900">Open questions to confirm with the agencies</h3>
                <ul className="mt-3 space-y-3">
                  {questions.map((r) => (
                    <RuleCard key={r.id} rule={r} />
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section id="ready" className="mt-12 scroll-mt-4" aria-labelledby="ready-heading">
            <h2 id="ready-heading" className="text-xl font-medium text-gray-900">What to have ready</h2>
            <p className="mt-1 text-sm text-gray-600">
              Each item explains what it is, why it matters, and how to do it. Tick items off as you go.
            </p>

            {items.length === 0 ? (
              <p className="mt-4 rounded-lg border border-orange-100 bg-white p-4 text-sm text-gray-700">
                A checklist for {PROJECT_LABELS[project].toLowerCase()} has not been researched yet. Use the reviews above and
                confirm the documents with the county.
              </p>
            ) : (
              <>
                <div className="mt-4 rounded-lg border border-orange-100 bg-white p-4" aria-live="polite">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {doneCount} of {items.length} ready
                    </p>
                    <p className="text-sm text-gray-600">{pct}%</p>
                  </div>
                  <div
                    className="mt-2 h-2 w-full overflow-hidden rounded bg-orange-100"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-full bg-orange-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={resetTicks} className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700">
                      Clear ticks for this project
                    </button>
                    <span className="text-xs text-gray-500">{syncMessage(syncStatus, auth.enabled)}</span>
                  </div>
                </div>

                {GROUP_ORDER.map((group) => {
                  const groupItems = items.filter((i) => i.group === group);
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={group} className="mt-6">
                      <h3 className="text-base font-medium text-gray-900">{GROUP_LABELS[group]}</h3>
                      <ul className="mt-3 space-y-3">
                        {groupItems.map((item) => {
                          const checked = !!done[keyFor(item.id)];
                          return (
                            <li key={item.id} className="rounded-lg border border-orange-100 bg-white p-4">
                              <div className="flex items-start gap-3">
                                <input
                                  id={`item-${item.id}`}
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggle(item.id)}
                                  className="mt-1 h-5 w-5 accent-orange-700"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <label
                                      htmlFor={`item-${item.id}`}
                                      className={`font-medium ${checked ? "text-gray-500 line-through" : "text-gray-900"}`}
                                    >
                                      {item.title}
                                    </label>
                                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[item.status]}`}>
                                      {STATUS_LABELS[item.status]}
                                    </span>
                                  </div>
                                  <details className="mt-2 text-sm text-gray-700">
                                    <summary className="cursor-pointer text-orange-800">What, why, and how</summary>
                                    <p className="mt-2"><span className="font-medium">What:</span> {item.what}</p>
                                    <p className="mt-1"><span className="font-medium">Why:</span> {item.why}</p>
                                    <p className="mt-1"><span className="font-medium">How:</span> {item.how}</p>
                                    <p className="mt-2">
                                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
                                        {item.sourceLabel}
                                      </a>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      Checked {item.checkedOn} · <ReportLink id={item.id} />
                                    </p>
                                  </details>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </>
            )}
          </section>

          <div className="mt-10 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-gray-800">
            <span className="font-medium">Next:</span> when your application is drafted,{" "}
            <Link href="/review" className="text-orange-800 underline">check it in Review</Link> before you submit.
          </div>
        </>
      )}
      <StatewideRules />
    </main>
  );
}
