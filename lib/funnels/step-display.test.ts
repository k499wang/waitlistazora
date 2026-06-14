import { describe, expect, it } from "vitest";

import type { FunnelStep } from "./types";
import { resolveStepDisplayCopy, stepTitle } from "./step-display";

const steps: FunnelStep[] = [
  {
    kind: "single_choice",
    id: "goal",
    question: "What do you want?",
    subtext: "Pick {{goal}}",
    options: [{ id: "calm", label: "Calm" }],
  },
  {
    kind: "info",
    id: "info",
    icon: "?",
    title: "{{goal}} plan",
    body: "Built for {{goal}}",
  },
  {
    kind: "offer",
    id: "offer",
    title: "Offer {{goal}}",
    body: "Body {{goal}}",
    offerKey: "annual",
  },
];

describe("step display helpers", () => {
  it("uses question text as the title for answer-bearing steps", () => {
    expect(stepTitle(steps[0])).toBe("What do you want?");
  });

  it("resolves templates for quiz and content screens", () => {
    expect(
      resolveStepDisplayCopy({
        step: steps[1],
        answers: { goal: "calm" },
        steps,
      }),
    ).toEqual({
      title: "Calm plan",
      body: "Built for Calm",
    });
  });

  it("leaves offer copy unresolved for the paywall component to personalize", () => {
    expect(
      resolveStepDisplayCopy({
        step: steps[2],
        answers: { goal: "calm" },
        steps,
      }),
    ).toEqual({
      title: "Offer {{goal}}",
      body: "Body {{goal}}",
    });
  });
});
