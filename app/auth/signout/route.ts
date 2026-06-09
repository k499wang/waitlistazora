import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

// Server-side sign out. Clears the Supabase session cookies (the SSR client
// writes the removals through `setAll`) and returns the user home. POST-only so
// a stray prefetch/GET can never log someone out.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), 303);
}
