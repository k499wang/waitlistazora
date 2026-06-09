import { NextRequest, NextResponse } from "next/server";

import { ENTITLEMENT_ID } from "@/lib/checkout/offers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPostHogClient } from "@/lib/posthog-server";
import { sendPurchaseEvent } from "@/lib/meta-capi";

// Read-only status endpoint polled by /checkout/success. Resolves the
// authenticated user from the session cookie, then reads that user's own
// latest checkout intent + subscription mirror via the service-role client
// (scoped strictly to user.id).
export const dynamic = "force-dynamic";

const PRO_STATUSES = ["active", "trialing", "in_grace_period"];

function computeIsPro(subscription: Record<string, unknown> | null): boolean {
  if (!subscription) {
    return false;
  }

  const status = subscription.status;
  if (typeof status !== "string" || !PRO_STATUSES.includes(status)) {
    return false;
  }

  const endsAt = subscription.current_period_ends_at;
  if (typeof endsAt === "string" && endsAt) {
    if (new Date(endsAt).getTime() <= Date.now()) {
      return false;
    }
  }

  // When an entitlement column is present, require the exact contract id.
  const entitlement = subscription.entitlement;
  if (typeof entitlement === "string" && entitlement !== ENTITLEMENT_ID) {
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();

  const { data: intent, error: intentError } = await admin
    .from("web_checkout_intents")
    .select("id, session_id, status, offer_id, environment, purchased_at, revenuecat_event_id, purchase_event_sent_at, price_amount, currency")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (intentError) {
    throw intentError;
  }

  const { data: subscription, error: subError } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (subError) {
    throw subError;
  }

  const isPro = computeIsPro(subscription);
  const purchased = intent?.status === "purchased" || isPro;

  // Fire web_purchase_confirmed + Meta CAPI Purchase once per intent (idempotent).
  // This runs on the first poll that sees purchased; repeat polls skip it.
  if (purchased && intent && !intent.purchase_event_sent_at) {
    try {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user.id,
        event: "web_purchase_confirmed",
        properties: {
          offer_id: intent.offer_id ?? null,
          environment: intent.environment ?? null,
          revenuecat_event_id: intent.revenuecat_event_id ?? null,
          $set: { email: user.email },
        },
      });
      posthog.flush();

      // Read persisted fbp/fbc from the attribution row so they survive
      // OAuth redirects and cookie expiration. Fall back to request cookies
      // for sessions created before this was implemented.
      let persistedFbp: string | null = null;
      let persistedFbc: string | null = null;
      try {
        const { data: attribution } = await admin
          .from("web_funnel_attribution")
          .select("fbp, fbc")
          .eq("session_id", intent.session_id)
          .maybeSingle();

        if (attribution) {
          persistedFbp = typeof attribution.fbp === "string" ? attribution.fbp : null;
          persistedFbc = typeof attribution.fbc === "string" ? attribution.fbc : null;
        }
      } catch {
        // Best-effort — fall back to request cookies below.
      }

      // Meta CAPI Purchase — fire-and-forget alongside PostHog.
      sendPurchaseEvent({
        externalId: user.id,
        email: user.email,
        fbp: persistedFbp ?? request.cookies.get("_fbp")?.value ?? null,
        fbc: persistedFbc ?? request.cookies.get("_fbc")?.value ?? null,
        clientIp: request.headers.get("x-forwarded-for") ?? null,
        clientUserAgent: request.headers.get("user-agent") ?? null,
        eventSourceUrl: request.nextUrl.origin + "/checkout/success",
        value: typeof intent.price_amount === "number" ? intent.price_amount : null,
        currency: typeof intent.currency === "string" ? intent.currency : null,
        eventId: `purchase_${intent.id}`,
      }).catch(() => {
        // Best-effort — Meta CAPI failures are silent.
      });

      // Stamp the intent so repeat polls never double-send.
      await admin
        .from("web_checkout_intents")
        .update({ purchase_event_sent_at: new Date().toISOString() })
        .eq("id", intent.id);
    } catch {
      // Best-effort analytics — never block the status poll.
    }
  }

  return NextResponse.json({
    intentStatus: intent?.status ?? null,
    offerId: intent?.offer_id ?? null,
    environment: intent?.environment ?? null,
    purchasedAt: intent?.purchased_at ?? null,
    isPro,
    purchased,
  });
}
