#!/usr/bin/env tsx
/** @deprecated Prefer `npx anti-default` / `node bin/anti-default.js` */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = path.join(root, "bin", "anti-default.js");
const result = spawnSync(process.execPath, [bin, ...process.argv.slice(2)], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
