"use client";

import dynamic from "next/dynamic";
import { createContext, useContext } from "react";

// Pages read sign-in state from here, so they work whether or not Clerk is set up.
// Clerk itself lives in ClerkParts.tsx and is only loaded when its keys exist.
export type AuthInfo = { enabled: boolean; loaded: boolean; signedIn: boolean; userId: string | null };

const GUEST: AuthInfo = { enabled: false, loaded: true, signedIn: false, userId: null };
export const AuthCtx = createContext<AuthInfo>(GUEST);

export const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function useAuthInfo() {
  return useContext(AuthCtx);
}

const ClerkControls = clerkEnabled
  ? dynamic(() => import("./ClerkParts").then((m) => m.ClerkControls), { ssr: false })
  : () => null;

export function AuthControls() {
  return <ClerkControls />;
}
