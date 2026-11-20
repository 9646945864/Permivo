"use client";

import { useState } from "react";
import ToolHeader from "../components/ToolHeader";
import { useAuthInfo } from "../components/AuthState";
import { syncMessage, useSyncedState } from "../components/useSyncedState";
import { usePlace } from "../components/PlaceSelector";
import { COVERED_COUNTIES } from "../../data/ncCounties";
import { JURISDICTIONS, type JurisdictionId } from "../../data/rules";

const KINDS = [
  "Application submitted",
  "Review started",
  "Comments received",
  "Resubmitted",
  "Hold placed",
  "Hold cleared",
  "Approved",
  "Permit issued",
  "Inspection failed",
  "Inspection passed",
  "Other",
] as const;
const PARTIES = ["County", "City", "Designer", "Contractor", "Other"] as const;
const TYPES = ["Deck", "Addition", "Garage", "Remodel", "New home", "Other"] as const;

type Kind = (typeof KINDS)[number];
type Party = (typeof PARTIES)[number];

interface TrackedEvent {
  id: string;
  date: string;
  party: Party;
  kind: Kind;
  note: string;
}
interface Permit {
  id: string;
  name: string;
  type: string;
  county?: string; // permits saved before counties were added are treated as Mecklenburg
  events: TrackedEvent[];
}

const STORAGE_KEY = "permivo-tracker-v1";
const DEFAULT_COUNTY = "Mecklenburg";
const statedFor = (county?: string) => JURISDICTIONS[(county ?? DEFAULT_COUNTY).toLowerCase() as JurisdictionId]?.statedDays;

// What to do next, based on the most recent event. A suggestion, not an agency instruction.
const NEXT_MOVE: Record<string, string> = {
  "Application submitted": "Wait for the agency to start review, then log Review started.",
  "Review started": "Log the next agency comment or the approval.",
  "Comments received": "Respond to each comment, then log Resubmitted.",
  "Resubmitted": "Log the next agency comment or the approval.",
  "Hold placed": "Resolve the hold, then log Hold cleared.",
  "Hold cleared": "Log the next agency step.",
  "Approved": "Log Permit issued when you have it.",
  "Permit issued": "Schedule inspections and log each result.",
  "Inspection failed": "Fix the items, request a re-inspection and log it.",
  "Inspection passed": "Request the next inspection.",
  "Other": "Log the next agency step.",
};

function compareToStated(county: string | undefined, elapsed: number) {
  const st = statedFor(county);
  if (!st || (st.min === undefined && st.max === undefined)) return null;
  const min = st.min ?? st.max!;
  const max = st.max ?? st.min!;
  if (min === max) {
    const d = elapsed - min;
    if (d === 0) return `Right at the stated ${min} days.`;
    return d < 0 ? `${-d} days faster than the stated ${min} days.` : `${d} days slower than the stated ${min} days.`;
  }
  if (elapsed < min) return `${min - elapsed} days faster than the stated ${min} to ${max} days.`;
  if (elapsed > max) return `${elapsed - max} days slower than the stated ${min} to ${max} days.`;
  return `Within the stated ${min} to ${max} days.`;
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const today = () => new Date().toLocaleDateString("en-CA");
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function metrics(p: Permit) {
  const ev = [...p.events].sort((a, b) => a.date.localeCompare(b.date));
  if (ev.length === 0) {
    return { ev, start: null as string | null, issued: null as string | null, elapsed: 0, rounds: 0, hold: 0, idle: null as number | null };
  }
  const app = ev.find((e) => e.kind === "Application submitted");
  const start = (app ?? ev[0]).date;
  const issuedEvent = [...ev].reverse().find((e) => e.kind === "Permit issued");
  const issued = issuedEvent ? issuedEvent.date : null;
  const end = issued ?? today();
  const rounds = ev.filter((e) => e.kind === "Comments received").length;
  let hold = 0;
  let openHold: string | null = null;
  for (const e of ev) {
    if (e.kind === "Hold placed" && openHold === null) openHold = e.date;
    else if (e.kind === "Hold cleared" && openHold !== null) {
      hold += daysBetween(openHold, e.date);
      openHold = null;
    }
  }
  if (openHold !== null) hold += daysBetween(openHold, end);
  const idle = issued ? null : daysBetween(ev[ev.length - 1].date, today());
  return { ev, start, issued, elapsed: daysBetween(start, end), rounds, hold, idle };
}

function PermitCard({
  permit,
  open,
  onAdd,
  onDeleteEvent,
  onDeletePermit,
}: {
  permit: Permit;
  open: boolean;
  onAdd: (id: string, ev: TrackedEvent) => void;
  onDeleteEvent: (permitId: string, eventId: string) => void;
  onDeletePermit: (id: string) => void;
}) {
  const [date, setDate] = useState(today());
  const [party, setParty] = useState<Party>("County");
  const [kind, setKind] = useState<Kind>("Application submitted");
  const [note, setNote] = useState("");
  const m = metrics(permit);

  const status = !m.start
    ? "No events yet"
    : m.issued
      ? `Issued in ${m.elapsed} days`
      : `Open ${m.elapsed} days`;
  const lastKind = m.ev.length ? m.ev[m.ev.length - 1].kind : null;
  const stated = statedFor(permit.county);
  const comparison = m.issued ? compareToStated(permit.county, m.elapsed) : null;

  return (
    <details open={open} className="rounded-lg border border-orange-100 bg-white">
      <summary className="flex cursor-pointer items-center justify-between gap-3 p-4">
        <span className="font-medium text-gray-900">
          {permit.name} · {permit.type} · {permit.county ?? DEFAULT_COUNTY}
        </span>
        <span className="text-sm text-gray-600">{status}</span>
      </summary>
      <div className="border-t border-orange-100 p-4">
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700">
          <span>
            <b>{m.rounds}</b> comment rounds
          </span>
          <span>
            <b>{m.hold}</b> days on hold
          </span>
          {m.idle !== null && m.idle >= 14 && (
            <span className="text-amber-800">No activity for {m.idle} days</span>
          )}
        </p>

        {stated && (
          <p className="mt-2 text-sm text-gray-700">
            <span className="font-medium">Agency says:</span> {stated.label}
            {comparison && <> <span className="font-medium">This permit:</span> issued in {m.elapsed} days. {comparison}</>}
          </p>
        )}
        {!m.issued && lastKind && (
          <p className="mt-2 rounded-md border border-orange-100 bg-orange-50 p-2 text-sm text-gray-800">
            <span className="font-medium">Next move:</span> {NEXT_MOVE[lastKind] ?? "Log the next agency step."}
          </p>
        )}

        {m.ev.length > 0 ? (
          <ul className="mt-3 divide-y divide-gray-200">
            {m.ev.map((e) => (
              <li key={e.id} className="flex items-baseline gap-3 py-2 text-sm">
                <span className="whitespace-nowrap text-gray-500">{e.date}</span>
                <span className="font-medium">{e.kind}</span>
                <span className="text-gray-500">{e.party}</span>
                <span className="min-w-0 flex-1 break-words text-gray-700">{e.note}</span>
                <button
                  type="button"
                  aria-label="Remove event"
                  data-noprint="1"
                  onClick={() => onDeleteEvent(permit.id, e.id)}
                  className="rounded border border-gray-300 px-2 text-gray-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-600">No events yet. Add the first one below.</p>
        )}

        <div className="no-print mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            type="date"
            aria-label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-gray-300 px-2 py-2 text-sm"
          />
          <select
            aria-label="Party"
            value={party}
            onChange={(e) => setParty(e.target.value as Party)}
            className="rounded border border-gray-300 px-2 py-2 text-sm"
          >
            {PARTIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            aria-label="Event"
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className="rounded border border-gray-300 px-2 py-2 text-sm"
          >
            {KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <input
            aria-label="Note"
            placeholder="Note, for example what the comment said"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded border border-gray-300 px-2 py-2 text-sm sm:col-span-3"
          />
          <button
            type="button"
            onClick={() => {
              if (!date) return;
              onAdd(permit.id, { id: uid(), date, party, kind, note: note.trim() });
              setNote("");
            }}
            className="rounded bg-orange-800 px-3 py-2 text-sm font-medium text-white sm:col-span-3"
          >
            Add event
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDeletePermit(permit.id)}
          className="no-print mt-3 rounded border border-gray-300 px-3 py-1 text-sm text-gray-600"
        >
          Remove this permit
        </button>
      </div>
    </details>
  );
}

export default function TrackerPage() {
  const [permits, setPermits, syncStatus] = useSyncedState<Permit[]>({
    localKey: STORAGE_KEY,
    api: "/api/tracker",
    field: "permits",
    initial: [],
    parse: (raw) => (Array.isArray(raw) ? (raw as Permit[]) : null),
    isEmpty: (v) => v.length === 0,
  });
  const auth = useAuthInfo();
  const [name, setName] = useState("");
  const [type, setType] = useState<string>(TYPES[0]);
  const [copyText, setCopyText] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [place] = usePlace();
  const [county, setCounty] = useState<string | null>(null);
  const [expand, setExpand] = useState(false);
  const [printedOn, setPrintedOn] = useState("");
  const newCounty = county ?? (COVERED_COUNTIES.includes(place) ? place : DEFAULT_COUNTY);

  const all = permits.map(metrics);
  const issued = all.filter((m) => m.issued);
  const avg = (nums: number[]) =>
    nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;
  const avgDays = avg(issued.map((m) => m.elapsed));
  const avgRounds = avg(all.filter((m) => m.start).map((m) => m.rounds));
  const totalHold = all.reduce((s, m) => s + m.hold, 0);

  function addPermit() {
    const n = name.trim();
    if (!n) return;
    setPermits((p) => [...p, { id: uid(), name: n, type, county: newCounty, events: [] }]);
    setName("");
  }

  function printTimeline() {
    setPrintedOn(new Date().toLocaleDateString());
    setExpand(true);
    setTimeout(() => {
      window.print();
      setExpand(false);
    }, 150);
  }

  async function copyData() {
    const clean = (s: string) => s.replace(/[\t\r\n]+/g, " ");
    const rows = ["Project\tType\tCounty\tDate\tParty\tEvent\tNote"];
    for (const p of permits) {
      for (const e of metrics(p).ev) {
        rows.push([p.name, p.type, p.county ?? DEFAULT_COUNTY, e.date, e.party, e.kind, e.note].map(clean).join("\t"));
      }
    }
    const text = rows.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied. Paste into Google Sheets or Excel.");
      setCopyText(null);
    } catch {
      setCopyText(text);
      setMessage("Select and copy the text below.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <ToolHeader />
      <p className="print-only text-sm text-gray-700">Permivo permit timeline{printedOn ? ` · printed ${printedOn}` : ""}</p>
      <h1 className="tool-title text-3xl text-[#211b18]">Permivo tracker</h1>
      <p className="mt-1 text-gray-600">
        Log each step of a permit. Compare the real timeline with what the agencies say.
      </p>

      <section className="mt-5 rounded-lg border border-orange-100 bg-white p-4" aria-live="polite">
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-800">
          <span>
            <b>{permits.length}</b> permits
          </span>
          <span>
            <b>{issued.length}</b> issued
          </span>
          <span>
            <b>{avgDays ?? "–"}</b> avg days to issue
          </span>
          <span>
            <b>{avgRounds ?? "–"}</b> avg comment rounds
          </span>
          <span>
            <b>{totalHold}</b> total hold days
          </span>
        </p>
        {COVERED_COUNTIES.map((cn) => {
          const mine = permits.filter((p) => (p.county ?? DEFAULT_COUNTY) === cn);
          const st = statedFor(cn);
          if (mine.length === 0 || !st) return null;
          const done = mine.map(metrics).filter((m) => m.issued);
          const a = avg(done.map((m) => m.elapsed));
          return (
            <p key={cn} className="mt-2 text-sm text-gray-600">
              {cn} County says: {st.label}
              {a !== null && ` Your issued ${cn} permits average ${a} days from application to issue.`}
            </p>
          );
        })}
        <p className="mt-2 text-xs text-gray-500">
          An agency&apos;s stated time may cover only part of the process, so treat the comparison as a guide.
        </p>
      </section>

      <div className="no-print mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Project nickname"
          placeholder="Project nickname (no names or addresses)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addPermit()}
          className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          aria-label="County"
          value={newCounty}
          onChange={(e) => setCounty(e.target.value)}
          className="rounded border border-gray-300 px-2 py-2 text-sm"
        >
          {COVERED_COUNTIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Project type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded border border-gray-300 px-2 py-2 text-sm"
        >
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={addPermit}
          className="rounded bg-orange-800 px-4 py-2 text-sm font-medium text-white"
        >
          Add permit
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {permits.length === 0 ? (
          <p className="text-sm text-gray-600">No permits yet. Add one above.</p>
        ) : (
          permits.map((p) => (
            <PermitCard
              key={p.id}
              permit={p}
              open={expand}
              onAdd={(id, ev) =>
                setPermits((all) =>
                  all.map((x) => (x.id === id ? { ...x, events: [...x.events, ev] } : x))
                )
              }
              onDeleteEvent={(pid, eid) =>
                setPermits((all) =>
                  all.map((x) =>
                    x.id === pid ? { ...x, events: x.events.filter((e) => e.id !== eid) } : x
                  )
                )
              }
              onDeletePermit={(id) => setPermits((all) => all.filter((x) => x.id !== id))}
            />
          ))
        )}
      </div>

      <div className="no-print mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={printTimeline}
          className="rounded border border-orange-800 px-3 py-2 text-sm text-orange-800"
        >
          Print or save as PDF
        </button>
        <button
          type="button"
          onClick={copyData}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700"
        >
          Copy data for Sheets
        </button>
        <span className="text-sm text-gray-600">{message}</span>
      </div>
      {copyText !== null && (
        <textarea
          readOnly
          aria-label="Data to copy"
          value={copyText}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-2 h-32 w-full rounded border border-gray-300 p-2 text-sm"
        />
      )}
      <p className="mt-4 text-sm text-gray-600">
        {syncMessage(syncStatus, auth.enabled)} Use nicknames, not owner names or addresses. Copy
        the data now and then as a backup.
      </p>
    </main>
  );
}
