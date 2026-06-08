import { NextResponse } from "next/server";

import { ENTITLEMENT_ID } from "@/lib/checkout/offers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

export async function GET() {
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
    .select("status, offer_id, environment, purchased_at, revenuecat_event_id")
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

  return NextResponse.json({
    intentStatus: intent?.status ?? null,
    offerId: intent?.offer_id ?? null,
    environment: intent?.environment ?? null,
    purchasedAt: intent?.purchased_at ?? null,
    isPro,
    purchased,
  });
}
