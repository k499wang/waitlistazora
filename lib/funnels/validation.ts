import type { FunnelConfig, FunnelStep } from "./types";

export interface FunnelValidationIssue {
  funnelSlug: string;
  message: string;
}

const TEMPLATE_RE = /\{\{(\w+)(?::short)?(?:\|[^}]*)?\}\}/g;
const SPECIAL_TEMPLATE_KEYS = new Set(["projection_date"]);

function stepLabel(step: FunnelStep): string {
  return `${step.kind}:${step.id}`;
}

function titleTemplates(step: FunnelStep): string[] {
  switch (step.kind) {
    case "single_choice":
    case "text_input":
      return [step.question, step.subtext ?? ""];
    case "account":
    case "info":
    case "interstitial":
    case "offer":
    case "result":
    case "summary":
    case "projection":
      return [step.title, step.body];
  }
}

function templateKeys(text: string): string[] {
  const keys: string[] = [];
  for (const match of text.matchAll(TEMPLATE_RE)) {
    const key = match[1];
    if (!SPECIAL_TEMPLATE_KEYS.has(key)) keys.push(key);
  }
  return keys;
}

function addUnknownTemplateIssues({
  funnel,
  issues,
  knownStepIds,
  label,
  text,
}: {
  funnel: FunnelConfig;
  issues: FunnelValidationIssue[];
  knownStepIds: Set<string>;
  label: string;
  text: string;
}) {
  for (const key of templateKeys(text)) {
    if (!knownStepIds.has(key)) {
      issues.push({
        funnelSlug: funnel.slug,
        message: `${label} references unknown template step "${key}"`,
      });
    }
  }
}

export function validateFunnelConfig(
  funnel: FunnelConfig,
): FunnelValidationIssue[] {
  const issues: FunnelValidationIssue[] = [];
  const seenStepIds = new Set<string>();
  const duplicateStepIds = new Set<string>();

  if (funnel.steps.length === 0) {
    issues.push({
      funnelSlug: funnel.slug,
      message: "funnel must contain at least one step",
    });
  }

  for (const step of funnel.steps) {
    if (seenStepIds.has(step.id)) duplicateStepIds.add(step.id);
    seenStepIds.add(step.id);
  }

  for (const id of duplicateStepIds) {
    issues.push({
      funnelSlug: funnel.slug,
      message: `duplicate step id "${id}"`,
    });
  }

  for (const step of funnel.steps) {
    if (step.kind === "single_choice") {
      const seenOptionIds = new Set<string>();
      const duplicateOptionIds = new Set<string>();
      for (const option of step.options) {
        if (seenOptionIds.has(option.id)) duplicateOptionIds.add(option.id);
        seenOptionIds.add(option.id);

        if (option.nextId && !seenStepIds.has(option.nextId)) {
          issues.push({
            funnelSlug: funnel.slug,
            message: `${stepLabel(step)} option "${option.id}" points to unknown nextId "${option.nextId}"`,
          });
        }
      }

      for (const optionId of duplicateOptionIds) {
        issues.push({
          funnelSlug: funnel.slug,
          message: `${stepLabel(step)} has duplicate option id "${optionId}"`,
        });
      }
    }

    for (const text of titleTemplates(step)) {
      addUnknownTemplateIssues({
        funnel,
        issues,
        knownStepIds: seenStepIds,
        label: stepLabel(step),
        text,
      });
    }
  }

  for (const [segment, stepIds] of Object.entries(
    funnel.personalization.analyticsSegments,
  )) {
    for (const stepId of stepIds) {
      if (!seenStepIds.has(stepId)) {
        issues.push({
          funnelSlug: funnel.slug,
          message: `analytics segment "${segment}" references unknown step "${stepId}"`,
        });
      }
    }
  }

  for (const [stepId, optionLabels] of Object.entries(
    funnel.personalization.shortAnswers,
  )) {
    const step = funnel.steps.find((s) => s.id === stepId);
    if (!step) {
      issues.push({
        funnelSlug: funnel.slug,
        message: `shortAnswers references unknown step "${stepId}"`,
      });
      continue;
    }
    if (step.kind !== "single_choice") {
      issues.push({
        funnelSlug: funnel.slug,
        message: `shortAnswers step "${stepId}" is not a single_choice step`,
      });
      continue;
    }

    const optionIds = new Set(step.options.map((option) => option.id));
    for (const optionId of Object.keys(optionLabels)) {
      if (!optionIds.has(optionId)) {
        issues.push({
          funnelSlug: funnel.slug,
          message: `shortAnswers step "${stepId}" references unknown option "${optionId}"`,
        });
      }
    }
  }

  for (const row of funnel.personalization.summary.planRows) {
    addUnknownTemplateIssues({
      funnel,
      issues,
      knownStepIds: seenStepIds,
      label: `summary row "${row.label}"`,
      text: row.value,
    });
  }

  const projection = funnel.personalization.summary.projection;
  if (projection && !seenStepIds.has(projection.stepId)) {
    issues.push({
      funnelSlug: funnel.slug,
      message: `summary projection references unknown step "${projection.stepId}"`,
    });
  }

  const prediction = funnel.personalization.summary.prediction;
  if (prediction) {
    addUnknownTemplateIssues({
      funnel,
      issues,
      knownStepIds: seenStepIds,
      label: "summary prediction",
      text: prediction.text,
    });
  }

  if (funnel.personalization.summary.compare) {
    addUnknownTemplateIssues({
      funnel,
      issues,
      knownStepIds: seenStepIds,
      label: "summary compare",
      text: funnel.personalization.summary.compare,
    });
  }

  const headline = funnel.personalization.offer.headline;
  if (headline && !seenStepIds.has(headline.stepId)) {
    issues.push({
      funnelSlug: funnel.slug,
      message: `offer headline references unknown step "${headline.stepId}"`,
    });
  }

  if (funnel.personalization.offer.body) {
    addUnknownTemplateIssues({
      funnel,
      issues,
      knownStepIds: seenStepIds,
      label: "offer body",
      text: funnel.personalization.offer.body,
    });
  }

  return issues;
}

export function assertValidFunnelConfig(funnel: FunnelConfig) {
  const issues = validateFunnelConfig(funnel);
  if (issues.length > 0) {
    throw new Error(
      issues.map((issue) => `[${issue.funnelSlug}] ${issue.message}`).join("\n"),
    );
  }
}
