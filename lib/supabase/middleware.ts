import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseAnonKey, supabaseUrl } from "./env";

// Refreshes the Supabase auth session on every request and writes any rotated
// auth cookies back onto the response. Without this the server client can read
// a stale/expired session. Adapted from the Supabase Next.js SSR guide.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the session so cookies refresh. Do not gate routes here; the
  // /checkout/start route does its own auth check and redirect-to-login.
  await supabase.auth.getUser();

  return response;
}
