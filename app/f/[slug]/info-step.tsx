"use client";

import Image from "next/image";

import iconApp from "../../assets/iconApp.png";
import { appStoreUrl } from "@/lib/client-attribution";
import type { FunnelStep } from "@/lib/funnels/types";

import { InfoStepVisual } from "./info-visuals";
import { renderBold } from "./render-bold";

type InfoStepConfig = Extract<FunnelStep, { kind: "info" }>;

/** Row of filled/empty stars for ratings and testimonials. */
function StarRow({ stars = 5 }: { stars?: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(stars)));
  return (
    <span className="funnelStars" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`funnelStar${i < filled ? "" : " funnelStarEmpty"}`}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

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
  const isQuestionIllustration =
    step.image?.src === "/q1.png" ||
    step.image?.src === "/q2.png" ||
    step.image?.src === "/q3.png" ||
    step.image?.src === "/clipart4175230.png";

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
          {hasBody ? <p className="funnelSubtext">{renderBold(body)}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="funnelInfo">
      {step.appNudge ? (
        <a
          className="funnelAppNudge"
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="funnelAppNudgeIcon" aria-hidden>
            <Image src={iconApp} alt="" fill sizes="44px" />
          </span>
          <span className="funnelAppNudgeText">
            <span className="funnelAppNudgeHeader">
              <span className="funnelAppNudgeApp">Azora</span>
              <span className="funnelAppNudgeTime">now</span>
            </span>
            <span className="funnelAppNudgeTitle">{step.appNudge.title}</span>
            <span className="funnelAppNudgeBody">{step.appNudge.body}</span>
          </span>
        </a>
      ) : null}
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
        <div
          className={`funnelInfoPhoto${
            step.imageLarge ? " funnelInfoPhotoLarge" : ""
          }${isQuestionIllustration ? " funnelInfoPhotoQuestion" : ""
          }`}
        >
          <Image
            src={step.image.src}
            alt={step.image.alt}
            fill
            sizes={
              isQuestionIllustration
                ? "(max-width: 640px) 90vw, 420px"
                : step.imageLarge
                  ? "(max-width: 640px) 94vw, 480px"
                  : "(max-width: 640px) 84vw, 360px"
            }
            className="funnelInfoPhotoImg"
          />
        </div>
      ) : step.visual ? (
        <InfoStepVisual visual={step.visual} />
      ) : step.logos?.length ? (
        <div className="funnelLogosBlock funnelLogosHero">
          <div className="funnelLogos" aria-label="Backed by leading institutions">
            {step.logos.map((logo) => (
              <div key={logo.src} className="funnelLogo">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="200px"
                  className="funnelLogoImg"
                />
              </div>
            ))}
          </div>
          {step.logosCaption ? (
            <p className="funnelLogosCaption">{step.logosCaption}</p>
          ) : null}
        </div>
      ) : step.icon ? (
        <div className="funnelInfoIcon" aria-hidden>
          {step.icon}
        </div>
      ) : null}
      <h1 className="funnelQuestion">{title}</h1>
      {hasBody ? <p className="funnelSubtext">{renderBold(body)}</p> : null}
      {step.checklist?.length ? (
        <ul className="funnelChecklist">
          {step.checklist.map((item) => (
            <li key={item} className="funnelChecklistItem">
              <span className="funnelChecklistCheck" aria-hidden>
                ✓
              </span>
              <span>{renderBold(item)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {step.rating ? (
        <div className="funnelRating">
          <span className="funnelRatingScore">{step.rating.score}</span>
          <StarRow stars={step.rating.stars} />
          {step.rating.count ? (
            <span className="funnelRatingCount">{step.rating.count}</span>
          ) : null}
        </div>
      ) : null}
      {step.reviews?.length ? (
        <div className="funnelReviews">
          {step.reviews.map((review) => (
            <figure key={review.name} className="funnelReview">
              <StarRow stars={review.stars} />
              <blockquote className="funnelReviewQuote">
                {renderBold(review.quote)}
              </blockquote>
              <figcaption className="funnelReviewName">{review.name}</figcaption>
            </figure>
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
