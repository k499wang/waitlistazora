"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

// Proper multi-method auth for web checkout:
//   - Google OAuth (PKCE -> /auth/callback)
//   - Email + password (sign in / create account)
//   - Magic-link email as a passwordless fallback
// On success the Supabase session lands in cookies and the user continues to
// `next`. The Supabase user.id is the RevenueCat App User ID by contract.
export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<null | "password" | "google">(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Account creation requires explicit consent to the Terms & Privacy Policy
  // (which includes marketing email consent). Google sign-in can also create
  // an account, so it's gated too while in signup mode.
  function requireConsent(): boolean {
    if (mode === "signup" && !acceptedTerms) {
      setError("Please accept the Terms & Conditions and Privacy Policy to create an account.");
      return false;
    }
    return true;
  }

  function callbackUrl() {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function signInWithGoogle() {
    setError(null);
    setNotice(null);
    if (!requireConsent()) return;
    setPending("google");
    try {
      const supabase = createBrowserSupabaseClient();
      // Stash `next` in a cookie — Supabase doesn't reliably preserve a nested
      // `next` query param through the Google round-trip. /auth/callback reads
      // this cookie back. Use a bare callback URL as redirectTo.
      document.cookie = `wf_login_next=${encodeURIComponent(next)}; path=/; max-age=600; samesite=lax`;
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
    if (!requireConsent()) return;
    setPending("password");
    try {
      const supabase = createBrowserSupabaseClient();
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: callbackUrl() },
        });
        if (signUpError) throw signUpError;

        // If email confirmation is required, no session is returned yet.
        if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
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

      // Route through /auth/finalize (full navigation) so password logins run
      // the same post-login side effects as OAuth — web_email_captured, the
      // session claim, and the server-side Meta CAPI Lead.
      window.location.assign(`/auth/finalize?next=${encodeURIComponent(next)}`);
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="authCard">
      <Link href="/" className="authBrand">
        <Image src="/icon.png" alt="" width={26} height={26} />
        Azora
      </Link>

      <h1 className="authTitle">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="authSubtitle">
        {mode === "signup"
          ? "Create your account to get started."
          : "Sign in to your account."}
      </p>

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
          <label className="authLabel" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
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
          <label className="authLabel" htmlFor="auth-password">
            Password
          </label>
          <input
            id="auth-password"
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
        {mode === "signup" ? (
          <label className="authConsent">
            <input
              type="checkbox"
              className="authConsentBox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setError(null);
              }}
            />
            <span className="authConsentText">
              I agree to the{" "}
              <Link href="/terms" target="_blank">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank">
                Privacy Policy
              </Link>
              , and to receive product updates and marketing emails from Azora
              (unsubscribe anytime).
            </span>
          </label>
        ) : null}
        <button type="submit" className="authSubmitBtn" disabled={pending !== null}>
          {pending === "password"
            ? "Working…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
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

      <div className="authFooter">
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

      {mode === "signin" ? (
        <p className="authFinePrint">
          By continuing, you agree to our{" "}
          <Link href="/terms" target="_blank">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank">
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}
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
