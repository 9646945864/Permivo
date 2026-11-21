// GET /api/analytics-config
// Hands the browser the PostHog project key at request time, so it works even when the key is not
// available while Vercel builds the site. The project key (phc_...) is public by design: it can only
// send events, not read data.
export const dynamic = "force-dynamic";

export function GET() {
  const key = (process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY || "").trim();
  return Response.json(
    { posthogKey: key || null },
    { headers: { "cache-control": "public, max-age=300, s-maxage=300" } }
  );
}
