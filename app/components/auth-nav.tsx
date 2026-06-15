"use client";

import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Auth-aware navigation island. Resolves the current Supabase user in the
// browser and renders either a "Sign in" link or a sign-out button (POSTs to
// /auth/signout so the server clears the cookies).
//
// `next` is the path to return to after signing in (defaults to the current
// page). Used on the marketing nav, the pricing page, and funnel pages.
export function AuthNav({ next }: { next?: string }) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setEmail(data.user?.email ?? null);
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Avoid a flash of the wrong state before the session resolves.
  if (!ready) {
    return <span className="authNavPlaceholder" aria-hidden />;
  }

  if (!email) {
    const href =
      next && next.startsWith("/")
        ? `/login?next=${encodeURIComponent(next)}`
        : "/login";
    return (
      <a className="authNavSignin" href={href}>
        Sign in
      </a>
    );
  }

  return (
    <div className="authNavChip">
      <form action="/auth/signout" method="post">
        <button type="submit" className="authNavSignout">
          Sign out
        </button>
      </form>
    </div>
  );
}
