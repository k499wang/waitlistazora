"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

import { EmbeddedCheckoutButton } from "./embedded-checkout-button";
import { trackMetaEvent } from "./meta-pixel-events";

// Flag-gated rollout: when on, checkout runs embedded on our own domain via the
// RevenueCat Web Billing SDK; when off, it falls back to the pay.rev.cat redirect
// (POST /checkout/start). Read as a literal so Next inlines it at build time.
const EMBEDDED_CHECKOUT =
  process.env.NEXT_PUBLIC_EMBEDDED_CHECKOUT === "true";

export function CheckoutForm({
  action,
  offerKey,
  className,
  children,
  onCheckoutStart,
  onCheckoutActive,
  onCheckoutInactive,
}: {
  action: string;
  offerKey: string;
  className?: string;
  children: ReactNode;
  onCheckoutStart?: () => void;
  onCheckoutActive?: () => void;
  onCheckoutInactive?: () => void;
}) {
  const submittedRef = useRef(false);

  if (EMBEDDED_CHECKOUT) {
    return (
      <EmbeddedCheckoutButton
        offerKey={offerKey}
        className={className}
        onCheckoutStart={onCheckoutStart}
        onCheckoutActive={onCheckoutActive}
        onCheckoutInactive={onCheckoutInactive}
      >
        {children}
      </EmbeddedCheckoutButton>
    );
  }

  return (
    <form
      action={action}
      method="post"
      className={className}
      onSubmit={(event) => {
        if (submittedRef.current) {
          return;
        }

        submittedRef.current = true;
        event.preventDefault();
        onCheckoutStart?.();
        onCheckoutActive?.();

        const form = event.currentTarget;
        let continued = false;
        const continueToCheckout = () => {
          if (continued) {
            return;
          }
          continued = true;
          HTMLFormElement.prototype.submit.call(form);
        };

        try {
          window.sessionStorage.setItem(
            `azora_meta_checkout:/checkout/start:${offerKey}`,
            "1",
          );
        } catch {
          // Pixel still fires even when storage is blocked.
        }

        trackMetaEvent(
          "InitiateCheckout",
          { content_name: offerKey },
          {
            eventCallback: continueToCheckout,
            eventTimeout: 700,
          },
        );

        window.setTimeout(continueToCheckout, 750);
      }}
    >
      {children}
    </form>
  );
}
