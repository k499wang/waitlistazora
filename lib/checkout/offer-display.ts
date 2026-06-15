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
  /**
   * Pre-discount per-week price shown before the spin-wheel discount is won,
   * then crossed out once it applies. Real charge never changes — keep this at
   * weeklyPrice / (1 - DISCOUNT_PCT/100) so the strikethrough math is honest
   * against the displayed discount.
   */
  anchorWeeklyPrice: string;
  /** Pre-discount full price for the billing cadence, e.g. "$149.99/yr". */
  anchorFullPrice: string;
  /** Optional ribbon, e.g. "Best value". */
  badge?: string;
  /** Short trial / risk-reversal line shown on the CTA. */
  trialLine: string;
  /** Charge-transparency line shown directly under the checkout CTA. */
  dueTodayLine: string;
  /** Bullet features rendered in the card. */
  features: string[];
  /** Whether this card is visually highlighted as the recommended plan. */
  featured: boolean;
}

export const OFFER_DISPLAY: Record<OfferKey, OfferDisplay> = {
  annual: {
    key: "annual",
    price: "$59.99",
    period: "/year",
    billingNote: "billed annually",
    weeklyPrice: "$1.15",
    anchorWeeklyPrice: "$2.88",
    anchorFullPrice: "$149.99/yr",
    badge: "Best value · Save 77%",
    trialLine: "7-day free trial, then $59.99/yr",
    dueTodayLine: "$0.00 due today · then $59.99/yr after your 7-day trial",
    features: [
      "Unlimited camera heart-rate readings",
      "Live biofeedback as you breathe",
      "Every program, paced to your pulse",
      "Streaks & daily reminders",
      "Stress & recovery trends",
    ],
    featured: true,
  },
  weekly: {
    key: "weekly",
    price: "$9.99",
    period: "/week",
    billingNote: "billed weekly",
    weeklyPrice: "$9.99",
    anchorWeeklyPrice: "$9.99",
    anchorFullPrice: "$9.99/wk",
    trialLine: "Cancel anytime",
    dueTodayLine: "$9.99 due today · billed weekly, cancel anytime",
    // Same benefits as annual — the plan choice is about price, not features.
    features: [
      "Unlimited camera heart-rate readings",
      "Live biofeedback as you breathe",
      "Every program, paced to your pulse",
      "Streaks & daily reminders",
      "Stress & recovery trends",
    ],
    featured: false,
  },
};

/** Display order for the pricing grid (featured plan first). */
export const OFFER_DISPLAY_ORDER: OfferKey[] = ["annual", "weekly"];
