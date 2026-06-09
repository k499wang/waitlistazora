"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type FbqOptions = {
  eventCallback?: () => void;
  eventTimeout?: number;
  /** Stable id shared with the matching CAPI event so Meta dedupes the pair. */
  eventID?: string;
};

declare global {
  interface Window {
    fbq?: (
      command: "track" | "init",
      eventNameOrPixelId: string,
      params?: Record<string, unknown>,
      options?: FbqOptions,
    ) => void;
  }
}

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  options?: FbqOptions,
) {
  window.fbq?.("track", eventName, params, options);
}

/**
 * Pixel advanced matching: re-init with the logged-in user's identifiers so
 * browser events match the same person as the server-side CAPI events
 * (external_id = Supabase user.id, consistent with lib/meta-capi.ts). The
 * pixel hashes these client-side before sending — pass them raw.
 */
export function setMetaAdvancedMatching({
  email,
  externalId,
}: {
  email?: string | null;
  externalId?: string | null;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (!pixelId || !window.fbq) return;

  const userData: Record<string, string> = {};
  if (email) userData.em = email.toLowerCase().trim();
  if (externalId) userData.external_id = externalId;
  if (Object.keys(userData).length === 0) return;

  window.fbq("init", pixelId, userData);
}

export function MetaPixelEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackMetaEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}
