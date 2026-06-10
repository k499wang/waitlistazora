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
  | "camera_ppg";

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

export interface FunnelConfig {
  slug: string;
  name: string;
  status: "draft" | "active" | "archived";
  /** Short copy under the headline on the first step. */
  intro: string;
  steps: FunnelStep[];
}
