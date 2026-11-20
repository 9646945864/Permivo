import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

// Clerk runs only once its keys are set, so the site keeps working before setup.
const clerkOn = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

let handler: ((req: NextRequest, ev: NextFetchEvent) => unknown) | null = null;

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (!clerkOn) return NextResponse.next();
  if (!handler) {
    const { clerkMiddleware } = await import("@clerk/nextjs/server");
    handler = clerkMiddleware();
  }
  return handler(req, ev);
}

export const config = {
  matcher: [
    // Skip Next internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
