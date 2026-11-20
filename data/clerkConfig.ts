// Clerk's publishable key is public by design, but it may be stored without the NEXT_PUBLIC_ prefix.
// The server reads it here and hands it to Clerk, so any of these names works.
export function clerkPublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.NEXT_CLERK_PUBLISHABLE_KEY ||
    ""
  ).trim();
}

export function clerkConfigured(): boolean {
  return Boolean(clerkPublishableKey() && process.env.CLERK_SECRET_KEY);
}
