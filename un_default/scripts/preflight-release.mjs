#!/usr/bin/env node
/**
 * Local QA gate before tagging a release / submitting directories.
 * Usage: npm run preflight
 */
import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, chmod } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  failures.push(msg);
}

async function readJson(rel) {
  return JSON.parse(await readFile(path.join(root, rel), "utf8"));
}

async function checkVersions() {
  console.log("\nVersions");
  const pkg = await readJson("package.json");
  const version = pkg.version;
  if (!pkg.mcpName) fail("package.json missing mcpName");
  else ok(`mcpName ${pkg.mcpName}`);

  const pairs = [
    ["server.json", (j) => j.version],
    ["server.json package", (j) => j.packages?.[0]?.version],
    [".claude-plugin/plugin.json", (j) => j.version],
    [".claude-plugin/marketplace.json", (j) => j.metadata?.version],
    [".cursor-plugin/plugin.json", (j) => j.version],
  ];

  for (const [label, pick] of pairs) {
    const file = label.split(" ")[0];
    const j = await readJson(file);
    const v = pick(j);
    if (v !== version) fail(`${label} is ${v}, expected ${version}`);
    else ok(`${label} = ${version}`);
  }

  if (pkg.mcpName !== (await readJson("server.json")).name) {
    fail("package.json mcpName !== server.json name");
  } else {
    ok("mcpName matches server.json name");
  }
}

async function runTests() {
  console.log("\nTests");
  try {
    await exec("npm", ["test"], {
      cwd: root,
      maxBuffer: 8_000_000,
      env: process.env,
    });
    ok("npm test");
  } catch (err) {
    fail(`npm test failed: ${err.stderr || err.message}`);
  }
}

async function mcpRoundTrip() {
  console.log("\nMCP");
  const bin = path.join(root, "bin", "un-default.js");
  const temp = await mkdtemp(path.join(os.tmpdir(), "un-default-mcp-"));
  try {
    await writeFile(
      path.join(temp, "copy.md"),
      "Ask a policeman about the whitelist.\n",
    );

    const child = spawn(process.execPath, [bin, "mcp"], {
      cwd: temp,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let buf = "";
    const replies = [];
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      buf += chunk;
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (line) {
          try {
            replies.push(JSON.parse(line));
          } catch {
            /* ignore non-json */
          }
        }
      }
    });

    const send = (msg) => {
      child.stdin.write(`${JSON.stringify(msg)}\n`);
    };

    send({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "preflight", version: "0" },
      },
    });
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    send({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "un_default_scan",
        arguments: { paths: ["copy.md"], failOn: "never" },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 2500));
    child.kill("SIGTERM");
    await new Promise((resolve) => child.on("close", resolve));

    const tools = replies.find((r) => r.id === 2)?.result?.tools ?? [];
    const names = tools.map((t) => t.name);
    for (const need of [
      "un_default_scan",
      "un_default_fix",
      "un_default_feedback",
    ]) {
      if (!names.includes(need)) fail(`MCP missing tool ${need}`);
      else ok(`MCP tool ${need}`);
    }

    const scanReply = replies.find((r) => r.id === 3);
    const text = scanReply?.result?.content?.[0]?.text ?? "";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      fail("MCP un_default_scan did not return JSON text");
      return;
    }
    if (!parsed.findings?.length) fail("MCP scan found nothing on known hits");
    else ok(`MCP scan → ${parsed.findings.length} finding(s)`);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

async function hookSmoke() {
  console.log("\nAfter-edit hook");
  const temp = await mkdtemp(path.join(os.tmpdir(), "un-default-hook-"));
  try {
    const file = path.join(temp, "copy.md");
    await writeFile(file, "Ask a policeman about the whitelist.\n");
    const scriptSrc = await readFile(
      path.join(root, "hooks", "un-default-after-edit.sh"),
      "utf8",
    );
    const script = path.join(temp, "hook.sh");
    const localBin = path.join(root, "bin", "un-default.js");
    const localCmd = `"${process.execPath}" "${localBin}"`;
    // Prefer local CLI over registry npx during preflight.
    await writeFile(
      script,
      scriptSrc.replace(/npx --yes anti-default/g, localCmd),
    );
    await chmod(script, 0o755);

    const input = JSON.stringify({
      hook_event_name: "PostToolUse",
      tool_input: { file_path: file },
    });

    let status = 0;
    let stderr = "";
    try {
      await new Promise((resolve, reject) => {
        const child = spawn("bash", [script], {
          cwd: temp,
          env: { ...process.env, PATH: process.env.PATH },
        });
        let err = "";
        child.stderr.setEncoding("utf8");
        child.stderr.on("data", (c) => {
          err += c;
        });
        child.on("error", reject);
        child.on("close", (code) => {
          status = code ?? 1;
          stderr = err;
          resolve();
        });
        child.stdin.end(input);
      });
    } catch (err) {
      status = 1;
      stderr = String(err.message ?? err);
    }

    if (status !== 2) fail(`hook exit ${status}, expected 2 on hard hits`);
    else ok("hook exit 2 on hard hits");
    if (!/Un-Default found hard/i.test(stderr)) {
      fail("hook stderr missing Un-Default message");
    } else {
      ok("hook stderr surfaces findings");
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

async function pluginValidate() {
  console.log("\nClaude plugin");
  try {
    await exec("claude", ["plugin", "validate", "."], {
      cwd: root,
      maxBuffer: 2_000_000,
    });
    ok("claude plugin validate .");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("  · claude CLI not installed — skip validate");
    } else {
      fail(`claude plugin validate: ${err.stderr || err.message}`);
    }
  }
}

async function initMergeSmoke() {
  console.log("\nInit merge");
  const temp = await mkdtemp(path.join(os.tmpdir(), "un-default-init-"));
  try {
    await writeFile(
      path.join(temp, "package.json"),
      '{"name":"preflight-init","private":true}\n',
    );
    await exec("mkdir", ["-p", path.join(temp, ".claude")]);
    await writeFile(
      path.join(temp, ".claude", "settings.json"),
      JSON.stringify(
        {
          hooks: {
            PostToolUse: [
              {
                matcher: "Bash",
                hooks: [{ type: "command", command: "echo keep-me" }],
              },
            ],
          },
        },
        null,
        2,
      ),
    );

    const bin = path.join(root, "bin", "un-default.js");
    await exec(process.execPath, [bin, "init"], { cwd: temp });
    const settings = JSON.parse(
      await readFile(path.join(temp, ".claude", "settings.json"), "utf8"),
    );
    const blob = JSON.stringify(settings);
    if (!blob.includes("un-default-after-edit")) {
      fail("init did not merge Un-Default hook into existing settings");
    } else {
      ok("init merged Un-Default into existing Claude settings");
    }
    if (!blob.includes("keep-me")) {
      fail("init clobbered pre-existing PostToolUse hook");
    } else {
      ok("init kept pre-existing PostToolUse hook");
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

function printNextSteps(version) {
  console.log(`
Next (after preflight is green)
  1. Commit any remaining changes on main
  2. Ensure GitHub secret NPM_TOKEN (granular publish) OR npm trusted publisher for this repo
  3. Tag and push:
       git tag v${version}
       git push origin v${version}
     → .github/workflows/publish.yml runs tests, npm publish, MCP Registry
  4. One-time / manual directories (not automatable):
       Anthropic  https://platform.claude.com/plugins/submit
       Cursor     https://cursor.com/marketplace/publish
       cursor.directory / Glama / mcp.so / Smithery — see docs/PUBLISH-DIRECTORIES.md
  5. Smoke from a clean machine:
       npx -y anti-default@${version} --help
`);
}

const pkg = await readJson("package.json");

await checkVersions();
await runTests();
await mcpRoundTrip();
await hookSmoke();
await initMergeSmoke();
await pluginValidate();

console.log("");
if (failures.length) {
  console.error(`Preflight FAILED (${failures.length}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log("Preflight PASSED");
printNextSteps(pkg.version);
