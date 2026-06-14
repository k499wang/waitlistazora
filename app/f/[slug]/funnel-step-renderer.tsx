"use client";

import type { FunnelConfig, FunnelStep } from "@/lib/funnels/types";

import { FunnelAccountStep } from "./account-step";
import { InfoStep } from "./info-step";
import { InterstitialStep } from "./interstitial-step";
import { OfferStep } from "./offer-step";
import { ProjectionStep } from "./projection-step";
import { ResultStep } from "./result-step";
import { SingleChoiceStep } from "./single-choice-step";
import { SummaryStep } from "./summary-step";
import { TextInputStep } from "./text-input-step";

export function FunnelStepRenderer({
  funnel,
  step,
  title,
  body,
  answers,
  effectiveAnswers,
  reassuringText,
  allowOptionHover,
  showConfetti,
  onEnableHover,
  onSelectChoice,
  onSubmitText,
  onAccountContinue,
}: {
  funnel: FunnelConfig;
  step: FunnelStep;
  title: string;
  body: string;
  answers: Record<string, string>;
  effectiveAnswers: Record<string, string>;
  reassuringText?: string;
  allowOptionHover: boolean;
  showConfetti: boolean;
  onEnableHover: () => void;
  onSelectChoice: (stepId: string, optionId: string) => void;
  onSubmitText: (stepId: string, value: string) => void;
  onAccountContinue: () => void;
}) {
  switch (step.kind) {
    case "single_choice":
      return (
        <SingleChoiceStep
          step={step}
          title={title}
          body={body}
          selectedOptionId={answers[step.id]}
          reassuringText={reassuringText}
          allowOptionHover={allowOptionHover}
          onEnableHover={onEnableHover}
          onSelect={(optionId) => onSelectChoice(step.id, optionId)}
        />
      );
    case "text_input":
      return (
        <TextInputStep
          step={step}
          title={title}
          body={body}
          onSubmit={(value) => onSubmitText(step.id, value)}
        />
      );
    case "interstitial":
      return <InterstitialStep step={step} title={title} body={body} />;
    case "info":
      return (
        <InfoStep
          step={step}
          title={title}
          body={body}
          funnelName={funnel.name}
        />
      );
    case "result":
      return (
        <ResultStep title={title} body={body} showConfetti={showConfetti} />
      );
    case "summary":
      return (
        <SummaryStep
          title={title}
          body={body}
          personalization={funnel.personalization}
          answers={effectiveAnswers}
        />
      );
    case "projection":
      return (
        <ProjectionStep
          title={title}
          body={body}
          personalization={funnel.personalization}
          answers={effectiveAnswers}
        />
      );
    case "account":
      return (
        <FunnelAccountStep
          step={step}
          slug={funnel.slug}
          onContinue={onAccountContinue}
        />
      );
    case "offer":
      return <OfferStep step={step} answers={effectiveAnswers} funnel={funnel} />;
  }
}
