import { type NextRequest, NextResponse } from "next/server";

import { applyPostLogin } from "@/lib/auth/post-login";
import { FUNNEL_SESSION_COOKIE } from "@/lib/checkout/funnel-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Post-login finalizer for auth methods that DON'T go through /auth/callback's
// PKCE code exchange — specifically email+password sign-in, where the session
// is already written to cookies by signInWithPassword. Routing those logins
// here (instead of jumping straight to `next`) guarantees every sign-in runs
// the same side effects as OAuth: web_email_captured, session claim, and the
// server-side Meta CAPI Lead.
export const dynamic = "force-dynamic";

function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session yet (e.g. user opened this URL directly) — send to login.
  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, url.origin),
    );
  }

  await applyPostLogin(user, request.cookies.get(FUNNEL_SESSION_COOKIE)?.value, {
    eventSourceUrl: `${url.origin}/auth/finalize`,
    clientIp: request.headers.get("x-forwarded-for"),
    clientUserAgent: request.headers.get("user-agent"),
    fbpCookie: request.cookies.get("_fbp")?.value ?? null,
    fbcCookie: request.cookies.get("_fbc")?.value ?? null,
  });

  // Lead is fired server-side in applyPostLogin (CAPI), so just forward to the
  // intended destination — no ?lead=1 / interstitial needed.
  return NextResponse.redirect(new URL(next, url.origin));
}
