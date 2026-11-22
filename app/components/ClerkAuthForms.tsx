"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

// Clerk's sign-in and sign-up forms. Only imported when Clerk keys are set (see app/sign-in and app/sign-up).
// After signing in or signing up, everyone goes to My projects (/dashboard).

export const AFTER_SIGN_IN = "/dashboard";

const appearance = {
  variables: { colorPrimary: "#9a3412", borderRadius: "0.5rem" },
  elements: { card: { boxShadow: "none", border: "1px solid #fed7aa" } },
};

export function SignInForm() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      forceRedirectUrl={AFTER_SIGN_IN}
      signUpForceRedirectUrl={AFTER_SIGN_IN}
      appearance={appearance}
    />
  );
}

export function SignUpForm() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl={AFTER_SIGN_IN}
      signInForceRedirectUrl={AFTER_SIGN_IN}
      appearance={appearance}
    />
  );
}
