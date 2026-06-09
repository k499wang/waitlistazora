import type { Metadata } from "next";

import { OFFERS } from "@/lib/checkout/offers";
import {
  OFFER_DISPLAY,
  OFFER_DISPLAY_ORDER,
} from "@/lib/checkout/offer-display";
import { CheckoutForm } from "@/app/components/checkout-form";
import { TopBar } from "@/app/components/top-bar";
import { LivePrice } from "./live-price";

export const metadata: Metadata = {
  title: "Pricing — Azora Pro",
  description:
    "Unlock unlimited camera heart-rate sessions, every guided breathwork program, and your stress & recovery trends with Azora Pro.",
};

const APP_STORE_URL =
  "https://apps.apple.com/us/app/azora-breathwork-for-wellness/id6763631574";

function CheckIcon() {
  return (
    <svg
      className="priceFeatureIcon"
      width="18"
      height="18"
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
  );
}

export default function PricingPage() {
  return (
    <>
      <TopBar next="/pricing" />
      <main className="pricingPage">
        <div className="glass-orb orb-brand orb-md" style={{ top: "8%", right: "-6%" }} />
        <div className="glass-orb orb-sm" style={{ top: "55%", left: "-4%" }} />

        <div className="container">
          <div className="pricingHeader">
            <span className="label" style={{ color: "var(--brand)" }}>
              Azora Pro
            </span>
            <h1 className="headline" style={{ marginTop: "0.75rem" }}>
              Start your practice today
            </h1>
            <p
              className="subhead"
              style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}
            >
              One subscription unlocks everything — on the web today and inside
              the app the moment you sign in. Cancel anytime.
            </p>
          </div>

          <div className="pricingGrid">
            {OFFER_DISPLAY_ORDER.map((key) => {
              const display = OFFER_DISPLAY[key];
              const offer = OFFERS[key];
              return (
                <div
                  key={key}
                  className={`priceCard${display.featured ? " priceCardFeatured" : ""}`}
                >
                  {display.badge ? (
                    <span className="priceBadge">{display.badge}</span>
                  ) : null}

                  <h2 className="priceName">{offer.displayName}</h2>

                  <div className="priceAmountRow">
                    <span className="priceAmount">
                      <LivePrice offerKey={key} fallback={display.price} />
                    </span>
                    <span className="pricePeriod">{display.period}</span>
                  </div>
                  <p className="priceBillingNote">{display.billingNote}</p>

                  <CheckoutForm
                    action={`/checkout/start?offer=${offer.key}`}
                    offerKey={offer.key}
                  >
                    <button type="submit" className="priceCta">
                      Get {offer.displayName}
                    </button>
                  </CheckoutForm>
                  <p className="priceTrialLine">{display.trialLine}</p>

                  <ul className="priceFeatures">
                    {display.features.map((feature) => (
                      <li key={feature}>
                        <CheckIcon />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="pricingReassure">
            <span>🔒 Secure checkout</span>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>·</span>
            <span>Works on web &amp; in the app</span>
          </div>

          <p className="pricingAppStore">
            Prefer to start in the app first?{" "}
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
              Download Azora free on the App Store →
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
