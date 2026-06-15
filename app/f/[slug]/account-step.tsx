"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

import { LOGIN_NEXT_COOKIE } from "@/lib/checkout/funnel-session";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { FunnelStep } from "@/lib/funnels/types";

import { INTENTIONAL_DEPARTURE_KEY } from "./funnel-constants";

// Query param marking a return from the Google OAuth round-trip. The runner
// sees it, strips it, and jumps straight back to the account step so the
// funnel resumes where the user left off instead of restarting at question 1.
export const ACCOUNT_DONE_PARAM = "account_done";

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
type OAuthProvider = "apple" | "google";

// Inline account creation, styled as a funnel step. Uses OAuth;
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
  const [pending, setPending] = useState<null | OAuthProvider>(null);

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

  async function signInWithProvider(provider: OAuthProvider) {
    const providerName = provider === "apple" ? "Apple" : "Google";
    setError(null);
    setPending(provider);
    posthog.capture("web_funnel_account_submitted", {
      funnel_slug: slug,
      method: provider,
    });
    try {
      const supabase = createBrowserSupabaseClient();
      // Same cookie handshake as the login page: Supabase doesn't reliably
      // carry a nested `next` param through the OAuth round-trip, so
      // /auth/callback reads it back from this cookie.
      document.cookie = `${LOGIN_NEXT_COOKIE}=${encodeURIComponent(returnUrl())}; path=/; max-age=600; samesite=lax`;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });
      if (oauthError) throw oauthError;
      if (!data.url) {
        throw new Error(`${providerName} sign-in did not return a redirect URL.`);
      }
      posthog.capture("web_auth_redirect_started", {
        funnel_slug: slug,
        method: provider,
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
      setError(err instanceof Error ? err.message : `${providerName} sign-in failed.`);
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
          Linked to your email. It&apos;ll be waiting in the app too.
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
          onClick={() => signInWithProvider("apple")}
          disabled={pending !== null}
        >
          <AppleIcon />
          {pending === "apple" ? "Redirecting…" : "Continue with Apple"}
        </button>

        <button
          type="button"
          className="authOauthBtn"
          onClick={() => signInWithProvider("google")}
          disabled={pending !== null}
        >
          <GoogleIcon />
          {pending === "google" ? "Redirecting…" : "Continue with Google"}
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

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.39 12.66c-.02-2.02 1.66-2.99 1.74-3.04-.95-1.38-2.42-1.57-2.93-1.59-1.23-.13-2.43.73-3.05.73-.64 0-1.61-.71-2.65-.69-1.34.02-2.6.8-3.29 2.02-1.42 2.46-.36 6.07 1 8.06.68.97 1.47 2.06 2.5 2.02 1.01-.04 1.39-.65 2.61-.65 1.21 0 1.56.65 2.62.63 1.09-.02 1.78-.98 2.43-1.96.79-1.11 1.1-2.21 1.11-2.27-.03-.01-2.07-.8-2.09-3.26zM14.39 6.73c.55-.69.93-1.62.82-2.56-.8.04-1.8.55-2.38 1.22-.52.6-.99 1.57-.86 2.47.9.07 1.85-.46 2.42-1.13z" />
    </svg>
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
