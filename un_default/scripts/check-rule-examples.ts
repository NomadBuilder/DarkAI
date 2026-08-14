#!/usr/bin/env tsx
/**
 * Verify rule examples match and counterexamples do not.
 */
import { LANGUAGE_RULES } from "../src/lib/rules";
import { analyzeText } from "../src/lib/analyzer";

const errors: string[] = [];
let exampleChecks = 0;
let counterexampleChecks = 0;

for (const rule of LANGUAGE_RULES) {
  for (const example of rule.examples ?? []) {
    exampleChecks += 1;
    const result = analyzeText(example, {
      sourceType: "text",
      sourceLabel: `${rule.id}:example`,
    });
    if (!result.findings.some((finding) => finding.ruleId === rule.id)) {
      errors.push(
        `${rule.id} example did not match: ${JSON.stringify(example)}`,
      );
    }
  }

  for (const counterexample of rule.counterexamples ?? []) {
    counterexampleChecks += 1;
    const result = analyzeText(counterexample, {
      sourceType: "text",
      sourceLabel: `${rule.id}:counterexample`,
    });
    if (result.findings.some((finding) => finding.ruleId === rule.id)) {
      errors.push(
        `${rule.id} counterexample still matched: ${JSON.stringify(counterexample)}`,
      );
    }
  }
}

console.log(
  `Rule shape checks: ${exampleChecks} examples, ${counterexampleChecks} counterexamples across ${LANGUAGE_RULES.filter((r) => (r.examples?.length || r.counterexamples?.length)).length} authored rules.`,
);

if (errors.length) {
  console.error(`\n${errors.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Rule example/counterexample checks passed.");
}
