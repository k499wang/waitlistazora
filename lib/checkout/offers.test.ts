import { describe, expect, it } from "vitest";

import {
  buildRevenueCatPurchaseUrl,
  ENTITLEMENT_ID,
  getOffer,
  resolveCheckout,
  resolveCheckoutBaseUrl,
  resolveEnvironment,
  resolveOfferKey,
} from "./offers";

const SANDBOX_ANNUAL = "https://pay.rev.cat/sandbox/onqkikrjlwnxfpsb";
const SANDBOX_WEEKLY = "https://pay.rev.cat/sandbox/plvwmjvsuochpfot";

const sandboxEnv = (name: string): string | undefined =>
  ({
    REVENUECAT_WEB_PURCHASE_LINK_ANNUAL_SANDBOX: SANDBOX_ANNUAL,
    REVENUECAT_WEB_PURCHASE_LINK_WEEKLY_SANDBOX: SANDBOX_WEEKLY,
  })[name];

describe("entitlement contract", () => {
  it("keeps the exact two-space entitlement id", () => {
    expect(ENTITLEMENT_ID).toBe("Azora  Pro");
    expect(ENTITLEMENT_ID).not.toBe("Azora Pro");
  });
});

describe("resolveOfferKey", () => {
  it("defaults to annual when nothing is provided", () => {
    expect(resolveOfferKey()).toBe("annual");
    expect(resolveOfferKey("")).toBe("annual");
    expect(resolveOfferKey(null)).toBe("annual");
  });

  it("accepts the short key and the full offer_id", () => {
    expect(resolveOfferKey("annual")).toBe("annual");
    expect(resolveOfferKey("WEEKLY")).toBe("weekly");
    expect(resolveOfferKey("web_annual_discount")).toBe("annual");
    expect(resolveOfferKey("web_weekly_discount")).toBe("weekly");
  });

  it("throws on an unknown selector", () => {
    expect(() => resolveOfferKey("lifetime")).toThrow(/Unknown checkout offer/);
  });
});

describe("offer registry contract", () => {
  it("maps keys to the exact contract offer_ids", () => {
    expect(getOffer("annual").offerId).toBe("web_annual_discount");
    expect(getOffer("weekly").offerId).toBe("web_weekly_discount");
  });

  it("exposes the SDK offering identifier for the embedded checkout path", () => {
    expect(getOffer("annual").offeringIdentifier).toBe("web_annual_discount");
    expect(getOffer("weekly").offeringIdentifier).toBe("web_weekly_discount");
  });
});

describe("resolveEnvironment", () => {
  it("only uses production for NODE_ENV=production", () => {
    expect(resolveEnvironment("production")).toBe("PRODUCTION");
    expect(resolveEnvironment("development")).toBe("SANDBOX");
    expect(resolveEnvironment("test")).toBe("SANDBOX");
    expect(resolveEnvironment(undefined)).toBe("SANDBOX");
  });
});

describe("resolveCheckoutBaseUrl", () => {
  it("returns the sandbox link in sandbox mode", () => {
    expect(resolveCheckoutBaseUrl(getOffer("annual"), "SANDBOX", sandboxEnv)).toBe(
      SANDBOX_ANNUAL,
    );
    expect(resolveCheckoutBaseUrl(getOffer("weekly"), "SANDBOX", sandboxEnv)).toBe(
      SANDBOX_WEEKLY,
    );
  });

  it("fails loudly when the production link is missing", () => {
    expect(() =>
      resolveCheckoutBaseUrl(getOffer("annual"), "PRODUCTION", sandboxEnv),
    ).toThrow(/Missing RevenueCat Web Purchase Link env var/);
  });

  it("does not fall back to sandbox in production", () => {
    expect(() =>
      resolveCheckoutBaseUrl(getOffer("annual"), "PRODUCTION", sandboxEnv),
    ).toThrow(/REVENUECAT_WEB_PURCHASE_LINK_ANNUAL_PROD/);
  });
});

describe("buildRevenueCatPurchaseUrl", () => {
  const appUserId = "11111111-2222-3333-4444-555555555555";

  it("appends the Supabase user id as the path segment", () => {
    expect(
      buildRevenueCatPurchaseUrl({ baseUrl: SANDBOX_ANNUAL, appUserId }),
    ).toBe(`${SANDBOX_ANNUAL}/${appUserId}`);
  });

  it("trims a trailing slash on the base url", () => {
    expect(
      buildRevenueCatPurchaseUrl({ baseUrl: `${SANDBOX_ANNUAL}/`, appUserId }),
    ).toBe(`${SANDBOX_ANNUAL}/${appUserId}`);
  });

  it("url-encodes the email query param", () => {
    const url = buildRevenueCatPurchaseUrl({
      baseUrl: SANDBOX_ANNUAL,
      appUserId,
      email: "user+test@example.com",
    });
    expect(url).toBe(
      `${SANDBOX_ANNUAL}/${appUserId}?email=user%2Btest%40example.com`,
    );
  });

  it("omits email when not provided", () => {
    const url = buildRevenueCatPurchaseUrl({ baseUrl: SANDBOX_ANNUAL, appUserId });
    expect(url).not.toContain("email=");
  });

  it("requires an app user id", () => {
    expect(() =>
      buildRevenueCatPurchaseUrl({ baseUrl: SANDBOX_ANNUAL, appUserId: "" }),
    ).toThrow(/appUserId is required/);
  });
});

describe("resolveCheckout", () => {
  const appUserId = "abc-123";

  it("resolves the full sandbox annual checkout", () => {
    const result = resolveCheckout({
      offer: "annual",
      appUserId,
      email: "a@b.com",
      nodeEnv: "development",
      readEnv: sandboxEnv,
    });

    expect(result.offer.offerId).toBe("web_annual_discount");
    expect(result.environment).toBe("SANDBOX");
    expect(result.purchaseUrl).toBe(`${SANDBOX_ANNUAL}/${appUserId}?email=a%40b.com`);
  });

  it("resolves weekly via the offer param", () => {
    const result = resolveCheckout({
      offer: "weekly",
      appUserId,
      nodeEnv: "development",
      readEnv: sandboxEnv,
    });

    expect(result.offer.offerId).toBe("web_weekly_discount");
    expect(result.purchaseUrl).toBe(`${SANDBOX_WEEKLY}/${appUserId}`);
  });

  it("throws in production when prod links are absent", () => {
    expect(() =>
      resolveCheckout({
        offer: "annual",
        appUserId,
        nodeEnv: "production",
        readEnv: sandboxEnv,
      }),
    ).toThrow(/Missing RevenueCat Web Purchase Link/);
  });
});
