import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { CheckoutStatus } from "./checkout-status";

// Post-checkout landing page (RevenueCat success redirect target). Confirms the
// user is authenticated, then hands off to the client poller which watches the
// checkout intent + entitlement until the webhook reconciles. No paywall here.
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout/success");
  }

  return (
    <main>
      <CheckoutStatus />
    </main>
  );
}
