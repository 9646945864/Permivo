import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Permivo — The clearer route to getting built",
  description: "Permit help, without the guesswork, for small residential contractors in Mecklenburg County.",
};

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!clerkEnabled) return <html lang="en"><body>{children}</body></html>;

  // Load Clerk only when its keys are set; importing it without keys fails in development.
  const [{ ClerkProvider }, { ClerkAuthBridge }] = await Promise.all([
    import("@clerk/nextjs"),
    import("./components/ClerkParts"),
  ]);
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ClerkAuthBridge>{children}</ClerkAuthBridge>
        </body>
      </html>
    </ClerkProvider>
  );
}
