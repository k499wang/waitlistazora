import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

// Only allow internal redirect targets to avoid an open-redirect via ?next=.
// Defaults to home so this behaves like a normal login screen; the checkout
// funnel still works because it passes an explicit ?next=/checkout/start.
function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeNext(next);

  // Already signed in -> skip straight to the intended destination.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(target);
  }

  return (
    <main className="authPage">
      <LoginForm next={target} initialError={error} />
    </main>
  );
}
