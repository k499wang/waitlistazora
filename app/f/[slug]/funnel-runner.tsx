"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

import { OFFERS } from "@/lib/checkout/offers";
import { OFFER_DISPLAY } from "@/lib/checkout/offer-display";
import { CheckoutForm } from "@/app/components/checkout-form";
import { trackMetaEvent } from "@/app/components/meta-pixel-events";
import { LivePrice } from "@/app/pricing/live-price";
import type { FunnelConfig, FunnelStep } from "@/lib/funnels/types";

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

export function FunnelRunner({ funnel }: { funnel: FunnelConfig }) {
  const [currentId, setCurrentId] = useState(funnel.steps[0].id);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const funnelViewFired = useRef(false);

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
                  Try for free
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
