# TODO — Meta Attribution & Launch Readiness

Priority roadmap for getting web checkout ready for paid Meta traffic.

**Key decision baked in:** the mobile/backend RevenueCat webhook **only updates
Supabase** — it does NOT call Meta. So the **web app** owns the Meta `Purchase`
event itself (fired server-side from `/checkout/status`, once, idempotently).

**Consequence:** upper-funnel events come from the browser Pixel, `Purchase`
comes from the server. Each event has a single source → **no event IDs and no
UTM passthrough are needed to launch Meta.**

## Status overview

- ✅ P0 #1 — Attribution capture on landing
- ✅ P0 #2 — Meta Pixel (browser, upper-funnel events)
- ✅ P0 #3 — Server-side Purchase → Meta CAPI
- ✅ P1 #4 — Profile verify + fail closed
- ✅ P1 #5 — Anonymous session on landing + persist funnel answers
- ✅ P2 #6 — UTM passthrough on RevenueCat URL
- ❌ P2 #7 — Apple OAuth

---

## Decisions

### CAPI event: `Purchase` (not `StartTrial`)

The annual plan includes a free trial, but the CAPI fires `Purchase` — not
`StartTrial`. Rationale:

- RevenueCat fires `INITIAL_PURCHASE` when the trial begins. A user who hands
  over payment info is a high-intent conversion regardless of whether they
  later cancel.
- Sending a single `Purchase` event (vs. `StartTrial` → `Purchase`) keeps
  deduplication simple and gives Meta a clean optimization target.
- The browser Pixel already fires `InitiateCheckout` before the redirect, so
  Meta sees the full funnel: ViewContent → Lead → InitiateCheckout → Purchase.
- If trial-to-paid conversion tracking becomes important later, it can be added
  as a separate event from the RevenueCat webhook (RENEWAL), not from
  `/checkout/status`.

---

## How it all works — end-to-end walkthrough

### Layer 1: Attribution capture (the foundation)

When a user clicks a Meta ad and lands on your site, three things happen in
parallel to capture their tracking data:

**Client-side (instrumentation-client.ts):**
1. Captures `fbclid` from URL, `_fbp` from Meta Pixel cookie, builds `_fbc`
   from `fbclid` (`fb.1.{timestamp}.{fbclid}`)
2. Registers all as PostHog super properties (auto-attached to every event)
3. Fires `influencer_link_landed` PostHog event
4. After 600ms (to let the Meta Pixel set `_fbp`), POSTs to
   `/api/track-landing` to persist attribution server-side

**Server-side (app/api/track-landing/route.ts):**
1. Creates a `web_funnel_sessions` row with `user_id = null` (anonymous),
   `anonymous_id = random UUID`, `landing_path`, `initial_url`, `referrer`,
   `user_agent`, `ip_country`
2. Creates a `web_funnel_attribution` row linked to that session with
   `fbclid`, `_fbp`, `_fbc`, `utm_source`, `utm_medium`, `utm_campaign`,
   `utm_term`, `utm_content`, `raw_params`
3. Sets an httpOnly cookie `wf_session_id` = the session ID so every subsequent
   request (including OAuth redirects) carries the same session

**Why this matters:** `fbclid` and `_fbc` are transient — they expire quickly.
By persisting them to the database at landing, they're available for the CAPI
Purchase event even if minutes pass before the purchase completes.

### Layer 2: Internal analytics (PostHog)

Every conversion point fires a PostHog event with all attribution params
auto-attached:

| PostHog event | Where | When |
|---|---|---|
| `influencer_link_landed` | `instrumentation-client.ts` | Page load with attribution params |
| `influencer_link_clicked` | `app/i/[cid]/route.ts` | Influencer redirect click (server) |
| `web_funnel_viewed` | `funnel-runner.tsx` | Funnel page first render |
| `web_email_captured` | `auth/callback/route.ts` | After successful OAuth (server) |
| `web_checkout_started` | `checkout/start/route.ts` | Before RevenueCat redirect (server) |
| `web_purchase_confirmed` | `checkout/status/route.ts` | First poll after purchase confirmed (server) |

The `$set: { email }` on server events identifies the user in PostHog, linking
anonymous events from before auth to the authenticated user.

### Layer 3: Meta ad optimization (Pixel + CAPI)

**Browser Pixel** (loaded in `app/layout.tsx` via `next/script`):

| Meta event | Where | When |
|---|---|---|
| `PageView` | `layout.tsx` (base code) | Every page load (automatic) |
| `ViewContent` | `funnel-runner.tsx` | Funnel first render |
| `Lead` | `funnel-runner.tsx` / `page.tsx` | After OAuth (via `?lead=1` query param + sessionStorage guard) |
| `InitiateCheckout` | `funnel-runner.tsx` | Form `onSubmit` before checkout redirect |

**Server CAPI** (fired from `checkout/status/route.ts` via `lib/meta-capi.ts`):

| Meta event | Where | When |
|---|---|---|
| `Purchase` | `checkout/status/route.ts` | First poll after webhook confirms purchase |

The CAPI Purchase payload includes:
- Hashed email (SHA-256)
- `external_id` = Supabase user ID (strongest match key)
- `fbp` + `fbc` from `web_funnel_attribution` (persisted at landing, not from
  cookies that may have expired)
- Client IP, user-agent, event source URL
- Value + currency from the checkout intent
- `event_id` for Meta-side deduplication
- `test_event_code` in development → shows in Test Events tab

**Idempotency:** The first poll that sees `purchased = true` fires both PostHog
and Meta CAPI, then stamps `purchase_event_sent_at` on the intent. Subsequent
polls see the stamp and skip. One purchase = one event each.

### Layer 4: Session continuity

The `wf_session_id` cookie ties everything together:

1. **Landing** (`/api/track-landing`) → creates anonymous session + attribution
2. **Auth** (`/auth/callback`) → attaches `user_id` to the session
3. **Checkout** (`/checkout/start`) → `getOrCreateFunnelSession` finds the
   session by cookie, claims it (updates user_id + status)
4. **Webhook** → reconciles purchase, sets `purchased_at`, `price_amount`,
   `currency` on the intent
5. **Status poll** (`/checkout/status`) → reads `fbp`/`fbc` from
   `web_funnel_attribution` via `intent.session_id` for CAPI

### Layer 5: Funnel answers

Quiz answers are persisted to `web_funnel_answers` on every selection via
`POST /api/funnel-answer`. Uses upsert on `(session_id, step_id)` so
re-selecting updates the same row. Answers survive the OAuth redirect because
they're keyed to the session, not React state.

### Layer 6: UTM passthrough

Before redirecting to RevenueCat, `/checkout/start` reads UTM params from
`web_funnel_attribution` and appends them to the purchase URL. RevenueCat
stores them on the transaction → revenue-by-campaign reporting.

---

## Files changed (this session)

| File | Change |
|---|---|
| `lib/attribution.ts` | Added `fbclid`, `_fbp`, `_fbc` to attribution keys |
| `instrumentation-client.ts` | Captures fbclid from URL, _fbp from cookie, builds _fbc; POSTs to `/api/track-landing` after 600ms |
| `app/layout.tsx` | Installed Meta Pixel base code via `next/script` + `<noscript>` fallback |
| `lib/meta-capi.ts` | **New** — SHA-256 hashing, CAPI payload builder, POSTs to Facebook Graph API |
| `app/api/track-landing/route.ts` | **New** — Creates anonymous session + attribution on landing |
| `app/api/funnel-answer/route.ts` | **New** — Persists quiz answers to `web_funnel_answers` |
| `app/f/[slug]/funnel-runner.tsx` | Fires `web_funnel_viewed` + Meta `ViewContent` + `Lead` + `InitiateCheckout`; persists answers to API |
| `app/auth/callback/route.ts` | Fires `web_email_captured`; attaches user_id to session; appends `?lead=1` to redirect |
| `app/checkout/start/route.ts` | Fires `web_checkout_started`; profile verify + fail closed; UTM passthrough to RevenueCat URL |
| `app/checkout/status/route.ts` | Fires `web_purchase_confirmed` + Meta CAPI `Purchase` with idempotency; reads fbp/fbc from DB |
| `app/page.tsx` | Fires Meta `Lead` on `?lead=1` detection |
| `lib/checkout/funnel-session.ts` | `getOrCreateFunnelSession` now claims anonymous sessions (user_id=null) |
| `middleware.ts` | No changes (session created client-side to avoid TTFB impact) |
| `.env.example` | Added `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, `META_TEST_EVENT_CODE` |
| `docs/webfunnelmigration.sql` | Added `purchase_event_sent_at` column migration |
| `docs/implementation/TODO-meta-attribution.md` | This document — updated with status, decisions, testing checklist |

---

## Env vars

```bash
NEXT_PUBLIC_META_PIXEL_ID=1495736694840775    # Browser + CAPI
META_CAPI_ACCESS_TOKEN=EAA...                  # Server-only
META_TEST_EVENT_CODE=TEST12345                 # Sandbox testing
```

---

## DB migration (already applied)

```sql
ALTER TABLE public.web_checkout_intents
  ADD COLUMN IF NOT EXISTS purchase_event_sent_at timestamptz;
```

The `web_funnel_sessions`, `web_funnel_attribution`, and `web_funnel_answers`
tables already existed from `docs/webfunnelmigration.sql` — no new migrations
needed for those.

---

## Testing checklist

### Pre-deploy
- [ ] All env vars set in `.env` (Pixel ID, CAPI token, test event code)
- [ ] DB migration applied (`purchase_event_sent_at` column exists)
- [ ] `npx tsc --noEmit` passes (no type errors)
- [ ] `git status` shows expected changed files

### Deploy
- [ ] Push to production / preview
- [ ] Verify the site loads without errors (check browser console)

### Meta Test Events
- [ ] Visit your site with `?fbclid=test123&utm_source=meta_test`
- [ ] Open Meta Events Manager → Test Events tab
- [ ] Verify `PageView` appears (proves Pixel is installed)
- [ ] Navigate to `/f/calm-reset` → verify `ViewContent` appears
- [ ] Complete OAuth (login) → verify `Lead` appears
- [ ] Click "Start free trial" → verify `InitiateCheckout` appears
- [ ] Complete a sandbox purchase → verify `Purchase` (CAPI) appears
- [ ] Poll `/checkout/status` twice → verify only ONE Purchase (idempotency)

### PostHog
- [ ] Open PostHog dashboard → Live Events
- [ ] Repeat the funnel flow → verify events appear:
  `influencer_link_landed` → `web_funnel_viewed` → `web_email_captured` →
  `web_checkout_started` → `web_purchase_confirmed`
- [ ] Check that `fbclid`, `_fbp`, `_fbc` appear as properties on events

### Database (Supabase)
- [ ] After landing: check `web_funnel_sessions` has a row with `user_id = null`
- [ ] After landing: check `web_funnel_attribution` has `fbclid` / `_fbp` / `_fbc`
- [ ] After quiz: check `web_funnel_answers` has rows keyed to the session
- [ ] After auth: check session's `user_id` is set
- [ ] After purchase: check `purchase_event_sent_at` is stamped (not null)

### UTM passthrough
- [ ] Start checkout with `?utm_source=meta_test&utm_campaign=test_campaign`
- [ ] Check the RevenueCat redirect URL has `utm_source=meta_test&utm_campaign=test_campaign`
- [ ] After purchase, check RevenueCat dashboard for campaign attribution

---

## Remaining (not implemented)

- [ ] **P2 #7: Apple OAuth** — Currently only Google + email auth
