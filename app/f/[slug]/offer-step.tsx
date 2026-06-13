"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";

import { OFFERS } from "@/lib/checkout/offers";
import { OFFER_DISPLAY } from "@/lib/checkout/offer-display";
import { CheckoutForm } from "@/app/components/checkout-form";
import {
  answerSegments,
  resolvePersonalTemplate,
  type FunnelAnalyticsProperties,
} from "@/lib/funnels/personalization";
import type { FunnelConfig, FunnelStep } from "@/lib/funnels/types";

import { useSupabaseSession } from "./account-step";
import {
  DISCOUNT_TIMER_MS,
  DiscountSpinnerOverlay,
  readSpinDiscount,
  type SpinDiscount,
} from "./discount-spinner";
import { INTENTIONAL_DEPARTURE_KEY } from "./funnel-constants";
import { PlanRecap } from "./plan-recap";

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

export function OfferStep({
  step,
  answers,
  funnel,
}: {
  step: Extract<FunnelStep, { kind: "offer" }>;
  answers: Record<string, string>;
  funnel: FunnelConfig;
}) {
  const funnelSlug = funnel.slug;
  const personalization = funnel.personalization;
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
      ...answerSegments(personalization, answers),
      spin_discount_claimed: readSpinDiscount() !== null,
    });
  }, [funnelSlug, step.offerKey, personalization, answers]);

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
      ...answerSegments(personalization, answers),
    };
  }

  const headline = personalization.offer.headline;
  const title =
    (headline ? headline.byAnswer[answers[headline.stepId]] : undefined) ??
    step.title;
  const body =
    (personalization.offer.body
      ? resolvePersonalTemplate(
          personalization.offer.body,
          answers,
          personalization.shortAnswers,
        )
      : null) ?? step.body;

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
        <PlanRecap personalization={personalization} answers={answers} />
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

        {personalization.offer.anchorNote ? (
          <p className="checkoutAnchorNote">{personalization.offer.anchorNote}</p>
        ) : null}

        {plan === "annual" && personalization.offer.trialTimeline?.length ? (
          <ol className="trialTimeline" aria-label="How your free trial works">
            {personalization.offer.trialTimeline.map((item) => (
              <li key={item.day}>
                <span className="trialTimelineDay">{item.day}</span>
                <span className="trialTimelineText">{item.text}</span>
              </li>
            ))}
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

        {/* Accuracy credibility block (e.g. PPG validation sources). */}
        {personalization.offer.validation ? (
          <div className="checkoutValidation">
            <p className="checkoutValidationLine">
              {personalization.offer.validation.line}
            </p>
            <p className="checkoutValidationSources">
              {personalization.offer.validation.sources}
            </p>
          </div>
        ) : null}
      </div>

      {/* Social proof: member reviews under the card, reinforcing the CTA. */}
      {personalization.offer.testimonials?.length ? (
        <section className="offerTestimonials" aria-label="Member reviews">
          <p className="offerTestimonialsHeading">What members say</p>
          {personalization.offer.testimonials.map((t) => (
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
      ) : null}
    </div>
  );
}
