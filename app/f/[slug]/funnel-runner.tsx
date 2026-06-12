"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import posthog from "posthog-js";

import { OFFERS } from "@/lib/checkout/offers";
import { OFFER_DISPLAY } from "@/lib/checkout/offer-display";
import { CheckoutForm } from "@/app/components/checkout-form";
import { RESUME_PARAM } from "@/app/components/embedded-checkout-button";
import { trackMetaEvent } from "@/app/components/meta-pixel-events";
import type { FunnelConfig, FunnelStep } from "@/lib/funnels/types";

import {
  ACCOUNT_DONE_PARAM,
  FunnelAccountStep,
  useSupabaseSession,
} from "./account-step";
import {
  DISCOUNT_TIMER_MS,
  DiscountSpinnerOverlay,
  readSpinDiscount,
  type SpinDiscount,
} from "./discount-spinner";
import { InfoStepVisual, StressProjection } from "./info-visuals";

const REASSURANCE_DURATION = 2800; // ms to show reassuring toast before advancing
const INTERSTITIAL_DURATION = 4000; // ms before an interstitial auto-advances
const INTENTIONAL_DEPARTURE_KEY = "azora_funnel_intentional_departure";

type FunnelAnalyticsValue = string | number | boolean | null;
type FunnelAnalyticsProperties = Record<string, FunnelAnalyticsValue>;

function answerSegments(answers: Record<string, string>): FunnelAnalyticsProperties {
  return {
    goal: answers.goal ?? null,
    branch_answer:
      answers.stress_body ?? answers.sleep_mind ?? answers.general_feel ?? null,
    tried_before: answers.tried_before ?? null,
    me_time: answers.me_time ?? null,
    peace_time: answers.peace_time ?? null,
    calm_duration: answers.calm_duration ?? null,
    body_signal: answers.body_signal ?? null,
    reset_blocker: answers.reset_blocker ?? null,
  };
}

function stepTitle(step: FunnelStep): string {
  switch (step.kind) {
    case "single_choice":
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
    ...answerSegments(answers),
  };
}

/** Resolve {{step_id}} placeholders in template strings against user answers. */
function resolveTemplate(
  text: string,
  answers: Record<string, string>,
  steps: FunnelStep[],
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const answerId = answers[key];
    if (!answerId) return "";
    const step = steps.find((s) => s.id === key);
    if (step?.kind === "single_choice") {
      const opt = step.options.find((o) => o.id === answerId);
      return opt?.label ?? answerId;
    }
    return answerId;
  });
}

/** Confetti particle configs — deterministic so SSR/hydration match. */
const CONFETTI_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 37) % 90}%`,
  delay: `${(i * 0.07).toFixed(2)}s`,
  size: `${6 + (i % 8)}px`,
  hue: ((i * 47 + 180) % 360),
  drift: `${-20 + (i % 40)}px`,
}));

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

  const choose = useCallback(
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

      // Determine next step: explicit nextId on the option, or sequential.
      const s = funnel.steps.find((st) => st.id === stepId);
      const opt =
        s?.kind === "single_choice"
          ? s.options.find((o) => o.id === optionId)
          : null;
      const nextId = opt?.nextId ?? defaultNext(stepId);
      const nextAnswers = { ...effectiveAnswers, [stepId]: optionId };

      if (s) {
        trackStepCompleted({
          completedStep: s,
          nextId,
          action: "answer_selected",
          answersForEvent: nextAnswers,
          extraProps: {
            option_id: optionId,
            option_label: opt?.label ?? null,
            option_position:
              s.kind === "single_choice"
                ? s.options.findIndex((o) => o.id === optionId) + 1
                : null,
            has_reassurance_delay:
              s.kind === "single_choice" && Boolean(s.reassurance && nextId),
            reassurance_delay_ms:
              s.kind === "single_choice" && s.reassurance && nextId
                ? REASSURANCE_DURATION
                : null,
          },
        });
      }

      // Calm-style reassuring toast: pause briefly before advancing.
      if (s?.kind === "single_choice" && s.reassurance && nextId) {
        const targetId = nextId;
        setReassuring({ stepId, text: s.reassurance });
        reassuranceTimer.current = setTimeout(() => {
          setReassuring(null);
          reassuranceTimer.current = null;
          navigate(targetId);
        }, REASSURANCE_DURATION);
        return;
      }

      if (nextId) navigate(nextId);
    },
    [
      defaultNext,
      effectiveAnswers,
      funnel.slug,
      funnel.steps,
      navigate,
      trackStepCompleted,
    ],
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
      : step.kind === "single_choice"
        ? step.question
        : step.kind === "offer"
          ? step.title
          : "";

  const displayBody =
    step.kind === "interstitial" ||
    step.kind === "result" ||
    step.kind === "info" ||
    step.kind === "summary"
      ? resolveTemplate(step.body, effectiveAnswers, funnel.steps)
      : step.kind === "single_choice"
        ? (step.subtext ?? "")
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

  return (
    <div className="container funnelContainer">
      {showProgress ? (
        <div
          className="funnelProgress"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="funnelProgressBar"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : null}

      {history.length > 0 && (step.kind === "single_choice" || step.kind === "info") ? (
        <button
          type="button"
          className="funnelBack"
          onClick={goBack}
        >
          ← Back
        </button>
      ) : null}

      <div className="funnelStep" key={step.id}>
        {step.kind === "single_choice" ? (
          <>
            {reassuring?.stepId === step.id ? (
              <div className="funnelReassurance" key={`re-${step.id}`}>
                <p className="funnelReassuranceText">{reassuring.text}</p>
              </div>
            ) : (
              <>
                <h1 className="funnelQuestion">{displayTitle}</h1>
                {displayBody ? (
                  <p className="funnelSubtext">{displayBody}</p>
                ) : null}
                <div
                  className={`funnelOptions${
                    allowOptionHover ? " funnelOptionsCanHover" : ""
                  }`}
                  onPointerMove={(event) => {
                    if (event.pointerType === "mouse") {
                      setAllowOptionHover(true);
                    }
                  }}
                >
                  {step.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`funnelOption${
                        answers[step.id] === opt.id
                          ? " funnelOptionSelected"
                          : ""
                      }`}
                      onClick={() => choose(step.id, opt.id)}
                    >
                      {opt.emoji ? (
                        <span className="funnelOptionEmoji" aria-hidden>
                          {opt.emoji}
                        </span>
                      ) : null}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : null}

        {step.kind === "interstitial" ? (
          <div className="funnelInterstitial">
            <div className="funnelSpinner" aria-hidden />
            {displayTitle ? (
              <h1 className="funnelQuestion">{displayTitle}</h1>
            ) : null}
            {displayBody ? (
              <p className="funnelSubtext">{displayBody}</p>
            ) : null}
          </div>
        ) : null}

        {step.kind === "info" ? (
          <div className="funnelInfo">
            {step.visual ? (
              <InfoStepVisual visual={step.visual} />
            ) : (
              <div className="funnelInfoIcon" aria-hidden>
                {step.icon}
              </div>
            )}
            <h1 className="funnelQuestion">{displayTitle}</h1>
            <p className="funnelSubtext">{displayBody}</p>
            {step.youtubeId ? (
              <div className="funnelVideoWrap">
                <iframe
                  className="funnelVideo"
                  src={`https://www.youtube-nocookie.com/embed/${step.youtubeId}?playsinline=1&rel=0`}
                  title="Demo: how Heart-Guided Breathing works"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : null}
            {step.institutions?.length ? (
              <div
                className="funnelInstitutions"
                aria-label="Research institutions"
              >
                {step.institutions.map((name) => (
                  <span key={name} className="funnelInstitution">
                    {name}
                  </span>
                ))}
              </div>
            ) : null}
            {step.citation ? (
              <p className="funnelCitation">{step.citation}</p>
            ) : null}
            <button
              type="button"
              className="funnelPrimaryBtn"
              onClick={() => {
                const nextId = defaultNext(step.id);
                trackStepCompleted({
                  completedStep: step,
                  nextId,
                  action: "continue_clicked",
                });
                if (nextId) navigate(nextId);
              }}
            >
              Continue
            </button>
          </div>
        ) : null}

        {step.kind === "result" ? (
          <div className="funnelResult">
            {showConfetti ? (
              <div className="confettiContainer" aria-hidden>
                {CONFETTI_PARTICLES.map((p) => (
                  <span
                    key={p.id}
                    className="confettiPiece"
                    style={{
                      left: p.left,
                      animationDelay: p.delay,
                      width: p.size,
                      height: p.size,
                      backgroundColor: `hsl(${p.hue}, 80%, 60%)`,
                      "--drift": p.drift,
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            ) : null}
            <div className="funnelResultBadge" aria-hidden>
              ✓
            </div>
            {displayTitle ? (
              <h1 className="funnelQuestion">{displayTitle}</h1>
            ) : null}
            {displayBody ? (
              <p className="funnelSubtext">{displayBody}</p>
            ) : null}
            <button
              type="button"
              className="funnelPrimaryBtn"
              onClick={() => {
                const nextId = defaultNext(step.id);
                trackStepCompleted({
                  completedStep: step,
                  nextId,
                  action: "result_unlock_clicked",
                });
                if (nextId) navigate(nextId);
              }}
            >
              Unlock my plan
            </button>
          </div>
        ) : null}

        {step.kind === "summary" ? (
          <SummaryStep
            title={displayTitle}
            body={displayBody}
            answers={effectiveAnswers}
            onContinue={() => {
              const nextId = defaultNext(step.id);
              trackStepCompleted({
                completedStep: step,
                nextId,
                action: "summary_save_clicked",
              });
              if (nextId) navigate(nextId);
            }}
          />
        ) : null}

        {step.kind === "account" ? (
          <FunnelAccountStep
            step={step}
            slug={funnel.slug}
            onContinue={() => {
              const nextId = defaultNext(step.id);
              trackStepCompleted({
                completedStep: step,
                nextId,
                action: "account_continue_clicked",
              });
              if (nextId) navigate(nextId);
            }}
          />
        ) : null}

        {step.kind === "offer" ? (
          <OfferStep step={step} answers={effectiveAnswers} funnelSlug={funnel.slug} />
        ) : null}
      </div>
    </div>
  );
}

// Paywall headline personalized to the goal picked in Q1. Falls back to the
// step's generic title when the answer is missing (e.g. post-OAuth resume,
// where local answer state resets).
const GOAL_HEADLINES: Record<string, string> = {
  stress: "Your plan for a calmer mind is ready",
  sleep: "Your plan for deeper sleep is ready",
  wellness: "Your plan to feel better every day is ready",
  focus: "Your plan for sharper focus is ready",
};

const DURATION_LABELS: Record<string, string> = {
  two_min: "2-minute",
  five_min: "5-minute",
  ten_min: "10-minute",
};

const PEACE_TIME_LABELS: Record<string, string> = {
  morning: "morning",
  midday: "midday",
  evening: "evening",
  late: "late-night",
};

// Short, card-friendly forms of each answer for the personalized plan recap.
// Full option labels are full sentences, so the summary uses these instead.
const GOAL_SHORT: Record<string, string> = {
  stress: "a calmer mind",
  sleep: "deeper sleep",
  wellness: "feeling better overall",
  focus: "sharper focus",
  explore: "a calmer mind",
};

const BODY_SIGNAL_SHORT: Record<string, string> = {
  shallow: "shallow breathing",
  heart: "a racing heart",
  tight: "tense shoulders and jaw",
  fatigue: "sudden fatigue",
};

// What they've tried, phrased for the "closes the loop" comparison line.
const TRIED_SHORT: Record<string, string> = {
  apps: "Meditation apps",
  videos: "Breathing videos",
  other: "Supplements and teas",
};

// Where the projection curve lands, named for the goal they picked — the
// chart forecasts *their* outcome, not a generic "calm".
const GOAL_END_LABELS: Record<string, string> = {
  stress: "Calm",
  sleep: "Rested",
  wellness: "Balanced",
  focus: "Clear",
  explore: "Calm",
};

/** Concrete date 2 weeks out (e.g. "Jun 24") so the forecast reads as a
 *  commitment, not a vague duration. Client-only steps, so no SSR mismatch. */
function projectionDateLabel(): string {
  return new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Plan rows derived from the user's answers, shared by the summary screen
 *  and the results-first recap on the paywall. */
function buildPlanRows(answers: Record<string, string>) {
  const goal = GOAL_SHORT[answers.goal] ?? "a calmer mind";
  const duration = DURATION_LABELS[answers.calm_duration] ?? "5-minute";
  const peaceTime = PEACE_TIME_LABELS[answers.peace_time] ?? "daily";
  const bodyFocus = BODY_SIGNAL_SHORT[answers.body_signal];
  return [
    { label: "Your goal", value: goal },
    { label: "Daily reset", value: `${duration} session, ${peaceTime}` },
    ...(bodyFocus ? [{ label: "Tuned for", value: bodyFocus }] : []),
    { label: "How it works", value: "Live camera heart-rate biofeedback" },
  ];
}

/** Personalized plan card + projection graph, reused on the summary screen and
 *  again at the top of the paywall (results-first framing). */
function PlanRecap({
  answers,
  showProjection = true,
}: {
  answers: Record<string, string>;
  showProjection?: boolean;
}) {
  return (
    <>
      <dl className="summaryPlanCard">
        {buildPlanRows(answers).map((row) => (
          <div key={row.label} className="summaryPlanRow">
            <dt className="summaryPlanLabel">{row.label}</dt>
            <dd className="summaryPlanValue">{row.value}</dd>
          </div>
        ))}
      </dl>

      {showProjection ? (
        <div className="summaryProjection">
          <p className="summaryProjectionTitle">Your stress, projected</p>
          <StressProjection
            endLabel={GOAL_END_LABELS[answers.goal] ?? "Calm"}
            targetDateLabel={`by ${projectionDateLabel()}`}
          />
        </div>
      ) : null}
    </>
  );
}

function SummaryStep({
  title,
  body,
  answers,
  onContinue,
}: {
  title: string;
  body: string;
  answers: Record<string, string>;
  onContinue: () => void;
}) {
  const tried = TRIED_SHORT[answers.tried_before];
  const duration = DURATION_LABELS[answers.calm_duration] ?? "5-minute";
  const peaceTime = PEACE_TIME_LABELS[answers.peace_time] ?? "daily";

  return (
    <div className="funnelSummary">
      {title ? <h1 className="funnelQuestion">{title}</h1> : null}
      {body ? <p className="funnelSubtext">{body}</p> : null}

      <PlanRecap answers={answers} />

      {/* Explicit forecast fed by their own answers — the "based on your
          answers, we predict" beat. First-session claim is observable in-app;
          keep the 2-week claim soft ("calmer baseline"), not medical. */}
      <div className="summaryPrediction">
        <p className="summaryPredictionKicker">Based on your answers</p>
        <p className="summaryPredictionText">
          We predict you&apos;ll watch your heart rate fall in your very first
          session — and feel a calmer baseline by{" "}
          <strong>{projectionDateLabel()}</strong> with your {duration}{" "}
          {peaceTime} resets.
        </p>
      </div>

      {tried ? (
        <p className="summaryCompare">
          <strong>{tried}</strong> gave you no feedback, so the habit never
          stuck. Your plan closes the loop — you&apos;ll watch it working from
          day one.
        </p>
      ) : null}

      <button type="button" className="funnelPrimaryBtn" onClick={onContinue}>
        Save my plan
      </button>
    </div>
  );
}

// PLACEHOLDER social proof — replace with real, verifiable customer reviews
// before running paid traffic. Fabricated testimonials in ads are an FTC /
// ad-platform compliance risk; these are wireframe copy only.
const TESTIMONIALS = [
  {
    name: "Maya R.",
    meta: "Member since 2025",
    text:
      "Watching my heart rate actually drop on screen is the first thing " +
      "that's ever made breathing exercises stick for me.",
  },
  {
    name: "James T.",
    meta: "Verified subscriber",
    text:
      "Two weeks in and my 3am wake-ups have basically stopped. Seeing the " +
      "streak build keeps me honest.",
  },
  {
    name: "Priya N.",
    meta: "Member since 2025",
    text:
      "I've tried every meditation app out there. This is the only one where " +
      "I can actually see it working.",
  },
];

/** Inline 5-star row. */
function Stars() {
  return (
    <span className="starRow" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

/** mm:ss for the "discount reserved" countdown. */
function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function OfferStep({
  step,
  answers,
  funnelSlug,
}: {
  step: Extract<FunnelStep, { kind: "offer" }>;
  answers: Record<string, string>;
  funnelSlug: string;
}) {
  const [plan, setPlan] = useState<"annual" | "weekly">("annual");
  const offer = OFFERS[plan];
  const display = OFFER_DISPLAY[plan];
  const { loaded, email } = useSupabaseSession();
  const offerEnteredAt = useRef(Date.now());

  // Spin-the-wheel discount. Read in an effect (not during render) so SSR and
  // the first client render match; until then neither the overlay nor the
  // discounted prices show. New visitors get the spinner overlay once;
  // returning visitors land with their discount already applied.
  const [discount, setDiscount] = useState<SpinDiscount | null>(null);
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    const existing = readSpinDiscount();
    if (existing) setDiscount(existing);
    else setShowSpinner(true);
  }, []);

  // Countdown ticks down from the moment the discount was claimed. After it
  // hits zero the timer disappears but the discount stays applied — the
  // price never actually changes.
  const [countdownMs, setCountdownMs] = useState(0);
  useEffect(() => {
    if (!discount) return;
    const tick = () =>
      setCountdownMs(
        Math.max(0, discount.claimedAt + DISCOUNT_TIMER_MS - Date.now()),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [discount]);

  // Fire web_paywall_viewed once when the offer step mounts, so paywall
  // conversion can be measured separately from quiz completion.
  const paywallViewFired = useRef(false);
  useEffect(() => {
    if (paywallViewFired.current) return;
    paywallViewFired.current = true;
    posthog.capture("web_paywall_viewed", {
      funnel_slug: funnelSlug,
      offer_key: step.offerKey,
      goal: answers.goal ?? null,
      spin_discount_claimed: readSpinDiscount() !== null,
    });
  }, [funnelSlug, step.offerKey, answers.goal]);

  function offerAnalyticsProperties(): FunnelAnalyticsProperties {
    return {
      funnel_slug: funnelSlug,
      step_id: step.id,
      step_kind: step.kind,
      default_offer_key: step.offerKey,
      selected_plan: plan,
      selected_offer_id: offer.offerId,
      selected_offer_name: offer.displayName,
      signed_in: email !== null,
      auth_loaded: loaded,
      spin_discount_claimed: discount !== null,
      discount_pct: discount?.pct ?? null,
      time_on_paywall_ms: Math.max(0, Date.now() - offerEnteredAt.current),
      ...answerSegments(answers),
    };
  }

  const title = GOAL_HEADLINES[answers.goal] ?? step.title;
  const duration = DURATION_LABELS[answers.calm_duration];
  const peaceTime = PEACE_TIME_LABELS[answers.peace_time];
  const body =
    duration && peaceTime
      ? `Try it free in the app. Built around a daily ${duration} ${peaceTime} reset.`
      : step.body;

  return (
    <div className="funnelOffer">
      {showSpinner && !discount ? (
        <DiscountSpinnerOverlay
          funnelSlug={funnelSlug}
          onClaim={(won) => {
            setDiscount(won);
            setShowSpinner(false);
          }}
        />
      ) : null}

      {/* Mini journey strip: makes the account requirement explicit instead of
          surprising the user with a login bounce when they hit the CTA. */}
      <ol className="offerSteps" aria-label="Checkout steps">
        <li className="offerStepDone">Plan built</li>
        <li className={email ? "offerStepDone" : "offerStepCurrent"}>Account</li>
        <li className={email ? "offerStepCurrent" : ""}>Unlock Pro</li>
      </ol>

      {title ? (
        <h1 className="funnelQuestion">{title}</h1>
      ) : null}
      {body ? (
        <p className="funnelSubtext">{body}</p>
      ) : null}

      {/* Results-first framing: the personalized plan the user just built,
          repeated at the point of payment so the value is in view at the CTA. */}
      <div className="offerRecap">
        <PlanRecap answers={answers} />
      </div>

      {discount ? (
        <div className="discountBanner" role="status">
          <span className="discountBannerPct">{discount.pct}% OFF</span>
          <span className="discountBannerText">applied to your plan</span>
          {countdownMs > 0 ? (
            <span className="discountBannerTimer">
              reserved for {formatCountdown(countdownMs)}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Plan toggle */}
      <div className="planToggle" role="radiogroup" aria-label="Billing period">
        {(["annual", "weekly"] as const).map((key) => {
          const d = OFFER_DISPLAY[key];
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={plan === key}
              className={`planToggleBtn${plan === key ? " planToggleBtnActive" : ""}`}
              onClick={() => {
                if (plan === key) return;
                posthog.capture("web_offer_plan_toggled", {
                  ...offerAnalyticsProperties(),
                  from_plan: plan,
                  to_plan: key,
                  to_offer_id: OFFERS[key].offerId,
                });
                setPlan(key);
              }}
            >
              <span className="planToggleLabel">
                {key === "annual" ? "Annual" : "Weekly"}
              </span>
              {d.badge ? (
                <span className="planToggleBadge">{d.badge}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Single checkout card */}
      <div className="checkoutCard">
        {/* Risk-reversal badge pinned to the card (not the CTA): defuses the
            "I'll forget to cancel" objection right where the price lives. */}
        <div className="checkoutGuaranteeBadge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V4l8-3zm-1.2 14.2l5.5-5.5-1.4-1.4-4.1 4.1-1.9-1.9-1.4 1.4 3.3 3.3z" />
          </svg>
          <span>Cancel anytime · we&apos;ll remind you 2 days before billing</span>
        </div>

        {/* Trial headline — the main message. */}
        <p className="checkoutTrialHeadline">
          {plan === "annual" ? (
            <>
              Try Azora <em className="freeAccent">free</em> for 7 days
            </>
          ) : (
            "No commitment"
          )}
        </p>
        {plan === "annual" ? (
          <p className="checkoutTrialSub">
            <strong>$0.00 today</strong> · cancel anytime during the trial
          </p>
        ) : null}

        {/* Pre-spin, the un-discounted anchor renders as the plain price (the
            spinner overlay is covering the card); winning the spin crosses it
            out and reveals the real price — which is what checkout charges. */}
        <div
          className={`checkoutCardPrice${discount ? " checkoutCardPriceDeal" : ""}`}
        >
          {discount ? (
            <span className="priceDealChip">{discount.pct}% OFF</span>
          ) : null}
          <p className="checkoutHeroPrice">
            {discount ? (
              <s className="priceAnchor">{display.anchorWeeklyPrice}</s>
            ) : null}
            <span className="priceHeroAmount">
              {discount ? display.weeklyPrice : display.anchorWeeklyPrice}
            </span>
            <span className="pricePeriod">/wk</span>
          </p>
          <p className="priceBillingNote">
            {display.billingNote}
            {/* Weekly's full price IS the weekly price above — skip the echo. */}
            {discount && plan === "annual" ? (
              <>
                {" · "}
                <s>{display.anchorFullPrice}</s> <strong>{display.price}{display.period}</strong>
              </>
            ) : null}
          </p>
        </div>

        {/* Feature checkmarks */}
        <ul className="checkoutFeatures">
          {display.features.map((feature) => (
            <li key={feature}>
              <svg
                className="checkoutFeatureIcon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <p className="checkoutAnchorNote">
          Everything a $300 wearable does — with just your phone.
        </p>

        {plan === "annual" ? (
          <ol className="trialTimeline" aria-label="How your free trial works">
            <li>
              <span className="trialTimelineDay">Today</span>
              <span className="trialTimelineText">
                Download the app, sign in, and watch your heart rate fall in
                your first session
              </span>
            </li>
            <li>
              <span className="trialTimelineDay">Day 5</span>
              <span className="trialTimelineText">
                Your daily streak builds and your stress trends take shape
              </span>
            </li>
            <li>
              <span className="trialTimelineDay">Day 7</span>
              <span className="trialTimelineText">
                Trial ends. Cancel anytime before and pay nothing
              </span>
            </li>
          </ol>
        ) : null}

        <CheckoutForm
          action={`/checkout/start?offer=${offer.key}`}
          offerKey={offer.key}
          onCheckoutStart={() => {
            posthog.capture("web_checkout_cta_clicked", {
              ...offerAnalyticsProperties(),
              cta_label:
                plan === "annual" ? "Start my free trial" : "Start now",
            });
          }}
          onCheckoutActive={() => {
            try {
              window.sessionStorage.setItem(INTENTIONAL_DEPARTURE_KEY, "1");
            } catch {
              // Best-effort guard against counting checkout as abandonment.
            }
          }}
          onCheckoutInactive={() => {
            try {
              window.sessionStorage.removeItem(INTENTIONAL_DEPARTURE_KEY);
            } catch {
              // Storage may be unavailable in locked-down browsers.
            }
          }}
        >
          <button type="submit" className="checkoutCta">
            {plan === "annual" ? "Start my free trial" : "Start now"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </CheckoutForm>

        <p className="checkoutDueToday">{display.dueTodayLine}</p>

        {/* Account status: reassure signed-in users their plan is attached;
            tell signed-out users upfront that checkout needs an account. */}
        {loaded ? (
          email ? (
            <p className="checkoutAccountNote checkoutAccountNoteSaved">
              ✓ Plan saved to <strong>{email}</strong>
            </p>
          ) : (
            <p className="checkoutAccountNote">
              Your subscription is linked to a free Azora account. You&apos;ll
              create one at checkout.
            </p>
          )
        ) : null}

        {/* Trust badges */}
        <div className="checkoutTrust">
          <span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 1 1 6 0v3H9z" />
            </svg>
            Secure checkout
          </span>
          <span>·</span>
          <span>Cancel anytime</span>
          <span>·</span>
          <span>Web &amp; app</span>
        </div>

        {/* Accuracy credibility: PPG validation, peer-reviewed sources. */}
        <div className="checkoutValidation">
          <p className="checkoutValidationLine">
            Heart rate via PPG, validated against ECG in peer-reviewed research
          </p>
          <p className="checkoutValidationSources">
            MIT Media Lab · Stanford Medicine · University Hospital Zurich
          </p>
        </div>
      </div>

      {/* Social proof: member reviews under the card, reinforcing the CTA. */}
      <section className="offerTestimonials" aria-label="Member reviews">
        <p className="offerTestimonialsHeading">What members say</p>
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="testimonialCard">
            <Stars />
            <blockquote className="testimonialText">{t.text}</blockquote>
            <figcaption className="testimonialMeta">
              <span className="testimonialName">{t.name}</span>
              <span className="testimonialSub">{t.meta}</span>
            </figcaption>
          </figure>
        ))}
      </section>
    </div>
  );
}
