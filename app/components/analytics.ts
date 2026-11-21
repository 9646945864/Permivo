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
  sketch_3d_opened: { kind: string };
  sketch_added_to_draft: { kind: string };
  sketch_plot_plan_printed: { kind: string };
};

export function track<E extends keyof Events>(event: E, props: Events[E]) {
  if (!posthog.__loaded) return;
  posthog.capture(event, props);
}

// Sign-in state seen before PostHog finished starting; applied once it has.
let pending: { userId: string | null } | null = null;

export function applyPendingIdentity() {
  if (pending) identify(pending.userId);
}

// Ties analytics to the signed-in account (Clerk's random user id only, no name or email).
export function identify(userId: string | null) {
  if (!posthog.__loaded) {
    pending = { userId };
    return;
  }
  pending = null;
  if (userId) {
    if (posthog.get_distinct_id() !== userId) posthog.identify(userId);
  } else if (posthog._isIdentified()) {
    posthog.reset();
  }
}
