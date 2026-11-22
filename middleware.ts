import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkConfigured, clerkPublishableKey } from "./data/clerkConfig";

// Clerk runs only once its keys are set, so the site keeps working before setup.
// - Plan and My projects need an account: signed-out visitors go to /sign-in (with a link to sign up).
//   Signed-in visitors go straight through.
// - Everyone lands on My projects (/dashboard) right after signing in or signing up, and signed-in
//   visitors who open /sign-in or /sign-up are sent there too.
const PROTECTED = [/^\/plan(\/.*)?$/, /^\/dashboard(\/.*)?$/];
const AUTH_PAGES = /^\/sign-(in|up)(\/.*)?$/;
const AFTER_SIGN_IN = "/dashboard";

const destination = (req: NextRequest) => new URL(AFTER_SIGN_IN, req.url);

let handler: ((req: NextRequest, ev: NextFetchEvent) => unknown) | null = null;

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (!clerkConfigured()) return NextResponse.next();
  if (!handler) {
    const { clerkMiddleware } = await import("@clerk/nextjs/server");
    handler = clerkMiddleware(
      async (auth, request) => {
        const path = request.nextUrl.pathname;
        // Clerk finishes Google and other sign-ins on /sign-in/sso-callback; let it do that itself.
        if (AUTH_PAGES.test(path) && !path.includes("sso-callback")) {
          const { userId } = await auth();
          if (userId) return NextResponse.redirect(destination(request));
          return;
        }
        if (PROTECTED.some((re) => re.test(path))) await auth.protect();
      },
      { publishableKey: clerkPublishableKey(), signInUrl: "/sign-in", signUpUrl: "/sign-up" }
    );
  }
  return handler(req, ev);
}

export const config = {
  matcher: [
    // Skip Next internals, the analytics proxy and static files
    "/((?!_next|ingest|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
