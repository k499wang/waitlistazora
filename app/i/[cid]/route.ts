import {
  attributionFromSearchParams,
  type InfluencerAttribution
} from "@/lib/attribution";
import { getPostHogClient } from "@/lib/posthog-server";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const defaultCampaign = "website_launch";

function cleanCid(value: string) {
  return value.trim().slice(0, 100);
}

async function captureInfluencerClick(attribution: InfluencerAttribution) {
  try {
    const posthog = getPostHogClient();

    posthog.capture({
      distinctId: `influencer-click:${randomUUID()}`,
      event: "influencer_link_clicked",
      properties: {
        source: "influencer_redirect",
        ...attribution
      }
    });

    await posthog.flush();
  } catch (error) {
    console.error("Failed to capture PostHog influencer click", error);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cid: string }> }
) {
  const { cid: rawCid } = await context.params;
  const cid = cleanCid(rawCid);
  const attribution = attributionFromSearchParams(request.nextUrl.searchParams);

  attribution.cid = attribution.cid || cid;
  attribution.influencer = attribution.influencer || cid;
  attribution.utm_source = attribution.utm_source || cid;
  attribution.platform = attribution.platform || attribution.utm_medium;
  attribution.utm_medium = attribution.utm_medium || attribution.platform || "influencer";
  attribution.platform = attribution.platform || attribution.utm_medium;
  attribution.utm_campaign = attribution.utm_campaign || defaultCampaign;

  await captureInfluencerClick(attribution);

  const destination = new URL("/", request.nextUrl.origin);

  for (const [key, value] of Object.entries(attribution)) {
    if (value) {
      destination.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(destination);
}
