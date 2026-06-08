import { createClient } from "@supabase/supabase-js";

import { supabaseServiceRoleKey, supabaseUrl } from "./env";

// Service-role Supabase client for server-side writes that bypass RLS.
//
// The web funnel tables grant `authenticated` SELECT only — all inserts/updates
// to web_funnel_sessions, web_checkout_intents, profiles, etc. must go through
// this client from server code. NEVER import this into a client component.
//
// Callers are responsible for scoping every query to the authenticated user's
// own id (derived from the cookie-bound server client), since this key has no
// RLS protection.
export function createAdminSupabaseClient() {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
