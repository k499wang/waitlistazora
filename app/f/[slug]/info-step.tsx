"use client";

import type { FunnelStep } from "@/lib/funnels/types";

import { InfoStepVisual } from "./info-visuals";

type InfoStepConfig = Extract<FunnelStep, { kind: "info" }>;

export function InfoStep({
  step,
  title,
  body,
  funnelName,
}: {
  step: InfoStepConfig;
  title: string;
  body: string;
  funnelName: string;
}) {
  return (
    <div className="funnelInfo">
      <h1 className="funnelQuestion">{title}</h1>
      <p className="funnelSubtext">{body}</p>
      {step.visual ? (
        <InfoStepVisual visual={step.visual} />
      ) : (
        <div className="funnelInfoIcon" aria-hidden>
          {step.icon}
        </div>
      )}
      {step.youtubeId ? (
        <div className="funnelVideoWrap">
          <iframe
            className="funnelVideo"
            src={`https://www.youtube-nocookie.com/embed/${step.youtubeId}?playsinline=1&rel=0`}
            title={`Demo: how ${funnelName} works`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : null}
      {step.institutions?.length ? (
        <div className="funnelInstitutions" aria-label="Research institutions">
          {step.institutions.map((name) => (
            <span key={name} className="funnelInstitution">
              {name}
            </span>
          ))}
        </div>
      ) : null}
      {step.citation ? <p className="funnelCitation">{step.citation}</p> : null}
    </div>
  );
}
