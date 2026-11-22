// Shared tracker data and calculations, used by Track (/tracker) and My projects (/dashboard).
import { JURISDICTIONS, type JurisdictionId } from "../../data/rules";

export const KINDS = [
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
export const PARTIES = ["County", "City", "Designer", "Contractor", "Other"] as const;
export const TYPES = ["Deck", "Addition", "Garage", "Remodel", "New home", "Other"] as const;

export type Kind = (typeof KINDS)[number];
export type Party = (typeof PARTIES)[number];

export interface TrackedEvent {
  id: string;
  date: string;
  party: Party;
  kind: Kind;
  note: string;
}
export interface Permit {
  id: string;
  name: string;
  type: string;
  county?: string; // permits saved before counties were added are treated as Mecklenburg
  events: TrackedEvent[];
}

export const TRACKER_KEY = "permivo-tracker-v1";
export const DEFAULT_COUNTY = "Mecklenburg";
export const IDLE_DAYS = 14;
export const statedFor = (county?: string) => JURISDICTIONS[(county ?? DEFAULT_COUNTY).toLowerCase() as JurisdictionId]?.statedDays;

// What to do next, based on the most recent event. A suggestion, not an agency instruction.
export const NEXT_MOVE: Record<string, string> = {
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

export function compareToStated(county: string | undefined, elapsed: number) {
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

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export const today = () => new Date().toLocaleDateString("en-CA");
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

export function metrics(p: Permit) {
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

export const parsePermits = (raw: unknown) => (Array.isArray(raw) ? (raw as Permit[]) : null);
