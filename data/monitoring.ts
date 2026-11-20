import * as Sentry from "@sentry/nextjs";

// AI provider health for /api/ask and /api/review. Sends nothing until Sentry is set up.
// Only provider names and failure reasons are sent, never the user's question or draft.

export type ProviderFailure = { provider: string; reason: string };

export function failureReason(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "AbortError") return "timeout";
    return err.message.slice(0, 120); // e.g. "status 429"
  }
  return "unknown error";
}

export function reportAllProvidersFailed(route: string, failures: ProviderFailure[]) {
  if (failures.length === 0) return;
  Sentry.captureMessage(`${route}: every AI provider failed, served fallback`, {
    level: "warning",
    tags: { route, providers_tried: String(failures.length) },
    extra: { failures },
    fingerprint: [route, "all-providers-failed"],
  });
}
