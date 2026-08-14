#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { build } from "esbuild";

const execFileAsync = promisify(execFile);

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

await Promise.all([
  build({
    entryPoints: ["scripts/cli.ts"],
    outfile: "dist/cli.cjs",
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    sourcemap: true,
    define: {
      __ANTI_DEFAULT_VERSION__: JSON.stringify(
        process.env.npm_package_version ?? "0.0.0",
      ),
    },
  }),
  build({
    entryPoints: ["src/lib/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    platform: "neutral",
    target: "es2020",
    format: "esm",
    sourcemap: true,
  }),
  build({
    entryPoints: ["src/lib/index.ts"],
    outfile: "dist/index.cjs",
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    sourcemap: true,
  }),
]);

await execFileAsync(
  path.join(
    "node_modules",
    ".bin",
    process.platform === "win32" ? "tsc.cmd" : "tsc",
  ),
  [
    "--declaration",
    "--emitDeclarationOnly",
    "--outDir",
    "dist/types",
    "--module",
    "esnext",
    "--moduleResolution",
    "node",
    "--target",
    "es2020",
    "--strict",
    "--skipLibCheck",
    "src/lib/index.ts",
  ],
);
