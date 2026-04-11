# Azora Waitlist

A small Next.js waitlist page that collects email addresses and saves them to Supabase from a server-side API route.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Vercel Web Analytics is already wired through `@vercel/analytics`. After deploying to Vercel, open the project dashboard, go to the Analytics tab, and enable Web Analytics for the project.

## Environment variables

Create `.env.local` in the project root:

```bash
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Use the service role key only on the server. Do not prefix it with `NEXT_PUBLIC_`, and do not use it in client components.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run the SQL in `supabase/waitlist.sql`.
4. Go to Project Settings, then API.
5. Copy the Project URL into `SUPABASE_URL`.
6. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY`.
7. Add the same env vars to your Vercel project settings before deploying.

The SQL enables row-level security, revokes direct anon/authenticated table access, and intentionally creates no public insert/select policies. The browser can only submit to the Next.js API route; the API route inserts with the server-only service role key.

```text
email | created_at
```
