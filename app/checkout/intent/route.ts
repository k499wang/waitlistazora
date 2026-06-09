import { NextResponse } from "next/server";

import { createCheckoutIntent } from "@/lib/checkout/create-intent";
import { getOffer } from "@/lib/checkout/offers";
import {
  FUNNEL_SESSION_COOKIE,
  FUNNEL_SESSION_COOKIE_MAX_AGE,
} from "@/lib/checkout/funnel-session";

// Embedded checkout entry point. Shares createCheckoutIntent with /checkout/start
// but returns JSON instead of redirecting, so the browser can run the RevenueCat
// Web Billing SDK purchase on our own domain (see embedded-checkout-button.tsx).
//
// POST-only: the offer is passed as ?offer=<key> and the body is empty.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const result = await createCheckoutIntent(req, { status: "created" });

  if (result.kind === "unauthenticated") {
    // 401 -> the client bounces through /login with a resume marker and retries.
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  if (result.kind === "profile_error") {
    return NextResponse.json(
      { error: "Could not prepare checkout. Please try again." },
      { status: 500 },
    );
  }

  const { sessionId, appUserId, email, checkout } = result;
  const offer = getOffer(checkout.offer.key);

  const response = NextResponse.json({
    sessionId,
    appUserId,
    email,
    offerId: checkout.offer.offerId,
    offeringIdentifier: offer.offeringIdentifier,
    environment: checkout.environment,
  });

  response.cookies.set(FUNNEL_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FUNNEL_SESSION_COOKIE_MAX_AGE,
  });

  return response;
}
