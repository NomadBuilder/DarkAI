/** Anonymous first-party usage beacons (aggregate counts only). */

import { LIVE_APP_URL } from "@/lib/links";

export type TelemetryEvent =
  | "for_agents_view"
  | "init_copy"
  | "marketplace_copy"
  | "plugin_install_copy"
  | "action_run";

const ENDPOINT = `${LIVE_APP_URL}/api/telemetry`;

/** Fire-and-forget allowlisted event. Never throws. */
export function trackEvent(event: TelemetryEvent): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ event });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
      mode: "cors",
    });
  } catch {
    // ignore
  }
}
