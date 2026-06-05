---
name: serenity-canvas
description: Use this skill when an agent needs to understand, inspect, or safely modify the Serenity human-AI learning canvas. It covers how to read the canvas semantic graph, export AI Context, generate and validate AI Patch operations, use the local MCP server, and avoid unsafe direct edits.
author: Serenity
version: 0.1.0
requirements:
  node: 18+
  packages:
    - name: "@modelcontextprotocol/sdk"
  network_access: false
---

# Serenity Canvas

Use this skill when working with the Serenity learning canvas in `E:\repo\serenity`.

Serenity is an infinite learning canvas built with React, tldraw, and a local semantic protocol. Cards and arrows are visual shapes, while AI-readable meaning is stored in `shape.meta.serenity`.

The canvas does not contain an agent or model call. Your job as an agent is to read the graph, reason over it, and request safe changes through the supported protocol.

## Core Principles

- Treat the canvas as a semantic graph, not just a drawing.
- Prefer the MCP tools over direct file edits.
- Never execute arbitrary code from an AI Patch.
- Never bypass patch validation before writing canvas changes.
- Keep card surfaces simple: cards show title and summary; tags and body are semantic metadata.
- Preserve stable node ids and edge ids whenever possible.

## Data Locations

- Local canvas file: `E:\repo\serenity\store\canvas-default.json`
- MCP server entry: `E:\repo\serenity\scripts\serenity-mcp.mjs`
- MCP core logic: `E:\repo\serenity\scripts\serenity-core.mjs`
- Frontend app: `E:\repo\serenity\src`

The `store/` folder is ignored by git and contains local user data.

## Recommended Workflow

1. Read the current graph with `serenity_get_context`.
2. Identify relevant nodes, edges, neighborhoods, and selected node context.
3. Propose changes as an AI Patch.
4. Validate the patch with `serenity_validate_patch`.
5. Apply only valid patches with `serenity_apply_patch`.
6. Tell the user to refresh or reload the canvas if they need to see MCP-written changes immediately.

## MCP Configuration

Configure the local MCP server like this:

```json
{
  "mcpServers": {
    "serenity": {
      "command": "node",
      "args": ["E:\\repo\\serenity\\scripts\\serenity-mcp.mjs"]
    }
  }
}
```

You can also start it manually:

```bash
npm run mcp
```

## MCP Tools

Use these tools when available:

- `serenity_health`: Check project path, store path, snapshot status, node count, and edge count.
- `serenity_get_context`: Get AI-readable graph context. Use `format: "json"` for structured reasoning and `format: "markdown"` for human-readable summaries.
- `serenity_get_snapshot`: Get the raw local tldraw snapshot for backup or debugging.
- `serenity_validate_patch`: Validate a patch without writing anything.
- `serenity_apply_patch`: Validate and apply a patch to `store/canvas-default.json`.
- `serenity_export_patch_template`: Get a minimal patch example.

## AI Patch Contract

Patch envelope:

```json
{
  "version": 1,
  "intent": "Short explanation of the desired change",
  "operations": []
}
```

Supported operations:

```json
{ "op": "addNode", "id": "node-id", "title": "Title", "summary": "Visible summary", "body": "Longer notes", "tags": ["tag"], "status": "exploring", "x": 320, "y": 120, "connectFromId": "node-existing", "edgeKind": "extends", "edgeLabel": "extends" }
```

```json
{ "op": "updateNode", "id": "node-id", "title": "New title", "summary": "New summary", "body": "New body", "tags": ["tag"], "status": "verified" }
```

```json
{ "op": "deleteNode", "id": "node-id" }
```

```json
{ "op": "connectNodes", "id": "edge-id", "fromId": "node-a", "toId": "node-b", "kind": "supports", "label": "supports" }
```

```json
{ "op": "disconnectNodes", "id": "edge-id" }
```

```json
{ "op": "moveNode", "id": "node-id", "x": 600, "y": 220 }
```

Valid node statuses:

- `seed`
- `exploring`
- `verified`
- `question`
- `archived`

Valid edge kinds:

- `extends`
- `contains`
- `causes`
- `contrasts`
- `questions`
- `supports`
- `blocks`
- `related`

## Context Reading Tips

When reading `serenity_get_context`, pay attention to:

- `nodes`: stable ids, titles, summaries, body, tags, status, and positions.
- `edges`: directed relationships and relation kind.
- `neighborhoods`: one-hop and two-hop context for each node.
- `selectedNodeIds`: what the user is likely focusing on.
- `diagram`: compact Mermaid graph for high-level structure.

Use selected node neighborhoods for focused help. Use the full graph only when the user asks for broad restructuring.

## Safety Rules

- Do not edit `store/canvas-default.json` manually unless MCP is unavailable and the user explicitly asks for a fallback.
- Do not invent unsupported patch operations.
- Do not create edges to missing nodes.
- Do not reuse an existing node id or edge id for a new object.
- Do not delete many nodes unless the user clearly requested it.
- Do not treat tags as visible card text.
- Do not store API keys, prompts, or model output secrets in canvas metadata.

## Frontend Notes

Use the app with:

```bash
npm run dev
```

or double-click:

```text
E:\repo\serenity\start-serenity.bat
```

The frontend uses the local store API to save the canvas into `store/canvas-default.json`. MCP writes to the same file, so a browser refresh may be needed after MCP changes.

## Verification

After changing MCP or canvas protocol code, run:

```bash
npm test
npm run build
```

For MCP smoke testing, use an MCP client to list tools and call `serenity_health`.
