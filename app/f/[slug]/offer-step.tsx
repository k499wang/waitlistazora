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
import { DiscountSpinnerOverlay, readSpinDiscount } from "./discount-spinner";
import { INTENTIONAL_DEPARTURE_KEY } from "./funnel-constants";
import {
  OfferDiscountBanner,
  OfferJourneySteps,
  OfferPlanToggle,
  OfferRating,
  OfferTestimonials,
} from "./offer-step-components";
import { PlanRecap } from "./plan-recap";
import { useOfferDiscount } from "./use-offer-discount";

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
  const { countdownMs, discount, showSpinner, claimDiscount } =
    useOfferDiscount();

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
          onClaim={claimDiscount}
        />
      ) : null}

      {/* Mini journey strip: makes the account requirement explicit instead of
          surprising the user with a login bounce when they hit the CTA. */}
      <OfferJourneySteps email={email} />

      {title ? (
        <h1 className="funnelQuestion">{title}</h1>
      ) : null}
      {body ? (
        <p className="funnelSubtext">{body}</p>
      ) : null}

      {/* Social proof: aggregate rating near the top, before the plan. */}
      <OfferRating />

      {/* Results-first framing: the personalized plan the user just built,
          repeated at the point of payment so the value is in view at the CTA. */}
      <div className="offerRecap">
        {/* Projection chart lives on its own `projection` step; keep the
            paywall recap to the plan card only. */}
        <PlanRecap
          personalization={personalization}
          answers={answers}
          showProjection={false}
        />
      </div>

      {discount ? (
        <OfferDiscountBanner discount={discount} countdownMs={countdownMs} />
      ) : null}

      {/* Plan toggle */}
      <OfferPlanToggle
        plan={plan}
        onChange={(nextPlan) => {
          if (plan === nextPlan) return;
          posthog.capture("web_offer_plan_toggled", {
            ...offerAnalyticsProperties(),
            from_plan: plan,
            to_plan: nextPlan,
            to_offer_id: OFFERS[nextPlan].offerId,
          });
          setPlan(nextPlan);
        }}
      />

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

        {/* Risk-reversal line in the most-read spot, right under the CTA. */}
        <p className="checkoutGuaranteeLine">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V4l8-3zm-1.2 14.2l5.5-5.5-1.4-1.4-4.1 4.1-1.9-1.9-1.4 1.4 3.3 3.3z" />
          </svg>
          {plan === "annual"
            ? "Risk-free: you won't be charged until your trial ends, and you can cancel any time."
            : "Cancel any time, no questions asked."}
        </p>

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

        {/* Payment-method / secure icons for checkout legitimacy. */}
        <div className="checkoutPayIcons" aria-label="Accepted payment methods">
          <svg className="checkoutPayLock" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 1 1 6 0v3H9z" />
          </svg>
          <svg width="34" height="22" viewBox="0 0 34 22" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="33" height="21" rx="3.5" stroke="currentColor" opacity="0.35" />
            <rect x="4" y="5" width="9" height="3" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="4" y="13" width="16" height="2" rx="1" fill="currentColor" opacity="0.45" />
          </svg>
          <svg width="34" height="22" viewBox="0 0 34 22" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="33" height="21" rx="3.5" stroke="currentColor" opacity="0.35" />
            <circle cx="15" cy="11" r="6" fill="currentColor" opacity="0.7" />
            <circle cx="21" cy="11" r="6" fill="currentColor" opacity="0.4" />
          </svg>
          <svg width="34" height="22" viewBox="0 0 34 22" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="33" height="21" rx="3.5" stroke="currentColor" opacity="0.35" />
            <path d="M10 14l2-6h1.6l-2 6H10zm5.4 0l1.2-6h1.5l-1.2 6h-1.5z" fill="currentColor" opacity="0.7" />
          </svg>
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
        <OfferTestimonials testimonials={personalization.offer.testimonials} />
      ) : null}
    </div>
  );
}
