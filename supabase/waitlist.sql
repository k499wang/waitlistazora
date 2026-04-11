create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_format check (
    email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

alter table public.waitlist_signups enable row level security;

revoke all on table public.waitlist_signups from anon, authenticated;

-- No anon or authenticated policies are created intentionally.
-- The Next.js API route inserts with SUPABASE_SERVICE_ROLE_KEY on the server only.
