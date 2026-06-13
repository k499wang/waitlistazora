"use client";

export function InterstitialStep({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="funnelInterstitial">
      <div className="funnelSpinner" aria-hidden />
      {title ? <h1 className="funnelQuestion">{title}</h1> : null}
      {body ? <p className="funnelSubtext">{body}</p> : null}
    </div>
  );
}
