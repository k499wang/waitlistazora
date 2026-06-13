"use client";

import type { ReactNode } from "react";

import { resolvePersonalTemplate } from "@/lib/funnels/personalization";
import type { FunnelPersonalization } from "@/lib/funnels/types";

import { PlanRecap } from "./plan-recap";

function renderBold(text: string): ReactNode[] {
  return text
    .split("**")
    .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

export function SummaryStep({
  title,
  body,
  personalization,
  answers,
}: {
  title: string;
  body: string;
  personalization: FunnelPersonalization;
  answers: Record<string, string>;
}) {
  const prediction = personalization.summary.prediction;
  const predictionText = prediction
    ? resolvePersonalTemplate(
        prediction.text,
        answers,
        personalization.shortAnswers,
      )
    : null;
  const compareText = personalization.summary.compare
    ? resolvePersonalTemplate(
        personalization.summary.compare,
        answers,
        personalization.shortAnswers,
      )
    : null;

  return (
    <div className="funnelSummary">
      {title ? <h1 className="funnelQuestion">{title}</h1> : null}
      {body ? <p className="funnelSubtext">{body}</p> : null}

      <PlanRecap personalization={personalization} answers={answers} />

      {prediction && predictionText ? (
        <div className="summaryPrediction">
          <p className="summaryPredictionKicker">{prediction.kicker}</p>
          <p className="summaryPredictionText">{renderBold(predictionText)}</p>
        </div>
      ) : null}

      {compareText ? (
        <p className="summaryCompare">{renderBold(compareText)}</p>
      ) : null}
    </div>
  );
}
