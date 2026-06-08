# Phase 6: Funnel Scaling And Operations

## Goal

Scale from one working paid funnel to many funnels, offers, and experiments without breaking attribution, checkout, or entitlement contracts.

Do not start this phase until one paid funnel works end-to-end.

## Add More Funnels

Use funnel configs for:

- step order,
- audience,
- result mapping,
- offer selection,
- analytics metadata,
- campaign defaults.

Avoid putting large React trees or business logic inside configs. Complex steps should use typed components referenced by `step.kind`.

## Add More Offers

Potential offers:

```text
web_annual_discount
web_lifetime
web_founder_offer
```

Start all offers with `Azora  Pro` unless there is a real product boundary.

Create new entitlements only for meaningful product differences:

- coaching,
- courses,
- premium reports,
- paid challenges,
- consultations.

Do not create entitlements just to label funnel variants.

## Experiment Model

Keep experiments simple:

- offer copy variant,
- price display variant,
- hero variant,
- quiz result segment,
- CTA copy,
- plan comparison visibility.

Persist:

```text
experiment_key
variant_key
assigned_at
web_funnel_session_id
```

Do not change RevenueCat product identity just because copy changed.

## Reporting

Add dashboard SQL or analytics views for:

- funnel views,
- email captures,
- auth completions,
- checkout starts,
- purchases,
- install/open CTA clicks,
- mobile activation completion,
- revenue by funnel,
- revenue by campaign,
- purchase conversion by result segment.

Core join keys:

```text
web_funnel_session_id
checkout_intent_id
supabase_user_id
offer_id
revenuecat_transaction_id
```

## Operational Guardrails

Add safeguards before scaling traffic:

- checkout disabled flag per offer,
- funnel draft/active/archived status,
- production/sandbox checkout guard,
- missing env var startup checks,
- webhook idempotency,
- Meta event deduplication checks,
- fallback success state,
- support path for purchase-not-found.

## Compliance And Lifecycle Messaging

Only add email/SMS lifecycle flows after consent and compliance review.

Possible lifecycle messages:

- abandoned checkout,
- purchase success instructions,
- install reminder,
- activation reminder,
- first-session nudge.

Each message must respect:

- opt-in source,
- unsubscribe requirements,
- region rules,
- data retention policy.

## Acceptance Criteria

- New funnel can be added through config plus focused components.
- New offer can be added without changing checkout route logic.
- Product copy can be tested without changing RevenueCat identity.
- Dashboard can attribute revenue to funnel and campaign.
- Failed/pending purchases have an operational support path.
- Paid traffic can be paused by disabling a funnel or offer.

## Risks

- Scaling before one checkout path is reliable.
- Creating too many offers before analytics can compare them.
- Mixing experiment identity with billing identity.
- Losing attribution because new funnel pages skip session capture.
- Sending lifecycle messages without clear consent.

## Questions To Answer

- What is the minimum dashboard needed before spending on paid traffic?
- Who owns funnel copy changes?
- Who owns price changes?
- What is the release process for new RevenueCat offers?
- Should archived funnels remain accessible for old ad links or redirect to current offers?

