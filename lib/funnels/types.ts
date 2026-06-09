// Minimal, data-driven funnel model. Intentionally boring: add new step kinds
// only when the UI/behavior is genuinely different (see docs/plan.md).

import type { OfferKey } from "@/lib/checkout/offers";

export interface FunnelOption {
  /** Stable id stored with the answer. */
  id: string;
  label: string;
  /** Optional emoji/glyph rendered before the label. */
  emoji?: string;
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
