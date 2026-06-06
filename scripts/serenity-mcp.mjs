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
  listPagesFromSnapshot,
  parsePatchTextInput,
  patchTemplate,
  projectRoot,
  readStoredCanvas,
  setCurrentPageInSnapshot,
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

function pageOptions(pageId) {
  return pageId ? { pageId } : {}
}

function parseOptions(pageId, importMode) {
  return {
    ...pageOptions(pageId),
    ...(importMode ? { importMode } : {}),
  }
}

function exportContextByFormat(snapshot, format, pageId) {
  const options = pageOptions(pageId)
  if (format === 'obsidian') return exportObsidianMarkdownFromSnapshot(snapshot, options)
  if (format === 'markdown') return exportReadableContextFromSnapshot(snapshot, options)
  return exportAiContextFromSnapshot(snapshot, options)
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
      currentPageId: context.summary.currentPageId,
      updatedAt: stored.updatedAt ?? null,
      tushareTokenConfigured: Boolean(process.env.TUSHARE_TOKEN),
    })
  }
)

server.registerTool(
  'serenity_list_pages',
  {
    title: 'List Serenity Pages',
    description: 'List tldraw pages in the local Serenity snapshot with node and edge counts for each page.',
    inputSchema: {},
  },
  async () => {
    const stored = await loadCanvas()
    const context = exportAiContextFromSnapshot(stored.snapshot)
    return toolText({
      ok: true,
      updatedAt: stored.updatedAt ?? null,
      currentPageId: context.summary.currentPageId,
      pages: listPagesFromSnapshot(stored.snapshot),
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
      pageId: z.string().optional(),
    },
  },
  async ({ format, pageId }) => {
    const stored = await loadCanvas()
    return toolText(exportContextByFormat(stored.snapshot, format, pageId))
  }
)

server.registerTool(
  'serenity_get_page_context',
  {
    title: 'Get Serenity Page Context',
    description: 'Read AI-readable semantic context from a specific Serenity page by pageId without changing the current page.',
    inputSchema: {
      pageId: z.string(),
      format: z.enum(['json', 'markdown', 'obsidian']).optional().default('json'),
    },
  },
  async ({ pageId, format }) => {
    const stored = await loadCanvas()
    return toolText(exportContextByFormat(stored.snapshot, format, pageId))
  }
)

server.registerTool(
  'serenity_set_current_page',
  {
    title: 'Set Serenity Current Page',
    description: 'Set snapshot.session.currentPageId so default MCP reads and future patches target that page.',
    inputSchema: {
      pageId: z.string(),
    },
  },
  async ({ pageId }) => {
    const stored = await loadCanvas()
    const nextSnapshot = setCurrentPageInSnapshot(stored.snapshot, pageId)
    const saved = await writeStoredCanvas({ ...stored, snapshot: nextSnapshot }, defaultCanvasFile)
    const context = exportAiContextFromSnapshot(saved.snapshot)
    return toolText({
      ok: true,
      updatedAt: saved.updatedAt,
      currentPageId: context.summary.currentPageId,
      nodeCount: context.summary.nodeCount,
      edgeCount: context.summary.edgeCount,
      pages: listPagesFromSnapshot(saved.snapshot),
    })
  }
)

server.registerTool(
  'serenity_export_obsidian_markdown',
  {
    title: 'Export Serenity Obsidian Markdown',
    description: 'Export the current local canvas as Obsidian-readable Markdown with frontmatter, wikilinks, tags, Mermaid, nodes, and edges.',
    inputSchema: {
      pageId: z.string().optional(),
    },
  },
  async ({ pageId }) => {
    const stored = await loadCanvas()
    return toolText(exportObsidianMarkdownFromSnapshot(stored.snapshot, pageOptions(pageId)))
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
      pageId: z.string().optional(),
      importMode: z.enum(['overwrite', 'merge', 'add-only']).optional(),
    },
  },
  async ({ patch, pageId, importMode }) => {
    const stored = await loadCanvas()
    const options = parseOptions(pageId, importMode)
    const parsed = parsePatchTextInput(patch, stored.snapshot, options)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [] })
    const validation = validateAiPatchForSnapshot(stored.snapshot, parsed.patch, options)
    return toolText({ ...validation, format: parsed.format, pageId: pageId ?? exportAiContextFromSnapshot(stored.snapshot).summary.currentPageId })
  }
)

server.registerTool(
  'serenity_apply_patch',
  {
    title: 'Apply Serenity AI Patch',
    description: 'Validate and apply an AI Patch to the local canvas snapshot.',
    inputSchema: {
      patch: z.union([z.string(), z.record(z.any())]),
      pageId: z.string().optional(),
      importMode: z.enum(['overwrite', 'merge', 'add-only']).optional(),
    },
  },
  async ({ patch, pageId, importMode }) => {
    const stored = await loadCanvas()
    const options = parseOptions(pageId, importMode)
    const parsed = parsePatchTextInput(patch, stored.snapshot, options)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [] })
    const result = applyAiPatchToSnapshot(stored.snapshot, parsed.patch, options)
    if (!result.validation.ok) return toolText(result.validation)
    const saved = await writeStoredCanvas({ ...stored, snapshot: result.snapshot }, defaultCanvasFile)
    const context = exportAiContextFromSnapshot(saved.snapshot, options)
    return toolText({
      ok: true,
      updatedAt: saved.updatedAt,
      pageId: context.summary.pageId,
      currentPageId: exportAiContextFromSnapshot(saved.snapshot).summary.currentPageId,
      nodeCount: context.summary.nodeCount,
      edgeCount: context.summary.edgeCount,
      format: parsed.format,
      summary: summarizePatch(parsed.patch),
      warnings: result.validation.warnings,
    })
  }
)

server.registerTool(
  'serenity_apply_patch_to_page',
  {
    title: 'Apply Serenity AI Patch To Page',
    description: 'Validate and apply an AI Patch to a specific Serenity page by pageId without changing the current page.',
    inputSchema: {
      pageId: z.string(),
      patch: z.union([z.string(), z.record(z.any())]),
      importMode: z.enum(['overwrite', 'merge', 'add-only']).optional(),
    },
  },
  async ({ pageId, patch, importMode }) => {
    const stored = await loadCanvas()
    const options = parseOptions(pageId, importMode)
    const parsed = parsePatchTextInput(patch, stored.snapshot, options)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [], pageId })
    const result = applyAiPatchToSnapshot(stored.snapshot, parsed.patch, options)
    if (!result.validation.ok) return toolText({ ...result.validation, pageId, format: parsed.format })
    const saved = await writeStoredCanvas({ ...stored, snapshot: result.snapshot }, defaultCanvasFile)
    const context = exportAiContextFromSnapshot(saved.snapshot, options)
    return toolText({
      ok: true,
      updatedAt: saved.updatedAt,
      pageId: context.summary.pageId,
      currentPageId: exportAiContextFromSnapshot(saved.snapshot).summary.currentPageId,
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
      pageId: z.string().optional(),
      importMode: z.enum(['overwrite', 'merge', 'add-only']).optional(),
    },
  },
  async ({ markdown, pageId, importMode }) => {
    const stored = await loadCanvas()
    const options = parseOptions(pageId, importMode)
    const parsed = parsePatchTextInput(markdown, stored.snapshot, options)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [], format: parsed.format })
    const validation = validateAiPatchForSnapshot(stored.snapshot, parsed.patch, options)
    return toolText({
      ...validation,
      format: parsed.format,
      pageId: pageId ?? exportAiContextFromSnapshot(stored.snapshot).summary.currentPageId,
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
      pageId: z.string().optional(),
      importMode: z.enum(['overwrite', 'merge', 'add-only']).optional(),
    },
  },
  async ({ markdown, pageId, importMode }) => {
    const stored = await loadCanvas()
    const options = parseOptions(pageId, importMode)
    const parsed = parsePatchTextInput(markdown, stored.snapshot, options)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [], format: parsed.format })
    const result = applyAiPatchToSnapshot(stored.snapshot, parsed.patch, options)
    if (!result.validation.ok) return toolText({ ...result.validation, format: parsed.format })
    const saved = await writeStoredCanvas({ ...stored, snapshot: result.snapshot }, defaultCanvasFile)
    const context = exportAiContextFromSnapshot(saved.snapshot, options)
    return toolText({
      ok: true,
      updatedAt: saved.updatedAt,
      pageId: context.summary.pageId,
      currentPageId: exportAiContextFromSnapshot(saved.snapshot).summary.currentPageId,
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
