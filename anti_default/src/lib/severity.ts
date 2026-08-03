import type { Severity } from "./types";

/** Plain-language labels for finding urgency (internal keys stay high/medium/low). */
export const SEVERITY_LABEL: Record<Severity, string> = {
  high: "Worth fixing",
  medium: "Consider",
  low: "Optional",
};

export const SEVERITY_ORDER: Severity[] = ["high", "medium", "low"];

export function severityLabel(severity: Severity): string {
  return SEVERITY_LABEL[severity];
}
