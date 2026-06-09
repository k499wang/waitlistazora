import { NextRequest, NextResponse } from "next/server";

import {
  FUNNEL_SESSION_COOKIE,
  FUNNEL_SESSION_COOKIE_MAX_AGE,
  getOrCreateAnonymousFunnelSession,
} from "@/lib/checkout/funnel-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// Client calls this once per landing to persist fbclid, _fbp, _fbc, utm_*
// server-side so they survive OAuth redirects and cookie expiration.
//
// The client waits ~600ms before calling so the Meta Pixel has time to set
// the _fbp cookie.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function maxLen(value: string | null, limit: number): string | null {
  if (!value) return null;
  return value.slice(0, limit);
}

function buildFbc(fbclid: string): string {
  return `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const admin = createAdminSupabaseClient();

    const landingPath = String(body.landing_path ?? "/");
    const initialUrl = String(body.initial_url ?? landingPath);
    const referrer = maxLen(String(body.referrer ?? ""), 2000) ?? null;
    const userAgent = maxLen(request.headers.get("user-agent"), 2000) ?? null;

    const fbclid = maxLen(String(body.fbclid ?? ""), 500) ?? null;
    const fbp = maxLen(String(body._fbp ?? ""), 500) ?? null;
    const fbc =
      maxLen(String(body._fbc ?? ""), 500) ??
      (fbclid ? buildFbc(fbclid) : null);

    const utmSource = maxLen(String(body.utm_source ?? ""), 500) ?? null;
    const utmMedium = maxLen(String(body.utm_medium ?? ""), 500) ?? null;
    const utmCampaign = maxLen(String(body.utm_campaign ?? ""), 500) ?? null;
    const utmTerm = maxLen(String(body.utm_term ?? ""), 500) ?? null;
    const utmContent = maxLen(String(body.utm_content ?? ""), 500) ?? null;

    // Skip if nothing meaningful to store.
    const hasAttribution = fbclid || fbp || fbc || utmSource || utmCampaign;
    if (!hasAttribution) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Derive funnel slug from the landing path.
    const funnelSlug = landingPath.startsWith("/f/")
      ? landingPath.split("/")[2] ?? "unknown"
      : "home";

    // Reuse the session named by the cookie when present (e.g. a fast first
    // answer already created it) so landing + answers share one session row.
    const { sessionId, created } = await getOrCreateAnonymousFunnelSession(admin, {
      cookieSessionId: request.cookies.get(FUNNEL_SESSION_COOKIE)?.value,
      funnelSlug,
      landingPath,
      initialUrl: maxLen(initialUrl, 2000)!,
      referrer,
      userAgent,
      ipCountry: request.headers.get("x-vercel-ip-country"),
    });

    // Upsert attribution (PK is session_id) so re-landing on an existing
    // session refreshes the row instead of erroring on the PK. Only non-null
    // values are written, so a later param-less landing can't clobber the
    // first-touch fbclid/fbc/utm that CAPI relies on.
    const attributionRow: Record<string, unknown> = {
      session_id: sessionId,
      raw_params: body,
    };
    if (utmSource) attributionRow.utm_source = utmSource;
    if (utmMedium) attributionRow.utm_medium = utmMedium;
    if (utmCampaign) attributionRow.utm_campaign = utmCampaign;
    if (utmTerm) attributionRow.utm_term = utmTerm;
    if (utmContent) attributionRow.utm_content = utmContent;
    if (fbclid) attributionRow.fbclid = fbclid;
    if (fbp) attributionRow.fbp = fbp;
    if (fbc) attributionRow.fbc = fbc;

    const { error: attrError } = await admin
      .from("web_funnel_attribution")
      .upsert(attributionRow, { onConflict: "session_id" });

    if (attrError) {
      throw attrError;
    }

    const response = NextResponse.json({ ok: true, session_id: sessionId });
    if (created) {
      response.cookies.set(FUNNEL_SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: FUNNEL_SESSION_COOKIE_MAX_AGE,
      });
    }

    return response;
  } catch (error) {
    console.error("[track-landing] failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
