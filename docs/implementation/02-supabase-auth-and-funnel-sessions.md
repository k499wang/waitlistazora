# Phase 2: Supabase Auth And Funnel Sessions

## Goal

Add Supabase auth and durable funnel sessions so a visitor can move from landing page to offer to checkout without losing identity or attribution.

This phase depends on Phase 0 decisions about Supabase ownership and profile creation.

## Dependencies

- Mobile/backend repo confirms Supabase project and migration ownership.
- Web repo gets `NEXT_PUBLIC_SUPABASE_URL`.
- Web repo gets `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Mobile/backend profile creation guarantee is documented.
- Web funnel session tables exist or are approved.

## Auth Recommendation

Use email, Google, and Apple in v1.

Email should remain available as the lowest-friction fallback. Google and Apple should be presented as primary one-tap options if they are configured in Supabase.

## Session Model

Use a first-party cookie for anonymous funnel identity:

```text
azora_web_session=<uuid>
```

The cookie should:

- be first-party,
- be httpOnly if it only needs server access,
- be secure in production,
- have a reasonable expiration window,
- survive auth redirects.

## Database Model

These tables should live in the mobile/backend-owned migration system unless ownership changes.

Minimum tables:

```text
web_funnel_sessions
web_funnel_attribution
web_funnel_answers
web_checkout_intents
```

Recommended additions beyond the original plan:

- explicit `first_touch` and `last_touch` attribution fields,
- status constraints,
- idempotency keys,
- indexes on `user_id`, `session_id`, `funnel_slug`, `created_at`,
- RLS policies,
- retention policy for raw attribution data.

## First-Touch And Last-Touch Rules

On the first meaningful landing:

- create `web_funnel_sessions`,
- create `web_funnel_attribution`,
- store first-touch params,
- store referrer, landing path, initial URL, user agent,
- store Meta click IDs if present.

On later visits:

- do not overwrite first-touch,
- update last-touch only if a meaningful campaign param is present,
- keep one canonical web funnel session ID through auth and checkout.

## Auth Flow

1. Visitor lands on `/f/[slug]`.
2. Server ensures anonymous funnel session cookie exists.
3. Visitor completes funnel steps.
4. Offer step asks for email.
5. Web starts Supabase OTP/magic link, Google OAuth, or Apple OAuth.
6. Auth callback restores the same funnel session from cookie.
7. Server reads authenticated Supabase user.
8. Server attaches `web_funnel_sessions.user_id`.
9. Server verifies `profiles.user_id` exists. Profile creation is expected to be guaranteed by the mobile/backend system.
10. User returns to the offer or checkout start.

## Suggested Web Repo Files

```text
shared/supabase/server.ts
shared/supabase/browser.ts
app/auth/callback/route.ts
features/attribution/server/sessionStore.ts
features/attribution/server/normalizeAttributionParams.ts
features/attribution/client/captureLandingAttribution.ts
features/funnels/lib/sessionCookie.ts
```

## Events

Internal events:

```text
web_funnel_viewed
web_funnel_step_completed
web_email_submitted
web_auth_started
web_auth_completed
web_profile_ensured
```

Do not send Meta `Lead` from both client and server until event IDs are implemented in Phase 4.

## Acceptance Criteria

- A visitor gets one stable web funnel session.
- Funnel state survives page refresh.
- Funnel state survives Supabase email auth callback.
- Authenticated user ID is attached to the funnel session.
- Profile existence is verified before checkout.
- First-touch attribution is immutable.
- Last-touch attribution updates only under documented rules.

## Risks

- Magic link opens in a different browser and loses the anonymous session.
- Profile creation guarantee regresses and checkout starts for a user without a profile.
- Auth callback drops the intended offer.
- Google/Apple OAuth callbacks do not restore the original funnel session.
- Client local storage and server database disagree on attribution.
- RLS prevents the checkout route from reading required session data.

## Questions To Answer

- Should magic links redirect directly back to the offer step or to a neutral auth callback page?
- Should web collect first name or only email?
- What is the cookie expiration window for anonymous funnel sessions?
- Are Google and Apple already configured in the Supabase project for the production web domain?
