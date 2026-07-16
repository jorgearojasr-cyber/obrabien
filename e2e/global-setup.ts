import { clerkSetup } from "@clerk/testing/playwright";
import type { FullConfig } from "@playwright/test";

// Obtains a Clerk Testing Token (via CLERK_SECRET_KEY) so automated browsers
// can pass the instance's bot protection (Cloudflare Turnstile) during signup.
export default async function globalSetup(_config: FullConfig) {
  process.env.CLERK_PUBLISHABLE_KEY ??= process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  await clerkSetup();
}
