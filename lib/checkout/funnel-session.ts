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
      .select("id, user_id")
      .eq("id", input.cookieSessionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Claim the session if it's anonymous (user_id=null) or already owned.
    if (existing) {
      if (!existing.user_id || existing.user_id === input.userId) {
        const { error: updateError } = await admin
          .from("web_funnel_sessions")
          .update({ user_id: input.userId, status: "checkout_started" })
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }

        return existing.id;
      }
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

interface AnonymousSessionInput {
  cookieSessionId?: string | null;
  funnelSlug: string;
  landingPath: string;
  initialUrl: string;
  referrer?: string | null;
  userAgent?: string | null;
  ipCountry?: string | null;
}

/**
 * Resolve the anonymous (pre-auth) funnel session for a browser. Reuses the
 * session named by the cookie when it still exists, otherwise creates a fresh
 * anonymous row. Returns the id plus whether a new row was created so the
 * caller knows to (re)set the cookie.
 *
 * Both the landing beacon and the answer-persist route go through this so they
 * can't create competing sessions for the same browser.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrCreateAnonymousFunnelSession(
  admin: SupabaseClient,
  input: AnonymousSessionInput,
): Promise<{ sessionId: string; created: boolean }> {
  // Only look up a cookie that's a well-formed UUID. A garbage value (stale
  // cookie, tampering) would otherwise make the uuid-typed query throw and
  // drop the answer instead of falling through to creating a fresh session.
  if (input.cookieSessionId && UUID_RE.test(input.cookieSessionId)) {
    const { data: existing, error } = await admin
      .from("web_funnel_sessions")
      .select("id")
      .eq("id", input.cookieSessionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (existing) {
      return { sessionId: existing.id, created: false };
    }
  }

  const { data: created, error: insertError } = await admin
    .from("web_funnel_sessions")
    .insert({
      anonymous_id: crypto.randomUUID(),
      user_id: null,
      funnel_slug: input.funnelSlug,
      landing_path: input.landingPath,
      initial_url: input.initialUrl,
      referrer: input.referrer ?? null,
      user_agent: input.userAgent ?? null,
      ip_country: input.ipCountry ?? null,
      status: "started",
    })
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  return { sessionId: created.id, created: true };
}
