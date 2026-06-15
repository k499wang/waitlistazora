"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RESUME_PARAM } from "@/app/components/embedded-checkout-button";
import { resolveStepDisplayCopy } from "@/lib/funnels/step-display";
import type { FunnelConfig, FunnelStep } from "@/lib/funnels/types";

import { ACCOUNT_DONE_PARAM } from "./account-step";
import { FunnelFooter } from "./funnel-footer";
import { getFunnelFooterConfig } from "./funnel-footer-config";
import { FunnelShell } from "./funnel-shell";
import { FunnelStepRenderer } from "./funnel-step-renderer";
import { useFunnelAnswers } from "./use-funnel-answers";
import { useFunnelAnalytics } from "./use-funnel-analytics";
import { useFunnelNavigation } from "./use-funnel-navigation";

const REASSURANCE_DURATION = 2800; // ms to show reassuring toast before advancing
const INTERSTITIAL_DURATION = 10800; // ms before an interstitial auto-advances
const SCALE_ADVANCE_DELAY = 650; // ms after a scale tap before auto-advancing

export function FunnelRunner({ funnel }: { funnel: FunnelConfig }) {
  const {
    currentId,
    step,
    history,
    previousStepId,
    defaultNext,
    navigate,
    replace,
    goBack: navigateBack,
  } = useFunnelNavigation(funnel.steps);
  const { answers, effectiveAnswers, recordAnswer } = useFunnelAnswers(
    funnel.slug,
  );
  const [reassuring, setReassuring] = useState<{ stepId: string; text: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [allowOptionHover, setAllowOptionHover] = useState(false);
  const confettiFired = useRef(false);
  const reassuranceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scaleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resumeParamsHandled, setResumeParamsHandled] = useState(false);

  // Handle auth/checkout resume params before step impressions fire. Otherwise
  // a resume load starts at step 1 long enough to record a false first-step view.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let nextStepId: string | null = null;

    // Post-login checkout resume: an offer click while logged out bounces
    // through /login and lands back here with ?resume_checkout=<offer>.
    if (params.has(RESUME_PARAM)) {
      const offerStep = funnel.steps.find((s) => s.kind === "offer");
      nextStepId = offerStep?.id ?? null;
    }

    // Post-auth funnel resume: Google OAuth or /auth/finalize land back here
    // with ?account_done=1. Strip the param so a refresh doesn't replay it.
    if (params.has(ACCOUNT_DONE_PARAM)) {
      params.delete(ACCOUNT_DONE_PARAM);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${params.toString() ? `?${params}` : ""}`,
      );
      const accountStep = funnel.steps.find((s) => s.kind === "account");
      nextStepId = accountStep?.id ?? nextStepId;
    }

    if (nextStepId) replace(nextStepId);
    setResumeParamsHandled(true);
  }, [funnel.steps, replace]);

  const accountIndex = funnel.steps.findIndex((s) => s.kind === "account");
  const showProgress =
    accountIndex > 0 && step.kind !== "account" && step.kind !== "offer";
  const estimatedTotal = Math.max(accountIndex - 2, 1);
  const ratio = Math.min(history.length, estimatedTotal) / estimatedTotal;
  const progressPct = Math.round(12 + 88 * Math.pow(ratio, 0.6));
  const { trackBackClicked, trackStepCompleted } = useFunnelAnalytics({
    funnel,
    step,
    currentId,
    answers: effectiveAnswers,
    history,
    progressPct,
    resumeParamsHandled,
  });

  // Trigger confetti once when the result step first appears.
  useEffect(() => {
    if (step.kind !== "result" || confettiFired.current) return;
    confettiFired.current = true;
    setShowConfetti(true);
  }, [currentId, step.kind]);

  // Cancel any pending reassurance timeout when the step changes (e.g. user
  // clicked Back during the 1.7s toast — don't drag them forward).
  useEffect(() => {
    return () => {
      if (reassuranceTimer.current) {
        clearTimeout(reassuranceTimer.current);
        reassuranceTimer.current = null;
      }
      if (scaleTimer.current) {
        clearTimeout(scaleTimer.current);
        scaleTimer.current = null;
      }
      setReassuring(null);
    };
  }, [currentId]);

  // A new question can appear under a stationary cursor after auto-advance.
  // Keep hover styling off until the pointer actually moves on that question.
  useEffect(() => {
    setAllowOptionHover(false);
  }, [currentId]);

  const goBack = useCallback(() => {
    if (!previousStepId) return;
    trackBackClicked(previousStepId);
    navigateBack();
  }, [navigateBack, previousStepId, trackBackClicked]);

  // App-onboarding model: tapping an option only *selects* it (highlights and
  // persists), and the pinned Continue button advances. Splitting selection
  // from advancement lets the user change their mind before committing.
  const selectChoice = useCallback(
    (stepId: string, optionId: string) => {
      recordAnswer(stepId, optionId);
    },
    [recordAnswer],
  );

  const advanceChoice = useCallback(
    (s: Extract<FunnelStep, { kind: "single_choice" }>) => {
      const optionId = effectiveAnswers[s.id];
      if (!optionId) return;
      const opt = s.options.find((o) => o.id === optionId);
      const nextId = opt?.nextId ?? defaultNext(s.id);

      trackStepCompleted({
        completedStep: s,
        nextId,
        action: "answer_selected",
        answersForEvent: effectiveAnswers,
        extraProps: {
          option_id: optionId,
          option_label: opt?.label ?? null,
          option_position: s.options.findIndex((o) => o.id === optionId) + 1,
          has_reassurance_delay: Boolean(s.reassurance && nextId),
          reassurance_delay_ms:
            s.reassurance && nextId ? REASSURANCE_DURATION : null,
        },
      });

      // Calm-style reassuring toast: pause briefly before advancing.
      if (s.reassurance && nextId) {
        const targetId = nextId;
        setReassuring({ stepId: s.id, text: s.reassurance });
        reassuranceTimer.current = setTimeout(() => {
          setReassuring(null);
          reassuranceTimer.current = null;
          navigate(targetId);
        }, REASSURANCE_DURATION);
        return;
      }

      if (nextId) navigate(nextId);
    },
    [defaultNext, effectiveAnswers, navigate, trackStepCompleted],
  );

  // Agree/disagree scale: tapping a point records it and schedules a brief,
  // resettable auto-advance. Re-tapping before it fires updates the answer and
  // restarts the timer, so a mistap can be corrected. Completion is tracked
  // when the advance actually fires (with the committed value).
  const selectScale = useCallback(
    (s: Extract<FunnelStep, { kind: "scale" }>, value: string) => {
      recordAnswer(s.id, value);
      if (scaleTimer.current) clearTimeout(scaleTimer.current);
      const nextId = defaultNext(s.id);
      scaleTimer.current = setTimeout(() => {
        scaleTimer.current = null;
        trackStepCompleted({
          completedStep: s,
          nextId,
          action: "scale_selected",
          answersForEvent: { ...effectiveAnswers, [s.id]: value },
          extraProps: { scale_value: Number(value) },
        });
        if (nextId) navigate(nextId);
      }, SCALE_ADVANCE_DELAY);
    },
    [defaultNext, effectiveAnswers, navigate, recordAnswer, trackStepCompleted],
  );

  // Free-text answer (e.g. the user's name). Stored and persisted like a
  // choice — the trimmed string goes in the `option_id` slot so it rehydrates
  // through the existing /api/funnel-answer contract. Not sent to PostHog
  // (can be PII); only the fact that the step was completed is tracked.
  const submitText = useCallback(
    (stepId: string, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      recordAnswer(stepId, trimmed);

      const s = funnel.steps.find((st) => st.id === stepId);
      const nextId = defaultNext(stepId);
      if (s) {
        trackStepCompleted({
          completedStep: s,
          nextId,
          action: "text_submitted",
          answersForEvent: { ...effectiveAnswers, [stepId]: trimmed },
          extraProps: { answer_length: trimmed.length },
        });
      }
      if (nextId) navigate(nextId);
    },
    [defaultNext, effectiveAnswers, funnel.steps, navigate, recordAnswer, trackStepCompleted],
  );

  // Info screens and "analyzing…" interstitials may route conditionally on a
  // prior answer (step.branch), so a reassurance/loader can sit *before* a fork.
  // Info screens may also force an unconditional convergence target (step.nextId)
  // — e.g. branched archetype reveals that all flow into the same next screen.
  // Falls back to the natural next step otherwise.
  const resolveNext = useCallback(
    (s: FunnelStep): string | null => {
      if ((s.kind === "info" || s.kind === "interstitial") && s.branch) {
        const answer = effectiveAnswers[s.branch.on];
        const target = answer ? s.branch.to[answer] : undefined;
        if (target) return target;
      }
      if (s.kind === "info" && s.nextId) return s.nextId;
      return defaultNext(s.id);
    },
    [defaultNext, effectiveAnswers],
  );

  // Interstitial auto-advances after a short, intentional pause.
  useEffect(() => {
    if (step.kind !== "interstitial") return;
    const nextId = resolveNext(step);
    if (!nextId) return;
    const t = setTimeout(() => {
      trackStepCompleted({
        completedStep: step,
        nextId,
        action: "auto_advance",
        extraProps: { auto_advance_delay_ms: INTERSTITIAL_DURATION },
      });
      navigate(nextId);
    }, INTERSTITIAL_DURATION);
    return () => clearTimeout(t);
  }, [currentId, step, resolveNext, navigate, trackStepCompleted]);

  const { title: displayTitle, body: displayBody } = resolveStepDisplayCopy({
    step,
    answers: effectiveAnswers,
    steps: funnel.steps,
  });

  // Front-loaded progress bar. The fill is deliberately biased ahead of the
  // user's true position (curve exponent < 1, non-zero base) so the bar always
  // reads "almost there" — a well-worn nudge that lifts quiz completion. Driven
  // by how many steps the user has actually visited (history length), not the
  // array index, so the goal-branch fork doesn't make the bar jump. The "-2"
  // accounts for the two branch follow-ups every user skips, so the bar still
  // reaches ~100% by the result/summary regardless of which branch they took.

  const canGoBack =
    previousStepId !== null &&
    step.kind !== "result" &&
    step.kind !== "interstitial";

  const advanceWith = (action: string) => {
    const nextId = resolveNext(step);
    trackStepCompleted({ completedStep: step, nextId, action });
    if (nextId) navigate(nextId);
  };

  const footerConfig = getFunnelFooterConfig({
    step,
    hasSelectedAnswer: Boolean(answers[step.id]),
    isShowingReassurance: reassuring?.stepId === step.id,
  });

  const onFooterClick = () => {
    if (!footerConfig) return;
    if (footerConfig.action === "advance_choice" && step.kind === "single_choice") {
      advanceChoice(step);
      return;
    }
    advanceWith(footerConfig.action);
  };

  return (
    <FunnelShell
      canGoBack={canGoBack}
      showProgress={showProgress}
      progressPct={progressPct}
      onBack={goBack}
    >
      <div className="funnelStep" data-step-kind={step.kind} key={step.id}>
        <FunnelStepRenderer
          funnel={funnel}
          step={step}
          title={displayTitle}
          body={displayBody}
          answers={answers}
          effectiveAnswers={effectiveAnswers}
          reassuringText={
            reassuring?.stepId === step.id ? reassuring.text : undefined
          }
          allowOptionHover={allowOptionHover}
          showConfetti={showConfetti}
          onEnableHover={() => setAllowOptionHover(true)}
          onSelectChoice={selectChoice}
          onSelectScale={(stepId, value) => {
            if (step.kind === "scale") selectScale(step, value);
          }}
          onSubmitText={submitText}
          onAccountContinue={() => {
            const nextId = defaultNext(step.id);
            trackStepCompleted({
              completedStep: step,
              nextId,
              action: "account_continue_clicked",
            });
            if (nextId) navigate(nextId);
          }}
        />
      </div>

      {footerConfig ? (
        <FunnelFooter
          label={footerConfig.label}
          disabled={footerConfig.disabled}
          onClick={onFooterClick}
        />
      ) : null}
    </FunnelShell>
  );
}
