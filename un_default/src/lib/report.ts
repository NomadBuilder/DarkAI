import type { Finding } from "./types";

const ISSUE_NEW =
  "https://github.com/NomadBuilder/anti-default/issues/new";

/**
 * Opens a pre-filled GitHub issue for a bad / contested suggestion.
 */
export function reportFindingIssueUrl(finding: Finding): string {
  const title = `[Un-Default] Wrong suggestion: ${finding.label} (“${finding.match}”)`;
  const body = [
    "## What was wrong",
    "",
    "<!-- Tell us why this match or suggestion is incorrect -->",
    "",
    "## Finding details",
    "",
    `- **Rule ID:** \`${finding.ruleId}\``,
    `- **Match:** “${finding.match}”`,
    `- **Label:** ${finding.label}`,
    `- **Category:** ${finding.category}`,
    finding.likelyFalsePositive
      ? `- **Soft-flagged:** yes (${finding.contextNote ?? "likely false positive"})`
      : "",
    "",
    "### Context snippet",
    "",
    "```",
    finding.context,
    "```",
    "",
    "### Suggested alternatives shown",
    "",
    finding.suggestions.map((s) => `- ${s}`).join("\n") || "_none_",
    "",
    "### Source (optional)",
    "",
    finding.source ?? "_not provided_",
    "",
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const params = new URLSearchParams({
    title,
    body,
    labels: "un-default,false-positive",
  });
  return `${ISSUE_NEW}?${params.toString()}`;
}
