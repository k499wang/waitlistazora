import { createHash } from "crypto";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;
// Bump periodically — Meta sunsets each Graph API version ~2y after release.
// When a version is sunset the endpoint starts erroring; sendPurchaseEvent logs
// those failures (see below) so a sunset surfaces in logs instead of silently
// dropping conversions.
const API_VERSION = "v25.0";

function hashSha256(value: string): string {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

export interface MetaPurchaseParams {
  /** Supabase user.id — used as Meta external_id for strong matching. */
  externalId: string;
  /** User's email — hashed with SHA-256 before sending. */
  email?: string | null;
  /** Facebook Browser ID from _fbp cookie. */
  fbp?: string | null;
  /** Facebook Click ID from _fbc cookie (built from fbclid). */
  fbc?: string | null;
  /** Client IP address (from request headers). */
  clientIp?: string | null;
  /** Client User-Agent (from request headers). */
  clientUserAgent?: string | null;
  /** URL where the purchase event is detected. */
  eventSourceUrl?: string | null;
  /** Purchase value in currency units. */
  value?: number | null;
  /** ISO 4217 currency code (e.g. "USD"). */
  currency?: string | null;
  /** Stable event ID for Meta-side deduplication on retries. */
  eventId?: string | null;
}

interface MetaEventPayload {
  event_name: "Purchase";
  event_time: number;
  action_source: "website";
  event_source_url: string;
  user_data: Record<string, string>;
  custom_data?: Record<string, unknown>;
  event_id?: string;
}

interface MetaApiPayload {
  data: [MetaEventPayload];
  test_event_code?: string;
}

/**
 * Send a Purchase event to Meta Conversions API.
 *
 * Returns the response status. Never throws — callers should wrap in try/catch
 * and treat failures as best-effort.
 */
export async function sendPurchaseEvent(
  params: MetaPurchaseParams,
): Promise<{ ok: boolean; status: number }> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[meta-capi] META_PIXEL_ID or META_CAPI_ACCESS_TOKEN not set — skipping");
    }
    return { ok: false, status: 0 };
  }

  const userData: Record<string, string> = {};

  if (params.email) {
    userData.em = hashSha256(params.email);
  }

  userData.external_id = params.externalId;

  if (params.fbp) {
    userData.fbp = params.fbp;
  }
  if (params.fbc) {
    userData.fbc = params.fbc;
  }
  if (params.clientIp) {
    userData.client_ip_address = params.clientIp;
  }
  if (params.clientUserAgent) {
    userData.client_user_agent = params.clientUserAgent;
  }

  const customData: Record<string, unknown> = {};
  if (typeof params.value === "number") {
    customData.value = params.value;
  }
  if (params.currency) {
    customData.currency = params.currency;
  }

  const event: MetaEventPayload = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: params.eventSourceUrl ?? "",
    user_data: userData,
    custom_data: Object.keys(customData).length ? customData : undefined,
  };

  if (params.eventId) {
    event.event_id = params.eventId;
  }

  const body: MetaApiPayload = { data: [event] };
  if (TEST_EVENT_CODE) {
    body.test_event_code = TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    // Network-level failure (DNS, timeout, TLS). Log in all environments so a
    // CAPI outage is visible in server logs rather than silently dropped.
    console.error("[meta-capi] Purchase event request failed:", error);
    return { ok: false, status: 0 };
  }

  if (!res.ok) {
    // HTTP-level failure (auth, sunset API version, validation). Log in all
    // environments — a sunset/token revocation here would otherwise quietly
    // stop conversions from landing.
    const text = await res.text().catch(() => "");
    console.error(
      "[meta-capi] Purchase event rejected:",
      res.status,
      text.slice(0, 500),
    );
  }

  return { ok: res.ok, status: res.status };
}
