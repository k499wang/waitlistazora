import { type NextRequest, NextResponse } from "next/server";

import { FUNNEL_SESSION_COOKIE } from "@/lib/checkout/funnel-session";
import { getPostHogClient } from "@/lib/posthog-server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// OAuth / magic-link / email-confirmation callback. Supabase (PKCE) redirects
// here with a `code` that we exchange for a session, which the SSR client
// writes into cookies. Then we forward to the original `next` destination.
export const dynamic = "force-dynamic";

function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
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

  // Fire web_email_captured (Lead equivalent) via PostHog server-side.
  // Also attach user_id to the anonymous web_funnel_session so attribution
  // (fbclid, _fbp, _fbc) is linked to the authenticated user for CAPI.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user.id,
        event: "web_email_captured",
        properties: {
          email: user.email,
          provider: user.app_metadata?.provider ?? null,
          $set: { email: user.email },
        },
      });
      posthog.flush();

      // Attach user_id to the anonymous funnel session.
      const sessionId = request.cookies.get(FUNNEL_SESSION_COOKIE)?.value;
      if (sessionId) {
        const admin = createAdminSupabaseClient();
        await admin
          .from("web_funnel_sessions")
          .update({ user_id: user.id, status: "authenticated" })
          .eq("id", sessionId)
          .is("user_id", null);
      }
    }
  } catch {
    // Best-effort analytics — never block the auth redirect.
  }

  // Append &lead=1 so the browser-side Meta Pixel can fire Lead on the
  // destination page.
  const target = new URL(next, url.origin);
  target.searchParams.set("lead", "1");

  return NextResponse.redirect(target);
}
