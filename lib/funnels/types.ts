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
      options: FunnelOption[];
    }
  | {
      kind: "interstitial";
      id: string;
      title: string;
      body: string;
    }
  | {
      kind: "result";
      id: string;
      title: string;
      body: string;
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
