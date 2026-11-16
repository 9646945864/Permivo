"use client";

import { useEffect, useState } from "react";
import { COVERED_COUNTIES, DIRECTORY_COUNTIES, NC_COUNTIES } from "../../data/ncCounties";
import { JURISDICTIONS, STATE_RULES, type JurisdictionId } from "../../data/rules";
import { FEEDBACK_URL } from "../../data/site";

const KEY = "permivo-place-v1";

export function usePlace(): [string, (p: string) => void] {
  const [place, setPlace] = useState("Mecklenburg");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v && NC_COUNTIES.includes(v)) setPlace(v);
    } catch {
      // storage may be unavailable
    }
  }, []);
  function update(p: string) {
    setPlace(p);
    try {
      localStorage.setItem(KEY, p);
    } catch {
      // ignore
    }
  }
  return [place, update];
}

export function isCovered(place: string) {
  return COVERED_COUNTIES.includes(place);
}

export function PlaceSelector({ place, onChange }: { place: string; onChange: (p: string) => void }) {
  const early = NC_COUNTIES.filter((c) => DIRECTORY_COUNTIES.includes(c));
  const others = NC_COUNTIES.filter((c) => !COVERED_COUNTIES.includes(c) && !DIRECTORY_COUNTIES.includes(c));
  return (
    <section className="mt-6" aria-labelledby="place-heading">
      <h2 id="place-heading" className="text-sm font-medium text-gray-700">
        County
      </h2>
      <select
        value={place}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900"
      >
        <optgroup label="Rules available">
          {COVERED_COUNTIES.map((c) => (
            <option key={c} value={c}>
              {c} County (verified rules)
            </option>
          ))}
        </optgroup>
        <optgroup label="Office info only (rules not verified)">
          {early.map((c) => (
            <option key={c} value={c}>
              {c} County
            </option>
          ))}
        </optgroup>
        <optgroup label="Not covered yet">
          {others.map((c) => (
            <option key={c} value={c}>
              {c} County
            </option>
          ))}
        </optgroup>
      </select>
    </section>
  );
}

export function NotCovered({ place }: { place: string }) {
  const j = JURISDICTIONS[place.toLowerCase() as JurisdictionId];
  if (j && j.coverage === "directory") {
    return (
      <section className="mt-8 rounded-lg border border-orange-200 bg-white p-4" aria-live="polite">
        <h2 className="text-lg font-medium text-gray-900">{place} County: office info only</h2>
        <p className="mt-2 text-sm text-gray-700">
          Permivo has not verified {place} County&apos;s permit rules yet, so the route planner and checklist are not
          shown. Below is what the county&apos;s own pages say, and who to ask.
        </p>
        <div className="mt-3 rounded-md border border-orange-100 bg-orange-50 p-3 text-sm text-gray-800">
          <p className="font-medium">{j.officeLabel}</p>
          {j.officeAddress && <p>{j.officeAddress}</p>}
          {j.officePhone && <p>Phone: {j.officePhone}</p>}
          {j.officeEmail && <p>Email: {j.officeEmail}</p>}
          <p className="mt-1">
            <a href={j.officeUrl} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
              Official page
            </a>
          </p>
          <p className="mt-1 text-gray-700">{j.note}</p>
        </div>
        {j.facts && j.facts.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {j.facts.map((f) => (
              <li key={f.text}>
                {f.text}{" "}
                <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
                  Source
                </a>{" "}
                <span className="text-xs text-gray-500">(read {f.checkedOn})</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm">
          <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
            Tell us you need {place} County
          </a>
        </p>
      </section>
    );
  }
  return (
    <section className="mt-8 rounded-lg border border-orange-200 bg-white p-4" aria-live="polite">
      <h2 className="text-lg font-medium text-gray-900">{place} County is not covered yet</h2>
      <p className="mt-2 text-sm text-gray-700">
        Permivo only shows rules it has checked against official county or city sources. Rules for {place} County have
        not been checked, so none are shown. Showing another county&apos;s rules here would be wrong.
      </p>
      <p className="mt-2 text-sm text-gray-700">
        In the meantime, contact the county or town inspections department that handles your project and ask whether it
        needs a permit, plan review, and any zoning review.
      </p>
      <p className="mt-3 text-sm">
        <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
          Tell us you need {place} County
        </a>{" "}
        (counties with the most requests come first).
      </p>
    </section>
  );
}

export function ReportLink({ id }: { id: string }) {
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-gray-500 underline"
      title={`Open the feedback form and mention ${id}`}
    >
      Report a problem with {id}
    </a>
  );
}

export function StatewideRules() {
  return (
    <section className="mt-8" aria-labelledby="state-heading">
      <h2 id="state-heading" className="text-lg font-medium text-gray-900">
        North Carolina rules (all counties)
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        These come from state law, not from a county. A county can add its own requirements on top. Not legal advice.
      </p>
      <ul className="mt-3 space-y-3">
        {STATE_RULES.map((r) => (
          <li key={r.id} className="rounded-lg border border-orange-100 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-gray-900">{r.title}</h3>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${
                  r.status === "verified"
                    ? "bg-green-100 text-green-900 border-green-300"
                    : "bg-yellow-100 text-yellow-900 border-yellow-300"
                }`}
              >
                {r.status === "verified" ? "Verified" : "Partly verified"}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-700">{r.summary}</p>
            {r.note && <p className="mt-1 text-sm text-gray-600">{r.note}</p>}
            <p className="mt-2 text-sm">
              <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">
                {r.sourceLabel}
              </a>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Checked {r.checkedOn} · <ReportLink id={r.id} />
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
