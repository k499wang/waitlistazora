# Phase 5: Success, Install, And Mobile Activation

## Goal

After purchase, guide the user into the mobile app without showing another paywall.

This phase spans both repos. The web repo owns success UI and install/open links. The mobile repo owns deep-link handling, auth restoration, entitlement refresh, and paywall suppression.

## Web Success Page

Create:

```text
app/checkout/success/page.tsx
```

Responsibilities:

- show purchase confirmation,
- show account email if available,
- show entitlement status if confirmed,
- show pending state if webhook has not finished,
- show install/open app CTA,
- show QR code on desktop,
- provide "I already have the app" CTA,
- avoid any second paywall language.

## Success States

Recommended states:

```text
pending
confirmed
needs_app_install
open_app
support_needed
```

Suggested behavior:

- `pending`: "We are confirming your purchase."
- `confirmed`: "Azora Pro is active on this account."
- `needs_app_install`: show OneLink/App Store CTA.
- `open_app`: show deep link / OneLink CTA.
- `support_needed`: show email/account support path.

## Install/Open Links

For paid funnel success pages, use Appsflyer OneLink when available.

Mobile web:

```text
Open / Download Azora
```

Desktop:

```text
QR code generated from the same OneLink
```

Fallback:

```text
Raw App Store URL only if OneLink generation fails or Appsflyer is not configured yet.
```

## Mobile Activation Contract

Mobile should eventually handle:

```text
deep_link_value=web_purchase_success
```

or:

```text
azora://activation?source=web_purchase&session_id=<id>
```

The app should:

1. Receive direct/deferred deep link data.
2. Ask the user to sign in with the same email/provider if needed.
3. Set RevenueCat App User ID to Supabase `user.id`.
4. Refresh RevenueCat customer info.
5. Refresh Supabase entitlement view.
6. Skip paywall when entitlement is active.
7. Show a syncing state instead of a paywall while entitlement is pending.

## Web-To-Mobile Personalization

Later, the mobile app can use web funnel answers:

- onboarding shortcuts,
- recommended first breathing protocol,
- recovery goal setup,
- result-segment-specific home screen copy.

Do not block v1 on personalization. Activation and entitlement correctness matter more.

## Acceptance Criteria

- Success page works when webhook confirmation is fast.
- Success page works when webhook confirmation is delayed.
- Desktop users get a scannable QR code.
- Mobile users get an open/download CTA.
- Paid users are not sent to a generic raw App Store link if OneLink is configured.
- Mobile app can open from the success path.
- Mobile app refreshes entitlement after login/open.
- Mobile app does not show another paywall to a confirmed web-paid user.

## Risks

- User buys on desktop but installs on phone with a different email.
- Web success page claims Pro is active before webhook confirms it.
- App opens before RevenueCat/Supabase entitlement has synced.
- Deep link routes user to generic onboarding instead of activation.
- Appsflyer deferred deep link data arrives after initial navigation.

## Questions To Answer

- Will mobile support universal links, custom URL scheme, Appsflyer deep link only, or all three?
- What should happen if the user bought with email OTP but signs into mobile with Apple?
- What support path should be shown when entitlement is not visible after purchase?
- How long should the success page poll for entitlement before showing support guidance?

