import { cookies } from "next/headers";

import { ensureWebProfile } from "@/lib/auth/profile";
import { resolveCheckout, type ResolvedCheckout } from "@/lib/checkout/offers";
import {
  FUNNEL_SESSION_COOKIE,
  getOrCreateFunnelSession,
} from "@/lib/checkout/funnel-session";
import { getPostHogClient } from "@/lib/posthog-server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Shared checkout-intent creation used by BOTH checkout entry points:
//   - /checkout/start  -> builds the intent then 303-redirects to pay.rev.cat
//   - /checkout/intent -> builds the intent then returns JSON for the embedded
//                         RevenueCat Web Billing SDK purchase (on our domain).
//
// Everything up to (but not including) the redirect is identical, so it lives
// here: auth check, profile ensure, funnel session, web_checkout_intents insert,
// and the web_checkout_started PostHog event. The caller owns the response
// shape (redirect vs JSON) and setting the funnel-session cookie.

// First IP in the x-forwarded-for chain is the originating client; Meta CAPI
// wants a single IP. Falls back to x-real-ip.
export function clientIpFromRequest(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip");
}

export type CreateCheckoutIntentResult =
  | { kind: "unauthenticated" }
  | { kind: "profile_error" }
  | {
      kind: "ok";
      /** web_funnel_sessions.id — caller sets this as the FUNNEL_SESSION_COOKIE. */
      sessionId: string;
      appUserId: string;
      email: string | null;
      checkout: ResolvedCheckout;
    };

/**
 * Create (or attach) the funnel session and a fresh web_checkout_intents row for
 * the authenticated user. Pure of any HTTP response concerns so it can back both
 * the redirect and the embedded-SDK route.
 *
 * `status` is the initial web_checkout_intents.status:
 *   - "redirected" for the pay.rev.cat link path
 *   - "created"    for the embedded SDK path
 * The webhook reconciles either one (it matches status in ['created','redirected']).
 */
export async function createCheckoutIntent(
  req: Request,
  { status }: { status: "redirected" | "created" },
): Promise<CreateCheckoutIntentResult> {
  const requestUrl = new URL(req.url);
  const offerParam = requestUrl.searchParams.get("offer");

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { kind: "unauthenticated" };
  }

  // Resolve the offer + environment + final URL first. In production this throws
  // loudly when the prod Web Purchase Link env var is missing, before we write
  // any rows.
  const checkout = resolveCheckout({
    offer: offerParam,
    appUserId: user.id,
    email: user.email,
  });

  const admin = createAdminSupabaseClient();

  try {
    await ensureWebProfile(admin, user);
  } catch (error) {
    console.error("[checkout/create-intent] profile ensure failed:", error);
    return { kind: "profile_error" };
  }

  const cookieStore = await cookies();
  const sessionId = await getOrCreateFunnelSession(admin, {
    userId: user.id,
    funnelSlug: checkout.offer.offerId,
    landingPath: requestUrl.pathname,
    initialUrl: req.url,
    cookieSessionId: cookieStore.get(FUNNEL_SESSION_COOKIE)?.value,
    referrer: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
    ipAddress: clientIpFromRequest(req),
  });

  // Persist the browser's _fbp/_fbc at checkout time so the webhook's CAPI
  // Purchase/StartTrial always has match keys, even when the landing beacon
  // (/api/session-init) was blocked or never ran. Fill-only: first-touch values
  // already persisted at landing are never overwritten (fbc carries the click
  // timestamp from the original ad click).
  const fbpCookie = cookieStore.get("_fbp")?.value ?? null;
  const fbcCookie = cookieStore.get("_fbc")?.value ?? null;
  if (fbpCookie || fbcCookie) {
    try {
      const { data: existing } = await admin
        .from("web_funnel_attribution")
        .select("fbp, fbc")
        .eq("session_id", sessionId)
        .maybeSingle();

      const attributionRow: Record<string, unknown> = { session_id: sessionId };
      if (fbpCookie && !existing?.fbp) attributionRow.fbp = fbpCookie;
      if (fbcCookie && !existing?.fbc) attributionRow.fbc = fbcCookie;
      if (Object.keys(attributionRow).length > 1) {
        await admin
          .from("web_funnel_attribution")
          .upsert(attributionRow, { onConflict: "session_id" });
      }
    } catch {
      // Best-effort — checkout proceeds without backfilled match keys.
    }
  }

  const { error: intentError } = await admin.from("web_checkout_intents").insert({
    session_id: sessionId,
    user_id: user.id,
    offer_id: checkout.offer.offerId,
    revenuecat_app_user_id: user.id,
    revenuecat_product_id: null,
    revenuecat_purchase_url: checkout.purchaseUrl,
    environment: checkout.environment,
    status,
  });

  if (intentError) {
    throw intentError;
  }

  // Fire web_checkout_started (InitiateCheckout equivalent) via PostHog.
  try {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: "web_checkout_started",
      properties: {
        offer_id: checkout.offer.offerId,
        environment: checkout.environment,
        session_id: sessionId,
        funnel_slug: checkout.offer.offerId,
        $set: { email: user.email },
      },
    });
    await posthog.flush();
  } catch {
    // Best-effort analytics — never block checkout.
  }

  return {
    kind: "ok",
    sessionId,
    appUserId: user.id,
    email: user.email ?? null,
    checkout,
  };
}
