import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseAnonKey, supabaseUrl } from "./env";

// Cookie-bound Supabase client for Server Components, Route Handlers, and
// Server Actions. Reads the authenticated user's session from request cookies
// so `auth.getUser()` returns the same Supabase user id used as the RevenueCat
// App User ID. This is the runbook's `createServerSupabaseClient()` helper.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` is called from a Server Component where cookies are
          // read-only. The middleware refreshes the session instead, so this
          // is safe to ignore.
        }
      },
    },
  });
}
