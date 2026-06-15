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
  OfferJourneySteps,
  OfferPlanRows,
  OfferTestimonials,
} from "./offer-step-components";
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
  const { discount, showSpinner, claimDiscount } =
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

      {/* Feature checkmarks — above the card so the value props are read before
          the price. */}
      <ul className="checkoutFeatures checkoutFeaturesAbove">
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

      {/* Checkout block (no card): plan rows + trial details, on the open page. */}
      <div className="checkoutCard">
        {/* Plan selection: stacked, full-width rows (app-paywall style) that
            each carry their own per-week price. The won discount renders as an
            overlay badge on the annual row, not a separate banner. */}
        <OfferPlanRows
          plan={plan}
          discount={discount}
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

        {personalization.offer.anchorNote ? (
          <p className="checkoutAnchorNote">{personalization.offer.anchorNote}</p>
        ) : null}

        {personalization.offer.trialTimeline?.length ? (
          <ol className="trialTimeline" aria-label="How your free trial works">
            {personalization.offer.trialTimeline.map((item) => (
              <li key={item.day}>
                <span className="trialTimelineDay">{item.day}</span>
                <span className="trialTimelineText">{item.text}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {/* Risk-reversal line in the most-read spot, near the price. */}
        <p className="checkoutGuaranteeLine">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V4l8-3zm-1.2 14.2l5.5-5.5-1.4-1.4-4.1 4.1-1.9-1.9-1.4 1.4 3.3 3.3z" />
          </svg>
          {plan === "annual"
            ? "Risk-free: you won't be charged until your trial ends, and you can cancel any time."
            : "Cancel any time, no questions asked."}
        </p>

        {/* Tell signed-out users upfront that checkout needs an account. */}
        {loaded && !email ? (
          <p className="checkoutAccountNote">
            Your subscription is linked to a free Azora account. You&apos;ll
            create one at checkout.
          </p>
        ) : null}

        {/* Guaranteed safe checkout: card-network logos + encryption reassurance. */}
        <div className="safeCheckout">
          <p className="safeCheckoutHeading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 1 1 6 0v3H9z" />
            </svg>
            Guaranteed safe checkout
          </p>
          <div className="safeCheckoutCards" aria-label="Accepted payment methods">
            <span className="cardTile">
              <svg viewBox="0 0 48 16" role="img" aria-label="Visa">
                <text x="24" y="13" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontStyle="italic" fontSize="13" fill="#1434CB">VISA</text>
              </svg>
            </span>
            <span className="cardTile">
              <svg viewBox="0 0 48 30" role="img" aria-label="Mastercard">
                <circle cx="20" cy="15" r="9" fill="#EB001B" />
                <circle cx="28" cy="15" r="9" fill="#F79E1B" fillOpacity="0.85" />
              </svg>
            </span>
            <span className="cardTile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cards/amex.png" alt="American Express" />
            </span>
          </div>
          <p className="safeCheckoutNote">
            All transactions are secure and encrypted
          </p>
        </div>
      </div>

      {/* Social proof: member reviews under the card, reinforcing the CTA. */}
      {personalization.offer.testimonials?.length ? (
        <OfferTestimonials testimonials={personalization.offer.testimonials} />
      ) : null}

      {/* Sticky checkout bar: pins the CTA to the bottom of the viewport so it's
          always reachable while the rest of the paywall scrolls behind it —
          the native-app paywall pattern. */}
      <div className="checkoutStickyBar">
        <CheckoutForm
          action={`/checkout/start?offer=${offer.key}`}
          offerKey={offer.key}
          onCheckoutStart={() => {
            posthog.capture("web_checkout_cta_clicked", {
              ...offerAnalyticsProperties(),
              cta_label:
                plan === "annual" ? "Try for free for 7 days" : "Start now",
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
            {plan === "annual" ? "Try for free for 7 days" : "Start now"}
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
      </div>
    </div>
  );
}
