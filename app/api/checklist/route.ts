import { NextResponse } from "next/server";
import { requireUserDb } from "../../../data/supabaseServer";

// Signed-in users' checklist ticks: a map of item id → done.

const KEY = "checklist";
const MAX_ITEMS = 2000;

export async function GET() {
  const ctx = await requireUserDb();
  if (ctx.error) return ctx.error;
  const { data, error } = await ctx.db
    .from("user_data")
    .select("value")
    .eq("user_id", ctx.userId)
    .eq("key", KEY)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "Could not load checklist." }, { status: 500 });
  return NextResponse.json({ done: (data?.value as Record<string, boolean>) ?? {} });
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
  const raw = (body as { done?: unknown })?.done;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const done: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw).slice(0, MAX_ITEMS)) {
    if (v === true && k.length <= 120) done[k] = true;
  }
  const { error } = await ctx.db
    .from("user_data")
    .upsert({ user_id: ctx.userId, key: KEY, value: done, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
  if (error) return NextResponse.json({ error: "Could not save checklist." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
