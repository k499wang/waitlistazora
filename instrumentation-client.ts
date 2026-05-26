import posthog from "posthog-js";
import {
  attributionFromRecord,
  attributionFromSearchParams,
  hasAttribution
} from "@/lib/attribution";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});

const attributionStorageKey = "azora_attribution";
const attribution = attributionFromSearchParams(
  new URLSearchParams(window.location.search)
);

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
