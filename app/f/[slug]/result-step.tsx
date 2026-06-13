"use client";

import type { CSSProperties } from "react";

const CONFETTI_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 37) % 90}%`,
  delay: `${(i * 0.07).toFixed(2)}s`,
  size: `${6 + (i % 8)}px`,
  hue: (i * 47 + 180) % 360,
  drift: `${-20 + (i % 40)}px`,
}));

export function ResultStep({
  title,
  body,
  showConfetti,
}: {
  title: string;
  body: string;
  showConfetti: boolean;
}) {
  return (
    <div className="funnelResult">
      {showConfetti ? (
        <div className="confettiContainer" aria-hidden>
          {CONFETTI_PARTICLES.map((p) => (
            <span
              key={p.id}
              className="confettiPiece"
              style={{
                left: p.left,
                animationDelay: p.delay,
                width: p.size,
                height: p.size,
                backgroundColor: `hsl(${p.hue}, 80%, 60%)`,
                "--drift": p.drift,
              } as CSSProperties}
            />
          ))}
        </div>
      ) : null}
      {title ? <h1 className="funnelQuestion">{title}</h1> : null}
      {body ? <p className="funnelSubtext">{body}</p> : null}
      <div className="funnelResultBadge" aria-hidden>
        ✓
      </div>
    </div>
  );
}
