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

const REASSURANCE_DURATION = 1700; // ms to show reassuring toast before advancing

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
    const t = setTimeout(() => navigate(nextId), 2200);
    return () => clearTimeout(t);
  }, [currentId, step.kind, defaultNext, navigate]);

  // Resolve templates for dynamic interstitial / result / info text.
  const displayTitle =
    step.kind === "interstitial" || step.kind === "result" || step.kind === "info"
      ? resolveTemplate(step.title, answers, funnel.steps)
      : step.kind === "single_choice"
        ? step.question
        : step.kind === "offer"
          ? step.title
          : "";

  const displayBody =
    step.kind === "interstitial" || step.kind === "result" || step.kind === "info"
      ? resolveTemplate(step.body, answers, funnel.steps)
      : step.kind === "single_choice"
        ? (step.subtext ?? "")
        : step.kind === "offer"
          ? step.body
          : "";

  return (
    <div className="container funnelContainer">
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
            <div className="funnelInfoIcon" aria-hidden>
              {step.icon}
            </div>
            <h1 className="funnelQuestion">{displayTitle}</h1>
            <p className="funnelSubtext">{displayBody}</p>
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
          <OfferStep step={step} />
        ) : null}
      </div>
    </div>
  );
}

function OfferStep({ step }: { step: { title: string; body: string } }) {
  const [plan, setPlan] = useState<"annual" | "weekly">("annual");
  const offer = OFFERS[plan];
  const display = OFFER_DISPLAY[plan];
  const { loaded, email } = useSupabaseSession();

  return (
    <div className="funnelOffer">
      {/* Mini journey strip: makes the account requirement explicit instead of
          surprising the user with a login bounce when they hit the CTA. */}
      <ol className="offerSteps" aria-label="Checkout steps">
        <li className="offerStepDone">Plan built</li>
        <li className={email ? "offerStepDone" : "offerStepCurrent"}>Account</li>
        <li className={email ? "offerStepCurrent" : ""}>Unlock Pro</li>
      </ol>

      {step.title ? (
        <h1 className="funnelQuestion">{step.title}</h1>
      ) : null}
      {step.body ? (
        <p className="funnelSubtext">{step.body}</p>
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
        {/* Trial headline — the main message. */}
        <p className="checkoutTrialHeadline">
          {plan === "annual" ? "Free for 7 days" : "No commitment"}
        </p>

        <div className="checkoutCardPrice">
          <p className="checkoutMonthlyPrice">
            {display.weeklyPrice}
            <span className="pricePeriod">/wk</span>
          </p>
          <p className="priceBillingNote">{display.billingNote}</p>
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

        <p className="checkoutTrialLine">{display.trialLine}</p>

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

        {/* Account status: reassure signed-in users their plan is attached;
            tell signed-out users upfront that checkout needs an account. */}
        {loaded ? (
          email ? (
            <p className="checkoutAccountNote checkoutAccountNoteSaved">
              ✓ Plan saved to <strong>{email}</strong>
            </p>
          ) : (
            <p className="checkoutAccountNote">
              Your subscription is linked to a free Azora account — you&apos;ll
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
      </div>
    </div>
  );
}
