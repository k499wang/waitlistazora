import { describe, expect, it } from "vitest";

import { listFunnelConfigs } from "./registry";
import type { FunnelConfig } from "./types";
import { validateFunnelConfig } from "./validation";

const baseFunnel: FunnelConfig = {
  slug: "test",
  name: "Test",
  status: "active",
  intro: "Test funnel",
  steps: [
    {
      kind: "single_choice",
      id: "goal",
      question: "Goal?",
      options: [
        { id: "calm", label: "Calm", nextId: "summary" },
        { id: "sleep", label: "Sleep" },
      ],
    },
    {
      kind: "summary",
      id: "summary",
      title: "Summary for {{goal}}",
      body: "Done",
    },
  ],
  personalization: {
    analyticsSegments: { goal: ["goal"] },
    shortAnswers: { goal: { calm: "calm", sleep: "sleep" } },
    summary: {
      planRows: [{ label: "Goal", value: "{{goal:short}}" }],
    },
    offer: {
      headline: { stepId: "goal", byAnswer: { calm: "Ready" } },
      body: "{{goal:short|calm}}",
    },
  },
};

function cloneConfig(config: FunnelConfig): FunnelConfig {
  return structuredClone(config) as FunnelConfig;
}

describe("funnel config validation", () => {
  it("keeps all registered funnels valid", () => {
    const issues = listFunnelConfigs().flatMap(validateFunnelConfig);

    expect(issues).toEqual([]);
  });

  it("detects duplicate step ids", () => {
    const funnel = cloneConfig(baseFunnel);
    funnel.steps.push({
      kind: "info",
      id: "goal",
      icon: "?",
      title: "Duplicate",
      body: "Duplicate",
    });

    expect(validateFunnelConfig(funnel)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'duplicate step id "goal"' }),
      ]),
    );
  });

  it("detects broken branch targets", () => {
    const funnel = cloneConfig(baseFunnel);
    const goal = funnel.steps[0];
    if (goal.kind !== "single_choice") throw new Error("fixture changed");
    goal.options[0].nextId = "missing";

    expect(validateFunnelConfig(funnel)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message:
            'single_choice:goal option "calm" points to unknown nextId "missing"',
        }),
      ]),
    );
  });

  it("detects broken personalization references", () => {
    const funnel = cloneConfig(baseFunnel);
    funnel.personalization.analyticsSegments.goal = ["missing"];
    funnel.personalization.shortAnswers.goal = { missing_option: "Missing" };
    funnel.personalization.summary.planRows = [
      { label: "Broken", value: "{{missing:short}}" },
    ];
    funnel.personalization.summary.projection = {
      title: "Projection",
      stepId: "missing",
      endLabels: {},
      fallbackEndLabel: "Done",
    };
    funnel.personalization.offer.headline = {
      stepId: "missing",
      byAnswer: {},
    };

    const messages = validateFunnelConfig(funnel).map((issue) => issue.message);

    expect(messages).toEqual(
      expect.arrayContaining([
        'analytics segment "goal" references unknown step "missing"',
        'shortAnswers step "goal" references unknown option "missing_option"',
        'summary row "Broken" references unknown template step "missing"',
        'summary projection references unknown step "missing"',
        'offer headline references unknown step "missing"',
      ]),
    );
  });
});
