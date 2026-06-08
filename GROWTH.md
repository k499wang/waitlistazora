# Azora — Growth, SEO & Attribution Playbook

Living doc for web → App Store growth. Niche: iOS breathwork app with
camera-based (PPG) heart-rate tracking, science-backed positioning.

Core strategy: **rank for high-intent informational queries → satisfy them with
a free interactive tool → push to App Store (with attribution intact).**
The unfair advantage is that the core feature (breathing pacing + PPG) works in
a browser, so the site is a *tool*, not a brochure.

---

## Done (2026-06-02)

### Shared helpers
- `app/faq-data.ts` — single source of truth for FAQ content (homepage + JSON-LD).
- `lib/client-attribution.ts` — `getStoredAttribution()`, `appStoreUrl`, storage key.

### Technical SEO foundation
- `app/sitemap.ts` → `/sitemap.xml`.
- `app/robots.ts` → `/robots.txt` (disallows `/api/`, `/i/`; links sitemap).
- `app/layout.tsx` → JSON-LD: `SoftwareApplication` + `FAQPage`.

### First tool page (reusable template)
- `app/box-breathing/page.tsx` — server component, own SEO metadata,
  `FAQPage` + `HowTo` JSON-LD, explainer, mini-FAQ, App Store CTA.
- `app/box-breathing/BreathPacer.tsx` — client animated 4-4-4-4 pacer,
  PostHog `breath_tool_started` / `breath_tool_stopped` events.
- Homepage internal link to `/box-breathing`.

**Outstanding verification:** run `npm run build`; visit `/box-breathing`,
`/sitemap.xml`, `/robots.txt`; validate JSON-LD in Google Rich Results Test.

---

## Roadmap (ROI-ranked)

### Tier 1 — Highest ROI
1. **Clone the breathing-tool template** into a programmatic set (each ~15 min):
   - `/4-7-8-breathing`, `/coherent-breathing`, `/wim-hof-breathing`
   - Use-case pages: `/breathing-for-anxiety`, `/breathing-for-sleep`,
     `/breathing-for-panic-attacks`, `/breathing-before-bed`
   - Each: working pacer (vary the counts) + science + App Store CTA.
   - Add each new route to `app/sitemap.ts`.
2. **Free browser heart-rate tool** (`/measure-heart-rate`) — camera PPG in the
   browser. Most shareable/link-baity asset; hardest for competitors to copy.
   Converts curiosity → install (for history/tracking).
3. **Quiz funnel** ("Find your breathing protocol") → email via existing
   Supabase `app/api/waitlist/route.ts` → personalized result → App Store CTA.
   Reuse attribution. Quizzes convert 30–50% to email in wellness.

### Tier 2 — Distribution / content
4. Editorial cluster linking into the tools ("HRV explained", "box vs 4-7-8")
   for internal-link equity.
5. Shareable result cards (downloadable image) from quiz/HR tool → social loop
   feeding TikTok/IG (the channels that actually drive installs).

### Tier 3 — Polish
6. Per-tool OG images (currently OG = app icon only).
7. Submit sitemap in Google Search Console; monitor Core Web Vitals.

---

## Attribution & Paid Ads

Current setup: PostHog (web), Vercel Analytics, custom UTM/cid attribution
(`lib/attribution.ts`, `/i/[cid]` redirect), **AppsFlyer + Meta attribution**.

The hard problem for a web-driven app: the **web → App Store → install** hop
loses attribution unless deliberately bridged. Priorities:

### 1. Bridge web clicks to installs with AppsFlyer OneLink (HIGH)
- Replace the raw App Store URL (`lib/client-attribution.ts` `appStoreUrl`)
  with an **AppsFlyer OneLink** that carries `utm_*` / `cid` / `platform` from
  our existing attribution into the install event (deferred deep linking).
- Result: a website visitor who came from a Meta/Google/TikTok ad → clicks
  "Download" → install is attributed back to that exact campaign in AppsFlyer.
- Keep firing the PostHog `app_store_clicked` event in parallel for web funnel.

### 2. Meta (running now)
- **Meta Pixel** on the website + **Conversions API (CAPI)** to send server-side
  web events (e.g. `app_store_clicked`, quiz email capture) — improves match
  quality and survives iOS/browser tracking limits.
- For installs: ensure **SKAdNetwork** + **Aggregated Event Measurement (AEM)**
  configured via AppsFlyer's Meta integration; rank the install/purchase
  conversion events in Events Manager.
- Feed AppsFlyer cost/ROAS data back so Meta optimizes for installs that
  actually convert to sessions/subscriptions, not just installs.

### 3. Apple Search Ads (NOT YET — high ROI for this niche)
- Capture branded ("azora"), competitor ("calm breathwork", "othership"),
  and category ("breathing app", "box breathing app") keywords.
- Lowest-funnel, highest-intent install source; usually best iOS CPI.
- Integrates cleanly with AppsFlyer for unified ROAS.

### 4. Google (planned)
- **Google Ads conversion tracking** on the website (tag the App Store click and
  any email capture as conversions).
- **App campaigns (UAC)** for installs; **Search ads** to the new tool pages for
  informational queries ("box breathing", "how to measure heart rate phone").
- Submit `sitemap.xml` to **Google Search Console** (free, do this regardless of
  ad spend) — it's how the SEO work above gets indexed and measured.

### 5. TikTok (planned)
- **TikTok Pixel + Events API** on the website; **Spark Ads** off organic
  breathwork content.
- Route installs through AppsFlyer's TikTok SKAN integration.
- The quiz + shareable result cards are tailor-made for TikTok creative.

### Cross-cutting
- **ATT / consent**: iOS App Tracking Transparency prompt and a web consent
  banner gate what Pixel/CAPI can use — wire these before scaling spend.
- **One conversion taxonomy**: keep event names consistent across PostHog,
  Meta, Google, TikTok, AppsFlyer (`app_store_clicked`, `email_captured`,
  `breath_tool_started`, …) so dashboards line up.
- **UTM discipline**: every ad URL should carry `utm_source/medium/campaign`
  (+ `cid`) so the existing `attributionFromSearchParams` captures it and
  OneLink forwards it to the install.
