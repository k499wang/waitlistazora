import { resolveTemplate } from "./personalization";
import type { FunnelStep } from "./types";

export interface ResolvedStepDisplayCopy {
  title: string;
  body: string;
}

export function stepTitle(step: FunnelStep): string {
  switch (step.kind) {
    case "single_choice":
    case "text_input":
      return step.question;
    case "scale":
      return step.statement;
    case "account":
    case "info":
    case "interstitial":
    case "offer":
    case "result":
    case "summary":
    case "projection":
    case "breathing":
      return step.title;
  }
}

export function resolveStepDisplayCopy({
  step,
  answers,
  steps,
}: {
  step: FunnelStep;
  answers: Record<string, string>;
  steps: FunnelStep[];
}): ResolvedStepDisplayCopy {
  switch (step.kind) {
    case "single_choice":
    case "text_input":
      return {
        title: resolveTemplate(step.question, answers, steps),
        body: resolveTemplate(step.subtext ?? "", answers, steps),
      };
    case "scale":
      return {
        title: resolveTemplate(step.statement, answers, steps),
        body: resolveTemplate(step.subtext ?? "", answers, steps),
      };
    case "account":
    case "offer":
      return {
        title: step.title,
        body: step.body,
      };
    case "breathing":
      return {
        title: resolveTemplate(step.title, answers, steps),
        body: resolveTemplate(step.subtext ?? "", answers, steps),
      };
    case "info":
    case "interstitial":
    case "result":
    case "summary":
    case "projection":
      return {
        title: resolveTemplate(step.title, answers, steps),
        body: resolveTemplate(step.body, answers, steps),
      };
  }
}
