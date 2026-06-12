"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

import { LOGIN_NEXT_COOKIE } from "@/lib/checkout/funnel-session";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { FunnelStep } from "@/lib/funnels/types";

// Query param marking a return from the Google OAuth round-trip. The runner
// sees it, strips it, and jumps straight back to the account step so the
// funnel resumes where the user left off instead of restarting at question 1.
export const ACCOUNT_DONE_PARAM = "account_done";
const INTENTIONAL_DEPARTURE_KEY = "azora_funnel_intentional_departure";

type SessionState = { loaded: boolean; email: string | null };

/** Client-side auth state, kept live via onAuthStateChange. */
export function useSupabaseSession(): SessionState {
  const [state, setState] = useState<SessionState>({ loaded: false, email: null });

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setState({ loaded: true, email: data.session?.user.email ?? null });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ loaded: true, email: session?.user.email ?? null });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

type AccountStepConfig = Extract<FunnelStep, { kind: "account" }>;

// Inline account creation, styled as a funnel step. Uses Google OAuth only;
// the page leaves for the provider round-trip and lands back with
// ?account_done=1, so the post-auth experience is the signed-in success state
// below — "plan saved" — with a Continue button to the offer.
export function FunnelAccountStep({
  step,
  slug,
  onContinue,
}: {
  step: AccountStepConfig;
  slug: string;
  onContinue: () => void;
}) {
  const { loaded, email: sessionEmail } = useSupabaseSession();

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<null | "google">(null);

  const viewFired = useRef(false);
  useEffect(() => {
    if (!loaded || viewFired.current) return;
    viewFired.current = true;
    posthog.capture("web_funnel_account_viewed", {
      funnel_slug: slug,
      already_signed_in: sessionEmail !== null,
    });
  }, [loaded, sessionEmail, slug]);

  // Where auth should land afterwards: this funnel, resumed at this step.
  function returnUrl() {
    return `/f/${slug}?${ACCOUNT_DONE_PARAM}=1`;
  }

  async function signInWithGoogle() {
    setError(null);
    setPending("google");
    posthog.capture("web_funnel_account_submitted", {
      funnel_slug: slug,
      method: "google",
    });
    try {
      const supabase = createBrowserSupabaseClient();
      // Same cookie handshake as the login page: Supabase doesn't reliably
      // carry a nested `next` param through the Google round-trip, so
      // /auth/callback reads it back from this cookie.
      document.cookie = `${LOGIN_NEXT_COOKIE}=${encodeURIComponent(returnUrl())}; path=/; max-age=600; samesite=lax`;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });
      if (oauthError) throw oauthError;
      if (!data.url) {
        throw new Error("Google sign-in did not return a redirect URL.");
      }
      posthog.capture("web_auth_redirect_started", {
        funnel_slug: slug,
        method: "google",
      });
      try {
        window.sessionStorage.setItem(INTENTIONAL_DEPARTURE_KEY, "1");
      } catch {
        // Best-effort guard against counting OAuth as funnel abandonment.
      }
      window.location.assign(data.url);
    } catch (err) {
      try {
        window.sessionStorage.removeItem(INTENTIONAL_DEPARTURE_KEY);
      } catch {
        // Storage may be unavailable in locked-down browsers.
      }
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setPending(null);
    }
  }

  // Avoid flashing the signup form at someone who's already signed in.
  if (!loaded) {
    return (
      <div className="funnelAccount">
        <div className="funnelSpinner" aria-hidden />
      </div>
    );
  }

  if (sessionEmail) {
    return (
      <div className="funnelAccount">
        <div className="funnelResultBadge" aria-hidden>
          ✓
        </div>
        <h1 className="funnelQuestion">Your plan is saved</h1>
        <p className="funnelSubtext">
          Linked to <strong>{sessionEmail}</strong>. It&apos;ll be waiting in the
          app too.
        </p>
        <button type="button" className="funnelPrimaryBtn" onClick={onContinue}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="funnelAccount">
      <h1 className="funnelQuestion">{step.title}</h1>
      <p className="funnelSubtext">{step.body}</p>

      <ul className="funnelAccountBenefits">
        {step.benefits.map((benefit) => (
          <li key={benefit}>
            <svg
              className="funnelAccountBenefitIcon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {benefit}
          </li>
        ))}
      </ul>

      <div className="funnelAccountCard">
        <button
          type="button"
          className="authOauthBtn"
          onClick={signInWithGoogle}
          disabled={pending !== null}
        >
          <GoogleIcon />
          {pending === "google" ? "Redirecting…" : "Save my plan, it's free"}
        </button>

        {error ? (
          <p className="authMessage authError" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <p className="funnelAccountFinePrint">
        Free to create · No spam, just your plan on web and iOS
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
