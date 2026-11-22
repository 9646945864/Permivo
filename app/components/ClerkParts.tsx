"use client";

import { useEffect, type ReactNode } from "react";
import { identify } from "./analytics";
import { SignInButton, SignOutButton, UserButton, useAuth } from "@clerk/nextjs";
import { AuthCtx, useAuthInfo } from "./AuthState";

// Only imported when Clerk keys are set. Must be rendered inside ClerkProvider.

export function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  useEffect(() => {
    if (isLoaded) identify(isSignedIn ? userId ?? null : null);
  }, [isLoaded, isSignedIn, userId]);
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
    <span className="flex items-center gap-2">
      <UserButton />
      <SignOutButton redirectUrl="/">
        <button type="button" className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700">
          Sign out
        </button>
      </SignOutButton>
    </span>
  ) : (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard">
      <button type="button" className="rounded border border-orange-800 px-3 py-1 text-sm text-orange-800">
        Sign in
      </button>
    </SignInButton>
  );
}
