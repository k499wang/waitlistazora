"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { purchaseEmbeddedOffering } from "@/lib/checkout/revenuecat-web";
import { resolveOfferKey } from "@/lib/checkout/offers";
import { setMetaAdvancedMatching, trackMetaEvent } from "./meta-pixel-events";

type IntentResponse = {
  sessionId: string;
  appUserId: string;
  email: string | null;
  offerId: string;
  offeringIdentifier: string;
  environment: string;
};

// Query param that tells a freshly-loaded page to auto-resume checkout after a
// login bounce. Value is the offer key, so the matching button (and only it,
// when the pricing page renders several) re-starts the flow on mount. Exported
// so pages with conditional rendering (e.g. the funnel) can detect a resume and
// make sure the matching button actually mounts.
export const RESUME_PARAM = "resume_checkout";

// Embedded on-domain checkout. Mirrors CheckoutForm's structure (a form wrapping
// the caller's submit button) so call sites stay identical, but instead of
// POSTing to /checkout/start and redirecting to pay.rev.cat it:
//   1. fires the Meta InitiateCheckout pixel (same marker as CheckoutForm)
//   2. POSTs /checkout/intent to create the web_checkout_intents row
//   3. runs the RevenueCat Web Billing SDK purchase modal on THIS page
//   4. on success, hands off to /checkout/success (existing webhook poller)
//
// Unauthenticated clicks bounce through /login and come back to this page with
// ?resume_checkout=<offerKey>, which auto-restarts the flow — matching the old
// redirect flow, where /checkout/start resumed checkout after login.
export function EmbeddedCheckoutButton({
  offerKey,
  className,
  children,
}: {
  offerKey: string;
  className?: string;
  children: ReactNode;
}) {
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // `firePixel` is false on the post-login resume: the pre-login click already
  // fired InitiateCheckout, and the old redirect flow likewise fired it exactly
  // once (on the click, before login) — so we must not double-count here.
  const startCheckout = useCallback(
    async ({ firePixel }: { firePixel: boolean }) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setError(null);

      if (firePixel) {
        // Same InitiateCheckout signal CheckoutForm fires, so attribution is
        // unchanged regardless of which checkout path is active.
        try {
          window.sessionStorage.setItem(
            `azora_meta_checkout:/checkout/start:${offerKey}`,
            "1",
          );
        } catch {
          // Pixel still fires even when storage is blocked.
        }
        trackMetaEvent("InitiateCheckout", { content_name: offerKey });
      }

      try {
        const res = await fetch(
          `/checkout/intent?offer=${encodeURIComponent(offerKey)}`,
          { method: "POST" },
        );

        if (res.status === 401) {
          // Not logged in — bounce through login and come back here with a
          // resume marker so checkout continues automatically.
          const url = new URL(window.location.href);
          url.searchParams.set(RESUME_PARAM, offerKey);
          const next = `${url.pathname}${url.search}`;
          window.location.assign(`/login?next=${encodeURIComponent(next)}`);
          return;
        }

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? "Could not start checkout. Please try again.");
        }

        const intent = (await res.json()) as IntentResponse;

        // Pixel advanced matching: tie this browser's pixel events to the same
        // identifiers the server-side CAPI events use (raw — the pixel hashes).
        setMetaAdvancedMatching({
          email: intent.email,
          externalId: intent.appUserId,
        });

        const outcome = await purchaseEmbeddedOffering({
          appUserId: intent.appUserId,
          offeringIdentifier: intent.offeringIdentifier,
          offerKey: resolveOfferKey(offerKey),
          email: intent.email,
        });

        if (outcome.status === "completed") {
          window.location.assign("/checkout/success");
          return;
        }

        if (outcome.status === "cancelled") {
          // User backed out of the payment modal — let them try again.
          submittingRef.current = false;
          return;
        }

        setError(outcome.message);
        submittingRef.current = false;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not start checkout. Please try again.",
        );
        submittingRef.current = false;
      }
    },
    [offerKey],
  );

  // Auto-resume after a login bounce. Only the button whose offer matches the
  // marker fires; strip the param first so a refresh can't reopen the modal.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (resumedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get(RESUME_PARAM) !== offerKey) return;

    resumedRef.current = true;
    params.delete(RESUME_PARAM);
    const cleaned = `${window.location.pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    window.history.replaceState(null, "", cleaned);

    void startCheckout({ firePixel: false });
  }, [offerKey, startCheckout]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void startCheckout({ firePixel: true });
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children}
      {error ? (
        <p className="checkoutError" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
