"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

import { LOGIN_NEXT_COOKIE } from "@/lib/checkout/funnel-session";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { FunnelStep } from "@/lib/funnels/types";

// Query param marking a return from the auth round-trip (Google OAuth or the
// /auth/finalize hop after a password signup). The runner sees it, strips it,
// and jumps straight back to the account step so the funnel resumes where the
// user left off instead of restarting at question 1.
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

// Inline account creation, styled as a funnel step. Both auth methods leave the
// page (Google → provider → /auth/callback; password → /auth/finalize) and land
// back on the funnel with ?account_done=1, so the post-auth experience is the
// signed-in success state below — "plan saved" — with a Continue button to the offer.
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

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<null | "password" | "google">(null);

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
    setNotice(null);
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
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      setPending(null);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setPending("password");
    posthog.capture("web_funnel_account_submitted", {
      funnel_slug: slug,
      method: "password",
      mode,
    });
    try {
      const supabase = createBrowserSupabaseClient();
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnUrl())}`,
          },
        });
        if (signUpError) throw signUpError;

        // Email confirmation required — no session yet, so we can't advance.
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in here.");
          setMode("signin");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (signInError) throw signInError;
      }

      // Route through /auth/finalize (full navigation) so password auth runs
      // the same post-login side effects as OAuth — web_email_captured, the
      // session claim, and the server-side Meta CAPI Lead.
      window.location.assign(`/auth/finalize?next=${encodeURIComponent(returnUrl())}`);
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
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
          {pending === "google" ? "Redirecting…" : "Continue with Google"}
        </button>

        <div className="authDivider" aria-hidden>
          or
        </div>

        <form className="authForm" onSubmit={submitPassword}>
          <div className="authField">
            <label className="authLabel" htmlFor="funnel-auth-email">
              Email
            </label>
            <input
              id="funnel-auth-email"
              className="authInput"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="authField">
            <label className="authLabel" htmlFor="funnel-auth-password">
              Password
            </label>
            <input
              id="funnel-auth-password"
              className="authInput"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="••••••••"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="authSubmitBtn" disabled={pending !== null}>
            {pending === "password"
              ? "Working…"
              : mode === "signup"
                ? "Save my plan, it's free"
                : "Sign in & save my plan"}
          </button>
        </form>

        {notice ? (
          <p className="authMessage authNotice" role="status">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="authMessage authError" role="alert">
            {error}
          </p>
        ) : null}

        <div className="funnelAccountToggle">
          {mode === "signup" ? "Already have an account?" : "New here?"}
          <button
            type="button"
            className="authTextBtn"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
              setNotice(null);
            }}
            disabled={pending !== null}
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </div>
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
