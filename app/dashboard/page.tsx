"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ToolHeader from "../components/ToolHeader";
import { useAuthInfo } from "../components/AuthState";
import { usePlace } from "../components/PlaceSelector";
import { useSyncedState } from "../components/useSyncedState";
import { DEFAULT_COUNTY, IDLE_DAYS, NEXT_MOVE, TRACKER_KEY, metrics, parsePermits, statedFor, type Permit } from "../components/trackerLogic";
import { PROJECT_LABELS, type JurisdictionId, type Location, type ProjectType } from "../../data/rules";
import { itemsFor } from "../../data/checklist";

// My projects: where signed-in users land. Built only from data Permivo already saves to the
// account (tracker permits and checklist ticks); nothing new is collected.

const CHECKLIST_KEY = "permivo-checklist-v1";
type Filter = "all" | "open" | "issued";

function fmtDate(d: string) {
  const t = Date.parse(d);
  return Number.isFinite(t) ? new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : d;
}

export default function DashboardPage() {
  const auth = useAuthInfo();
  const [place] = usePlace();
  const [permits, , permitStatus] = useSyncedState<Permit[]>({
    localKey: TRACKER_KEY,
    api: "/api/tracker",
    field: "permits",
    initial: [],
    parse: parsePermits,
    isEmpty: (v) => v.length === 0,
  });
  const [done] = useSyncedState<Record<string, boolean>>({
    localKey: CHECKLIST_KEY,
    api: "/api/checklist",
    field: "done",
    initial: {},
    parse: (raw) => (raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, boolean>) : null),
    isEmpty: (v) => Object.keys(v).length === 0,
  });
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => permits.map((p) => ({ p, m: metrics(p) })), [permits]);
  const open = rows.filter((r) => r.m.start && !r.m.issued);
  const issued = rows.filter((r) => r.m.issued);
  const needsNudge = open.filter((r) => r.m.idle !== null && r.m.idle >= IDLE_DAYS);
  const avg = (nums: number[]) => (nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null);
  const avgDays = avg(issued.map((r) => r.m.elapsed));
  const avgRounds = avg(rows.filter((r) => r.m.start).map((r) => r.m.rounds));
  const shown = rows.filter((r) => (filter === "all" ? true : filter === "open" ? !r.m.issued : !!r.m.issued));

  // Checklist progress, per project type and location (that is how ticks are saved), for the chosen county.
  const progress = useMemo(() => {
    const groups = new Map<string, { project: ProjectType; location: Location }>();
    for (const [k, v] of Object.entries(done)) {
      if (!v) continue;
      const [project, location] = k.split(":") as [ProjectType, Location];
      if (PROJECT_LABELS[project] && (location === "city" || location === "outside")) groups.set(`${project}:${location}`, { project, location });
    }
    return [...groups.values()].map(({ project, location }) => {
      const items = itemsFor(project, location, place.toLowerCase() as JurisdictionId);
      const ready = items.filter((i) => done[`${project}:${location}:${i.id}`]).length;
      return { project, location, ready, total: items.length };
    }).filter((g) => g.total > 0);
  }, [done, place]);

  // Stated vs. real, per county, from issued permits
  const byCounty = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const r of rows) {
      const c = r.p.county ?? DEFAULT_COUNTY;
      if (!m.has(c)) m.set(c, []);
      if (r.m.issued) m.get(c)!.push(r.m.elapsed);
    }
    return [...m].map(([county, days]) => ({ county, avg: avg(days), stated: statedFor(county)?.label }));
  }, [rows]);

  const loading = permitStatus === "loading";
  const summary = loading
    ? "Loading your projects…"
    : rows.length === 0
      ? "No permits tracked yet. Start a plan, or log a permit you have already submitted."
      : `${open.length} ${open.length === 1 ? "permit" : "permits"} open${needsNudge.length ? `, ${needsNudge.length} ${needsNudge.length === 1 ? "needs" : "need"} a nudge` : ""}.`;

  return (
    <main className="db-wrap mx-auto px-4 py-8">
      <ToolHeader />
      <h1 className="tool-title text-3xl text-[#211b18]">{auth.signedIn ? "Welcome back" : "My projects"}</h1>
      <p className="mt-1 text-gray-600" aria-live="polite">{summary}</p>
      {!auth.signedIn && !loading && (
        <p className="mt-2 text-sm text-gray-600">These come from this browser. Sign in to see them on every device.</p>
      )}

      <div className="db-acts">
        <Link href="/plan" className="db-act">
          <b>Start a new plan</b>
          <span>Reviews and what to have ready</span>
        </Link>
        <Link href="/review" className="db-act">
          <b>Check an application</b>
          <span>Find gaps before you submit</span>
        </Link>
        <Link href="/tracker" className="db-act">
          <b>Log an update</b>
          <span>Comments, holds, approvals</span>
        </Link>
      </div>

      <div className="sk-metrics">
        <div><span>Open permits</span><b>{open.length}</b></div>
        <div><span>Issued</span><b>{issued.length}</b></div>
        <div><span>Avg days to issue</span><b>{avgDays ?? "–"}</b></div>
        <div><span>Avg comment rounds</span><b>{avgRounds ?? "–"}</b></div>
      </div>

      <section className="mt-8" aria-labelledby="db-permits">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="db-permits" className="text-xl font-medium text-gray-900">Your permits</h2>
          <div className="sk-tabs" role="group" aria-label="Filter permits">
            {(
              [
                ["all", `All ${rows.length}`],
                ["open", `Open ${rows.length - issued.length}`],
                ["issued", `Issued ${issued.length}`],
              ] as [Filter, string][]
            ).map(([f, label]) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="mt-3 rounded-lg border border-orange-100 bg-white p-4 text-sm text-gray-700">
            {rows.length === 0 ? (
              <>Nothing here yet. Add a permit in <Link href="/tracker" className="text-orange-800 underline">Track</Link> when you submit it.</>
            ) : (
              "No permits match this filter."
            )}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {shown.map(({ p, m }) => {
              const isOpen = openId === p.id;
              const last = m.ev.length ? m.ev[m.ev.length - 1].kind : null;
              const status = !m.start ? "No events yet" : m.issued ? `Issued in ${m.elapsed} days` : `Open ${m.elapsed} days`;
              const tone = m.issued ? "db-ok" : !m.start ? "db-muted" : "db-open";
              const idle = !m.issued && m.idle !== null && m.idle >= IDLE_DAYS;
              return (
                <li key={p.id} className="db-permit">
                  <button type="button" className="db-permit-head" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : p.id)}>
                    <span className="db-name">
                      {p.name}
                      <small>{p.type} · {p.county ?? DEFAULT_COUNTY}</small>
                    </span>
                    {idle && <span className="db-pill db-warn">No activity for {m.idle} days</span>}
                    <span className={`db-pill ${tone}`}>{status}</span>
                    <span aria-hidden="true" className="db-chev">{isOpen ? "▴" : "▾"}</span>
                  </button>
                  {isOpen && (
                    <div className="db-permit-body">
                      {!m.issued && last && (
                        <p className="rounded-md border border-orange-100 bg-orange-50 p-2 text-sm text-gray-800">
                          <span className="font-medium">Next move:</span> {NEXT_MOVE[last] ?? "Log the next agency step."}
                        </p>
                      )}
                      {m.ev.length ? (
                        <ul className="mt-2 text-sm">
                          {m.ev.map((e) => (
                            <li key={e.id} className="db-ev">
                              <b>{fmtDate(e.date)}</b>
                              <span>{e.kind}{e.party ? ` · ${e.party}` : ""}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-gray-600">No events logged yet.</p>
                      )}
                      <p className="mt-2 flex flex-wrap gap-x-5 text-xs text-gray-600">
                        <span>{m.rounds} comment {m.rounds === 1 ? "round" : "rounds"}</span>
                        <span>{m.hold} {m.hold === 1 ? "day" : "days"} on hold</span>
                      </p>
                      <Link href="/tracker" className="mt-3 inline-block rounded border border-orange-800 px-3 py-1 text-sm text-orange-800">
                        Open in Track
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="db-two">
        <section className="db-card" aria-labelledby="db-ready">
          <h2 id="db-ready" className="text-base font-medium text-gray-900">Readiness checklists</h2>
          {progress.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              No checklist started. Tick items in <Link href="/plan#ready" className="text-orange-800 underline">Plan</Link> to see progress here.
            </p>
          ) : (
            progress.map((g) => {
              const pct = Math.round((g.ready / g.total) * 100);
              return (
                <div key={`${g.project}:${g.location}`} className="mt-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span>{PROJECT_LABELS[g.project]} · {g.location === "city" ? "in a city or town" : "outside a city or town"}</span>
                    <span className="text-gray-600">{g.ready} of {g.total}</span>
                  </div>
                  <div className="db-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <i style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
          <p className="mt-3 text-xs text-gray-500">Totals are for {place} County.</p>
        </section>

        <section className="db-card" aria-labelledby="db-times">
          <h2 id="db-times" className="text-base font-medium text-gray-900">Stated vs. your real times</h2>
          {byCounty.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">Your issued permits will show here next to what each county says.</p>
          ) : (
            byCounty.map((c) => (
              <div key={c.county} className="db-ev mt-2 text-sm">
                <b>{c.county}</b>
                <span>
                  {c.stated ? `${c.stated} ` : ""}
                  {c.avg !== null ? `Yours: ${c.avg} days on average.` : "No issued permits yet."}
                </span>
              </div>
            ))
          )}
          <p className="mt-3 text-xs text-gray-500">A stated time may cover only part of the process. Treat this as a guide.</p>
        </section>
      </div>
    </main>
  );
}
