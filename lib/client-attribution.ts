import { attributionFromRecord } from "@/lib/attribution";

export const attributionStorageKey = "azora_attribution";

export const appStoreUrl =
  "https://apps.apple.com/us/app/azora-breathwork-for-wellness/id6763631574";

export function getStoredAttribution() {
  try {
    return attributionFromRecord(
      JSON.parse(window.localStorage.getItem(attributionStorageKey) || "{}")
    );
  } catch {
    return {};
  }
}
