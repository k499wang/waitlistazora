import { sendLeadEvent } from "@/lib/meta-capi";
import { getPostHogClient } from "@/lib/posthog-server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ensureWebProfile } from "./profile";

interface PostLoginContext {
  eventSourceUrl?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  /** Two-letter ISO country code from the edge (x-vercel-ip-country). */
  country?: string | null;
  /**
   * _fbp/_fbc cookies read off the auth request — fallback match keys for when
   * the landing beacon never persisted attribution (blocked /api/session-init,
   * bounce before the 600ms timer). DB values win: they carry the first-touch
   * click timestamp.
   */
  fbpCookie?: string | null;
  fbcCookie?: string | null;
}

// x-forwarded-for can be a comma-separated chain (client, proxy1, proxy2…).
// Meta CAPI wants a single IP, so keep only the first (originating client).
function firstClientIp(value: string | null | undefined): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

// Shared post-login side effects, run once per successful authentication
// regardless of method (OAuth, magic link, email confirmation, or
// email+password). Keeping this in one place means every login path:
//   1. fires the web_email_captured PostHog event,
//   2. attaches user_id to the anonymous funnel session so attribution
//      (fbclid / _fbp / _fbc) is linked to the authenticated user, and
//   3. fires the Meta CAPI Lead event server-side — reliably, because it does
//      NOT depend on the user landing on a page that renders (the post-login
//      destination is often a redirect route or an external site).
//
// Best-effort: never throws, so it can't block an auth redirect.
export async function applyPostLogin(
  user: { id: string; email?: string | null; app_metadata?: { provider?: string } },
  sessionId: string | null | undefined,
  context?: PostLoginContext,
): Promise<void> {
  const admin = createAdminSupabaseClient();

  try {
    await ensureWebProfile(admin, user);

    if (sessionId) {
      await admin
        .from("web_funnel_sessions")
        .update({ user_id: user.id, status: "authenticated" })
        .eq("id", sessionId)
        .is("user_id", null);
    }
  } catch {
    // Best-effort DB preparation — checkout will enforce/create the profile again.
  }

  // Read persisted fbp/fbc for the Lead match keys, falling back to the
  // cookies on the auth request itself. Best-effort.
  let fbp: string | null = context?.fbpCookie ?? null;
  let fbc: string | null = context?.fbcCookie ?? null;
  if (sessionId) {
    try {
      const { data: attribution } = await admin
        .from("web_funnel_attribution")
        .select("fbp, fbc")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (attribution) {
        if (typeof attribution.fbp === "string" && attribution.fbp) {
          fbp = attribution.fbp;
        }
        if (typeof attribution.fbc === "string" && attribution.fbc) {
          fbc = attribution.fbc;
        }
      }
    } catch {
      // Best-effort — fire Lead with whatever match keys we have.
    }
  }

  try {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: "web_email_captured",
      properties: {
        email: user.email,
        provider: user.app_metadata?.provider ?? null,
        $set: { email: user.email },
      },
    });
    await posthog.flush();
  } catch {
    // Best-effort analytics — never block the auth redirect.
  }

  try {
    // Meta CAPI Lead — fire-and-forget. event_id = lead_<user.id> dedupes
    // across the callback + finalize paths and repeat logins.
    await sendLeadEvent({
      externalId: user.id,
      email: user.email,
      fbp,
      fbc,
      clientIp: firstClientIp(context?.clientIp),
      clientUserAgent: context?.clientUserAgent ?? null,
      country: context?.country ?? null,
      eventSourceUrl: context?.eventSourceUrl ?? null,
      eventId: `lead_${user.id}`,
    });
  } catch {
    // Best-effort analytics — never block the auth redirect.
  }
}
