import { NextRequest, NextResponse } from "next/server";

import {
  FUNNEL_SESSION_COOKIE,
  FUNNEL_SESSION_COOKIE_MAX_AGE,
  getOrCreateAnonymousFunnelSession,
} from "@/lib/checkout/funnel-session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// Persist a single funnel quiz answer to web_funnel_answers so answers survive
// the OAuth redirect and can personalize onboarding later.
//
// The client calls this on every answer selection (fire-and-forget). If the
// landing beacon hasn't created the session yet (fast first click) or never
// runs (organic / Pixel-blocked visitor), we create the anonymous session here
// so no answer is ever dropped for lack of a session cookie.
//
// Uses upsert on (session_id, step_id) so re-selecting an answer doesn't
// create duplicate rows.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Parse the Referer once into the bits we need to seed a session, tolerating
// a missing or malformed header (some privacy settings strip it).
// First IP in the x-forwarded-for chain is the originating client; Meta CAPI
// wants a single IP. Falls back to x-real-ip.
function clientIp(request: NextRequest): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}

function refererParts(referer: string | null): { path: string; slug: string } {
  if (!referer) return { path: "/", slug: "unknown" };
  try {
    const path = new URL(referer).pathname;
    const slug = path.startsWith("/f/")
      ? path.split("/")[2] ?? "unknown"
      : "home";
    return { path, slug };
  } catch {
    return { path: "/", slug: "unknown" };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const stepId = String(body.step_id ?? "");
    const answer = body.answer;

    if (!stepId || answer === undefined) {
      return NextResponse.json({ ok: false, reason: "missing fields" }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    const referer = request.headers.get("referer");
    const { path: landingPath, slug: refererSlug } = refererParts(referer);

    const { sessionId, created } = await getOrCreateAnonymousFunnelSession(admin, {
      cookieSessionId: request.cookies.get(FUNNEL_SESSION_COOKIE)?.value,
      funnelSlug:
        (typeof body.funnel_slug === "string" && body.funnel_slug) || refererSlug,
      landingPath,
      initialUrl: referer ?? "/",
      referrer: referer,
      userAgent: request.headers.get("user-agent"),
      ipCountry: request.headers.get("x-vercel-ip-country"),
      ipAddress: clientIp(request),
    });

    const { error } = await admin
      .from("web_funnel_answers")
      .upsert(
        { session_id: sessionId, step_id: stepId, answer },
        { onConflict: "session_id,step_id" },
      );

    if (error) {
      throw error;
    }

    const response = NextResponse.json({ ok: true });
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
    console.error("[funnel-answer] failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
