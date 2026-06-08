import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on app routes, but skip Next internals, static assets, and the PostHog
  // ingest rewrites so we don't churn cookies on every asset request.
  matcher: [
    "/((?!_next/static|_next/image|ingest|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|mov|pdf)$).*)",
  ],
};
