# Phase 3: RevenueCat Checkout Integration

## Goal

Send authenticated web users to RevenueCat checkout using Supabase `user.id` as the RevenueCat App User ID.

This phase should not begin until the mobile repo creates at least one real RevenueCat web offer/product.

## Dependencies

- Phase 0 contract complete.
- RevenueCat sandbox Web Purchase Link token exists.
- Web offer ID is final.
- `Azora  Pro` entitlement grant is verified in sandbox.
- Supabase funnel and checkout tables exist.
- Auth and profile verification from Phase 2 work.
- Mobile/backend webhook reconciles RevenueCat events to `web_checkout_intents`.
- Mobile/backend webhook cancellation, expiration, and renewal behavior is reviewed.

## Checkout Principle

Never build checkout URLs entirely on the client.

Checkout start must be server-side because it needs to:

- verify the authenticated user,
- validate the offer,
- ensure profile existence,
- create checkout intent,
- generate event IDs,
- build the purchase URL,
- prevent use of sandbox URLs in production.

## Offer Registry

Add a typed registry:

```ts
export type WebOffer = {
  id: string;
  name: string;
  active: boolean;
  checkoutEnabled: boolean;
  grantsEntitlement: "Azora  Pro";
  currency: "USD";
  priceDisplay: string;
  includedItems: string[];
  revenueCatPurchaseLinkToken: {
    productionEnv: string;
    sandboxEnv: string;
  };
};
```

Example:

```ts
export const webOffers = {
  web_annual_discount: {
    id: "web_annual_discount",
    name: "Azora Pro Annual",
    active: true,
    checkoutEnabled: true,
    grantsEntitlement: "Azora  Pro",
    currency: "USD",
    priceDisplay: "$29/year",
    includedItems: [
      "Azora Pro access",
      "Guided breathwork sessions",
      "Camera-based recovery tracking",
    ],
    revenueCatPurchaseLinkToken: {
      productionEnv: "REVENUECAT_WEB_PURCHASE_LINK_ANNUAL_PROD",
      sandboxEnv: "REVENUECAT_WEB_PURCHASE_LINK_ANNUAL_SANDBOX",
    },
  },
} satisfies Record<string, WebOffer>;
```

Keep display copy separate from RevenueCat identifiers.

## Combination Offer Modeling

Use one of these models:

### Model A: One Bundled Product

Create one RevenueCat web product/package for the bundle.

Example:

```text
offer_id: web_pro_reset_bundle
product: annual subscription or lifetime product
grants: Azora  Pro
bonus_delivery: app content, email, or web content
```

This is the recommended v1 approach because checkout, attribution, refunds, support, and analytics all map to one purchase.

### Model B: One Offering With Multiple Choices

Show multiple mutually exclusive choices:

```text
Annual Pro
Lifetime Founder
```

Each choice has its own RevenueCat product/package and purchase link. The user buys one.

This is acceptable if pricing strategy requires a choice, but it adds more QA surface.

### Model C: True Cart Or Add-Ons

Examples:

```text
Annual Pro + coaching add-on
Lifetime + paid report
Subscription + order bump
```

Avoid this for v1. It likely requires the RevenueCat Web SDK, a custom commerce boundary, or raw Stripe later depending on the exact checkout behavior required.

## Checkout Start Route

Create:

```text
app/checkout/start/route.ts
```

Responsibilities:

1. Accept `offer_id` and `web_funnel_session_id`.
2. Verify Supabase user from server-side session.
3. Load the web funnel session.
4. Confirm session belongs to this user or can be attached to this user.
5. Validate offer exists and is active.
6. Confirm checkout is enabled.
7. Ensure `profiles.user_id` exists.
8. Generate `checkout_event_id`.
9. Generate `purchase_event_id`.
10. Create `web_checkout_intents`.
11. Build RevenueCat purchase link with Supabase `user.id`.
12. Append email if available.
13. Append supported UTM params.
14. Redirect to RevenueCat.

## Checkout Intent Fields

Recommended fields:

```text
id
session_id
user_id
offer_id
revenuecat_app_user_id
revenuecat_purchase_url
environment
status
checkout_event_id
purchase_event_id
revenuecat_event_id
revenuecat_transaction_id
revenuecat_original_transaction_id
purchased_at
price_amount
currency
failure_reason
created_at
updated_at
expires_at
```

Statuses:

```text
created
redirected
purchased
failed
expired
refunded
canceled
billing_issue
```

## Success URL

Configure RevenueCat to return to:

```text
/checkout/success?intent=<checkout_intent_id>
```

If RevenueCat cannot preserve a custom ID reliably, store enough state by user/session to reconcile the latest open intent.

## Webhook Reconciliation

This likely belongs in the mobile/backend repo.

Expected behavior:

1. Receive RevenueCat event.
2. Deduplicate by RevenueCat event ID or transaction ID.
3. Verify `app_user_id` is a Supabase UUID.
4. Verify profile exists.
5. Apply event-order protection.
6. Update subscription tables.
7. Match to open checkout intent.
8. Mark checkout intent with the correct status.
9. Store price, currency, product, entitlement, transaction ID, original transaction ID, and purchase timestamp.
10. Trigger server-side purchase analytics later in Phase 4.

Required event behavior:

```text
INITIAL_PURCHASE -> mark matching checkout intent purchased
RENEWAL -> update subscription period/revenue, preserve user entitlement
CANCELLATION -> mark cancellation state without ending access early if entitlement remains active
EXPIRATION -> end access when RevenueCat says entitlement expired
BILLING_ISSUE -> mark billing issue but follow RevenueCat entitlement state
PRODUCT_CHANGE -> update product/package linkage
TRANSFER -> audit and avoid corrupting the original user's entitlement
SUBSCRIBER_ALIAS -> audit and preserve identity mapping
TEST -> audit only unless explicitly running sandbox acceptance
```

Production checkout should be blocked until this behavior is implemented or explicitly verified in the mobile/backend repo.

## Environment Safety

Required env vars:

```text
REVENUECAT_WEB_PURCHASE_LINK_ANNUAL_PROD=
REVENUECAT_WEB_PURCHASE_LINK_ANNUAL_SANDBOX=
```

Rules:

- production cannot use sandbox link tokens,
- preview/dev should use sandbox tokens,
- missing tokens should fail closed,
- client code should never need RevenueCat purchase link tokens unless they are intentionally public links.

## Acceptance Criteria

- Unauthenticated users cannot start checkout.
- Authenticated users have profile existence verified before checkout.
- Checkout intent is created before redirect.
- RevenueCat URL contains Supabase `user.id` as App User ID.
- Sandbox checkout grants `Azora  Pro`.
- Webhook reconciles the RevenueCat event to `web_checkout_intents`.
- Webhook updates Supabase subscription state.
- Mobile sees Pro after purchase.
- Duplicate webhooks do not create duplicate purchase events.
- Out-of-order webhook events cannot overwrite newer subscription state.
- Cancellation does not end access earlier than RevenueCat entitlement state.

## Risks

- Purchase link URL shape is assumed incorrectly.
- Checkout succeeds but webhook cannot match a profile.
- Success page is shown before entitlement has been confirmed.
- Sandbox and production product IDs diverge.
- Purchase analytics fire from success page before webhook confirmation.
- Checkout intents lack enough transaction data for support, refunds, and Meta dedupe.
- Webhook treats audit-only events as subscription-changing events.

## Questions To Answer

- What exact return/success URL can RevenueCat preserve?
- Can the checkout intent ID be passed through checkout reliably?
- Does the mobile webhook already record RevenueCat transaction IDs?
- Should the web route poll Supabase entitlement after success, or simply show activation instructions?
- Does the current webhook have event-order protection?
- What exact RevenueCat event types should change `web_checkout_intents.status`?
