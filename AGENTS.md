# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains two parallel delivery mechanisms for OWASP ASVS 5.0 security guidance to AI coding agents:

1. **`skills/security-guidance/`** — A Claude Code skill that inlines ASVS guidance directly into the agent context via `expand.sh`. No server required.
2. **`mcp/`** — A Model Context Protocol (MCP) server that serves the same guidance via semantic search over HTTP or stdio.

Both consume the same source files in `references/ASVS/`.

## Reference Files (`references/ASVS/`)

Each file corresponds to one ASVS subsection (e.g., `V1.2.md`, `V6.3.md`). Files have a YAML frontmatter block followed by the verbatim ASVS content:

```yaml
---
title: "VN.M Section Title"
asvs_chapter: "VN.M"
when_to_use:
  - <programming task trigger>
threats:
  - <attack category>
summary: "<one-line description>"
---
```

To regenerate these files after an ASVS version update, follow `docs/EXTRACT_ASVS.md`. The script is `scripts/extract_asvs.py` (not in this repo — lives in a checked-out ASVS repo; see the doc for details).

## MCP Server (`mcp/`)

### Commands

```bash
cd mcp
npm install

npm run stateless   # HTTP stateless transport — http://localhost:3000/mcp
npm run stateful    # HTTP stateful transport  — http://localhost:3000/mcp
npm run stdio       # stdio transport
```

Set `PORT` env var to change the port. Set `CARDFOLDER` to override the references directory (default: `src/references/`).

### Architecture

- **`src/embedding.ts`** — Loads `onnx-community/Qwen3-Embedding-0.6B-ONNX` via `@huggingface/transformers` (runs on CPU/GPU via `device: "auto"`). Embeddings are cached in `src/_cache/` by SHA-256 of the file content; first run downloads the model and generates embeddings, which takes a while.
- **`src/repository.ts`** — Loads all `.md` files from the references folder at startup, computes or loads cached embeddings, and exposes `queryCards` (cosine similarity search) and `getCard` (by ID).
- **`src/mcp.ts`** — Registers two MCP tools: `search_guidance` (semantic search, returns IDs + titles) and `get_guidance` (returns full card markdown by ID).
- **`src/stateless.ts` / `src/stateful.ts` / `src/stdio.ts`** — Transport entry points.

The `mcp/src/references/` directory must contain (or symlink to) the ASVS reference files for the server to serve them.

### MCP rules

`mcp/rules/security_guidance.md` contains the system prompt / agent rule for clients using the MCP transport.

## Skill (`skills/security-guidance/`)

- **`SKILL.md`** — The skill definition. The line `! expand.sh` is a directive that causes `expand.sh` to be executed and its output inlined when the skill is loaded.
- **`expand.sh`** — Iterates `references/ASVS/*.md` (sorted), reads `title`, `summary`, and `when_to_use` from frontmatter, and emits a compact index. This index tells the agent which reference file to read for each task type.
- **`references/`** — Should symlink or copy from the root `references/ASVS/` directory.

The skill workflow: agent reads the index → identifies matching sections by `when_to_use` → reads the full reference file → cites requirements inline in code/plans.
