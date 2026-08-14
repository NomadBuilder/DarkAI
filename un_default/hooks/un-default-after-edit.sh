#!/usr/bin/env bash
# Un-Default — run after Claude Code / Cursor file edits.
# Reads hook JSON on stdin. On hard findings, surfaces them to the agent
# (Claude Code: exit 2 + stderr; Cursor: additional_context JSON).
set -u

INPUT="$(cat || true)"

FILE="$(
  printf '%s' "$INPUT" | node -e '
let d = "";
process.stdin.on("data", (c) => (d += c));
process.stdin.on("end", () => {
  try {
    const j = JSON.parse(d || "{}");
    const p =
      j.tool_input?.file_path ||
      j.tool_input?.path ||
      j.file_path ||
      j.path ||
      j.filePath ||
      "";
    process.stdout.write(typeof p === "string" ? p : "");
  } catch {
    process.stdout.write("");
  }
});
' 2>/dev/null || true
)"

if [[ -z "${FILE}" || ! -f "${FILE}" ]]; then
  exit 0
fi

case "${FILE}" in
  *.md|*.mdx|*.txt|*.html|*.htm|*.tsx|*.jsx|*.vue|*.svelte|*.astro|*.css|*.scss|*.sass|*.less|*.json|*.yml|*.yaml|*.toml|*.xml|*.svg|*.mjs|*.cjs|*.js|*.ts|*.py|*.rb|*.go|*.rs|*.java|*.kt|*.swift|*.php|*.cs|*.sh|*.bash|*.zsh)
    ;;
  *)
    exit 0
    ;;
esac

# Skip generated / vendor noise
case "${FILE}" in
  *node_modules*|*dist/*|*/.next/*|*/out/*|*package-lock.json|*pnpm-lock.yaml)
    exit 0
    ;;
esac

STATUS=0
REPORT="$(npx --yes anti-default "${FILE}" --format text --fail-on hard 2>&1)" || STATUS=$?

if [[ "${STATUS}" -eq 0 ]]; then
  exit 0
fi

MSG="Un-Default found hard inclusive-language hits in ${FILE}.
Fix clear user-facing hits (or record fine-in-context feedback) before treating this copy as done.
Prefer: npx -y anti-default fix \"${FILE}\" then re-scan, or MCP un_default_fix / un_default_scan.

${REPORT}"

# Claude Code PostToolUse: exit 2 shows stderr to the model (tool already ran).
if printf '%s' "$INPUT" | grep -q '"hook_event_name"'; then
  printf '%s\n' "$MSG" >&2
  exit 2
fi

# Cursor hooks: inject as additional_context when supported.
node -e 'const msg=process.argv[1]; process.stdout.write(JSON.stringify({ additional_context: msg }));' "$MSG"
exit 0
