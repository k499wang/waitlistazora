// Data-driven funnel model with branching support.
//
// Steps are defined as a flat array. Sequential advance walks the array,
// but any FunnelOption can set `nextId` to jump to a specific step —
// enabling conditional branching (e.g. different follow-up questions
// based on the user's goal).
//
// Interstitial and result steps support {{step_id}} template variables
// in their title/body. The runner resolves them to the selected option
// label at render time.

import type { OfferKey } from "@/lib/checkout/offers";

/**
 * Built-in SVG diagram rendered as the visual centerpiece of an info step
 * (replaces the emoji icon). Components live in app/f/[slug]/info-visuals.tsx.
 */
export type InfoVisualKey =
  | "fading_streak"
  | "open_vs_closed_loop"
  | "ppg_vs_ecg"
  | "hr_falling"
  | "stat_ring"
  | "stress_signature"
  | "camera_ppg"
  | "stress_projection";

export interface FunnelOption {
  /** Stable id stored with the answer. */
  id: string;
  label: string;
  /** Optional emoji/glyph rendered before the label. */
  emoji?: string;
  /**
   * If set, selecting this option navigates to this step ID instead of
   * the next sequential step in the array. Use for branching funnels.
   */
  nextId?: string;
}

export type FunnelStep =
  | {
      kind: "single_choice";
      id: string;
      question: string;
      subtext?: string;
      /** Calm-style brief reassurance shown after selecting an answer, then auto-advances. */
      reassurance?: string;
      options: FunnelOption[];
    }
  | {
      // Free-text answer (e.g. the user's first name) used to personalize
      // later copy via {{step_id}} templates. The raw trimmed string is stored
      // as the answer and persisted like any other answer.
      kind: "text_input";
      id: string;
      question: string;
      subtext?: string;
      placeholder?: string;
      /** Max characters accepted; the runner defaults this when unset. */
      maxLength?: number;
    }
  | {
      kind: "interstitial";
      id: string;
      title: string;
      body: string;
    }
  | {
      kind: "info";
      id: string;
      /** Emoji/glyph rendered as a large visual above the title. */
      icon: string;
      /**
       * Built-in SVG diagram rendered above the title instead of the emoji
       * icon. The icon remains the fallback when this is unset.
       */
      visual?: InfoVisualKey;
      title: string;
      body: string;
      /**
       * Institution names rendered as a wordmark credibility strip under the
       * body (e.g. "MIT Media Lab"). Text-only for now; swap in licensed logo
       * assets later without changing the data shape.
       */
      institutions?: string[];
      /** Small-print study citation line rendered under the strip. */
      citation?: string;
      /**
       * YouTube video id embedded as a vertical (9:16, Shorts-style) demo
       * player between the body and the Continue button.
       */
      youtubeId?: string;
    }
  | {
      kind: "result";
      id: string;
      title: string;
      body: string;
    }
  | {
      // Personalized plan recap. The card contents (goal, schedule, focus,
      // projection, vs. what they tried) are derived from the user's answers
      // in the runner, so the step itself only carries the framing copy.
      kind: "summary";
      id: string;
      title: string;
      body: string;
    }
  | {
      kind: "account";
      id: string;
      title: string;
      body: string;
      /** Benefit bullets shown above the inline auth form. */
      benefits: string[];
    }
  | {
      kind: "offer";
      id: string;
      title: string;
      body: string;
      /** Which registered offer this funnel sells. */
      offerKey: OfferKey;
    };

/**
 * Per-funnel personalization: everything the runner derives from the user's
 * answers (summary plan card, paywall headline/body, analytics segments) plus
 * the offer-step copy blocks that are funnel-specific. Keeping this in config
 * keeps the runner funnel-agnostic.
 *
 * Template strings here support:
 *   {{step_id:short}}           → the short label for the user's answer to that
 *                                 step, looked up in `shortAnswers`
 *   {{step_id:short|fallback}}  → same, but renders the fallback when the step
 *                                 is unanswered
 *   {{projection_date}}         → a concrete date 2 weeks out (e.g. "Jun 26")
 *   **bold**                    → rendered as <strong>
 * A template that references an unanswered step with no |fallback resolves to
 * null, and the runner omits that row/line entirely.
 */
export interface FunnelPersonalization {
  /**
   * Answer-derived PostHog event properties: property name → step IDs checked
   * in order (first answered wins; null when none answered). Lets branching
   * funnels coalesce branch follow-ups into one segment property.
   */
  analyticsSegments: Record<string, string[]>;
  /**
   * Short, sentence-friendly forms of answers for {{step_id:short}} tokens:
   * step ID → option ID → label. Full option labels are full sentences, so
   * recap copy uses these instead.
   */
  shortAnswers: Record<string, Record<string, string>>;
  summary: {
    /**
     * Plan recap rows (shown on the summary step and again on the paywall).
     * `value` is a template; rows referencing an unanswered step with no
     * fallback are omitted.
     */
    planRows: { label: string; value: string }[];
    /** Projection chart under the plan card. Omit to hide the chart. */
    projection?: {
      title: string;
      /** Step whose answer names where the curve lands. */
      stepId: string;
      endLabels: Record<string, string>;
      fallbackEndLabel: string;
    };
    /** "Based on your answers, we predict…" block. */
    prediction?: { kicker: string; text: string };
    /** Comparison line ("X gave you no feedback…"); template, omitted when unresolved. */
    compare?: string;
  };
  offer: {
    /** Paywall headline keyed by the answer to `stepId`; falls back to the offer step's title. */
    headline?: { stepId: string; byAnswer: Record<string, string> };
    /** Paywall subline template; falls back to the offer step's body when unresolved. */
    body?: string;
    /** Value-anchor line under the feature list. */
    anchorNote?: string;
    /** "How your free trial works" timeline (annual plan only). */
    trialTimeline?: { day: string; text: string }[];
    /** Accuracy/credibility block at the bottom of the checkout card. */
    validation?: { line: string; sources: string };
    /** Member reviews under the checkout card. */
    testimonials?: { name: string; meta: string; text: string }[];
  };
}

export interface FunnelConfig {
  slug: string;
  name: string;
  status: "draft" | "active" | "archived";
  /** Short copy under the headline on the first step. */
  intro: string;
  steps: FunnelStep[];
  personalization: FunnelPersonalization;
}
