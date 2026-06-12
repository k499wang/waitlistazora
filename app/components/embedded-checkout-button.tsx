"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
//   3. opens our branded checkout panel and renders the RevenueCat Web Billing
//      purchase flow inside it (htmlTarget) — falling back to RevenueCat's own
//      modal if the panel isn't mounted yet
//   4. on success, hands off to /checkout/success (existing webhook poller)
//
// The panel is portaled to <body>: RevenueCat's UI contains <button> elements,
// and rendering them inside our wrapping <form> would let them submit it.
//
// Unauthenticated clicks bounce through /login and come back to this page with
// ?resume_checkout=<offerKey>, which auto-restarts the flow — matching the old
// redirect flow, where /checkout/start resumed checkout after login.
export function EmbeddedCheckoutButton({
  offerKey,
  className,
  children,
  onCheckoutStart,
  onIntentionalDeparture,
}: {
  offerKey: string;
  className?: string;
  children: ReactNode;
  onCheckoutStart?: () => void;
  onIntentionalDeparture?: () => void;
}) {
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  // Increments on every start/close; a pending purchase whose session no longer
  // matches was abandoned via our close button, so its outcome is ignored.
  const sessionRef = useRef(0);

  useEffect(() => setMounted(true), []);

  const closePanel = useCallback(() => {
    sessionRef.current += 1;
    setPanelOpen(false);
    if (targetRef.current) targetRef.current.innerHTML = "";
    submittingRef.current = false;
  }, []);

  // Esc closes the panel; lock page scroll behind it while open.
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [panelOpen, closePanel]);

  // The portal mounts one render after first mount, so on an auto-resume the
  // target may not exist yet when checkout starts. Wait a few frames; if it
  // never appears, return undefined and let RevenueCat use its own modal.
  const waitForTarget = useCallback(async (): Promise<HTMLElement | undefined> => {
    for (let i = 0; i < 20; i += 1) {
      if (targetRef.current) return targetRef.current;
      await new Promise((r) => requestAnimationFrame(r));
    }
    return undefined;
  }, []);

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
          onIntentionalDeparture?.();
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

        const session = (sessionRef.current += 1);
        const htmlTarget = await waitForTarget();
        if (htmlTarget) {
          htmlTarget.innerHTML = "";
          setPanelOpen(true);
        }

        const outcome = await purchaseEmbeddedOffering({
          appUserId: intent.appUserId,
          offeringIdentifier: intent.offeringIdentifier,
          offerKey: resolveOfferKey(offerKey),
          email: intent.email,
          htmlTarget,
        });

        // Panel was closed mid-purchase; this outcome belongs to an abandoned
        // session, so don't act on it.
        if (session !== sessionRef.current) return;

        if (outcome.status === "completed") {
          onIntentionalDeparture?.();
          window.location.assign("/checkout/success");
          return;
        }

        if (outcome.status === "cancelled") {
          // User backed out of the payment flow — let them try again.
          closePanel();
          return;
        }

        closePanel();
        setError(outcome.message);
      } catch (err) {
        closePanel();
        setError(
          err instanceof Error ? err.message : "Could not start checkout. Please try again.",
        );
      }
    },
    [offerKey, waitForTarget, closePanel, onIntentionalDeparture],
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
    onCheckoutStart?.();
    void startCheckout({ firePixel: true });
  }

  return (
    <>
      <form className={className} onSubmit={handleSubmit}>
        {children}
        {error ? (
          <p className="checkoutError" role="alert">
            {error}
          </p>
        ) : null}
      </form>
      {mounted
        ? createPortal(
            <div
              className={`checkoutOverlay${panelOpen ? " open" : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label="Checkout"
              aria-hidden={!panelOpen}
            >
              <div className="checkoutPanel">
                <div className="checkoutPanelHead">
                  <span className="checkoutPanelBrand">Azora</span>
                  <button
                    type="button"
                    className="checkoutPanelClose"
                    onClick={closePanel}
                    aria-label="Close checkout"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 3l10 10M13 3L3 13"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <div ref={targetRef} className="checkoutPanelTarget" />
                <div className="checkoutPanelLoading" aria-hidden="true">
                  <span className="checkoutPanelSpinner" />
                  Preparing secure checkout…
                </div>
                <p className="checkoutPanelReassure">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 1 1 6 0v3H9z" />
                  </svg>
                  Payments processed securely by RevenueCat. Cancel anytime.
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
