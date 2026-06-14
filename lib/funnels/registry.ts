import { breathholdFunnel } from "./breathhold";
import { calmResetFunnel } from "./calm-reset";
import type { FunnelConfig } from "./types";

const FUNNELS: Record<string, FunnelConfig> = {
  [calmResetFunnel.slug]: calmResetFunnel,
  [breathholdFunnel.slug]: breathholdFunnel,
};
export function getFunnel(slug: string): FunnelConfig | null {
  const funnel = FUNNELS[slug];
  if (!funnel || funnel.status !== "active") {
    return null;
  }
  return funnel;
}

export function listActiveFunnelSlugs(): string[] {
  return Object.values(FUNNELS)
    .filter((f) => f.status === "active")
    .map((f) => f.slug);
}

export function listFunnelConfigs(): FunnelConfig[] {
  return Object.values(FUNNELS);
}
