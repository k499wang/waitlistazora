"use client";

// Live price lookup via the RevenueCat Web Billing SDK (@revenuecat/purchases-js).
//
// Purpose: display *accurate* prices on the pricing/offer UI instead of the
// hardcoded placeholders in `offer-display.ts`. This only READS offerings; it
// never starts a purchase — checkout still goes through the server-built
// RevenueCat Web Purchase Link (see offers.ts / /checkout/start).
//
// Requires a PUBLIC Web Billing API key (`rcb_...`) in
// NEXT_PUBLIC_REVENUECAT_BILLING_KEY. The public key is safe to expose to the
// browser; it cannot grant entitlements or mutate state.
//
// Caveat (documented for callers): getOfferings() returns each package's
// current/base price. If a promotional offer (e.g. `web_annual_discount`) is
// attached only to the Web Purchase Link, the charged price at pay.rev.cat is
// the authoritative one and may differ from what this returns. Always keep a
// hardcoded fallback in the UI.

import { ErrorCode, Purchases, PurchasesError } from "@revenuecat/purchases-js";

import { OFFERS, type OfferKey } from "./offers";

const BILLING_KEY = process.env.NEXT_PUBLIC_REVENUECAT_BILLING_KEY;

// Our offer keys -> RevenueCat's standard package identifiers on the current
// offering. These `$rc_*` identifiers are RevenueCat conventions for duration.
const PACKAGE_IDENTIFIER: Record<OfferKey, string> = {
  annual: "$rc_annual",
  weekly: "$rc_weekly",
};

export interface LiveOfferPrice {
  /** Localized, ready-to-render price, e.g. "$39.99". */
  formattedPrice: string;
  /** Price in micros (1_000_000 = 1 unit of currency). */
  amountMicros: number;
  /** ISO currency code, e.g. "USD". */
  currency: string;
}

export type LiveOfferPrices = Partial<Record<OfferKey, LiveOfferPrice>>;

// Module-level memo so multiple price components share a single network fetch
// and a single configured SDK instance per page load.
let pricesPromise: Promise<LiveOfferPrices> | null = null;

/**
 * Fetch live prices for all known offers. Returns an empty object when the
 * billing key is absent or the lookup fails — callers must fall back to their
 * hardcoded display price. Never throws.
 */
export function getLiveOfferPrices(): Promise<LiveOfferPrices> {
  if (!BILLING_KEY) {
    return Promise.resolve({});
  }
  if (!pricesPromise) {
    pricesPromise = loadPrices().catch((err) => {
      // Reset so a later mount can retry; degrade to fallback prices.
      pricesPromise = null;
      if (process.env.NODE_ENV !== "production") {
        console.warn("[revenuecat-web] price lookup failed:", err);
      }
      return {};
    });
  }
  return pricesPromise;
}

export type PurchaseOutcome =
  | { status: "completed" }
  | { status: "cancelled" }
  | { status: "error"; message: string };

/**
 * Run an embedded RevenueCat Web Billing purchase on our own domain.
 *
 * Configures the SDK with the REAL Supabase app user id (unlike loadPrices,
 * which uses an anonymous id for catalog reads) so the resulting RevenueCat
 * app_user_id equals user.id by contract — this is what the web-checkout webhook
 * matches the open intent against. Re-configuring is safe: the SDK simply
 * replaces its singleton with a fresh instance bound to this user (no alias).
 *
 * Loads the discount-bearing offering by identifier (NOT the `current` offering)
 * and purchases its package for the given offer. When `htmlTarget` is provided
 * the payment UI renders inside that element (our branded checkout panel);
 * otherwise the SDK falls back to its own full-screen modal. Never throws —
 * resolves to a discriminated outcome so the caller can branch on cancel vs
 * error.
 */
export async function purchaseEmbeddedOffering(input: {
  appUserId: string;
  offeringIdentifier: string;
  offerKey: OfferKey;
  email?: string | null;
  htmlTarget?: HTMLElement;
}): Promise<PurchaseOutcome> {
  if (!BILLING_KEY) {
    return { status: "error", message: "Checkout is not configured." };
  }

  try {
    const purchases = Purchases.configure({
      apiKey: BILLING_KEY as string,
      appUserId: input.appUserId,
    });

    const offerings = await purchases.getOfferings();
    const offering = offerings.all[input.offeringIdentifier];
    if (!offering) {
      return {
        status: "error",
        message: `Offering ${input.offeringIdentifier} is unavailable.`,
      };
    }

    const packageIdentifier = PACKAGE_IDENTIFIER[input.offerKey];
    const rcPackage = offering.availablePackages.find(
      (p) => p.identifier === packageIdentifier,
    );
    if (!rcPackage) {
      return {
        status: "error",
        message: `No ${input.offerKey} package on ${input.offeringIdentifier}.`,
      };
    }

    await purchases.purchase({
      rcPackage,
      customerEmail: input.email ?? undefined,
      htmlTarget: input.htmlTarget,
    });

    return { status: "completed" };
  } catch (err) {
    if (err instanceof PurchasesError && err.errorCode === ErrorCode.UserCancelledError) {
      return { status: "cancelled" };
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn("[revenuecat-web] purchase failed:", err);
    }
    const message =
      err instanceof Error ? err.message : "Something went wrong during checkout.";
    return { status: "error", message };
  }
}

async function loadPrices(): Promise<LiveOfferPrices> {
  // Anonymous app user id: we are only reading the catalog, never purchasing,
  // so we must NOT configure with the real Supabase user id here.
  const purchases = Purchases.configure({
    apiKey: BILLING_KEY as string,
    appUserId: Purchases.generateRevenueCatAnonymousAppUserId(),
  });

  const offerings = await purchases.getOfferings();

  const result: LiveOfferPrices = {};

  for (const key of Object.keys(PACKAGE_IDENTIFIER) as OfferKey[]) {
    // The discounted packages live on each offer's own offering (see
    // OFFERS[key].offeringIdentifier), not on the `current` offering.
    const offering = offerings.all[OFFERS[key].offeringIdentifier];
    if (!offering) continue;

    const pkg = offering.availablePackages.find(
      (p) => p.identifier === PACKAGE_IDENTIFIER[key],
    );
    if (!pkg) continue;

    // Field name has varied across SDK versions (rcBillingProduct ->
    // webBillingProduct); read defensively so a minor bump doesn't break us.
    const product =
      (pkg as { webBillingProduct?: unknown }).webBillingProduct ??
      (pkg as { rcBillingProduct?: unknown }).rcBillingProduct;
    const currentPrice = (product as { currentPrice?: LiveOfferPrice } | undefined)
      ?.currentPrice;

    if (currentPrice?.formattedPrice) {
      result[key] = {
        formattedPrice: currentPrice.formattedPrice,
        amountMicros: currentPrice.amountMicros,
        currency: currentPrice.currency,
      };
    }
  }

  return result;
}
