import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import {
  applyAiPatchToSnapshot,
  defaultCanvasFile,
  exportAiContextFromSnapshot,
  exportObsidianMarkdownFromSnapshot,
  exportReadableContextFromSnapshot,
  parsePatchTextInput,
  patchTemplate,
  projectRoot,
  readStoredCanvas,
  storeDir,
  summarizePatch,
  toolText,
  validateAiPatchForSnapshot,
  writeStoredCanvas,
} from './serenity-core.mjs'

function loadDotEnv() {
  try {
    const text = readFileSync(join(projectRoot, '.env'), 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const index = trimmed.indexOf('=')
      if (index <= 0) continue
      const key = trimmed.slice(0, index).trim()
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
      if (key && process.env[key] === undefined) process.env[key] = value
    }
  } catch {
    // .env is optional.
  }
}

loadDotEnv()

const server = new McpServer({
  name: 'serenity-learning-canvas',
  version: '0.1.0',
})

async function loadCanvas() {
  return readStoredCanvas(defaultCanvasFile)
}

server.registerTool(
  'serenity_health',
  {
    title: 'Serenity Health',
    description: 'Return local Serenity project and canvas store status.',
    inputSchema: {},
  },
  async () => {
    const stored = await loadCanvas()
    const context = exportAiContextFromSnapshot(stored.snapshot)
    return toolText({
      ok: true,
      projectRoot,
      storeDir,
      canvasFile: defaultCanvasFile,
      snapshotExists: true,
      nodeCount: context.summary.nodeCount,
      edgeCount: context.summary.edgeCount,
      updatedAt: stored.updatedAt ?? null,
      tushareTokenConfigured: Boolean(process.env.TUSHARE_TOKEN),
    })
  }
)

server.registerTool(
  'serenity_get_context',
  {
    title: 'Get Serenity AI Context',
    description: 'Read the local canvas snapshot and return AI-readable semantic context.',
    inputSchema: {
      format: z.enum(['json', 'markdown', 'obsidian']).optional().default('json'),
    },
  },
  async ({ format }) => {
    const stored = await loadCanvas()
    if (format === 'obsidian') return toolText(exportObsidianMarkdownFromSnapshot(stored.snapshot))
    if (format === 'markdown') return toolText(exportReadableContextFromSnapshot(stored.snapshot))
    return toolText(exportAiContextFromSnapshot(stored.snapshot))
  }
)

server.registerTool(
  'serenity_export_obsidian_markdown',
  {
    title: 'Export Serenity Obsidian Markdown',
    description: 'Export the current local canvas as Obsidian-readable Markdown with frontmatter, wikilinks, tags, Mermaid, nodes, and edges.',
    inputSchema: {},
  },
  async () => {
    const stored = await loadCanvas()
    return toolText(exportObsidianMarkdownFromSnapshot(stored.snapshot))
  }
)

server.registerTool(
  'serenity_get_snapshot',
  {
    title: 'Get Serenity Snapshot',
    description: 'Return the raw local tldraw snapshot payload from store/canvas-default.json.',
    inputSchema: {},
  },
  async () => toolText(await loadCanvas())
)

server.registerTool(
  'serenity_validate_patch',
  {
    title: 'Validate Serenity AI Patch',
    description: 'Validate an AI Patch against the current local canvas without writing changes.',
    inputSchema: {
      patch: z.union([z.string(), z.record(z.any())]),
    },
  },
  async ({ patch }) => {
    const stored = await loadCanvas()
    const parsed = parsePatchTextInput(patch, stored.snapshot)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [] })
    const validation = validateAiPatchForSnapshot(stored.snapshot, parsed.patch)
    return toolText({ ...validation, format: parsed.format })
  }
)

server.registerTool(
  'serenity_apply_patch',
  {
    title: 'Apply Serenity AI Patch',
    description: 'Validate and apply an AI Patch to the local canvas snapshot.',
    inputSchema: {
      patch: z.union([z.string(), z.record(z.any())]),
    },
  },
  async ({ patch }) => {
    const stored = await loadCanvas()
    const parsed = parsePatchTextInput(patch, stored.snapshot)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [] })
    const result = applyAiPatchToSnapshot(stored.snapshot, parsed.patch)
    if (!result.validation.ok) return toolText(result.validation)
    const saved = await writeStoredCanvas({ ...stored, snapshot: result.snapshot }, defaultCanvasFile)
    const context = exportAiContextFromSnapshot(saved.snapshot)
    return toolText({
      ok: true,
      updatedAt: saved.updatedAt,
      nodeCount: context.summary.nodeCount,
      edgeCount: context.summary.edgeCount,
      format: parsed.format,
      summary: summarizePatch(parsed.patch),
      warnings: result.validation.warnings,
    })
  }
)

server.registerTool(
  'serenity_validate_markdown_import',
  {
    title: 'Validate Serenity Markdown Import',
    description: 'Parse a Serenity Obsidian Markdown export into AI Patch operations and validate it without writing changes.',
    inputSchema: {
      markdown: z.string(),
    },
  },
  async ({ markdown }) => {
    const stored = await loadCanvas()
    const parsed = parsePatchTextInput(markdown, stored.snapshot)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [], format: parsed.format })
    const validation = validateAiPatchForSnapshot(stored.snapshot, parsed.patch)
    return toolText({
      ...validation,
      format: parsed.format,
      patch: parsed.patch,
      summary: summarizePatch(parsed.patch),
    })
  }
)

server.registerTool(
  'serenity_apply_markdown_import',
  {
    title: 'Apply Serenity Markdown Import',
    description: 'Parse, validate, and apply a Serenity Obsidian Markdown export to the local canvas snapshot.',
    inputSchema: {
      markdown: z.string(),
    },
  },
  async ({ markdown }) => {
    const stored = await loadCanvas()
    const parsed = parsePatchTextInput(markdown, stored.snapshot)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [], format: parsed.format })
    const result = applyAiPatchToSnapshot(stored.snapshot, parsed.patch)
    if (!result.validation.ok) return toolText({ ...result.validation, format: parsed.format })
    const saved = await writeStoredCanvas({ ...stored, snapshot: result.snapshot }, defaultCanvasFile)
    const context = exportAiContextFromSnapshot(saved.snapshot)
    return toolText({
      ok: true,
      updatedAt: saved.updatedAt,
      nodeCount: context.summary.nodeCount,
      edgeCount: context.summary.edgeCount,
      format: parsed.format,
      summary: summarizePatch(parsed.patch),
      warnings: result.validation.warnings,
    })
  }
)

server.registerTool(
  'serenity_export_patch_template',
  {
    title: 'Export Serenity Patch Template',
    description: 'Return a minimal valid AI Patch example for Serenity canvas edits.',
    inputSchema: {},
  },
  async () => toolText(patchTemplate())
)

await server.connect(new StdioServerTransport())
