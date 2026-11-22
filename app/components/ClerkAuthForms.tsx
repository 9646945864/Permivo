"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

// Clerk's sign-in and sign-up forms. Only imported when Clerk keys are set (see app/sign-in and app/sign-up).
// After signing in, Clerk returns the visitor to the page they asked for (redirect_url), else to Plan.

const appearance = {
  variables: { colorPrimary: "#9a3412", borderRadius: "0.5rem" },
  elements: { card: { boxShadow: "none", border: "1px solid #fed7aa" } },
};

export function SignInForm() {
  return <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/plan" appearance={appearance} />;
}

export function SignUpForm() {
  return <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/plan" appearance={appearance} />;
}
