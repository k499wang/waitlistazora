"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

import { trackMetaEvent } from "./meta-pixel-events";

export function CheckoutForm({
  action,
  offerKey,
  className,
  children,
}: {
  action: string;
  offerKey: string;
  className?: string;
  children: ReactNode;
}) {
  const submittedRef = useRef(false);

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
