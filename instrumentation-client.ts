import posthog from "posthog-js";
import {
  attributionFromRecord,
  attributionFromSearchParams,
  hasAttribution
} from "@/lib/attribution";

// Keep in sync with the global declaration in app/components/meta-pixel-events.tsx.
declare global {
  interface Window {
    fbq?: (
      command: "track" | "init",
      eventNameOrPixelId: string,
      params?: Record<string, unknown>,
      options?: {
        eventCallback?: () => void;
        eventTimeout?: number;
        eventID?: string;
      },
    ) => void;
  }
}

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});

const attributionStorageKey = "azora_attribution";

// ── Meta / Facebook click params ────────────────────────────────────────────
// fbclid arrives as a URL param on paid clicks. _fbp is written by the Meta
// Pixel as a first-party cookie. Build _fbc from fbclid per Meta CAPI spec.

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax`;
}

function buildFbc(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`;
}

const searchParams = new URLSearchParams(window.location.search);
const attribution = attributionFromSearchParams(searchParams);

// Note: Meta `Lead` is fired server-side via CAPI from the auth callback
// (see lib/auth/post-login.ts), not from the browser — so it doesn't depend on
// landing on a renderable page and can't double-count.

// Fill Meta params from URL / cookies when they aren't already in attribution.
const fbclid = searchParams.get("fbclid");
const fbp = getCookie("_fbp");
const fbc = getCookie("_fbc") ?? (fbclid ? buildFbc(fbclid) : undefined);

if (fbclid && !attribution.fbclid) {
  attribution.fbclid = fbclid;
}
if (fbp && !attribution._fbp) {
  attribution._fbp = fbp;
}
if (fbc && !attribution._fbc) {
  attribution._fbc = fbc;
}
if (fbclid && fbc && !getCookie("_fbc")) {
  setCookie("_fbc", fbc, 60 * 60 * 24 * 90);
}

// ── Persist attribution server-side ──────────────────────────────────────────
// Wait 600ms for the Meta Pixel to fire and set _fbp, then POST the landing
// data to /api/session-init so fbclid/_fbp/_fbc survive OAuth + cookie expiry.
// (Named generically — not "track" — so ad/tracker blocklists don't drop it.)
setTimeout(() => {
  const payload: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of ["fbclid","utm_source","utm_medium","utm_campaign","utm_term","utm_content"]) {
    const v = params.get(key);
    if (v) payload[key] = v;
  }
  payload._fbp = getCookie("_fbp") ?? "";
  payload._fbc = getCookie("_fbc") ?? fbc ?? "";
  payload.landing_path = window.location.pathname;
  payload.initial_url = window.location.href;
  payload.referrer = document.referrer;

  if (Object.values(payload).some((v) => v && v !== "")) {
    fetch("/api/session-init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}, 600);

// ── Persist & register ──────────────────────────────────────────────────────

if (hasAttribution(attribution)) {
  const enrichedAttribution = {
    ...attribution,
    landing_page: window.location.href,
    ...(document.referrer ? { referrer: document.referrer } : {})
  };

  try {
    window.localStorage.setItem(
      attributionStorageKey,
      JSON.stringify(enrichedAttribution)
    );
  } catch {
    // Attribution still gets registered for this page even if storage is blocked.
  }

  posthog.register(enrichedAttribution);
  posthog.capture("influencer_link_landed", enrichedAttribution);
} else {
  try {
    const storedAttribution = attributionFromRecord(
      JSON.parse(window.localStorage.getItem(attributionStorageKey) || "{}")
    );

    if (hasAttribution(storedAttribution)) {
      posthog.register(storedAttribution);
    }
  } catch {
    window.localStorage.removeItem(attributionStorageKey);
  }
}
