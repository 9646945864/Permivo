import * as Sentry from "@sentry/nextjs";
import { sentryPrivacy } from "./sentry.shared";

// Error reporting for middleware. Does nothing until SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN) is set.
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    ...sentryPrivacy,
  });
}
