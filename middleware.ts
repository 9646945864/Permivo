import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkConfigured, clerkPublishableKey } from "./data/clerkConfig";

// Clerk runs only once its keys are set, so the site keeps working before setup.
let handler: ((req: NextRequest, ev: NextFetchEvent) => unknown) | null = null;

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (!clerkConfigured()) return NextResponse.next();
  if (!handler) {
    const { clerkMiddleware } = await import("@clerk/nextjs/server");
    handler = clerkMiddleware({ publishableKey: clerkPublishableKey() });
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
