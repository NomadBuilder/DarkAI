#!/usr/bin/env tsx
/**
 * Practice test: run Anti-Default against the lived corpus.
 *
 *   npm run corpus
 *
 * Exit 1 if any non-gap case fails.
 */
import {
  CORPUS_CASES,
  type CorpusCase,
} from "../fixtures/corpus/cases";
import { analyzeText } from "../src/lib/analyzer";

interface CaseResult {
  id: string;
  ok: boolean;
  knownGap: boolean;
  detail: string;
}

function checkCase(c: CorpusCase): CaseResult {
  const result = analyzeText(c.text, {
    sourceType: "text",
    sourceLabel: c.id,
  });
  const findings = result.findings;
  const byRule = new Map<string, typeof findings>();
  for (const f of findings) {
    const list = byRule.get(f.ruleId) ?? [];
    list.push(f);
    byRule.set(f.ruleId, list);
  }

  const knownGap = Boolean(c.knownGap);

  if (c.expect === "flag") {
    const missing = c.ruleIds.filter((id) => !byRule.has(id));
    if (missing.length) {
      return {
        id: c.id,
        ok: false,
        knownGap,
        detail: `expected rules missing: ${missing.join(", ")} (got: ${
          findings.map((f) => f.ruleId).join(", ") || "none"
        })`,
      };
    }
    return {
      id: c.id,
      ok: true,
      knownGap,
      detail: `flagged ${c.ruleIds.join(", ")}`,
    };
  }

  if (c.expect === "no-flag") {
    const hits = c.ruleIds.filter((id) => byRule.has(id));
    if (hits.length) {
      return {
        id: c.id,
        ok: false,
        knownGap,
        detail: `should not flag ${hits.join(", ")} but did`,
      };
    }
    if (c.strict) {
      if (findings.length) {
        return {
          id: c.id,
          ok: false,
          knownGap,
          detail: `strict no-flag but got: ${findings.map((f) => f.ruleId).join(", ")}`,
        };
      }
    }
    return {
      id: c.id,
      ok: true,
      knownGap,
      detail: `correctly skipped ${c.ruleIds.join(", ")}`,
    };
  }

  // soft
  const missing = c.ruleIds.filter((id) => !byRule.has(id));
  if (missing.length) {
    return {
      id: c.id,
      ok: false,
      knownGap,
      detail: `expected soft rules missing: ${missing.join(", ")}`,
    };
  }
  const notSoft = c.ruleIds.filter((id) => {
    const hits = byRule.get(id) ?? [];
    return hits.some((f) => !f.likelyFalsePositive);
  });
  if (notSoft.length) {
    return {
      id: c.id,
      ok: false,
      knownGap,
      detail: `expected soft-flag on ${notSoft.join(", ")} but likelyFalsePositive was false`,
    };
  }
  return {
    id: c.id,
    ok: true,
    knownGap,
    detail: `soft-flagged ${c.ruleIds.join(", ")}`,
  };
}

function main() {
  const results = CORPUS_CASES.map(checkCase);
  const hard = results.filter((r) => !r.knownGap);
  const gaps = results.filter((r) => r.knownGap);
  const failed = hard.filter((r) => !r.ok);
  const gapOpen = gaps.filter((r) => !r.ok);
  const gapClosed = gaps.filter((r) => r.ok);

  console.log(`\nAnti-Default corpus — ${CORPUS_CASES.length} cases\n`);

  for (const r of hard) {
    const mark = r.ok ? "PASS" : "FAIL";
    console.log(`${mark}  ${r.id}`);
    if (!r.ok) console.log(`      ${r.detail}`);
  }

  if (gaps.length) {
    console.log("\nKnown gaps (warn only):");
    for (const r of gaps) {
      if (r.ok) {
        console.log(`CLOSED ${r.id} — rule now catches this; remove knownGap`);
      } else {
        console.log(`GAP    ${r.id}`);
        console.log(`      ${r.detail}`);
      }
    }
  }

  console.log(
    `\n${hard.length - failed.length}/${hard.length} practice checks passed` +
      (gapOpen.length ? ` · ${gapOpen.length} known gaps still open` : "") +
      (gapClosed.length ? ` · ${gapClosed.length} gaps now closed` : "") +
      "\n",
  );

  if (failed.length) {
    console.error("Corpus failed. Fix rules/context or update the case.\n");
    process.exit(1);
  }
}

main();
