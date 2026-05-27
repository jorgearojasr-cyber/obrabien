import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static/asset files
    "/((?!_next/static|_next/image|favicon\\.ico|assets/.*).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
