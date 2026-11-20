import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";
import { sentryPrivacy } from "./sentry.shared";

// Browser error reporting. Does nothing until SENTRY_DSN is set (next.config.ts passes it here).
// A DSN only says where to send error reports; it is public by design.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    ...sentryPrivacy,
  });
}

// Usage analytics. Does nothing until POSTHOG_KEY is set (next.config.ts passes it here).
// Sends page views and a few named actions (see app/components/analytics.ts), never typed text:
// click autocapture and session recording stay off because pages show project nicknames and drafts.
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: "/ingest", // proxied to PostHog by next.config.ts, so ad blockers do not drop it
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_UI_HOST,
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: false,
    disable_session_recording: true,
    capture_exceptions: false, // Sentry handles errors
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
