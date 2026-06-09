import { NextResponse } from "next/server";

import { createCheckoutIntent } from "@/lib/checkout/create-intent";
import {
  FUNNEL_SESSION_COOKIE,
  FUNNEL_SESSION_COOKIE_MAX_AGE,
} from "@/lib/checkout/funnel-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// Server-side checkout entry point (pay.rev.cat redirect / fallback path). Flow:
//   1. createCheckoutIntent: auth -> profile -> funnel session -> intent row
//      (status=redirected) -> web_checkout_started PostHog
//   2. passthrough UTM params onto the RevenueCat Web Purchase Link
//   3. 303 redirect to RevenueCat hosted checkout
//
// The embedded on-domain checkout lives at /checkout/intent and shares step 1.
// Supports POST (form button) and GET (plain link) — both run the same flow.
export const dynamic = "force-dynamic";

async function handleCheckoutStart(req: Request): Promise<Response> {
  const result = await createCheckoutIntent(req, { status: "redirected" });

  if (result.kind === "unauthenticated") {
    const requestUrl = new URL(req.url);
    const next = `/checkout/start${requestUrl.search}`;
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, req.url),
    );
  }

  if (result.kind === "profile_error") {
    return NextResponse.redirect(
      new URL("/login?error=Could+not+prepare+checkout.+Please+try+again.", req.url),
    );
  }

  const { sessionId, checkout } = result;
  const admin = createAdminSupabaseClient();

  // Passthrough UTM params to the RevenueCat URL so campaign data flows into
  // revenue reporting (not needed by Meta — handled separately by CAPI).
  let purchaseUrl = checkout.purchaseUrl;
  try {
    const { data: attribution } = await admin
      .from("web_funnel_attribution")
      .select("utm_source, utm_medium, utm_campaign, utm_term, utm_content")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (attribution) {
      const url = new URL(purchaseUrl);
      for (const key of ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"]) {
        const value = (attribution as Record<string,unknown>)[key];
        if (typeof value === "string" && value) {
          url.searchParams.set(key, value);
        }
      }
      purchaseUrl = url.toString();
    }
  } catch {
    // Best-effort — continue without UTM passthrough.
  }

  // 303 so a POST form submit redirects as a GET to the external checkout.
  const response = NextResponse.redirect(purchaseUrl, 303);
  response.cookies.set(FUNNEL_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FUNNEL_SESSION_COOKIE_MAX_AGE,
  });

  return response;
}

export async function POST(req: Request) {
  return handleCheckoutStart(req);
}

export async function GET(req: Request) {
  return handleCheckoutStart(req);
}
