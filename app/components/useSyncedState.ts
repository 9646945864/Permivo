"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useAuthInfo } from "./AuthState";

// State saved in this browser for guests, and in the user's account when signed in.
// On first sign-in, anything saved in the browser is copied to the account if the account is empty.

export type SyncStatus = "loading" | "browser" | "account" | "saving" | "error";

type Options<T> = {
  localKey: string;
  api: string; // e.g. "/api/tracker"
  field: string; // JSON field the API uses, e.g. "permits"
  initial: T;
  parse: (raw: unknown) => T | null; // returns null when the value is not usable
  isEmpty: (v: T) => boolean;
};

function readLocal<T>(key: string, parse: (raw: unknown) => T | null): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? parse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function useSyncedState<T>(o: Options<T>): [T, Dispatch<SetStateAction<T>>, SyncStatus] {
  const auth = useAuthInfo();
  const [value, setValue] = useState<T>(o.initial);
  const [mode, setMode] = useState<"loading" | "browser" | "account">("loading");
  const [status, setStatus] = useState<SyncStatus>("loading");
  // The value as last loaded; saving is skipped while the state is still exactly this object.
  const loadedValue = useRef<unknown>(o.initial);
  const opts = useRef(o);
  opts.current = o;

  // Load whenever the signed-in user changes.
  useEffect(() => {
    if (!auth.loaded) return;
    let cancelled = false;
    const { localKey, api, field, initial, parse, isEmpty } = opts.current;
    const local = readLocal(localKey, parse);

    if (!auth.signedIn) {
      const v = local ?? initial;
      loadedValue.current = v;
      setValue(v);
      setMode("browser");
      setStatus("browser");
      return;
    }

    setMode("loading");
    setStatus("loading");
    (async () => {
      try {
        const res = await fetch(api, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Record<string, unknown>;
        const server = parse(data[field]) ?? initial;
        if (cancelled) return;
        if (isEmpty(server) && local && !isEmpty(local)) {
          loadedValue.current = null; // save the browser copy to the account
          setValue(local);
        } else {
          loadedValue.current = server;
          setValue(server);
        }
        setMode("account");
        setStatus("account");
      } catch {
        if (cancelled) return;
        // Storage not set up or unreachable: keep working in this browser.
        const v = local ?? initial;
        loadedValue.current = v;
        setValue(v);
        setMode("browser");
        setStatus("browser");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.loaded, auth.signedIn, auth.userId]);

  // Save on change.
  useEffect(() => {
    if (mode === "loading" || value === loadedValue.current) return;
    const { localKey, api, field } = opts.current;
    if (mode === "browser") {
      try {
        localStorage.setItem(localKey, JSON.stringify(value));
      } catch {
        // storage may be unavailable
      }
      return;
    }
    setStatus("saving");
    const t = setTimeout(async () => {
      try {
        const res = await fetch(api, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        });
        setStatus(res.ok ? "account" : "error");
      } catch {
        setStatus("error");
      }
    }, 700);
    return () => clearTimeout(t);
  }, [value, mode]);

  return [value, setValue, status];
}

export function syncMessage(status: SyncStatus, enabled: boolean): string {
  switch (status) {
    case "loading":
      return "Loading…";
    case "account":
      return "Saved to your account.";
    case "saving":
      return "Saving…";
    case "error":
      return "Could not save to your account. Check your connection; changes will retry on the next edit.";
    default:
      return enabled
        ? "Saved in this browser only. Sign in to keep it on every device."
        : "Saved in this browser only.";
  }
}
