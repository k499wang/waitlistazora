import { redirect } from "next/navigation";

import { TopBar } from "@/app/components/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { CheckoutStatus } from "./checkout-status";

// Post-checkout landing page (RevenueCat success redirect target). Confirms the
// user is authenticated, then hands off to the client poller which watches the
// checkout intent + entitlement until the webhook reconciles.
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
    <>
      <TopBar />
      <main className="checkoutSuccessPage">
        <div className="container checkoutSuccessContainer">
          <CheckoutStatus />
        </div>
      </main>
    </>
  );
}
