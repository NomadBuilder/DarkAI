#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/** npx un-default entry. Published packages run the compiled CLI. */
const path = require("node:path");

const pkgRoot = path.join(__dirname, "..");
const compiled = path.join(pkgRoot, "dist", "cli.cjs");
const cli = path.join(pkgRoot, "scripts", "cli.ts");

try {
  require(compiled);
  return;
} catch (error) {
  if (error && error.code !== "MODULE_NOT_FOUND") throw error;
}

// Source-checkout fallback for contributors before `npm run package:build`.
require("tsx/cjs");
require(cli);
