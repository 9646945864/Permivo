import type { Metadata } from "next";
import AuthPage from "../../components/AuthPage";

export const metadata: Metadata = { title: "Sign in · Permivo" };
export const dynamic = "force-dynamic";

export default function SignInPage() {
  return <AuthPage mode="sign-in" />;
}
