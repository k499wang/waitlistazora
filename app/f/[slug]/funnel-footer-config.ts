import type { FunnelStep } from "@/lib/funnels/types";

export type FunnelFooterAction =
  | "advance_choice"
  | "continue_clicked"
  | "result_unlock_clicked"
  | "summary_save_clicked";

export interface FunnelFooterConfig {
  label: string;
  disabled: boolean;
  action: FunnelFooterAction;
}

export function getFunnelFooterConfig({
  step,
  hasSelectedAnswer,
  isShowingReassurance,
}: {
  step: FunnelStep;
  hasSelectedAnswer: boolean;
  isShowingReassurance: boolean;
}): FunnelFooterConfig | null {
  if (step.kind === "single_choice") {
    if (isShowingReassurance) return null;
    return {
      label: "Continue",
      disabled: !hasSelectedAnswer,
      action: "advance_choice",
    };
  }

  if (step.kind === "result") {
    return {
      label: "Unlock my plan",
      disabled: false,
      action: "result_unlock_clicked",
    };
  }

  if (step.kind === "summary") {
    return {
      label: "Save my plan",
      disabled: false,
      action: "summary_save_clicked",
    };
  }

  if (step.kind === "info" || step.kind === "projection") {
    return {
      label: "Continue",
      disabled: false,
      action: "continue_clicked",
    };
  }

  // Breathing exercise: Continue stays locked until the exercise completes
  // (completion is recorded as the step's answer, like a selection).
  if (step.kind === "breathing") {
    return {
      label: "Continue",
      disabled: !hasSelectedAnswer,
      action: "continue_clicked",
    };
  }

  return null;
}
