import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
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

  return NextResponse.redirect(new URL(next, url.origin));
}
