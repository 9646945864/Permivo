import type { Metadata } from "next";
import { clerkConfigured, clerkPublishableKey } from "../data/clerkConfig";
import "./globals.css";

export const metadata: Metadata = {
  title: "Permivo — The clearer route to getting built",
  description: "Permit help, without the guesswork, for small residential contractors in Mecklenburg County.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!clerkConfigured()) return <html lang="en"><body>{children}</body></html>;

  // Load Clerk only when its keys are set; importing it without keys fails in development.
  const [{ ClerkProvider }, { ClerkAuthBridge }] = await Promise.all([
    import("@clerk/nextjs"),
    import("./components/ClerkParts"),
  ]);
  return (
    <ClerkProvider publishableKey={clerkPublishableKey()}>
      <html lang="en">
        <body>
          <ClerkAuthBridge>{children}</ClerkAuthBridge>
        </body>
      </html>
    </ClerkProvider>
  );
}
