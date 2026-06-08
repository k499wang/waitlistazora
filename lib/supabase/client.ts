"use client";

import { createBrowserClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "./env";

// Browser Supabase client for the login page. Uses the public anon key and
// writes the session into cookies that the server client / middleware read.
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
