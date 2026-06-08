// Web checkout offer registry + RevenueCat Web Purchase Link builder.
//
// Hard contracts (owned by the mobile/backend repo — do not change here):
// - RevenueCat App User ID = Supabase auth user.id
// - RevenueCat entitlement ID is exactly `Azora  Pro` (two spaces).
// - Annual offer_id = `web_annual_discount`
// - Weekly offer_id = `web_weekly_discount`
// - Checkout uses RevenueCat Web Purchase Links (pay.rev.cat), never raw Stripe.
//
// Everything in this file is pure and side-effect free (env access is injected),
// so it can be unit tested without a running server. See offers.test.ts.

/** RevenueCat entitlement ID. Exactly two spaces between the words. */
export const ENTITLEMENT_ID = "Azora  Pro";

export type OfferKey = "annual" | "weekly";

export type RevenueCatEnvironment = "SANDBOX" | "PRODUCTION";

export interface OfferDefinition {
  /** Short key used in the `?offer=` query param. */
  key: OfferKey;
  /** Stable RevenueCat offer_id, stored on web_checkout_intents.offer_id. */
  offerId: string;
  /** Human-facing label (display only). */
  displayName: string;
  /** Env var holding the sandbox Web Purchase Link base URL. */
  sandboxEnvVar: string;
  /** Env var holding the production Web Purchase Link base URL. */
  prodEnvVar: string;
}

export const OFFERS: Record<OfferKey, OfferDefinition> = {
  annual: {
    key: "annual",
    offerId: "web_annual_discount",
    displayName: "Azora Pro Annual",
    sandboxEnvVar: "REVENUECAT_WEB_PURCHASE_LINK_ANNUAL_SANDBOX",
    prodEnvVar: "REVENUECAT_WEB_PURCHASE_LINK_ANNUAL_PROD",
  },
  weekly: {
    key: "weekly",
    offerId: "web_weekly_discount",
    displayName: "Azora Pro Weekly",
    sandboxEnvVar: "REVENUECAT_WEB_PURCHASE_LINK_WEEKLY_SANDBOX",
    prodEnvVar: "REVENUECAT_WEB_PURCHASE_LINK_WEEKLY_PROD",
  },
};

export const DEFAULT_OFFER_KEY: OfferKey = "annual";

/** Reader injected for testability; defaults to process.env. */
export type EnvReader = (name: string) => string | undefined;

const defaultEnvReader: EnvReader = (name) => process.env[name];

/**
 * Resolve a user-supplied offer selector to a known OfferKey.
 * Accepts the short key ("annual"/"weekly") or the full offer_id
 * ("web_annual_discount"/"web_weekly_discount"). Falls back to the default
 * when the input is missing; throws when it is present but unrecognized.
 */
export function resolveOfferKey(input?: string | null): OfferKey {
  if (input == null || input.trim() === "") {
    return DEFAULT_OFFER_KEY;
  }

  const normalized = input.trim().toLowerCase();

  for (const offer of Object.values(OFFERS)) {
    if (normalized === offer.key || normalized === offer.offerId) {
      return offer.key;
    }
  }

  throw new Error(`Unknown checkout offer: ${input}`);
}

export function getOffer(key: OfferKey): OfferDefinition {
  return OFFERS[key];
}

/**
 * Pick the RevenueCat environment. Production only when NODE_ENV === production;
 * everything else (development, test, preview) uses sandbox.
 */
export function resolveEnvironment(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): RevenueCatEnvironment {
  return nodeEnv === "production" ? "PRODUCTION" : "SANDBOX";
}

/**
 * Resolve the Web Purchase Link base URL for an offer + environment.
 * Fails loudly when the expected env var is missing — production links are not
 * available yet, so a missing prod link must throw rather than silently using
 * a sandbox link.
 */
export function resolveCheckoutBaseUrl(
  offer: OfferDefinition,
  environment: RevenueCatEnvironment,
  readEnv: EnvReader = defaultEnvReader,
): string {
  const varName =
    environment === "PRODUCTION" ? offer.prodEnvVar : offer.sandboxEnvVar;
  const value = readEnv(varName)?.trim();

  if (!value) {
    throw new Error(
      `Missing RevenueCat Web Purchase Link env var ${varName} ` +
        `for offer ${offer.offerId} in ${environment}.`,
    );
  }

  return value;
}

/**
 * Build the full RevenueCat Web Purchase Link:
 *   <baseUrl>/<supabase_user_id>?email=<url_encoded_email>
 * The Supabase user.id IS the RevenueCat App User ID by contract.
 */
export function buildRevenueCatPurchaseUrl(input: {
  baseUrl: string;
  appUserId: string;
  email?: string | null;
}): string {
  if (!input.appUserId) {
    throw new Error("buildRevenueCatPurchaseUrl: appUserId is required.");
  }

  const trimmedBase = input.baseUrl.replace(/\/+$/, "");
  const url = new URL(`${trimmedBase}/${encodeURIComponent(input.appUserId)}`);

  if (input.email) {
    url.searchParams.set("email", input.email);
  }

  return url.toString();
}

export interface ResolvedCheckout {
  offer: OfferDefinition;
  environment: RevenueCatEnvironment;
  baseUrl: string;
  purchaseUrl: string;
}

/**
 * One-shot resolver used by the /checkout/start route: pick the offer, decide
 * the environment, read the (env-specific) base link, and build the final URL.
 */
export function resolveCheckout(input: {
  offer?: string | null;
  appUserId: string;
  email?: string | null;
  nodeEnv?: string;
  readEnv?: EnvReader;
}): ResolvedCheckout {
  const offer = getOffer(resolveOfferKey(input.offer));
  const environment = resolveEnvironment(input.nodeEnv);
  const baseUrl = resolveCheckoutBaseUrl(offer, environment, input.readEnv);
  const purchaseUrl = buildRevenueCatPurchaseUrl({
    baseUrl,
    appUserId: input.appUserId,
    email: input.email,
  });

  return { offer, environment, baseUrl, purchaseUrl };
}
