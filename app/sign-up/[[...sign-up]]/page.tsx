import type { Metadata } from "next";
import AuthPage from "../../components/AuthPage";

export const metadata: Metadata = { title: "Create an account · Permivo" };
export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return <AuthPage mode="sign-up" />;
}
