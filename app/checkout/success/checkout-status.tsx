"use client";

import { useEffect, useRef, useState } from "react";

import {
  setMetaAdvancedMatching,
  trackMetaEvent,
} from "@/app/components/meta-pixel-events";

type StatusResponse = {
  intentStatus: string | null;
  intentId: string | null;
  offerId: string | null;
  environment: string | null;
  purchasedAt: string | null;
  priceAmount: number | null;
  currency: string | null;
  isTrial: boolean;
  userId: string | null;
  email: string | null;
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

// Meta's event_id dedup window. Both legs must land inside it, and a stale
// revisit outside it must never fire (it would be counted as a NEW conversion).
const META_DEDUP_WINDOW_MS = 48 * 60 * 60 * 1000;
// Only fire the browser leg for a fresh purchase — the legit case is the user
// sitting on this page seconds after paying. Half the dedup window leaves
// plenty of margin for clock skew and slow webhooks.
const MAX_PURCHASE_AGE_MS = META_DEDUP_WINDOW_MS / 2;

// Browser leg of the Meta conversion event. The webhook already sends the
// authoritative CAPI Purchase/StartTrial; this pixel event carries the SAME
// event_id (purchase_<intentId> / starttrial_<intentId>) so Meta dedupes the
// pair — the browser leg adds fresh fbp/fbc + browser context for match
// quality, and covers the case where the CAPI leg failed. Mirrors the
// webhook's mapping exactly: trial start → StartTrial (value 0), paid →
// Purchase. Guarded per-intent (localStorage, so it survives new tabs) and by
// purchase freshness, so refreshes and stale revisits can't re-fire outside
// Meta's dedup window.
function fireBrowserConversionPixel(data: StatusResponse) {
  if (data.intentStatus !== "purchased" || !data.intentId) return;

  // Sandbox test purchases must not hit the production pixel (the webhook
  // likewise only sends sandbox CAPI events under a test_event_code).
  if (data.environment !== "PRODUCTION") return;

  if (!data.purchasedAt) return;
  const purchaseAge = Date.now() - new Date(data.purchasedAt).getTime();
  if (!Number.isFinite(purchaseAge) || purchaseAge > MAX_PURCHASE_AGE_MS) {
    return;
  }

  const storageKey = `azora_meta_conversion:${data.intentId}`;
  try {
    if (window.localStorage.getItem(storageKey)) return;
    window.localStorage.setItem(storageKey, "1");
  } catch {
    // Storage blocked — still fire; the freshness guard above keeps us inside
    // Meta's dedup window, so the shared event_id dedupes on Meta's side.
  }

  setMetaAdvancedMatching({ email: data.email, externalId: data.userId });

  const eventName = data.isTrial ? "StartTrial" : "Purchase";
  const eventID = `${data.isTrial ? "starttrial" : "purchase"}_${data.intentId}`;
  trackMetaEvent(
    eventName,
    {
      value: data.isTrial ? 0 : (data.priceAmount ?? 0),
      currency: data.currency ?? "USD",
      content_name: data.offerId ?? undefined,
    },
    { eventID },
  );
}

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
          fireBrowserConversionPixel(data);
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
