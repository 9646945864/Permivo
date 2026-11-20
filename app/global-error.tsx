"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Shown when the whole app crashes. Reports the error to Sentry (when set up).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 560, margin: "4rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: "1.5rem" }}>Something went wrong</h1>
          <p style={{ color: "#555" }}>The problem has been logged. Try again, or go back to the home page.</p>
          <p style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="button" onClick={reset} style={{ padding: "0.5rem 1rem", border: "1px solid #9a3412", color: "#9a3412", borderRadius: 6, background: "white" }}>
              Try again
            </button>
            <a href="/" style={{ padding: "0.5rem 1rem", color: "#9a3412" }}>Home</a>
          </p>
        </main>
      </body>
    </html>
  );
}
