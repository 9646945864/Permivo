import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

// PostHog region: https://us.i.posthog.com (default) or https://eu.i.posthog.com
const posthogHost = (process.env.POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/+$/, "");
const posthogAssets = posthogHost.replace("://us.i.", "://us-assets.i.").replace("://eu.i.", "://eu-assets.i.");
const posthogUi = posthogHost.includes("://eu.") ? "https://eu.posthog.com" : "https://us.posthog.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    // Browser code needs these. They may be stored without a public prefix and are copied into
    // the browser code at build time. Both are public by design (they only say where to send data).
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "",
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.POSTHOG_KEY || "",
    NEXT_PUBLIC_POSTHOG_UI_HOST: posthogUi,
  },
  // Old tool pages, merged into Plan · Review · Track. Kept so saved links and bookmarks still work.
  async redirects() {
    return [
      { source: "/planner", destination: "/plan", permanent: true },
      { source: "/checklist", destination: "/plan#ready", permanent: true },
      { source: "/ask", destination: "/plan?ask=1", permanent: true },
    ];
  },
  // Send analytics through this site's own address (/ingest) so ad blockers do not drop it.
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `${posthogAssets}/static/:path*` },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
  },
  skipTrailingSlashRedirect: true, // PostHog's API paths end in a slash
};

// Source maps upload only when SENTRY_AUTH_TOKEN, SENTRY_ORG and SENTRY_PROJECT are set,
// which makes error stack traces point at the real source lines. Optional.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  telemetry: false,
});
