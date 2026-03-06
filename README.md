# OWASP Agent Skills

Security guidance for AI coding agents, grounded in [OWASP ASVS 5.0](https://owasp.org/www-project-application-security-verification-standard/). Two delivery options are provided — use whichever fits your setup:

|                           | Skill                              | MCP server                  |
| ------------------------- | ---------------------------------- | --------------------------- |
| Requires a running server | No                                 | Yes                         |
| Guidance delivery         | Inlined into context at skill load | Fetched on demand via tools |
| Semantic search           | No (index only)                    | Yes                         |

---

## Option 1: Claude Code Skill

The skill inlines a compact ASVS index into the agent context. The agent reads the index to identify relevant sections, then reads the full reference files as needed.

### Setup

Copy or symlink the `skills/security-guidance/` directory into your Claude Code skills folder (typically `~/.claude/skills/` or a project-local `.claude/skills/`):

```bash
# Project-local
ln -s /path/to/this/repo/skills/security-guidance .claude/skills/security-guidance
```

No server, no dependencies — the skill works entirely from files in this repository.

### How it works

When triggered, the skill:

1. Runs `expand.sh` to build a live index from `references/ASVS/` — one entry per subsection with its title, summary, and `when_to_use` triggers.
2. Instructs the agent to match the current task against those triggers, read the relevant reference files, and apply the requirements.
3. Requires the agent to cite each applied requirement inline (e.g., `// ASVS 6.2.4`).

The skill is designed to trigger automatically on any task touching user input, authentication, data persistence, network communication, file I/O, cryptography, or access control.

---

## Option 2: MCP Server

The MCP server exposes two tools — `search_guidance` (semantic search) and `get_guidance` (fetch by ID) — and serves them over stdio or HTTP.

### First run / caching

On startup the server:

1. Downloads the `onnx-community/Qwen3-Embedding-0.6B-ONNX` model via `@huggingface/transformers` (~600 MB, cached by Hugging Face in `~/.cache/huggingface/`).
2. Computes embeddings for every reference file and caches them in `mcp/src/_cache/` (keyed by file content hash).

**This only happens once.** Subsequent runs load from cache. To avoid re-downloading the model or regenerating embeddings on every run, make sure both cache locations are preserved between runs — do not run the server in a throwaway container without mounting these directories.

### Install

```bash
cd mcp
npm install
```

### Run modes

```bash
npm run stdio       # stdio transport (for mcp.json)
npm run stateless   # HTTP stateless — http://localhost:3000/mcp
npm run stateful    # HTTP stateful  — http://localhost:3000/mcp (+ legacy /sse)
```

Set `PORT` to change the HTTP port. Set `CARDFOLDER` to point at a different references directory if you want to use custom guidance rather than ASVS.

### Claude Code — stdio configuration

Add to your `mcp.json` (e.g., `~/.claude/mcp.json` for global, or `.claude/mcp.json` for project-local):

```json
{
  "mcpServers": {
    "security-guidance": {
      "type": "stdio",
      "command": "npm",
      "args": ["run", "stdio"],
      "cwd": "/absolute/path/to/this/repo/mcp",
      "env": {}
    }
  }
}
```

To persist the Hugging Face model cache across runs, add it to `env`:

```json
"env": {
  "HF_HOME": "/absolute/path/to/this/repo/mcp/.hf_cache"
}
```

This keeps the model download local to the project so it survives between updates and is easy to back up.

### Agent rules (MCP)

`mcp/rules/security_guidance.md` contains a system prompt you can add to your agent configuration to instruct it to always consult the MCP tools before writing security-sensitive code.

---

## Updating for a new ASVS version

When a new ASVS release is published, the reference files in `references/ASVS/` need to be regenerated. The full specification for the extraction script and output format is in [`docs/EXTRACT_ASVS.md`](docs/EXTRACT_ASVS.md).

The extraction script (`scripts/extract_asvs.py`) is not included in this repository. Ask an AI agent to create it by pointing it at `docs/EXTRACT_ASVS.md` as the specification.

Once the script exists:

1. Delete the existing generated files:
   ```bash
   rm references/ASVS/*.md
   ```
2. Run:
   ```bash
   python3 scripts/extract_asvs.py
   ```

The MCP embedding cache (`mcp/src/_cache/`) will automatically recompute only the changed files on next startup — unchanged files hit the cache by content hash.
