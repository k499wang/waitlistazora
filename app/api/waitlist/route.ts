import { appendWaitlistSignup } from "@/lib/supabase";
import { NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  if (!email || !emailPattern.test(email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email is required." },
      { status: 400 }
    );
  }

  try {
    const createdAt = new Date().toISOString();
    await appendWaitlistSignup({ email, createdAt });

    return NextResponse.json({ ok: true, email, createdAt }, { status: 201 });
  } catch (error) {
    console.error("Failed to append waitlist signup", error);

    return NextResponse.json(
      { ok: false, error: "Failed to save signup." },
      { status: 500 }
    );
  }
}
