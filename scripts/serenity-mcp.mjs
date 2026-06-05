import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  applyAiPatchToSnapshot,
  defaultCanvasFile,
  exportAiContextFromSnapshot,
  exportReadableContextFromSnapshot,
  parseAiPatchInput,
  patchTemplate,
  projectRoot,
  readStoredCanvas,
  storeDir,
  summarizePatch,
  toolText,
  validateAiPatchForSnapshot,
  writeStoredCanvas,
} from './serenity-core.mjs'

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
    })
  }
)

server.registerTool(
  'serenity_get_context',
  {
    title: 'Get Serenity AI Context',
    description: 'Read the local canvas snapshot and return AI-readable semantic context.',
    inputSchema: {
      format: z.enum(['json', 'markdown']).optional().default('json'),
    },
  },
  async ({ format }) => {
    const stored = await loadCanvas()
    if (format === 'markdown') return toolText(exportReadableContextFromSnapshot(stored.snapshot))
    return toolText(exportAiContextFromSnapshot(stored.snapshot))
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
    const parsed = parseAiPatchInput(patch)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [] })
    const stored = await loadCanvas()
    return toolText(validateAiPatchForSnapshot(stored.snapshot, parsed.patch))
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
    const parsed = parseAiPatchInput(patch)
    if (!parsed.patch) return toolText({ ok: false, errors: parsed.errors, warnings: [], summary: [] })
    const stored = await loadCanvas()
    const result = applyAiPatchToSnapshot(stored.snapshot, parsed.patch)
    if (!result.validation.ok) return toolText(result.validation)
    const saved = await writeStoredCanvas({ ...stored, snapshot: result.snapshot }, defaultCanvasFile)
    const context = exportAiContextFromSnapshot(saved.snapshot)
    return toolText({
      ok: true,
      updatedAt: saved.updatedAt,
      nodeCount: context.summary.nodeCount,
      edgeCount: context.summary.edgeCount,
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
