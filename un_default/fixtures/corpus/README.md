# Lived corpus (practice test)

This folder is a **practice test** made of real-ish sentences — the kinds of lines people actually see on jobs pages, news, and org sites.

We run Un-Default on them whenever rules change:

```bash
npm run corpus
```

- **PASS / FAIL** — cases we claim to handle today  
- **GAP** — harms we care about but haven’t added a rule for yet (warning only)

Edit `cases.ts` to add snippets. Prefer paraphrased public copy; don’t paste private documents.
