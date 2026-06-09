# TODO — Meta Attribution & Launch Readiness

Priority roadmap for getting web checkout ready for paid Meta traffic.

**Key decision baked in:** the mobile/backend RevenueCat webhook **only updates
Supabase** — it does NOT call Meta. So the **web app** owns the Meta `Purchase`
event itself (fired server-side from `/checkout/status`, once, idempotently).

**Consequence:** upper-funnel events come from the browser Pixel, `Purchase`
comes from the server. Each event has a single source → **no event IDs and no
UTM passthrough are needed to launch Meta.**

---

## P0 — The only work that actually moves Meta

- [ ] **1. Attribution capture on landing** (the foundation for everything Meta)
  - [ ] Capture on first hit of `/` and `/f/[slug]`: `fbclid`, `_fbp`, `_fbc`
        (build `_fbc` from `fbclid`), `utm_*`, referrer, landing path, initial
        URL, user-agent, IP-country.
  - [ ] Persist to a first-party anonymous cookie (`azora_web_session`,
        httpOnly, secure, ~90d) + a `web_funnel_sessions` row (user_id null) and
        a `web_funnel_attribution` row.
  - [ ] First-touch values are **immutable**; last-touch updates only on a new
        meaningful campaign param.
  - [ ] Attach `user_id` to the same session at `/auth/callback` (move the
        attach earlier than `/checkout/start`).
  - Files: `lib/attribution/{normalize,sessionStore}.ts`, a capture
    route/server action, `middleware.ts`, `app/auth/callback/route.ts`.
  - Done when: `/f/x?fbclid=…` persists session + attribution BEFORE login,
    values survive refresh, same session id after Google OAuth.

- [ ] **2. Meta Pixel — browser, upper-funnel only**
  - [ ] Install Pixel in `app/layout.tsx`.
  - [ ] Fire `PageView`, `ViewContent` (funnel start), `Lead` (after auth),
        `InitiateCheckout` (right before the `/checkout/start` redirect).
  - [ ] No event IDs (single source per event).

- [ ] **3. Server-side `Purchase` → Meta CAPI** ⭐ biggest single lever
  - [ ] In `/checkout/status`, when it first sees `intent.status === "purchased"`
        / `isPro`, send the CAPI `Purchase`.
  - [ ] Stamp the intent (`meta_purchase_sent_at`) so repeat polls never
        double-send.
  - [ ] Payload: `Purchase`, hashed email, `external_id` = Supabase user id,
        `fbp`, `fbc`, client IP, user-agent, event source URL, value + currency,
        `action_source: website`.
  - [ ] Env: `META_PIXEL_ID`, `META_DATASET_ID`, `META_CAPI_ACCESS_TOKEN`,
        `META_TEST_EVENT_CODE`.
  - Done when: one sandbox purchase = exactly one Purchase in Meta Test Events
    with strong match quality; polling twice does not duplicate.

## P1 — Correctness before paid traffic

- [ ] **4. Profile verify + fail closed**
  - `checkout/start` currently **creates** the profile (`upsert`). Per the
    Phase 0 contract it should **select and fail closed** with a recoverable
    error if missing — not create it.

- [ ] **5. Anonymous session on landing + persist funnel answers**
  - [ ] Create the session at landing (ties to #1), not at checkout.
  - [ ] Persist quiz answers to `web_funnel_answers` as the user advances so
        they survive the auth redirect and can personalize onboarding later.

## P2 — Cheap / optional

- [ ] **6. UTM passthrough** on the RevenueCat URL — revenue-by-campaign
      reporting only (~10 min). Not needed by Meta.
- [ ] **7. Apple OAuth** — auth coverage (currently Google + email only).

## Explicitly deferred

- `checkout_event_id` / `purchase_event_id` — only needed if you later mirror
  browser events into CAPI. Skip for now.

---

**Suggested build order:** 1 → 3 → 2 → 4 → 5 → (6, 7).
The 1→3 spine is ~80% of the Meta value; 2 is quick and can slot in anywhere.
