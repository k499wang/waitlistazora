import { createClient } from "@supabase/supabase-js";

type WaitlistSignup = {
  email: string;
  createdAt: string;
};

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function appendWaitlistSignup({
  email,
  createdAt
}: WaitlistSignup) {
  const supabase = createClient(
    requiredEnv("SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );

  const { error } = await supabase.from("waitlist_signups").insert({
    email,
    created_at: createdAt
  });

  if (error?.code === "23505") {
    return;
  }

  if (error) {
    throw error;
  }
}
