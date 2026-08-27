# Shared feedback → better defaults

When someone marks a finding **Fine in this context**, Un-Default records a structured event:

- Locally: `.undefaultfeedback.jsonl` (CLI / MCP) or browser storage (web)
- Optionally as a GitHub issue labeled `fine-in-context`

These events are how the shared catalog learns safer soft-flags and fewer false positives — without guessing from private repos.

## Event shape

```json
{
  "version": 1,
  "kind": "fine_in_context",
  "createdAt": "2026-08-07T00:00:00.000Z",
  "ruleId": "guys-generic",
  "match": "guys",
  "context": "…snippet…",
  "note": "Quoted lyric / proper name / …",
  "sourceKind": "cli"
}
```

## Maintainers

1. Triage `fine-in-context` issues monthly.
2. Promote repeated patterns into `context.ts` soft-rules or rule `defaultSoft`.
3. Never paste private customer copy into the public rules file — generalize the pattern.
