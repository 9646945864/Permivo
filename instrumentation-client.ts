import * as Sentry from "@sentry/nextjs";
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

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
