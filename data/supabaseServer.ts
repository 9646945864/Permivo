import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { clerkConfigured } from "./clerkConfig";

// Server-only Supabase access. Uses the secret (service role) key, so never import this in a client file.
let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

// Returns the signed-in user and a database client, or a ready-made error response.
export async function requireUserDb(): Promise<
  { userId: string; db: SupabaseClient; error?: undefined } | { error: NextResponse }
> {
  if (!clerkConfigured()) {
    return { error: NextResponse.json({ error: "Accounts are not set up yet." }, { status: 503 }) };
  }
  const { auth } = await import("@clerk/nextjs/server"); // loaded only when Clerk is set up
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) };
  const db = supabase();
  if (!db) return { error: NextResponse.json({ error: "Storage is not set up yet." }, { status: 503 }) };
  return { userId, db };
}
