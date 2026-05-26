export const attributionKeys = [
  "cid",
  "influencer",
  "platform",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "landing_page",
  "referrer"
] as const;

export type AttributionKey = (typeof attributionKeys)[number];
export type InfluencerAttribution = Partial<Record<AttributionKey, string>>;

const maxValueLength = 500;

function cleanValue(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxValueLength);
}

export function hasAttribution(attribution: InfluencerAttribution) {
  return Object.values(attribution).some(Boolean);
}

export function attributionFromSearchParams(
  searchParams: URLSearchParams
): InfluencerAttribution {
  const attribution: InfluencerAttribution = {};

  for (const key of attributionKeys) {
    const value = cleanValue(searchParams.get(key));

    if (value) {
      attribution[key] = value;
    }
  }

  if (!attribution.influencer) {
    attribution.influencer = attribution.cid || attribution.utm_source;
  }

  if (!attribution.platform) {
    attribution.platform = attribution.utm_medium;
  }

  return attribution;
}

export function attributionFromRecord(value: unknown): InfluencerAttribution {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const attribution: InfluencerAttribution = {};

  for (const key of attributionKeys) {
    const cleaned = cleanValue(record[key]);

    if (cleaned) {
      attribution[key] = cleaned;
    }
  }

  if (!attribution.influencer) {
    attribution.influencer = attribution.cid || attribution.utm_source;
  }

  if (!attribution.platform) {
    attribution.platform = attribution.utm_medium;
  }

  return attribution;
}
