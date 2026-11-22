import Link from "next/link";
import ToolHeader from "./ToolHeader";
import { clerkConfigured } from "../../data/clerkConfig";

// Shared layout for /sign-in and /sign-up. Clerk's form is loaded only when Clerk is set up.
export default async function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signIn = mode === "sign-in";
  let form: React.ReactNode = (
    <p className="mt-6 rounded-lg border border-orange-100 bg-white p-4 text-sm text-gray-700">
      Accounts are not switched on yet. You can <Link href="/plan" className="text-orange-800 underline">use the planner</Link> without one.
    </p>
  );
  if (clerkConfigured()) {
    const { SignInForm, SignUpForm } = await import("./ClerkAuthForms");
    form = <div className="mt-6 flex justify-center">{signIn ? <SignInForm /> : <SignUpForm />}</div>;
  }
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <ToolHeader />
      <h1 className="tool-title text-3xl text-[#211b18]">{signIn ? "Sign in to plan your permit" : "Create your free account"}</h1>
      <p className="mt-1 text-gray-600">
        {signIn
          ? "Already have an account? Sign in and you go straight in, with your projects, checklist and permits saved."
          : "New to Permivo? An account keeps your plan, checklist and permit timeline on every device. It is free."}
      </p>
      {form}
      <p className="mt-6 text-center text-sm text-gray-600">
        {signIn ? (
          <>New here? <Link href="/sign-up" className="text-orange-800 underline">Create a free account</Link></>
        ) : (
          <>Already have an account? <Link href="/sign-in" className="text-orange-800 underline">Sign in</Link></>
        )}
      </p>
    </main>
  );
}
