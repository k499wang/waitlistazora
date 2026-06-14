"use client";

import type { FunnelStep } from "@/lib/funnels/types";

type InterstitialStepConfig = Extract<FunnelStep, { kind: "interstitial" }>;

export function InterstitialStep({
  step,
  title,
  body,
}: {
  step: InterstitialStepConfig;
  title: string;
  body: string;
}) {
  const loadingItems = step.loadingItems ?? [];

  return (
    <div className="funnelInterstitial">
      <div className="funnelSpinner" aria-hidden />
      {title ? <h1 className="funnelQuestion">{title}</h1> : null}
      {body ? <p className="funnelSubtext">{body}</p> : null}
      {loadingItems.length ? (
        <div className="funnelLoadingList" role="status" aria-label="Building your personalized plan">
          {loadingItems.map((item) => (
            <div className="funnelLoadingItem" key={item}>
              <div className="funnelLoadingItemTop">
                <span>{item}</span>
                <span className="funnelLoadingCheck" aria-hidden>
                  ✓
                </span>
              </div>
              <div className="funnelLoadingTrack" aria-hidden>
                <div className="funnelLoadingFill" />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
