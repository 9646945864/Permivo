"use client";

import type { ReactNode } from "react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { AuthCtx, useAuthInfo } from "./AuthState";

// Only imported when Clerk keys are set. Must be rendered inside ClerkProvider.

export function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  return (
    <AuthCtx.Provider value={{ enabled: true, loaded: isLoaded, signedIn: Boolean(isSignedIn), userId: userId ?? null }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function ClerkControls() {
  const auth = useAuthInfo();
  if (!auth.loaded) return null;
  return auth.signedIn ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <button type="button" className="rounded border border-orange-800 px-3 py-1 text-sm text-orange-800">
        Sign in
      </button>
    </SignInButton>
  );
}
