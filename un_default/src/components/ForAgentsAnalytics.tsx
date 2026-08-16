"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/telemetry";

/** Counts a for-agents page view once per mount (install-intent funnel). */
export function ForAgentsAnalytics() {
  useEffect(() => {
    trackEvent("for_agents_view");
  }, []);
  return null;
}
