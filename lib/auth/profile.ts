import type { SupabaseClient } from "@supabase/supabase-js";

interface ProfileUser {
  id: string;
}

// Web-created auth users must still satisfy the shared billing contract:
// RevenueCat app_user_id == Supabase user.id, and that id must exist in
// public.profiles so checkout intent FKs and webhook reconciliation work.
export async function ensureWebProfile(
  admin: SupabaseClient,
  user: ProfileUser,
): Promise<void> {
  const { data: existing, error: lookupError } = await admin
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    return;
  }

  const { error: insertError } = await admin
    .from("profiles")
    .insert({ user_id: user.id });

  // Another request may have created the profile between lookup and insert.
  if (insertError && insertError.code !== "23505") {
    throw insertError;
  }
}
