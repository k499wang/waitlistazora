import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { resolveCheckout } from "@/lib/checkout/offers";
import {
  FUNNEL_SESSION_COOKIE,
  FUNNEL_SESSION_COOKIE_MAX_AGE,
  getOrCreateFunnelSession,
} from "@/lib/checkout/funnel-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Server-side checkout entry point. Never build the RevenueCat URL on the
// client. Flow:
//   1. read Supabase session -> redirect to /login if absent
//   2. ensure profiles.user_id exists
//   3. create/attach a web_funnel_sessions row
//   4. build the RevenueCat Web Purchase Link (Supabase user.id = RC app user id)
//   5. insert a web_checkout_intents row (status=redirected) before redirecting
//   6. 303 redirect to RevenueCat hosted checkout
//
// Supports POST (form button) and GET (plain link) — both run the same flow.
export const dynamic = "force-dynamic";

async function handleCheckoutStart(req: Request): Promise<Response> {
  const requestUrl = new URL(req.url);
  const offerParam = requestUrl.searchParams.get("offer");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const next = `/checkout/start${requestUrl.search}`;
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, req.url),
    );
  }

  // Resolve the offer + environment + final URL first. In production this
  // throws loudly when the prod Web Purchase Link env var is missing, before
  // we write any rows.
  const checkout = resolveCheckout({
    offer: offerParam,
    appUserId: user.id,
    email: user.email,
  });

  const admin = createAdminSupabaseClient();

  // Ensure a profiles row exists (web_checkout_intents.user_id FK + the
  // RevenueCat App User ID contract both depend on it).
  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

  if (profileError) {
    throw profileError;
  }

  const cookieStore = await cookies();
  const sessionId = await getOrCreateFunnelSession(admin, {
    userId: user.id,
    funnelSlug: checkout.offer.offerId,
    landingPath: "/checkout/start",
    initialUrl: req.url,
    cookieSessionId: cookieStore.get(FUNNEL_SESSION_COOKIE)?.value,
    referrer: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
  });

  const { error: intentError } = await admin.from("web_checkout_intents").insert({
    session_id: sessionId,
    user_id: user.id,
    offer_id: checkout.offer.offerId,
    revenuecat_app_user_id: user.id,
    revenuecat_product_id: null,
    revenuecat_purchase_url: checkout.purchaseUrl,
    environment: checkout.environment,
    status: "redirected",
  });

  if (intentError) {
    throw intentError;
  }

  // 303 so a POST form submit redirects as a GET to the external checkout.
  const response = NextResponse.redirect(checkout.purchaseUrl, 303);
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
