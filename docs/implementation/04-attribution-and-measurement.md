# Phase 4: Attribution And Measurement

## Goal

Add reliable measurement after the purchase path works.

Attribution should not be the first implementation task. It depends on stable funnel sessions, auth, checkout intents, and webhook reconciliation.

## Systems

This phase serves three different systems:

1. Meta optimization.
2. Appsflyer web-to-app handoff.
3. Internal RevenueCat/Supabase revenue analysis.

Keep these concerns separate in code.

## Recommended Modules

```text
features/attribution/
  client/
    metaPixel.ts
    appsFlyerSmartScript.ts
    captureLandingAttribution.ts
  server/
    metaConversionsApi.ts
    attributionSessionStore.ts
    normalizeAttributionParams.ts
  eventNames.ts
  types.ts
```

## Internal Event Names

Use internal product event names:

```text
web_funnel_viewed
web_funnel_step_completed
web_funnel_result_viewed
web_email_captured
web_checkout_started
web_purchase_confirmed
web_purchase_success_page_viewed
web_app_install_cta_clicked
web_app_open_cta_clicked
```

Map to vendor events explicitly:

```text
web_funnel_viewed -> Meta ViewContent
web_email_captured -> Meta Lead
web_checkout_started -> Meta InitiateCheckout
web_purchase_confirmed -> Meta Purchase
```

Do not let Meta/Appsflyer names leak throughout product code.

## Meta Pixel And CAPI

Start with:

- browser Pixel for page/funnel events,
- server CAPI for Lead, InitiateCheckout, and Purchase,
- stable event IDs stored before events are fired.

Deduplication rule:

```text
Same Meta event_name + same event_id = one conversion
```

Event ownership:

```text
PageView
- browser Pixel: yes
- server CAPI: optional

ViewContent
- browser Pixel: yes
- server CAPI: yes if event_id is stored

Lead
- browser Pixel: yes
- server CAPI: yes
- event_id: required

InitiateCheckout
- browser Pixel: yes if possible before redirect
- server CAPI: yes from checkout start route
- event_id: required

Purchase
- browser Pixel: only if using stored purchase_event_id
- server CAPI: yes from RevenueCat webhook reconciliation
- event_id: required
```

## Purchase Tracking Rule

Do not treat landing on the success page as purchase truth.

The best source for purchase truth is RevenueCat webhook confirmation. The success page can show a pending state until entitlement is visible or can fire only diagnostic/success-page-view events.

## Match Data

For Meta CAPI, include only what consent and policy allow:

- hashed email after auth,
- hashed Supabase user ID as external ID,
- user agent,
- client IP where available,
- `fbp`,
- `fbc`,
- event source URL,
- event time,
- event ID,
- offer ID,
- funnel slug,
- value/currency for confirmed purchase.

Do not send raw email or raw PII to ad platforms.

## Appsflyer OneLink

Add OneLink after the funnel and checkout work.

Every install/open CTA on paid funnel pages and success pages should use OneLink, not a raw App Store URL.

Recommended mapping:

```text
utm_source -> pid
utm_campaign -> c
utm_medium -> af_channel
funnel_slug -> af_sub1
offer_id -> af_sub2
web_funnel_session_id -> af_sub3
result_segment -> af_sub4
checkout_intent_id -> af_sub5
```

Use raw App Store links only on generic pages where attribution is not needed, or as fallback when OneLink generation fails.

## Consent And Privacy

Before launching paid traffic, define:

- cookie consent behavior,
- whether Meta Pixel loads before consent,
- whether CAPI sends events before consent,
- retention period for raw URL params and click IDs,
- what data is stored server-side for anonymous users,
- how users can request deletion.

This is not optional if paid advertising attribution is part of the plan.

## Acceptance Criteria

- UTM, `fbclid`, `_fbp`, and `_fbc` are persisted.
- Each conversion event has one stable event ID.
- Browser Pixel and CAPI deduplicate correctly.
- Meta Test Events show Lead and InitiateCheckout.
- Purchase is sent only after RevenueCat confirmation.
- Purchase value/currency match RevenueCat.
- OneLink URLs include campaign and session params.
- Desktop QR code resolves to the generated OneLink.
- Raw App Store links are not used for paid funnel success CTAs.

## Risks

- Double-counted purchases from success page and webhook.
- Event IDs generated separately on client and server.
- Appsflyer treated as purchase truth before mobile install exists.
- Consent requirements added after implementation and forcing rework.
- Attribution stored only in local storage and lost during OAuth/checkout.

## Questions To Answer

- Will the site use a consent banner before Meta Pixel loads?
- What regions are being targeted first?
- Is PostHog still the internal analytics tool, or should this move elsewhere?
- Should Appsflyer be used on the homepage too, or only paid funnel/success pages?

