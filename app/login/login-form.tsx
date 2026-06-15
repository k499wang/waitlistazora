"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { LOGIN_NEXT_COOKIE } from "@/lib/checkout/funnel-session";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type OAuthProvider = "apple" | "google";

// OAuth (PKCE -> /auth/callback). On success the Supabase session lands
// in cookies and the user continues to `next`. The Supabase user.id is the
// RevenueCat App User ID by contract.
export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, setPending] = useState<null | OAuthProvider>(null);

  async function signInWithProvider(provider: OAuthProvider) {
    const providerName = provider === "apple" ? "Apple" : "Google";
    setError(null);
    setPending(provider);
    try {
      const supabase = createBrowserSupabaseClient();
      // Stash `next` in a cookie — Supabase doesn't reliably preserve a nested
      // `next` query param through the OAuth round-trip. /auth/callback reads
      // this cookie back. Use a bare callback URL as redirectTo.
      document.cookie = `${LOGIN_NEXT_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=600; samesite=lax`;
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
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${providerName} sign-in failed.`);
      setPending(null);
    }
  }

  return (
    <div className="authCard">
      <Link href="/" className="authBrand">
        <Image src="/icon.png" alt="" width={26} height={26} />
        Azora
      </Link>

      <h1 className="authTitle">Sign in to Azora</h1>
      <p className="authSubtitle">Continue to access your account.</p>

      <div className="authOauthGroup">
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
      </div>

      {error ? (
        <p className="authMessage authError" role="alert">
          {error}
        </p>
      ) : null}

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
