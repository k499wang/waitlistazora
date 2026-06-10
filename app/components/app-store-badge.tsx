import { appStoreUrl } from "@/lib/client-attribution";

// Official Apple "Download on the App Store" badge (public/app-store-badge.svg,
// US-UK black lockup). Per Apple's marketing guidelines the badge artwork must
// not be modified or recolored — size it via the `height` prop only.
export function AppStoreBadge({
  href = appStoreUrl,
  height = 48,
  onClick,
  className,
}: {
  href?: string;
  height?: number;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`appStoreBadge${className ? ` ${className}` : ""}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/app-store-badge.svg"
        alt="Download on the App Store"
        height={height}
        style={{ height, width: "auto" }}
      />
    </a>
  );
}
