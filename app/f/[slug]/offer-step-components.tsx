"use client";

import { OFFER_DISPLAY } from "@/lib/checkout/offer-display";
import type { FunnelPersonalization } from "@/lib/funnels/types";

import type { SpinDiscount } from "./discount-spinner";

type PlanKey = "annual" | "weekly";
type Testimonials = NonNullable<FunnelPersonalization["offer"]["testimonials"]>;

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

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function OfferJourneySteps({ email }: { email: string | null }) {
  return (
    <ol className="offerSteps" aria-label="Checkout steps">
      <li className="offerStepDone">Plan built</li>
      <li className={email ? "offerStepDone" : "offerStepCurrent"}>Account</li>
      <li className={email ? "offerStepCurrent" : ""}>Unlock Pro</li>
    </ol>
  );
}

export function OfferDiscountBanner({
  discount,
  countdownMs,
}: {
  discount: SpinDiscount;
  countdownMs: number;
}) {
  return (
    <div className="discountBanner" role="status">
      <span className="discountBannerPct">{discount.pct}% OFF</span>
      <span className="discountBannerText">applied to your plan</span>
      {countdownMs > 0 ? (
        <span className="discountBannerTimer">
          reserved for {formatCountdown(countdownMs)}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Stacked, full-width selectable plan rows — the signature app-paywall layout
 * (vs. a web-style segmented toggle). Each row carries its own per-week price,
 * so the price lives with the choice rather than in a separate hero block.
 * Discount strikethrough mirrors the spinner-win logic: pre-win the anchor
 * shows as the plain price; once `discount` is set, the anchor is crossed out
 * and the real (charged) price is revealed.
 */
export function OfferPlanRows({
  plan,
  discount,
  onChange,
}: {
  plan: PlanKey;
  discount: SpinDiscount | null;
  onChange: (nextPlan: PlanKey) => void;
}) {
  return (
    <div className="planRows" role="radiogroup" aria-label="Choose your plan">
      {(["annual", "weekly"] as const).map((key) => {
        const display = OFFER_DISPLAY[key];
        const selected = plan === key;
        // The spin discount only marks down the annual plan; weekly stays flat.
        const dealApplies = discount !== null && key === "annual";
        const perWeek = dealApplies
          ? display.weeklyPrice
          : display.anchorWeeklyPrice;
        const anchorWeekly = dealApplies ? display.anchorWeeklyPrice : null;
        const label = key === "annual" ? "Start 7-day free trial" : "Weekly";
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`planRow${selected ? " planRowActive" : ""}`}
            onClick={() => onChange(key)}
          >
            {/* Won discount sits as an overlay badge on the annual row. */}
            {discount && key === "annual" ? (
              <span className="planRowDeal">{discount.pct}% OFF</span>
            ) : null}
            <span className="planRowRadio" aria-hidden />
            <span className="planRowMain">
              <span className="planRowTop">
                <span className="planRowLabel">
                  {label}
                </span>
                {display.badge && key !== "annual" ? (
                  <span className="planRowBadge">{display.badge}</span>
                ) : null}
              </span>
            </span>
            <span className="planRowPrice">
              {anchorWeekly ? (
                <s className="planRowAnchor">{anchorWeekly}</s>
              ) : null}
              <span className="planRowAmount">{perWeek}</span>
              <span className="planRowPer">/wk</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function OfferTestimonials({
  testimonials,
}: {
  testimonials: Testimonials;
}) {
  return (
    <section className="offerTestimonials" aria-label="Member reviews">
      <p className="offerTestimonialsHeading">What members say</p>
      {testimonials.map((testimonial) => (
        <figure key={testimonial.name} className="testimonialCard">
          <Stars />
          <blockquote className="testimonialText">
            {testimonial.text}
          </blockquote>
          <figcaption className="testimonialMeta">
            <span className="testimonialName">{testimonial.name}</span>
            <span className="testimonialSub">{testimonial.meta}</span>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
