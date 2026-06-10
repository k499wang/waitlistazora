"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [history, setHistory] = useState<string[]>([]);
  const [reassuring, setReassuring] = useState<{ stepId: string; text: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const funnelViewFired = useRef(false);
  const confettiFired = useRef(false);
  const reassuranceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Post-login checkout resume: an offer click while logged out bounces through
  // /login and lands back here with ?resume_checkout=<offer>. The runner always
  // starts at step 1, so jump straight to the offer step — otherwise the
  // EmbeddedCheckoutButton that auto-resumes the purchase never mounts. The
  // button itself strips the param and re-starts checkout without re-firing the
  // InitiateCheckout pixel (it already fired on the pre-login click).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(RESUME_PARAM)) return;
    const offerStep = funnel.steps.find((s) => s.kind === "offer");
    if (offerStep) setCurrentId(offerStep.id);
  }, [funnel.steps]);

  // Post-auth funnel resume: the account step's signup/sign-in round-trips
  // (Google OAuth or /auth/finalize) land back here with ?account_done=1.
  // Jump to the account step, which now renders its "plan saved" success
  // state and auto-advances to the offer. Strip the param so a refresh
  // doesn't replay the jump.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(ACCOUNT_DONE_PARAM)) return;
    params.delete(ACCOUNT_DONE_PARAM);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.toString() ? `?${params}` : ""}`,
    );
    const accountStep = funnel.steps.find((s) => s.kind === "account");
    if (accountStep) setCurrentId(accountStep.id);
  }, [funnel.steps]);

  const step = funnel.steps.find((s) => s.id === currentId)!;

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
    setHistory((h) => h.slice(0, -1));
    setCurrentId(prev);
  }, [history]);

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
    [funnel.steps, funnel.slug, navigate, defaultNext],
  );

  // Interstitial auto-advances after a short, intentional pause.
  useEffect(() => {
    if (step.kind !== "interstitial") return;
    const nextId = defaultNext(step.id);
    if (!nextId) return;
    const t = setTimeout(() => navigate(nextId), INTERSTITIAL_DURATION);
    return () => clearTimeout(t);
  }, [currentId, step.kind, defaultNext, navigate]);

  // Resolve templates for dynamic interstitial / result / info text.
  const displayTitle =
    step.kind === "interstitial" ||
    step.kind === "result" ||
    step.kind === "info" ||
    step.kind === "summary"
      ? resolveTemplate(step.title, answers, funnel.steps)
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
      ? resolveTemplate(step.body, answers, funnel.steps)
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
  const accountIndex = funnel.steps.findIndex((s) => s.kind === "account");
  const showProgress =
    accountIndex > 0 && step.kind !== "account" && step.kind !== "offer";
  const estimatedTotal = Math.max(accountIndex - 2, 1);
  const ratio = Math.min(history.length, estimatedTotal) / estimatedTotal;
  const progressPct = Math.round(12 + 88 * Math.pow(ratio, 0.6));

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
                <div className="funnelOptions">
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
            answers={answers}
            onContinue={() => {
              const nextId = defaultNext(step.id);
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
              if (nextId) navigate(nextId);
            }}
          />
        ) : null}

        {step.kind === "offer" ? (
          <OfferStep step={step} answers={answers} funnelSlug={funnel.slug} />
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
          <StressProjection />
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

  return (
    <div className="funnelSummary">
      {title ? <h1 className="funnelQuestion">{title}</h1> : null}
      {body ? <p className="funnelSubtext">{body}</p> : null}

      <PlanRecap answers={answers} />

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
              onClick={() => setPlan(key)}
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
