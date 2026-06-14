"use client";

import Image from "next/image";

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
  const hasBody = body.trim().length > 0;

  // A background photo and a foreground graphic compete for the same space, so
  // a backgrounded step is deliberately text-only — no icon, visual, image, or
  // logos. Just the headline and body, over a darkened photo for legibility.
  if (step.backgroundImage) {
    return (
      <div
        className="funnelInfo funnelInfoBg"
        style={{ backgroundImage: `url("${step.backgroundImage}")` }}
      >
        <div className="funnelInfoBgScrim" aria-hidden />
        <div className="funnelInfoBgText">
          <h1 className="funnelQuestion">{title}</h1>
          {hasBody ? <p className="funnelSubtext">{body}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="funnelInfo">
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
      ) : step.image ? (
        <div className="funnelInfoPhoto">
          <Image
            src={step.image.src}
            alt={step.image.alt}
            fill
            sizes="(max-width: 640px) 60vw, 240px"
            className="funnelInfoPhotoImg"
          />
        </div>
      ) : step.visual ? (
        <InfoStepVisual visual={step.visual} />
      ) : (
        <div className="funnelInfoIcon" aria-hidden>
          {step.icon}
        </div>
      )}
      <h1 className="funnelQuestion">{title}</h1>
      {hasBody ? <p className="funnelSubtext">{body}</p> : null}
      {step.logos?.length ? (
        <div className="funnelLogos" aria-label="Backed by leading institutions">
          {step.logos.map((logo) => (
            <div key={logo.src} className="funnelLogo">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="140px"
                className="funnelLogoImg"
              />
            </div>
          ))}
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
