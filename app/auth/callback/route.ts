import { type NextRequest, NextResponse } from "next/server";

import { applyPostLogin } from "@/lib/auth/post-login";
import {
  FUNNEL_SESSION_COOKIE,
  LOGIN_NEXT_COOKIE,
} from "@/lib/checkout/funnel-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// OAuth / magic-link / email-confirmation callback. Supabase (PKCE) redirects
// here with a `code` that we exchange for a session, which the SSR client
// writes into cookies. Then we forward to the original `next` destination.
export const dynamic = "force-dynamic";

function safeNext(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

// Prefer the `next` stashed in a cookie before the OAuth redirect — Supabase
// doesn't reliably preserve a nested `next` query param through the provider
// round-trip. Fall back to the query param (magic-link / email confirmation).
function resolveNext(request: NextRequest, url: URL): string {
  const cookieNext = request.cookies.get(LOGIN_NEXT_COOKIE)?.value;
  if (cookieNext) {
    try {
      return safeNext(decodeURIComponent(cookieNext));
    } catch {
      // fall through to the query param
    }
  }
  return safeNext(url.searchParams.get("next"));
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = resolveNext(request, url);
  const errorDescription = url.searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription)}`, url.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Missing+auth+code", url.origin),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  // Run the shared post-login side effects: web_email_captured, attach user_id
  // to the funnel session, and fire the Meta CAPI Lead server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await applyPostLogin(user, request.cookies.get(FUNNEL_SESSION_COOKIE)?.value, {
      eventSourceUrl: `${url.origin}/auth/callback`,
      clientIp: request.headers.get("x-forwarded-for"),
      clientUserAgent: request.headers.get("user-agent"),
    });
  }

  // Lead is fired server-side in applyPostLogin (CAPI), so just forward to the
  // intended destination — no ?lead=1 / interstitial needed.
  const response = NextResponse.redirect(new URL(next, url.origin));
  // Clear the one-shot next cookie now that we've consumed it.
  response.cookies.set(LOGIN_NEXT_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
