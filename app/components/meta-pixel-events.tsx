"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type FbqOptions = {
  eventCallback?: () => void;
  eventTimeout?: number;
};

declare global {
  interface Window {
    fbq?: (
      command: "track",
      eventName: string,
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

export function MetaPixelEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackMetaEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}
