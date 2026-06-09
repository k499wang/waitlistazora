"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

import { OFFERS } from "@/lib/checkout/offers";
import { OFFER_DISPLAY } from "@/lib/checkout/offer-display";
import { CheckoutForm } from "@/app/components/checkout-form";
import { trackMetaEvent } from "@/app/components/meta-pixel-events";
import { LivePrice } from "@/app/pricing/live-price";
import type { FunnelConfig } from "@/lib/funnels/types";

// Client step machine for a funnel. Answers are persisted to
// web_funnel_answers via POST /api/funnel-answer on every selection so they
// survive the OAuth redirect and can personalize onboarding later.
export function FunnelRunner({ funnel }: { funnel: FunnelConfig }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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

  const step = funnel.steps[index];
  const isLast = index >= funnel.steps.length - 1;
  const progress = Math.round(((index + 1) / funnel.steps.length) * 100);

  function advance() {
    setIndex((i) => Math.min(i + 1, funnel.steps.length - 1));
  }

  function choose(stepId: string, optionId: string) {
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

    if (!isLast) advance();
  }

  // Interstitial auto-advances after a short, intentional pause.
  useEffect(() => {
    if (step.kind !== "interstitial") return;
    const t = setTimeout(advance, 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, step.kind]);

  return (
    <div className="container funnelContainer">
      {step.kind !== "offer" && step.kind !== "result" ? (
        <div className="funnelProgress" aria-hidden>
          <div className="funnelProgressBar" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      {index > 0 && step.kind === "single_choice" ? (
        <button
          type="button"
          className="funnelBack"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
        >
          ← Back
        </button>
      ) : null}

      <div className="funnelStep" key={step.id}>
        {step.kind === "single_choice" ? (
          <>
            <h1 className="funnelQuestion">{step.question}</h1>
            {step.subtext ? (
              <p className="funnelSubtext">{step.subtext}</p>
            ) : null}
            <div className="funnelOptions">
              {step.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`funnelOption${
                    answers[step.id] === opt.id ? " funnelOptionSelected" : ""
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
            <h1 className="funnelQuestion">{step.title}</h1>
            <p className="funnelSubtext">{step.body}</p>
          </div>
        ) : null}

        {step.kind === "result" ? (
          <div className="funnelResult">
            <div className="funnelResultBadge" aria-hidden>
              ✓
            </div>
            <h1 className="funnelQuestion">{step.title}</h1>
            <p className="funnelSubtext">{step.body}</p>
            <button type="button" className="funnelPrimaryBtn" onClick={advance}>
              See my plan &amp; pricing
            </button>
          </div>
        ) : null}

        {step.kind === "offer" ? <OfferStep offerKey={step.offerKey} step={step} /> : null}
      </div>
    </div>
  );
}

function OfferStep({
  offerKey,
  step,
}: {
  offerKey: "annual" | "weekly";
  step: { title: string; body: string };
}) {
  const offer = OFFERS[offerKey];
  const display = OFFER_DISPLAY[offerKey];

  return (
    <div className="funnelOffer">
      <h1 className="funnelQuestion">{step.title}</h1>
      <p className="funnelSubtext">{step.body}</p>

      <div className="funnelOfferCard">
        {display.badge ? (
          <span className="priceBadge">{display.badge}</span>
        ) : null}
        <div className="priceAmountRow">
          <span className="priceAmount">
            <LivePrice offerKey={offerKey} fallback={display.price} />
          </span>
          <span className="pricePeriod">{display.period}</span>
        </div>
        <p className="priceBillingNote">{display.billingNote}</p>

        <CheckoutForm
          action={`/checkout/start?offer=${offer.key}`}
          offerKey={offer.key}
        >
          <button type="submit" className="funnelPrimaryBtn">
            Start free trial
          </button>
        </CheckoutForm>
        <p className="priceTrialLine">{display.trialLine}</p>
      </div>

      <a className="funnelOfferAlt" href="/pricing">
        See all plans
      </a>
    </div>
  );
}
