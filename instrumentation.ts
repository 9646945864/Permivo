import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./monitoring/sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./monitoring/sentry.edge.config");
}

// Reports errors thrown while rendering pages or running API routes.
export const onRequestError = Sentry.captureRequestError;
