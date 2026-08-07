#!/usr/bin/env tsx
/** @deprecated Prefer `npx anti-default --urls` / `--urls-file` */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = path.join(root, "bin", "anti-default.js");
const args = process.argv.slice(2);
const result = spawnSync(
  process.execPath,
  [bin, "--urls", ...args],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
