import { NextResponse } from "next/server";
import { requireUserDb } from "../../../data/supabaseServer";

// Signed-in users' tracker permits. GET returns them all; PUT replaces the whole list.

const MAX_PERMITS = 300;
const MAX_EVENTS = 300;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const DATE = /^\d{4}-\d{2}-\d{2}$/;

type Event = { id: string; date: string; party: string; kind: string; note: string };
type Permit = { id: string; name: string; type: string; county: string | null; events: Event[] };

function cleanPermit(raw: unknown): Permit | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id, 64);
  const name = str(r.name, 120).trim();
  if (!id || !name) return null;
  const events = (Array.isArray(r.events) ? r.events : [])
    .slice(0, MAX_EVENTS)
    .map((e): Event | null => {
      if (!e || typeof e !== "object") return null;
      const x = e as Record<string, unknown>;
      const date = str(x.date, 10);
      if (!str(x.id, 64) || !DATE.test(date)) return null;
      return { id: str(x.id, 64), date, party: str(x.party, 40), kind: str(x.kind, 60), note: str(x.note, 1000) };
    })
    .filter((e): e is Event => e !== null);
  return { id, name, type: str(r.type, 40), county: str(r.county, 60) || null, events };
}

export async function GET() {
  const ctx = await requireUserDb();
  if (ctx.error) return ctx.error;
  const { data, error } = await ctx.db
    .from("permits")
    .select("id,name,type,county,events")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Could not load permits." }, { status: 500 });
  return NextResponse.json({ permits: data ?? [] });
}

export async function PUT(req: Request) {
  const ctx = await requireUserDb();
  if (ctx.error) return ctx.error;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const list = (body as { permits?: unknown })?.permits;
  if (!Array.isArray(list) || list.length > MAX_PERMITS) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const permits = list.map(cleanPermit).filter((p): p is Permit => p !== null);
  const now = new Date().toISOString();

  if (permits.length > 0) {
    const { error } = await ctx.db
      .from("permits")
      .upsert(permits.map((p) => ({ ...p, user_id: ctx.userId, updated_at: now })), { onConflict: "user_id,id" });
    if (error) return NextResponse.json({ error: "Could not save permits." }, { status: 500 });
  }

  // Remove permits the user deleted.
  let del = ctx.db.from("permits").delete().eq("user_id", ctx.userId);
  if (permits.length > 0) {
    del = del.not("id", "in", `(${permits.map((p) => `"${p.id.replace(/"/g, "")}"`).join(",")})`);
  }
  const { error: delError } = await del;
  if (delError) return NextResponse.json({ error: "Could not save permits." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
