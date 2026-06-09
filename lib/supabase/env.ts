// Shared Supabase env access for the web funnel.
//
// The anon URL/key are exposed to the browser (NEXT_PUBLIC_*) for the SSR/auth
// client. The service-role key is server-only and must never be imported into a
// client component. `SUPABASE_URL` is kept as a fallback for the legacy waitlist
// path that predates the auth setup.

export function supabaseUrl(): string {
  const value = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  )?.trim();

  if (!value) {
    throw new Error(
      "Missing required env var NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL).",
    );
  }

  return value;
}

export function supabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!value) {
    throw new Error("Missing required env var NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return value;
}

export function supabaseServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!value) {
    throw new Error("Missing required env var SUPABASE_SERVICE_ROLE_KEY.");
  }

  return value;
}
