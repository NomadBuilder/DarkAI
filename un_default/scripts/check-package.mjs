#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const temp = await mkdtemp(path.join(os.tmpdir(), "un-default-package-"));

try {
  const packed = await exec(
    "npm",
    ["pack", "--json", "--pack-destination", temp],
    { cwd: process.cwd(), maxBuffer: 2_000_000 },
  );
  const packInfo = JSON.parse(packed.stdout)[0];
  const tarball = path.join(temp, packInfo.filename);

  await writeFile(
    path.join(temp, "package.json"),
    '{"name":"un-default-smoke","private":true,"type":"module"}\n',
  );
  await writeFile(
    path.join(temp, "copy.md"),
    "Hey guys. Ask a policeman. Enable the whitelist.\\n",
  );
  await exec(
    "npm",
    ["install", tarball, "--no-audit", "--no-fund", "--ignore-scripts"],
    { cwd: temp, maxBuffer: 2_000_000 },
  );

  const bin = path.join(temp, "node_modules", ".bin", "un-default");
  const scan = await exec(
    bin,
    ["copy.md", "--format", "json", "--fail-on", "never"],
    { cwd: temp },
  );
  const report = JSON.parse(scan.stdout);
  if (!report.findings?.length) throw new Error("packed CLI found nothing");

  const dry = await exec(
    bin,
    ["fix", "copy.md", "--dry-run", "--format", "json", "--fail-on", "never"],
    { cwd: temp },
  );
  const dryReport = JSON.parse(dry.stdout);
  if (!dryReport.appliedCount) throw new Error("packed CLI fix dry-run applied nothing");

  await exec(bin, ["fix", "copy.md", "--fail-on", "never"], { cwd: temp });
  const fixed = await readFile(path.join(temp, "copy.md"), "utf8");
  if (/policeman|whitelist/i.test(fixed)) {
    throw new Error("packed CLI fix did not rewrite safe matches");
  }
  if (!/\bguys\b/i.test(fixed)) {
    throw new Error("packed CLI fix should leave multi-option guys for review");
  }

  await exec(bin, ["init"], { cwd: temp });
  await readFile(
    path.join(temp, ".cursor", "skills", "un-default", "SKILL.md"),
    "utf8",
  );
  await readFile(path.join(temp, ".cursor", "mcp.json"), "utf8");
  await exec(bin, ["baseline", "."], { cwd: temp });
  const afterBaseline = await exec(
    bin,
    [".", "--format", "json", "--fail-on", "any"],
    { cwd: temp },
  );
  if (JSON.parse(afterBaseline.stdout).findings.length !== 0) {
    throw new Error("packed CLI baseline did not suppress existing findings");
  }

  const apiCheck = path.join(temp, "api-check.mjs");
  await writeFile(
    apiCheck,
    `import { analyzeText } from "un-default";
const result = analyzeText("Welcome, you guys.");
if (!result.findings.length) process.exit(1);
console.log(result.findings.length);
`,
  );
  await exec(process.execPath, [apiCheck], { cwd: temp });
  const cjsCheck = path.join(temp, "api-check.cjs");
  await writeFile(
    cjsCheck,
    `const { analyzeText } = require("un-default");
if (!analyzeText("Welcome, you guys.").findings.length) process.exit(1);
`,
  );
  await exec(process.execPath, [cjsCheck], { cwd: temp });

  const pkg = JSON.parse(
    await readFile(path.join(temp, "node_modules", "un-default", "package.json"), "utf8"),
  );
  if (Object.keys(pkg.dependencies ?? {}).length !== 0) {
    throw new Error("published package unexpectedly has runtime dependencies");
  }

  console.log(
    `Package OK: ${packInfo.filename} · ${packInfo.size} bytes · ${report.findings.length} finding(s)`,
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
