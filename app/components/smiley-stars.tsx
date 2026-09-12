// Cute rating stars: a rounded five-point star with a little smiley face
// inside. Inline SVG (rather than a font glyph) so the face stays crisp at any
// size and picks up the home page's palette variables.
export function SmileyStar({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {/* Rounded points come from the matching-color stroke with round joins. */}
      <path
        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        fill="var(--home-star, #ffc93c)"
        stroke="var(--home-star, #ffc93c)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <g fill="var(--home-star-ink, #17324d)">
        <circle cx="9.9" cy="11.9" r="1.05" />
        <circle cx="14.1" cy="11.9" r="1.05" />
      </g>
      <path
        d="M9.9 13.9q2.1 1.7 4.2 0"
        fill="none"
        stroke="var(--home-star-ink, #17324d)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Rating row of smiley stars. Decorative: the visible rating copy next to it
// carries the meaning for screen readers.
export function SmileyStars({
  count = 5,
  size = 26,
}: {
  count?: number;
  size?: number;
}) {
  return (
    <span className="smileyStars" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <SmileyStar key={i} size={size} />
      ))}
    </span>
  );
}
