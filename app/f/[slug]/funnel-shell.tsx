"use client";

import type { ReactNode } from "react";

export function FunnelShell({
  canGoBack,
  showProgress,
  progressPct,
  onBack,
  children,
}: {
  canGoBack: boolean;
  showProgress: boolean;
  progressPct: number;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="container funnelContainer">
      <header className="funnelAppHeader">
        {canGoBack ? (
          <button
            type="button"
            className="funnelAppBack"
            onClick={onBack}
            aria-label="Go back"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : null}
        <span className="funnelAppWordmark">Azora</span>
      </header>

      {showProgress ? (
        <div
          className="funnelProgress"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="funnelProgressBar"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : null}

      {children}
    </div>
  );
}
