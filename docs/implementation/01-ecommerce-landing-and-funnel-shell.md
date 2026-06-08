# Phase 1: Ecommerce Landing And Funnel Shell

## Goal

Make the web experience feel like an ecommerce product page with app elements, not a generic app download page.

This phase can start before checkout products exist. The CTA should capture interest or move through a funnel until real checkout is ready.

## Current State

The current app is a polished marketing/download page. It has:

- App-focused hero copy.
- App Store CTA.
- App screenshots/video.
- Science and FAQ sections.
- Basic PostHog/local attribution helpers.

The new direction should sell a specific outcome and offer. The app remains the product delivery mechanism, but the page should behave like a purchase page.

## Recommended Page Structure

### Homepage

Use the homepage as a broad commerce-oriented product page:

1. Product hero with offer framing.
2. App preview media.
3. What is included.
4. How it works.
5. Outcome/results section.
6. Science/credibility.
7. Plan comparison or disabled offer block.
8. FAQ focused on buying/access.
9. Final CTA.

### Funnel Route

Create a paid-traffic route:

```text
/f/[slug]
```

Use this for Meta/influencer campaigns instead of sending paid traffic to the generic homepage.

Recommended first slug:

```text
/f/breathwork-reset
```

or, if the offer is already known:

```text
/f/web-annual-discount
```

## Ecommerce Copy Direction

Move from app-store language:

```text
Breathe with intention. Recover with clarity.
Get the app.
```

Toward product/offer language:

```text
Azora Pro
Guided breathwork and camera-based recovery tracking.
Start your 7-day reset.
```

CTA examples before checkout exists:

```text
Join the early access list
Get launch offer
Reserve my discount
```

CTA examples after checkout exists:

```text
Start Azora Pro
Continue to secure checkout
Start my reset
```

## Visual Direction

Keep app elements, but make them support the purchase decision.

Use:

- phone video/screenshot as product media,
- feature callouts beside screenshots,
- included-benefits list,
- offer block with price/status,
- trust strip,
- FAQ about payment, access, cancellation, and app login.

Avoid:

- treating the App Store button as the primary conversion,
- a hero that only describes the brand,
- long generic wellness copy before showing the offer,
- too many plan choices in v1.

## Funnel Config Shell

Add a small data model before building checkout:

```ts
export type FunnelConfig = {
  slug: string;
  name: string;
  status: "draft" | "active" | "archived";
  audience: "meta_cold" | "retargeting" | "organic" | "creator";
  defaultOfferId: string;
  steps: FunnelStep[];
};
```

Start with only a few step kinds:

```ts
type FunnelStep =
  | { kind: "single_choice"; id: string; question: string; options: FunnelOption[] }
  | { kind: "interstitial"; id: string; variant: string }
  | { kind: "result"; id: string; resultType: string }
  | { kind: "offer"; id: string; offerId: string };
```

Do not make the config system too generic. The goal is one useful funnel, not a form builder.

## Suggested Web Repo Files

```text
app/page.tsx
app/f/[slug]/page.tsx
features/funnels/types.ts
features/funnels/data/breathworkReset.ts
features/funnels/lib/getFunnel.ts
features/funnels/components/FunnelRenderer.tsx
features/funnels/components/OfferBlock.tsx
features/funnels/components/StepRenderer.tsx
features/billing/offers.ts
```

The offer registry can exist before real checkout:

```ts
export const webOffers = {
  web_annual_discount: {
    id: "web_annual_discount",
    name: "Azora Pro Annual",
    active: false,
    checkoutEnabled: false,
    grantsEntitlement: "Azora  Pro",
  },
};
```

## CTA Behavior Before Checkout Exists

Until the mobile repo creates the RevenueCat product:

- primary CTA should collect email or waitlist intent,
- offer block should not claim a live price unless approved,
- checkout button should be disabled or routed to interest capture,
- tracking event should be `web_offer_interest_captured`, not `web_checkout_started`.

## Combination Offer Presentation

It is possible to sell a combination offer. The page should present it like one simple ecommerce bundle, not like a complex cart.

Good v1 examples:

```text
Azora Pro Reset Bundle
- 1 year of Azora Pro
- 7-day guided breathwork reset
- Camera-based recovery tracking
- Launch pricing
```

or:

```text
Founder Lifetime Bundle
- Lifetime Azora Pro access
- Founder pricing
- Bonus reset program
```

Avoid in v1:

- add-to-cart behavior,
- order bumps,
- multiple add-ons,
- separate checkout products in one transaction,
- unclear bonus delivery.

If there are multiple choices, make them mutually exclusive plan cards:

```text
Annual Pro
Lifetime Founder
```

The user should choose one path to checkout.

## Acceptance Criteria

- Homepage reads like a product/commerce page.
- One `/f/[slug]` route exists.
- One funnel config renders without checkout.
- One offer block exists with checkout disabled.
- App Store link is secondary on paid funnel pages.
- CTAs do not promise a checkout that does not exist.
- The code structure supports adding auth and checkout in later phases.
- Bundle/combination copy is clear about what is included and how access is delivered.

## Risks

- Building too much funnel engine before product/price is known.
- Hardcoding copy that conflicts with the actual RevenueCat offer.
- Keeping App Store CTA as the main conversion for paid traffic.
- Making the homepage do every job instead of using dedicated funnel routes.
