"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

import { OFFERS } from "@/lib/checkout/offers";
import { OFFER_DISPLAY } from "@/lib/checkout/offer-display";
import { CheckoutForm } from "@/app/components/checkout-form";
import { trackMetaEvent } from "@/app/components/meta-pixel-events";
import { LivePrice } from "@/app/pricing/live-price";
import type { FunnelConfig, FunnelStep } from "@/lib/funnels/types";

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

  // Resolve templates for dynamic interstitial / result text.
  const displayTitle =
    step.kind === "interstitial" || step.kind === "result"
      ? resolveTemplate(step.title, answers, funnel.steps)
      : step.kind === "single_choice"
        ? step.question
        : step.kind === "offer"
          ? step.title
          : "";

  const displayBody =
    step.kind === "interstitial" || step.kind === "result"
      ? resolveTemplate(step.body, answers, funnel.steps)
      : step.kind === "single_choice"
        ? (step.subtext ?? "")
        : step.kind === "offer"
          ? step.body
          : "";

  return (
    <div className="container funnelContainer">
      {history.length > 0 && step.kind === "single_choice" ? (
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

        {step.kind === "offer" ? (
          <OfferStep step={step} />
        ) : null}
      </div>
    </div>
  );
}

function OfferStep({ step }: { step: { title: string; body: string } }) {
  const offerKeys = ["annual", "weekly"] as const;

  return (
    <div className="funnelOffer">
      {step.title ? (
        <h1 className="funnelQuestion">{step.title}</h1>
      ) : null}
      {step.body ? (
        <p className="funnelSubtext">{step.body}</p>
      ) : null}

      <div className="funnelOfferGrid">
        {offerKeys.map((offerKey) => {
          const offer = OFFERS[offerKey];
          const display = OFFER_DISPLAY[offerKey];

          return (
            <div
              key={offerKey}
              className={`funnelOfferCard${
                display.featured ? " funnelOfferCardFeatured" : ""
              }`}
            >
              {display.badge ? (
                <span className="priceBadge">{display.badge}</span>
              ) : null}
              <div className="priceAmountRow">
                <span className="priceAmount">
                  <LivePrice
                    offerKey={offerKey}
                    fallback={display.price}
                  />
                </span>
                <span className="pricePeriod">{display.period}</span>
              </div>
              <p className="priceBillingNote">{display.billingNote}</p>

              <CheckoutForm
                action={`/checkout/start?offer=${offer.key}`}
                offerKey={offer.key}
              >
                <button type="submit" className="funnelPrimaryBtn">
                  {offerKey === "annual" ? "Try for free" : "Start now"}
                </button>
              </CheckoutForm>
              <p className="priceTrialLine">{display.trialLine}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
