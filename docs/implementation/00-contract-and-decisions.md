# Phase 0: Contract And Decisions

## Goal

Create the contract that lets the web repo safely integrate with the mobile-owned Supabase and RevenueCat systems.

Do this before implementing real checkout. The web repo should not guess product IDs, entitlement identifiers, database tables, webhook behavior, or purchase URL shape.

## Owner

Primary owner: mobile app repo / backend owner.

Web repo role: consume the agreed contract and build UI/routes around it.

## Required Decisions

### 1. First Web Offer

Pick one launch offer.

Recommended v1 options:

```text
offer_id: web_annual_discount
display_name: Azora Pro Annual
grants_entitlement: Azora  Pro
billing_type: annual subscription
checkout_type: RevenueCat Web Purchase Link
```

or:

```text
offer_id: web_pro_bundle
display_name: Azora Pro Reset Bundle
grants_entitlement: Azora  Pro
billing_type: annual subscription or one-time lifetime product
includes: Pro access plus clearly-defined bonus value
checkout_type: RevenueCat Web Purchase Link
```

A combination offer is allowed, but v1 should keep it simple. Prefer one bundled product or one offer page with two mutually exclusive choices. Avoid cart-style order bumps, multiple simultaneous products, coupons, coaching add-ons, or post-purchase upsells until the first checkout path works.

### 2. Entitlement Contract

Confirm this remains exact:

```text
Azora  Pro
```

There are two spaces between `Azora` and `Pro`. The web repo should treat this as a fragile external contract, not something to normalize.

### 3. App User ID Contract

Confirm:

```text
RevenueCat App User ID = Supabase auth user.id
Appsflyer Customer User ID = Supabase auth user.id
```

This means checkout must be identified. The web repo should not send users to checkout until it has a verified Supabase user from the server.

### 4. Profile Contract

Confirmed assumption: `profiles.user_id` is guaranteed for every Supabase auth user by the mobile/backend system.

The plan says the existing RevenueCat webhook ignores subscription-writing events unless a matching profile exists. Because profile creation is guaranteed, the web checkout start route should still verify the profile exists before redirecting to RevenueCat. If the profile is unexpectedly missing, fail closed and show a recoverable error instead of starting checkout.

The web repo should not own profile creation unless this guarantee changes.

### 5. Web Repo Role

Confirmed decision: this repo should become the real `tryazora.app` web repo.

That means Phase 1 can include production-oriented route structure and naming. It does not mean the web repo owns mobile contracts. Supabase migrations and RevenueCat product setup still belong to the mobile/backend owner unless ownership changes explicitly.

### 6. Supabase Schema Ownership

Confirmed recommended ownership: the mobile/backend repo owns shared Supabase migrations for:

```text
profiles
subscriptions
revenuecat_events
web_funnel_sessions
web_funnel_attribution
web_funnel_answers
web_checkout_intents
```

The web repo owns Next.js routes, UI, funnel config, offer registry, checkout-start behavior, attribution capture, and success/activation pages. It can read/write the shared schema through approved server-side APIs or Supabase access, but it should not create a competing migration history.

### 7. RevenueCat Product Setup

Mobile/backend owner should create:

- RevenueCat product/package/offering for the web offer.
- Sandbox Web Purchase Link token.
- Production Web Purchase Link token when ready.
- Confirmation that identified checkout grants `Azora  Pro`.
- Confirmation that web purchase events reach the existing webhook.

### 8. Webhook Reconciliation Contract

Define what happens when RevenueCat sends a web purchase event:

1. Validate event idempotency.
2. Read `app_user_id`.
3. Confirm it is a Supabase UUID.
4. Confirm matching `profiles.user_id`.
5. Apply event-order protection so stale events cannot overwrite newer subscription state.
6. Update `subscriptions`.
7. Update entitlement view behavior.
8. Match the event to `web_checkout_intents`.
9. Mark checkout as purchased, failed, expired, refunded, or otherwise terminal.
10. Store RevenueCat event ID, transaction ID, original transaction ID, purchase timestamp, price, currency, product, entitlement, and failure reason where available.
11. Send or queue server-side purchase analytics only after purchase confirmation.

This is not a later enhancement. Webhook reconciliation is a required backend deliverable before production web purchases.

Events with explicit required behavior:

```text
INITIAL_PURCHASE
RENEWAL
CANCELLATION
EXPIRATION
BILLING_ISSUE
PRODUCT_CHANGE
TRANSFER
SUBSCRIBER_ALIAS
TEST
```

Cancellation handling needs special review. A cancellation event should not end access early if RevenueCat also provides an entitlement/subscription expiration timestamp in the future. If the current webhook treats cancellation without an expiration timestamp as ending access immediately, resolve that behavior before web commerce launches.

## Mobile Repo Deliverables

- RevenueCat offer/product exists in sandbox.
- Web Purchase Link token exists for sandbox.
- Entitlement grant verified for `Azora  Pro`.
- Supabase migrations are created or approved.
- Profile creation guarantee is documented.
- Webhook reconciliation supports web checkout intents before production checkout.
- Existing cancellation/expiration behavior is reviewed and corrected if needed.
- RevenueCat transaction IDs, original transaction IDs, price, currency, and purchase timestamps are stored or explicitly mapped.
- Event-order protection is implemented or explicitly documented.

## Web Repo Deliverables

- A `commerceContracts` config file once real values exist.
- A disabled offer registry before real tokens exist.
- Clear runtime errors if checkout env vars are missing.
- No hardcoded fake RevenueCat tokens.
- No duplicate Supabase schema ownership.
- Google, Apple, and email auth UI in the v1 auth gate.
- Checkout-start route verifies `profiles.user_id` exists before redirecting.

## Acceptance Criteria

- A sandbox RevenueCat purchase can be made with a known Supabase user ID.
- RevenueCat customer uses Supabase `user.id` as App User ID.
- The purchase grants `Azora  Pro`.
- The RevenueCat webhook matches the purchase to `web_checkout_intents`.
- The webhook updates Supabase subscription state.
- Mobile can sign in as that user and see Pro access.
- The web repo has the exact offer ID, entitlement ID, purchase link env var names, and profile verification method.

## Risks

- Product names drift between web, RevenueCat, and mobile.
- Profile creation guarantee regresses and the webhook ignores the purchase.
- Web builds a purchase URL with the wrong App User ID.
- RevenueCat event order causes stale subscription state to overwrite newer state.
- Cancellation events end access earlier than intended.
- Web checkout intent cannot be reconciled to the RevenueCat transaction.
- Sandbox checkout works but production uses different offering/package settings.
- Multiple repos create conflicting Supabase migrations.

## Questions To Answer

- What is the first web product or bundle: annual, lifetime, founder, or Pro plus bonus content?
- Will v1 use RevenueCat Web Purchase Links or the RevenueCat Web SDK?
- Does the existing RevenueCat webhook need changes for web purchases?
- Where will web funnel migrations live?
- If a bundle includes bonus content, what system owns delivery and access?
- How should the webhook handle cancellation events with missing or future expiration timestamps?
- Which RevenueCat event fields are stored as the transaction and original transaction IDs?
