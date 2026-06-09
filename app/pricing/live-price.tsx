"use client";

import { useEffect, useState } from "react";

import { getLiveOfferPrices } from "@/lib/checkout/revenuecat-web";
import type { OfferKey } from "@/lib/checkout/offers";

// Renders the RevenueCat live price for an offer.
//
// RevenueCat has no supported server-side price API (the Web Billing SDK is
// browser-only and the REST API doesn't expose prices), so the price can only
// be known on the client. To avoid flashing a stale/placeholder number, we show
// a shimmer skeleton until the SDK resolves, then render the real price. The
// hardcoded `fallback` is only used if the live lookup fails entirely (no
// billing key / network error) — never shown as a transient first paint.
export function LivePrice({
  offerKey,
  fallback,
}: {
  offerKey: OfferKey;
  fallback: string;
}) {
  // null = still loading -> render skeleton (no wrong value ever shown).
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getLiveOfferPrices()
      .then((prices) => {
        if (!active) return;
        // Live price when available; fallback only when the lookup yields none.
        setPrice(prices[offerKey]?.formattedPrice ?? fallback);
      })
      .catch(() => {
        if (active) setPrice(fallback);
      });
    return () => {
      active = false;
    };
  }, [offerKey, fallback]);

  if (price === null) {
    return (
      <span
        className="priceSkeleton"
        role="status"
        aria-live="polite"
        aria-label="Loading price"
      />
    );
  }

  return <>{price}</>;
}
