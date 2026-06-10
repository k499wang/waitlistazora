// Presentational copy for the web offers. Kept deliberately separate from
// `offers.ts` (which owns billing identifiers + RevenueCat link building) so
// experiments can change price copy without touching product identity.
//
// NOTE: the `price` strings below are now FALLBACKS. The pricing UI fetches the
// real localized price from RevenueCat at runtime (see revenuecat-web.ts +
// app/pricing/live-price.tsx) and only shows these when the live lookup is
// unavailable (no billing key / network failure). Keep them roughly accurate.
// The actual charge is controlled by the RevenueCat Web Purchase Link.

import type { OfferKey } from "./offers";

export interface OfferDisplay {
  key: OfferKey;
  /** Headline price, e.g. "$39.99". */
  price: string;
  /** Billing cadence shown next to the price, e.g. "/year". */
  period: string;
  /** Secondary line under the price, e.g. "billed annually · ~$3.33/mo". */
  billingNote: string;
  /** Per-week equivalent for compact display, e.g. "$0.77". */
  weeklyPrice: string;
  /** Optional ribbon, e.g. "Best value". */
  badge?: string;
  /** Short trial / risk-reversal line shown on the CTA. */
  trialLine: string;
  /** Bullet features rendered in the card. */
  features: string[];
  /** Whether this card is visually highlighted as the recommended plan. */
  featured: boolean;
}

export const OFFER_DISPLAY: Record<OfferKey, OfferDisplay> = {
  annual: {
    key: "annual",
    price: "$39.99",
    period: "/year",
    billingNote: "billed annually",
    weeklyPrice: "$0.77",
    badge: "Best value · Save 80%",
    trialLine: "7-day free trial, then $39.99/yr",
    features: [
      "Unlimited camera heart-rate sessions",
      "All guided breathwork programs",
      "Stress & recovery trends over time",
      "Personalized daily practice",
      "Cancel anytime",
    ],
    featured: true,
  },
  weekly: {
    key: "weekly",
    price: "$4.99",
    period: "/week",
    billingNote: "billed weekly",
    weeklyPrice: "$4.99",
    trialLine: "Cancel anytime",
    features: [
      "Unlimited camera heart-rate sessions",
      "All guided breathwork programs",
      "Stress & recovery trends over time",
      "Cancel anytime",
    ],
    featured: false,
  },
};

/** Display order for the pricing grid (featured plan first). */
export const OFFER_DISPLAY_ORDER: OfferKey[] = ["annual", "weekly"];
