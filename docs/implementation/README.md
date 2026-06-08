# Azora Web Funnel Implementation Plan

This folder breaks `docs/plan.md` into execution phases.

The important constraint is that the mobile app repo owns Supabase and RevenueCat. This web repo should not invent subscription products, entitlement names, or database migrations independently. The web repo can build ecommerce-style presentation and funnel scaffolding now, but real checkout should wait until the mobile repo exposes a clear commerce contract.

## Recommended Order

1. [Phase 0: Contract And Decisions](./00-contract-and-decisions.md)
2. [Phase 1: Ecommerce Landing And Funnel Shell](./01-ecommerce-landing-and-funnel-shell.md)
3. [Phase 2: Supabase Auth And Funnel Sessions](./02-supabase-auth-and-funnel-sessions.md)
4. [Phase 3: RevenueCat Checkout Integration](./03-revenuecat-checkout-integration.md)
5. [Phase 4: Attribution And Measurement](./04-attribution-and-measurement.md)
6. [Phase 5: Success, Install, And Mobile Activation](./05-success-install-and-mobile-activation.md)
7. [Phase 6: Funnel Scaling And Operations](./06-funnel-scaling-and-operations.md)

## Parallel Work

Some work can happen before checkout exists:

- Redesign the current landing page to feel more like ecommerce.
- Build one funnel route at `/f/<slug>`.
- Add typed funnel and offer config with checkout disabled.
- Add basic attribution capture shape.
- Add a disabled/placeholder offer state that captures interest instead of charging.

Some work should wait:

- Real checkout redirects.
- RevenueCat product IDs or purchase link tokens.
- Supabase migrations in this repo. Shared migrations should live in the mobile/backend repo unless ownership changes.
- Purchase event tracking.
- Appsflyer purchase/install attribution claims.

## MVP Definition

The first production-ready version should prove one paid flow:

1. Visitor lands on one ecommerce-style funnel page.
2. Attribution is captured in a first-party session.
3. Visitor reaches one offer.
4. Visitor authenticates with Supabase.
5. Server verifies user and profile.
6. Server creates a checkout intent.
7. User is redirected to RevenueCat Web Purchase Link.
8. RevenueCat webhook reconciles the event to `web_checkout_intents`.
9. RevenueCat webhook updates the mobile-owned Supabase subscription state.
10. Success page sends the user to install/open Azora.
11. Mobile app sees the user as Pro and does not show another paywall.

## Current Assumptions

- Mobile repo owns Supabase migrations.
- Mobile repo owns RevenueCat setup and web products.
- Current Pro entitlement remains exactly `Azora  Pro`.
- Supabase `user.id` remains the RevenueCat App User ID.
- Anonymous checkout is not part of v1.
- Raw Stripe is not part of v1.
- First web checkout product has not been created yet.
- This repo should become the real `tryazora.app` web repo.
- Supabase profile rows are guaranteed for every user by the mobile/backend system.
- Google and Apple auth should be included in v1 alongside email.
- Combination offers are allowed, but v1 should model them as a simple bundle/offer rather than a cart.

## Hard Gates Before Production Checkout

- Checkout start must server-verify Supabase auth and verify `profiles.user_id` before redirecting.
- Mobile/backend webhook must reconcile RevenueCat web events to `web_checkout_intents`.
- Web checkout intents must store transaction IDs, price/currency, purchase timestamps, event IDs, and failure state.
- Webhook idempotency and event-order handling must be verified with sandbox events.
- Cancellation, expiration, renewal, billing issue, transfer, alias, and test events must have explicit behavior before paid traffic.
- Sandbox acceptance must prove: web purchase -> RevenueCat event -> Supabase subscription update -> mobile sees `Azora  Pro`.

## Open Questions

- Which backend endpoint or webhook repo will own RevenueCat webhook reconciliation for web purchases?
- What is the desired first paid traffic channel: Meta, influencer, organic, or retargeting?
- What is the first sellable combination: Pro annual plus bonus content, Pro lifetime plus founder perks, or multiple plan choices?
- If the offer includes bonuses, are those delivered inside the app, by email, or on the web?
- Does the current mobile RevenueCat webhook handle cancellation events without ending access early when there is no expiration timestamp?
