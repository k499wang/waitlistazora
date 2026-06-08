"use client";

import { useEffect, useRef, useState } from "react";

type StatusResponse = {
  intentStatus: string | null;
  offerId: string | null;
  environment: string | null;
  purchasedAt: string | null;
  isPro: boolean;
  purchased: boolean;
};

type Phase = "pending" | "confirmed" | "timeout" | "error";

// Poll the read-only status endpoint while the RevenueCat webhook reconciles
// the purchase into Supabase. Webhooks are usually quick but can lag, so we
// poll for a short window and then show a graceful "still finalizing" state.
const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 90_000;
const APP_STORE_URL = "https://apps.apple.com/app/azora";

export function CheckoutStatus() {
  const [phase, setPhase] = useState<Phase>("pending");
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch("/checkout/status", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`status ${res.status}`);
        }
        const data: StatusResponse = await res.json();

        if (cancelled) return;

        if (data.purchased) {
          setPhase("confirmed");
          return;
        }

        if (Date.now() - startedAt.current > MAX_WAIT_MS) {
          setPhase("timeout");
          return;
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        if (Date.now() - startedAt.current > MAX_WAIT_MS) {
          setPhase("error");
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (phase === "confirmed") {
    return (
      <div>
        <h1>You&apos;re all set 🎉</h1>
        <p>Azora Pro is now active on your account.</p>
        <p>Open the Azora app and sign in with the same account to start using Pro.</p>
        <a href={APP_STORE_URL}>Open the Azora app</a>
      </div>
    );
  }

  if (phase === "timeout" || phase === "error") {
    return (
      <div>
        <h1>Finalizing your purchase…</h1>
        <p>
          Your payment went through. We&apos;re still confirming it with our
          billing provider — this can take a moment.
        </p>
        <p>
          Open the Azora app and sign in; Pro will appear automatically once
          confirmed. You can also refresh this page.
        </p>
        <a href={APP_STORE_URL}>Open the Azora app</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Finalizing your purchase…</h1>
      <p>Confirming your subscription. This usually takes just a few seconds.</p>
    </div>
  );
}
