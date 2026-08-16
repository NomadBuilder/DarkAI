# Directory & marketplace submissions

Repo is ready for discovery. Product CTA stays:

```bash
npx -y anti-default init
```

One-pager: https://darkai.ca/un-default/for-agents/

---

## Automated release (npm + MCP Registry)

Before tagging:

```bash
npm run preflight
```

That checks version sync, full tests, MCP tools/list + scan, after-edit hook exit-2,
init merge into existing Claude settings, and `claude plugin validate` when available.

Then tag (versions must match `package.json`):

```bash
git tag v0.5.4
git push origin v0.5.4
```

`.github/workflows/publish.yml` on `v*` tags / GitHub Releases:

1. Preflight  
2. `npm publish --access public --provenance`  
3. Wait until the version is visible on npm  
4. `mcp-publisher` → official MCP Registry (GitHub OIDC)  
5. Print the manual directory checklist  

**GitHub secret:** `NPM_TOKEN` (granular publish token), **or** configure npm
[trusted publishing](https://docs.npmjs.com/trusted-publishers) for this repo so
OIDC provenance works without a classic token.

MCP Registry OIDC needs no extra secret (`id-token: write` is already set).

---

## Done in-repo (shipped)

| Channel | Artifact |
|---------|----------|
| Claude Code marketplace (self-serve) | `.claude-plugin/marketplace.json` + `plugin.json` |
| Claude plugin components | `skills/`, `.mcp.json`, `hooks/hooks.json` |
| Cursor plugin | `.cursor-plugin/plugin.json`, `mcp.json`, `skills/` |
| Official MCP Registry metadata | `server.json` + `package.json` → `mcpName` |
| Smithery | `smithery.yaml` |

### Claude Code — install without browsing a store

```bash
claude plugin marketplace add NomadBuilder/anti-default
claude plugin install un-default@un-default
```

Validate locally (optional):

```bash
claude plugin validate .
```

### Official Claude plugin directory (Anthropic)

Submit the **public GitHub repo** after validate:

- Console: https://platform.claude.com/plugins/submit  
- Team/Enterprise: https://claude.ai/admin-settings/directory/submissions/plugins/new  

Repo URL: `https://github.com/NomadBuilder/anti-default`

### Cursor marketplace

1. Local smoke (optional): see `docs/PUBLISH-DIRECTORIES.md`
2. Submit: https://cursor.com/marketplace/publish  
3. Community: https://cursor.directory/plugins/new — paste GitHub URL

### Official MCP Registry

Requires npm package with matching `mcpName` (needs **anti-default@0.5.4+** published), then:

```bash
# once: install mcp-publisher (brew or GitHub release)
mcp-publisher login github
mcp-publisher publish
```

Server name: `io.github.NomadBuilder/un-default`

### Smithery

```bash
npx @smithery/cli@latest
# or after smithery auth:
# smithery mcp publish ./… -n nomadbuilder/un-default
```

Use `smithery.yaml` (npx `anti-default mcp`). Complete any web onboarding at https://smithery.ai

---

## Paste-ready listing copy

**Name:** Un-Default  
**npm:** `anti-default`  
**Command:** `npx -y anti-default mcp`  
**Init:** `npx -y anti-default init`  
**Docs:** https://darkai.ca/un-default/for-agents/  
**GitHub:** https://github.com/NomadBuilder/anti-default  
**Privacy:** https://darkai.ca/un-default/privacy/

**Short description (≤160 chars):**  
Inclusive-language definition of done for AI-written copy. Local rules, scan/fix/feedback MCP, after-edit hooks. No account.

**Longer blurb:**  
Un-Default catches colonial defaults, gendered role titles, ableist framing, and related coded language in UI copy, docs, and marketing. One `init` installs a Claude/Cursor skill, MCP tools, after-edit hooks, and a PR check so agents keep checking even when nobody remembers. Prefer `npx -y anti-default init` over starring the repo.

### Glama / mcp.so / PulseMCP

| Field | Value |
|-------|--------|
| Package | `anti-default` |
| Start | `npx -y anti-default mcp` |
| Homepage | https://darkai.ca/un-default/for-agents/ |
| Source | https://github.com/NomadBuilder/anti-default |

(Do **not** use the blocked npm name `un-default`.)

---

## Still manual (needs your account)

- [ ] Anthropic plugin directory form  
- [ ] Cursor marketplace publish  
- [ ] cursor.directory  
- [ ] `mcp-publisher publish` (after npm 0.5.4)  
- [ ] Smithery account publish  
- [ ] Glama / mcp.so / PulseMCP claim  
- [ ] Post LinkedIn draft from for-agents page  
