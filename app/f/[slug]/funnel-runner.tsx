"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";

import { RESUME_PARAM } from "@/app/components/embedded-checkout-button";
import { trackMetaEvent } from "@/app/components/meta-pixel-events";
import {
  answerSegments,
  resolveTemplate,
  type FunnelAnalyticsProperties,
} from "@/lib/funnels/personalization";
import type { FunnelConfig, FunnelStep } from "@/lib/funnels/types";

import { ACCOUNT_DONE_PARAM } from "./account-step";
import { INTENTIONAL_DEPARTURE_KEY } from "./funnel-constants";
import { FunnelFooter } from "./funnel-footer";
import { FunnelShell } from "./funnel-shell";
import { FunnelStepRenderer } from "./funnel-step-renderer";

const REASSURANCE_DURATION = 2800; // ms to show reassuring toast before advancing
const INTERSTITIAL_DURATION = 4000; // ms before an interstitial auto-advances

function stepTitle(step: FunnelStep): string {
  switch (step.kind) {
    case "single_choice":
    case "text_input":
      return step.question;
    case "account":
    case "info":
    case "interstitial":
    case "offer":
    case "result":
    case "summary":
      return step.title;
  }
}

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

export function FunnelRunner({ funnel }: { funnel: FunnelConfig }) {
  const [currentId, setCurrentId] = useState(funnel.steps[0].id);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Server-saved answers from earlier in the session (or a previous visit),
  // kept separate from `answers` so quiz options never render pre-selected —
  // these only feed personalized copy (templates, summary, paywall).
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [reassuring, setReassuring] = useState<{ stepId: string; text: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [allowOptionHover, setAllowOptionHover] = useState(false);
  const funnelViewFired = useRef(false);
  const confettiFired = useRef(false);
  const reassuranceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resumeParamsHandled, setResumeParamsHandled] = useState(false);

  // Fire web_funnel_viewed + Meta ViewContent once on first render.
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

  // Rehydrate answers persisted server-side. Local state resets across the
  // OAuth/login round-trips, which silently degrades the personalized
  // summary/paywall copy to its generic fallbacks for exactly the users who
  // invested the most.
  useEffect(() => {
    fetch("/api/funnel-answer")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { answers?: Record<string, string> } | null) => {
        if (!data?.answers || Object.keys(data.answers).length === 0) return;
        setSavedAnswers(data.answers);
      })
      .catch(() => {});
  }, []);

  // Personalized copy reads from the merged view; live picks win over the
  // server snapshot. Option highlighting deliberately uses `answers` only.
  const effectiveAnswers = useMemo(
    () => ({ ...savedAnswers, ...answers }),
    [answers, savedAnswers],
  );

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

    if (nextStepId) setCurrentId(nextStepId);
    setResumeParamsHandled(true);
  }, [funnel.steps]);

  const step = funnel.steps.find((s) => s.id === currentId)!;
  const accountIndex = funnel.steps.findIndex((s) => s.kind === "account");
  const showProgress =
    accountIndex > 0 && step.kind !== "account" && step.kind !== "offer";
  const estimatedTotal = Math.max(accountIndex - 2, 1);
  const ratio = Math.min(history.length, estimatedTotal) / estimatedTotal;
  const progressPct = Math.round(12 + 88 * Math.pow(ratio, 0.6));
  const stepEnteredAt = useRef(Date.now());
  const lastCompletedStepId = useRef<string | null>(null);
  const lastStepViewKey = useRef("");
  const latestStep = useRef(step);
  const latestAnswers = useRef(effectiveAnswers);
  const latestHistoryLength = useRef(history.length);
  const latestProgressPct = useRef(progressPct);

  latestStep.current = step;
  latestAnswers.current = effectiveAnswers;
  latestHistoryLength.current = history.length;
  latestProgressPct.current = progressPct;

  const trackStepCompleted = useCallback(
    ({
      completedStep,
      nextId,
      action,
      extraProps = {},
      answersForEvent = effectiveAnswers,
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
    [effectiveAnswers, funnel, history.length, progressPct],
  );

  // Step-level impressions are the denominator for diagnosing funnel drop-off.
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
        answers: effectiveAnswers,
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
          answers: effectiveAnswers,
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
          answers: effectiveAnswers,
          historyLength: history.length,
          progressPct,
        }),
      });
    }
  }, [currentId, effectiveAnswers, funnel, history, progressPct, resumeParamsHandled, step]);

  // A pagehide while someone is in the quiz is the closest signal we have for
  // "dropped here". Intentional exits (checkout/auth) set a short-lived marker.
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
      setReassuring(null);
    };
  }, [currentId]);

  // A new question can appear under a stationary cursor after auto-advance.
  // Keep hover styling off until the pointer actually moves on that question.
  useEffect(() => {
    setAllowOptionHover(false);
  }, [currentId]);

  // Find the next sequential step in the array (default advance when no nextId).
  const defaultNext = useCallback(
    (fromId: string): string | null => {
      const idx = funnel.steps.findIndex((s) => s.id === fromId);
      if (idx < 0 || idx >= funnel.steps.length - 1) return null;
      return funnel.steps[idx + 1].id;
    },
    [funnel.steps],
  );

  const navigate = useCallback(
    (stepId: string) => {
      setHistory((prev) => [...prev, currentId]);
      setCurrentId(stepId);
    },
    [currentId],
  );

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    posthog.capture("web_funnel_back_clicked", {
      ...stepAnalyticsProperties({
        funnel,
        step,
        answers: effectiveAnswers,
        historyLength: history.length,
        progressPct,
      }),
      to_step_id: prev,
      time_on_step_ms: Math.max(0, Date.now() - stepEnteredAt.current),
    });
    setHistory((h) => h.slice(0, -1));
    setCurrentId(prev);
  }, [effectiveAnswers, funnel, history, progressPct, step]);

  // App-onboarding model: tapping an option only *selects* it (highlights and
  // persists), and the pinned Continue button advances. Splitting selection
  // from advancement lets the user change their mind before committing.
  const selectChoice = useCallback(
    (stepId: string, optionId: string) => {
      setAnswers((prev) => ({ ...prev, [stepId]: optionId }));

      // Persist the answer server-side so it survives the OAuth redirect.
      fetch("/api/funnel-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_id: stepId,
          answer: { option_id: optionId },
          funnel_slug: funnel.slug,
        }),
        keepalive: true,
      }).catch(() => {});
    },
    [funnel.slug],
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

  // Free-text answer (e.g. the user's name). Stored and persisted like a
  // choice — the trimmed string goes in the `option_id` slot so it rehydrates
  // through the existing /api/funnel-answer contract. Not sent to PostHog
  // (can be PII); only the fact that the step was completed is tracked.
  const submitText = useCallback(
    (stepId: string, value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setAnswers((prev) => ({ ...prev, [stepId]: trimmed }));

      fetch("/api/funnel-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_id: stepId,
          answer: { option_id: trimmed },
          funnel_slug: funnel.slug,
        }),
        keepalive: true,
      }).catch(() => {});

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
    [defaultNext, effectiveAnswers, funnel.slug, funnel.steps, navigate, trackStepCompleted],
  );

  // Interstitial auto-advances after a short, intentional pause.
  useEffect(() => {
    if (step.kind !== "interstitial") return;
    const nextId = defaultNext(step.id);
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
  }, [currentId, step, defaultNext, navigate, trackStepCompleted]);

  // Resolve templates for dynamic interstitial / result / info text.
  const displayTitle =
    step.kind === "interstitial" ||
    step.kind === "result" ||
    step.kind === "info" ||
    step.kind === "summary"
      ? resolveTemplate(step.title, effectiveAnswers, funnel.steps)
      : step.kind === "single_choice" || step.kind === "text_input"
        ? resolveTemplate(step.question, effectiveAnswers, funnel.steps)
        : step.kind === "offer"
          ? step.title
          : "";

  const displayBody =
    step.kind === "interstitial" ||
    step.kind === "result" ||
    step.kind === "info" ||
    step.kind === "summary"
      ? resolveTemplate(step.body, effectiveAnswers, funnel.steps)
      : step.kind === "single_choice" || step.kind === "text_input"
        ? resolveTemplate(step.subtext ?? "", effectiveAnswers, funnel.steps)
        : step.kind === "offer"
          ? step.body
          : "";

  // Front-loaded progress bar. The fill is deliberately biased ahead of the
  // user's true position (curve exponent < 1, non-zero base) so the bar always
  // reads "almost there" — a well-worn nudge that lifts quiz completion. Driven
  // by how many steps the user has actually visited (history length), not the
  // array index, so the goal-branch fork doesn't make the bar jump. The "-2"
  // accounts for the two branch follow-ups every user skips, so the bar still
  // reaches ~100% by the result/summary regardless of which branch they took.

  const canGoBack =
    history.length > 0 &&
    step.kind !== "result" &&
    step.kind !== "interstitial";

  const advanceWith = (action: string) => {
    const nextId = defaultNext(step.id);
    trackStepCompleted({ completedStep: step, nextId, action });
    if (nextId) navigate(nextId);
  };

  const footer = (() => {
    const showFooter =
      (step.kind === "single_choice" && reassuring?.stepId !== step.id) ||
      step.kind === "info" ||
      step.kind === "result" ||
      step.kind === "summary";
    if (!showFooter) return null;

    if (step.kind === "single_choice") {
      return {
        label: "Continue",
        disabled: !answers[step.id],
        onClick: () => advanceChoice(step),
      };
    }

    if (step.kind === "result") {
      return {
        label: "Unlock my plan",
        disabled: false,
        onClick: () => advanceWith("result_unlock_clicked"),
      };
    }

    if (step.kind === "summary") {
      return {
        label: "Save my plan",
        disabled: false,
        onClick: () => advanceWith("summary_save_clicked"),
      };
    }

    return {
      label: "Continue",
      disabled: false,
      onClick: () => advanceWith("continue_clicked"),
    };
  })();

  return (
    <FunnelShell
      canGoBack={canGoBack}
      showProgress={showProgress}
      progressPct={progressPct}
      onBack={goBack}
    >
      <div className="funnelStep" key={step.id}>
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

      {footer ? (
        <FunnelFooter
          label={footer.label}
          disabled={footer.disabled}
          onClick={footer.onClick}
        />
      ) : null}
    </FunnelShell>
  );
}
