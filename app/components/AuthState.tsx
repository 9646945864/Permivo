"use client";

import dynamic from "next/dynamic";
import { createContext, useContext } from "react";

// Pages read sign-in state from here, so they work whether or not Clerk is set up.
// Clerk itself lives in ClerkParts.tsx; the layout only adds it when the server has Clerk keys,
// and that is what sets `enabled` to true.
export type AuthInfo = { enabled: boolean; loaded: boolean; signedIn: boolean; userId: string | null };

const GUEST: AuthInfo = { enabled: false, loaded: true, signedIn: false, userId: null };
export const AuthCtx = createContext<AuthInfo>(GUEST);

export function useAuthInfo() {
  return useContext(AuthCtx);
}

// Loaded on demand, so guests without Clerk never download it.
const ClerkControls = dynamic(() => import("./ClerkParts").then((m) => m.ClerkControls), { ssr: false });

export function AuthControls() {
  return useAuthInfo().enabled ? <ClerkControls /> : null;
}
