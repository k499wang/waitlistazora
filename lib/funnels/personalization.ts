// Pure, framework-free helpers for funnel personalization and analytics.
// Kept out of the runner component so they can be unit-tested and reused by
// every step renderer (and every funnel). No React imports here on purpose.

import type { FunnelPersonalization, FunnelStep } from "./types";

export type FunnelAnalyticsValue = string | number | boolean | null;
export type FunnelAnalyticsProperties = Record<string, FunnelAnalyticsValue>;

/**
 * Answer-derived PostHog event properties. Each configured segment maps a
 * property name to the step IDs checked in order, the first answered step
 * wins, null when none are answered. Lets branching funnels coalesce their
 * branch follow-ups into a single segment property.
 */
export function answerSegments(
  personalization: FunnelPersonalization,
  answers: Record<string, string>,
): FunnelAnalyticsProperties {
  const segments: FunnelAnalyticsProperties = {};
  for (const [key, stepIds] of Object.entries(personalization.analyticsSegments)) {
    segments[key] =
      stepIds.map((id) => answers[id]).find((v) => v !== undefined) ?? null;
  }
  return segments;
}

/** Concrete date 2 weeks out (e.g. "Jun 24") so forecasts read as a
 *  commitment, not a vague duration. Client-only, so no SSR mismatch. */
export function projectionDateLabel(): string {
  return new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Resolve {{step_id}} placeholders to the *label* of the user's selected
 * option (used for interstitial / result / info / summary display copy that
 * echoes an answer verbatim).
 */
export function resolveTemplate(
  text: string,
  answers: Record<string, string>,
  steps: FunnelStep[],
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const answerId = answers[key];
    if (!answerId) return "";
    const step = steps.find((s) => s.id === key);
    if (step?.kind === "single_choice") {
      const opt = step.options.find((o) => o.id === answerId);
      return opt?.label ?? answerId;
    }
    return answerId;
  });
}

/**
 * Resolve a personalization template ({{step_id:short}}, optional |fallback,
 * {{projection_date}}) against the user's answers and the funnel's short-label
 * maps. Returns null when the template references an unanswered step with no
 * fallback, callers omit that row/line or fall back to generic copy.
 */
export function resolvePersonalTemplate(
  template: string,
  answers: Record<string, string>,
  shortAnswers: FunnelPersonalization["shortAnswers"],
): string | null {
  let missing = false;
  const resolved = template.replace(
    /\{\{(\w+)(?::short)?(?:\|([^}]*))?\}\}/g,
    (_match, stepId: string, fallback?: string) => {
      if (stepId === "projection_date") return projectionDateLabel();
      const answerId = answers[stepId];
      const short = answerId ? shortAnswers[stepId]?.[answerId] : undefined;
      if (short !== undefined) return short;
      if (fallback !== undefined) return fallback;
      missing = true;
      return "";
    },
  );
  return missing ? null : resolved;
}
