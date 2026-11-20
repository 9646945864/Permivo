"use client";

import posthog from "posthog-js";

// Named product actions sent to PostHog (when set up). Properties are choices from fixed lists
// (county, project type, event kind), never anything the user typed.
type Events = {
  ask_submitted: { county: string; project: string };
  review_submitted: { county: string; project: string; location: string };
  checklist_item_toggled: { project: string; location: string; done: boolean };
  tracker_permit_added: { county: string; type: string };
  tracker_event_logged: { kind: string; party: string };
};

export function track<E extends keyof Events>(event: E, props: Events[E]) {
  if (!posthog.__loaded) return;
  posthog.capture(event, props);
}

// Ties analytics to the signed-in account (Clerk's random user id only, no name or email).
export function identify(userId: string | null) {
  if (!posthog.__loaded) return;
  if (userId) {
    if (posthog.get_distinct_id() !== userId) posthog.identify(userId);
  } else if (posthog._isIdentified()) {
    posthog.reset();
  }
}
