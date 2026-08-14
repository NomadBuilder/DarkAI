# Publish Un-Default to agent directories

Checklist for getting the skill + MCP in front of Claude / Cursor users.
The product CTA is always:

```bash
npx -y anti-default init
```

One-pager: https://darkai.ca/un-default/for-agents/

---

## Cursor marketplace (plugin)

Repo already includes:

- `.cursor-plugin/plugin.json` — plugin manifest
- `mcp.json` — MCP server entry for plugin hosts
- `skills/un-default/SKILL.md` — agent skill

### Local smoke test

```bash
mkdir -p ~/.cursor/plugins/local/un-default
rsync -a \
  .cursor-plugin \
  mcp.json \
  skills \
  README.md \
  ~/.cursor/plugins/local/un-default/
```

Reload Cursor → confirm skill `un-default` and MCP server appear.

### Submit

1. Polish README “After Claude / Cursor” section (done).
2. Optional logo: square PNG hosted in-repo.
3. Submit at https://cursor.com/marketplace/publish  
   or email Cursor plugins (see current Cursor plugin-template docs).
4. Also list on community catalog: https://cursor.directory/plugins/new — paste the GitHub URL.

---

## Claude MCP directories

Paste the same stdio config:

```json
{
  "mcpServers": {
    "un-default": {
      "command": "npx",
      "args": ["-y", "anti-default", "mcp"]
    }
  }
}
```

Submit / claim listings where people browse MCP servers:

| Directory | Notes |
|-----------|--------|
| [Glama MCP](https://glama.ai/mcp) | Add server with npm package `un-default`, command `npx -y un-default mcp` |
| [Smithery](https://smithery.ai) | Publish if you want one-click Claude Desktop install |
| [mcp.so](https://mcp.so) / PulseMCP | Community listings — link to for-agents + GitHub |
| Anthropic / Claude docs “custom connectors” | When they accept community stdio servers, point at this package |

Always link **https://darkai.ca/un-default/for-agents/** as the install doc.

---

## Claude Project gallery / templates

There is no official public “Project template store” yet. Distribution:

1. Share the custom-instructions block from the for-agents page.
2. Pin a LinkedIn / X post with the instructions + `npx -y anti-default init`.
3. Add a gist mirroring `docs/agents/CLAUDE_PROJECT.md` for easy star/fork.

---

## After listing

- Update Chrome store / npm README badges if directories give share URLs.
- Prefer CTA copy that says **run `init`**, not “star the repo”.
