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

export function OfferRating() {
  // NOTE: 5.0 / "2,000+ ratings" are PLACEHOLDERS. Replace with a real,
  // verifiable App Store rating + count before running paid traffic (FTC /
  // ad-platform requirement).
  return (
    <div className="offerRating" aria-label="Average member rating 5 out of 5">
      <Stars />
      <span className="offerRatingText">
        <strong>5.0</strong> · 2,000+ ratings
      </span>
    </div>
  );
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

export function OfferPlanToggle({
  plan,
  onChange,
}: {
  plan: PlanKey;
  onChange: (nextPlan: PlanKey) => void;
}) {
  return (
    <div className="planToggle" role="radiogroup" aria-label="Billing period">
      {(["annual", "weekly"] as const).map((key) => {
        const display = OFFER_DISPLAY[key];
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={plan === key}
            className={`planToggleBtn${plan === key ? " planToggleBtnActive" : ""}`}
            onClick={() => onChange(key)}
          >
            <span className="planToggleLabel">
              {key === "annual" ? "Annual" : "Weekly"}
            </span>
            {display.badge ? (
              <span className="planToggleBadge">{display.badge}</span>
            ) : null}
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
