#!/usr/bin/env node
/**
 * npx anti-default entry — runs the TypeScript CLI via tsx.
 * Resolves tsx from this package so CI / composite actions work
 * even when cwd is the consumer repo.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const pkgRoot = path.join(__dirname, "..");
const cli = path.join(pkgRoot, "scripts", "cli.ts");
const nodeModules = path.join(pkgRoot, "node_modules");

function resolveTsxImport() {
  try {
    return require.resolve("tsx/esm/api/register", { paths: [pkgRoot] });
  } catch {
    try {
      return require.resolve("tsx", { paths: [pkgRoot] });
    } catch {
      return "tsx";
    }
  }
}

function resolveTsxCjs() {
  try {
    return require.resolve("tsx/cjs", { paths: [pkgRoot] });
  } catch {
    return require.resolve("tsx/cjs");
  }
}

const env = {
  ...process.env,
  NODE_PATH: [nodeModules, process.env.NODE_PATH]
    .filter(Boolean)
    .join(path.delimiter),
};

let result = spawnSync(
  process.execPath,
  ["--import", resolveTsxImport(), cli, ...process.argv.slice(2)],
  { stdio: "inherit", env },
);

if (result.error) {
  result = spawnSync(
    process.execPath,
    ["-r", resolveTsxCjs(), cli, ...process.argv.slice(2)],
    { stdio: "inherit", env },
  );
}

process.exit(result.status ?? 1);
