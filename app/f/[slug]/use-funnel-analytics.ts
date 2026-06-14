"use client";

import { useCallback, useEffect, useRef } from "react";
import posthog from "posthog-js";

import { trackMetaEvent } from "@/app/components/meta-pixel-events";
import {
  answerSegments,
  type FunnelAnalyticsProperties,
} from "@/lib/funnels/personalization";
import { stepTitle } from "@/lib/funnels/step-display";
import type { FunnelConfig, FunnelStep } from "@/lib/funnels/types";

import { INTENTIONAL_DEPARTURE_KEY } from "./funnel-constants";

function stepAnalyticsProperties({
  funnel,
  step,
  answers,
  historyLength,
  progressPct,
}: {
  funnel: FunnelConfig;
  step: FunnelStep;
  answers: Record<string, string>;
  historyLength: number;
  progressPct: number;
}): FunnelAnalyticsProperties {
  return {
    funnel_slug: funnel.slug,
    funnel_name: funnel.name,
    step_id: step.id,
    step_kind: step.kind,
    step_title: stepTitle(step).slice(0, 120),
    step_index: funnel.steps.findIndex((s) => s.id === step.id) + 1,
    step_count: funnel.steps.length,
    visited_step_count: historyLength + 1,
    progress_pct: progressPct,
    ...answerSegments(funnel.personalization, answers),
  };
}

export function useFunnelAnalytics({
  funnel,
  step,
  currentId,
  answers,
  history,
  progressPct,
  resumeParamsHandled,
}: {
  funnel: FunnelConfig;
  step: FunnelStep;
  currentId: string;
  answers: Record<string, string>;
  history: string[];
  progressPct: number;
  resumeParamsHandled: boolean;
}) {
  const funnelViewFired = useRef(false);
  const stepEnteredAt = useRef(Date.now());
  const lastCompletedStepId = useRef<string | null>(null);
  const lastStepViewKey = useRef("");
  const latestStep = useRef(step);
  const latestAnswers = useRef(answers);
  const latestHistoryLength = useRef(history.length);
  const latestProgressPct = useRef(progressPct);

  latestStep.current = step;
  latestAnswers.current = answers;
  latestHistoryLength.current = history.length;
  latestProgressPct.current = progressPct;

  useEffect(() => {
    if (funnelViewFired.current) return;
    funnelViewFired.current = true;
    posthog.capture("web_funnel_viewed", {
      funnel_slug: funnel.slug,
      funnel_name: funnel.name,
    });
    trackMetaEvent("ViewContent", {
      content_name: funnel.name,
    });
  }, [funnel.slug, funnel.name]);

  const trackStepCompleted = useCallback(
    ({
      completedStep,
      nextId,
      action,
      extraProps = {},
      answersForEvent = answers,
    }: {
      completedStep: FunnelStep;
      nextId: string | null;
      action: string;
      extraProps?: FunnelAnalyticsProperties;
      answersForEvent?: Record<string, string>;
    }) => {
      const timeOnStepMs = Math.max(0, Date.now() - stepEnteredAt.current);
      lastCompletedStepId.current = completedStep.id;
      posthog.capture("web_funnel_step_completed", {
        ...stepAnalyticsProperties({
          funnel,
          step: completedStep,
          answers: answersForEvent,
          historyLength: history.length,
          progressPct,
        }),
        action,
        next_step_id: nextId,
        time_on_step_ms: timeOnStepMs,
        ...extraProps,
      });
    },
    [answers, funnel, history.length, progressPct],
  );

  const trackBackClicked = useCallback(
    (toStepId: string) => {
      posthog.capture("web_funnel_back_clicked", {
        ...stepAnalyticsProperties({
          funnel,
          step,
          answers,
          historyLength: history.length,
          progressPct,
        }),
        to_step_id: toStepId,
        time_on_step_ms: Math.max(0, Date.now() - stepEnteredAt.current),
      });
    },
    [answers, funnel, history.length, progressPct, step],
  );

  useEffect(() => {
    if (!resumeParamsHandled) return;

    const viewKey = `${currentId}:${history.length}`;
    if (lastStepViewKey.current === viewKey) return;
    lastStepViewKey.current = viewKey;

    stepEnteredAt.current = Date.now();
    posthog.capture("web_funnel_step_viewed", {
      ...stepAnalyticsProperties({
        funnel,
        step,
        answers,
        historyLength: history.length,
        progressPct,
      }),
      previous_step_id: history[history.length - 1] ?? null,
    });

    if (step.kind === "result") {
      posthog.capture("web_funnel_result_viewed", {
        ...stepAnalyticsProperties({
          funnel,
          step,
          answers,
          historyLength: history.length,
          progressPct,
        }),
      });
    }

    if (step.kind === "summary") {
      posthog.capture("web_funnel_summary_viewed", {
        ...stepAnalyticsProperties({
          funnel,
          step,
          answers,
          historyLength: history.length,
          progressPct,
        }),
      });
    }
  }, [answers, currentId, funnel, history, progressPct, resumeParamsHandled, step]);

  useEffect(() => {
    function reportAbandonment() {
      try {
        if (window.sessionStorage.getItem(INTENTIONAL_DEPARTURE_KEY) === "1") {
          window.sessionStorage.removeItem(INTENTIONAL_DEPARTURE_KEY);
          return;
        }
      } catch {
        // If storage is blocked, still capture the best-effort exit event.
      }

      const activeStep = latestStep.current;
      const timeOnStepMs = Math.max(0, Date.now() - stepEnteredAt.current);
      posthog.capture("web_funnel_step_abandoned", {
        ...stepAnalyticsProperties({
          funnel,
          step: activeStep,
          answers: latestAnswers.current,
          historyLength: latestHistoryLength.current,
          progressPct: latestProgressPct.current,
        }),
        last_completed_step_id: lastCompletedStepId.current,
        time_on_step_ms: timeOnStepMs,
      });
    }

    window.addEventListener("pagehide", reportAbandonment);
    return () => window.removeEventListener("pagehide", reportAbandonment);
  }, [funnel]);

  return { trackBackClicked, trackStepCompleted };
}
