#!/usr/bin/env tsx
import { LANGUAGE_RULES } from "../src/lib/rules";
import {
  ruleSourceMappingIds,
  sourceContextForRule,
} from "../src/lib/rule-sources";
import { SOURCE_GROUPS } from "../src/lib/sources";

const ruleIds = new Set(LANGUAGE_RULES.map((rule) => rule.id));
const staleMappings = ruleSourceMappingIds().filter((id) => !ruleIds.has(id));
const missing = LANGUAGE_RULES.filter(
  (rule) => !sourceContextForRule(rule).hasDirectEvidence,
);
const colonial = LANGUAGE_RULES.filter((rule) => rule.category === "colonial");
const colonialWithEvidence = colonial.filter(
  (rule) => sourceContextForRule(rule).hasDirectEvidence,
);
const colonialUnclear = colonial.filter((rule) => {
  const context = sourceContextForRule(rule);
  return !context.hasDirectEvidence && context.contested.length === 0;
});
const evidenceWithoutClaim = LANGUAGE_RULES.flatMap((rule) =>
  sourceContextForRule(rule).evidence
    .filter((source) => !source.supports)
    .map((source) => `${rule.id}: ${source.title}`),
);
const worldBankReferences = LANGUAGE_RULES.flatMap((rule) => {
  const context = sourceContextForRule(rule);
  return [...context.evidence, ...context.contested]
    .filter((source) => /world bank|worldbank/i.test(source.title + source.href))
    .map((source) => `${rule.id}: ${source.title}`);
});
const weakSourcePattern =
  /rationalwiki|reddit\.com|indiecator|conspiracychart/i;
const weakRuleReferences = LANGUAGE_RULES.flatMap((rule) => {
  const context = sourceContextForRule(rule);
  return [...context.evidence, ...context.contested, ...context.background]
    .filter((source) =>
      weakSourcePattern.test(`${source.title} ${source.href}`),
    )
    .map((source) => `${rule.id}: ${source.title}`);
});
const weakPublicReferences = SOURCE_GROUPS.flatMap((group) =>
  group.links
    .filter((source) =>
      weakSourcePattern.test(`${source.title} ${source.href}`),
    )
    .map((source) => `${group.id}: ${source.title}`),
);

console.log(
  `Source audit: ${LANGUAGE_RULES.length - missing.length}/${LANGUAGE_RULES.length} rules have direct evidence.`,
);
console.log(
  `Colonial & Eurocentric: ${colonialWithEvidence.length}/${colonial.length} have direct evidence.`,
);
if (colonialUnclear.length > 0) {
  console.log(
    `Colonial rules still needing direct research: ${colonialUnclear.map((rule) => rule.id).join(", ")}`,
  );
}

const errors: string[] = [];
if (staleMappings.length > 0) {
  errors.push(`source mappings reference unknown rule IDs: ${staleMappings.join(", ")}`);
}
if (evidenceWithoutClaim.length > 0) {
  errors.push(
    `Rule evidence missing a specific “supports” claim:\n- ${evidenceWithoutClaim.join("\n- ")}`,
  );
}
if (worldBankReferences.length > 0) {
  errors.push(
    `World Bank references remain attached as rule evidence:\n- ${worldBankReferences.join("\n- ")}`,
  );
}
if (weakRuleReferences.length > 0 || weakPublicReferences.length > 0) {
  errors.push(
    `Editable, crowdsourced, or personal references remain in the source model:\n- ${[
      ...weakRuleReferences,
      ...weakPublicReferences,
    ].join("\n- ")}`,
  );
}
if (colonialWithEvidence.length < 22) {
  errors.push(
    `Colonial direct-evidence coverage fell below 22/${colonial.length}.`,
  );
}

if (errors.length > 0) {
  console.error(`\n${errors.join("\n\n")}`);
  process.exitCode = 1;
} else {
  console.log("Source provenance checks passed.");
}
