import type { SupabaseClient } from "@supabase/supabase-js";

// Cookie that ties a browser to its web_funnel_sessions row so repeat visits
// (e.g. login bounce -> checkout) attach to one session instead of creating a
// new row each time.
export const FUNNEL_SESSION_COOKIE = "wf_session_id";
export const FUNNEL_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface FunnelSessionInput {
  userId: string;
  funnelSlug: string;
  landingPath: string;
  initialUrl: string;
  cookieSessionId?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
}

/**
 * Create a new web_funnel_sessions row, or attach to the existing one named by
 * the cookie when it still belongs to this user. Returns the session id.
 *
 * Uses a service-role client (writes bypass RLS) — callers must pass the
 * authenticated user's own id.
 */
export async function getOrCreateFunnelSession(
  admin: SupabaseClient,
  input: FunnelSessionInput,
): Promise<string> {
  if (input.cookieSessionId) {
    const { data: existing, error } = await admin
      .from("web_funnel_sessions")
      .select("id")
      .eq("id", input.cookieSessionId)
      .eq("user_id", input.userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (existing) {
      const { error: updateError } = await admin
        .from("web_funnel_sessions")
        .update({ status: "checkout_started" })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }

      return existing.id;
    }
  }

  const { data: created, error: insertError } = await admin
    .from("web_funnel_sessions")
    .insert({
      anonymous_id: crypto.randomUUID(),
      user_id: input.userId,
      funnel_slug: input.funnelSlug,
      landing_path: input.landingPath,
      initial_url: input.initialUrl,
      referrer: input.referrer ?? null,
      user_agent: input.userAgent ?? null,
      status: "checkout_started",
    })
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  return created.id;
}
