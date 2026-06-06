import type { Editor, TLShapeId } from 'tldraw'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  buildCanvasIndex,
  connectLearningCards,
  createLearningCard,
  getEdgeData,
  getLearningShapes,
  getNextBranchPosition,
  updateLearningCard,
} from '../model/learningGraph'
import type {
  AiPatch,
  AiPatchOperation,
  CanvasIndex,
  LearningEdgeKind,
  LearningStatus,
  PatchValidationResult,
} from '../model/types'

export type ObsidianImportMode = 'overwrite' | 'merge' | 'add-only'

const VALID_STATUSES: LearningStatus[] = ['seed', 'exploring', 'verified', 'question', 'archived']
const VALID_EDGE_KINDS: LearningEdgeKind[] = [
  'extends',
  'contains',
  'causes',
  'contrasts',
  'questions',
  'supports',
  'blocks',
  'related',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function readStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function readStatus(value: unknown): value is LearningStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as LearningStatus)
}

function readEdgeKind(value: unknown): value is LearningEdgeKind {
  return typeof value === 'string' && VALID_EDGE_KINDS.includes(value as LearningEdgeKind)
}

export function parseAiPatch(text: string): { patch: AiPatch | null; errors: string[] } {
  try {
    const parsed = JSON.parse(text) as unknown
    if (!isRecord(parsed)) return { patch: null, errors: ['Patch must be a JSON object.'] }
    if (parsed.version !== 1) return { patch: null, errors: ['Patch version must be 1.'] }
    if (!Array.isArray(parsed.operations)) {
      return { patch: null, errors: ['Patch must include an operations array.'] }
    }
    return { patch: parsed as unknown as AiPatch, errors: [] }
  } catch (error) {
    return {
      patch: null,
      errors: [error instanceof Error ? error.message : 'Invalid JSON patch.'],
    }
  }
}

function readMarkdownField(section: string, name: string) {
  const match = section.match(new RegExp(`^- ${name}:\\s*(.*)$`, 'm'))
  return match?.[1]?.trim() ?? ''
}

function readBacktickValue(value: string) {
  return value.match(/^`([^`]+)`$/)?.[1] ?? value
}

function readMarkdownTags(value: string) {
  if (!value || value === 'none') return []
  return [...value.matchAll(/#([^\s#]+)/g)].map((match) => match[1]).filter(Boolean)
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function hashText(value: string) {
  let hash = 0
  for (const char of value) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0
  return Math.abs(hash).toString(36)
}

function nodeIdFromTitle(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
    .replaceAll(/^-+|-+$/g, '')
  return `node-obsidian-${slug || hashText(title)}`
}

function findNodeByTitleOrId(index: CanvasIndex | undefined, title: string, id = nodeIdFromTitle(title)) {
  if (!index) return null
  return index.nodesById.get(id) ?? [...index.nodesById.values()].find((node) => node.title === title) ?? null
}

function mergeNodeOperation(
  existing: ReturnType<typeof findNodeByTitleOrId>,
  next: { id: string; title: string; summary: string; body: string; tags: string[]; status: LearningStatus },
  mode: ObsidianImportMode
): AiPatchOperation | null {
  if (!existing) return { op: 'addNode', ...next }
  if (mode === 'add-only') return null
  if (mode === 'overwrite') return { op: 'updateNode', ...next, id: existing.id }
  return {
    op: 'updateNode',
    id: existing.id,
    title: next.title || existing.title,
    summary: next.summary || existing.summary,
    body: existing.body && next.body && !existing.body.includes(next.body)
      ? `${existing.body}\n\n${next.body}`
      : next.body || existing.body,
    tags: uniqueValues([...existing.tags, ...next.tags]),
    status: existing.status,
  }
}

function readMarkdownBody(section: string) {
  const summaryMatch = section.match(/^- Summary:.*$/m)
  const linksIndex = section.search(/^#### Links\s*$/m)
  if (!summaryMatch || linksIndex < 0 || linksIndex <= summaryMatch.index!) return ''
  return section
    .slice(summaryMatch.index! + summaryMatch[0].length, linksIndex)
    .trim()
    .replace(/^_No body yet\._$/, '')
}

function parseNodeHeading(heading: string, fallbackId: string) {
  const match = heading.trim().match(/^(.*?)\s+\(([^()]+)\)$/)
  return {
    title: match?.[1]?.trim() || heading.trim() || fallbackId,
    id: match?.[2]?.trim() || fallbackId,
  }
}

function parseObsidianNodes(markdown: string, index?: CanvasIndex, mode: ObsidianImportMode = 'merge'): AiPatchOperation[] {
  const operations: AiPatchOperation[] = []
  const sections = [...markdown.matchAll(/^###\s+(.+)$/gm)]
  for (const [sectionIndex, match] of sections.entries()) {
    const start = match.index! + match[0].length
    const end = sections[sectionIndex + 1]?.index ?? markdown.length
    const section = markdown.slice(start, end)
    const idField = readBacktickValue(readMarkdownField(section, 'ID'))
    const { id, title } = parseNodeHeading(match[1], idField || `node-import-${sectionIndex + 1}`)
    const statusField = readBacktickValue(readMarkdownField(section, 'Status'))
    const status = readStatus(statusField) ? statusField : 'exploring'
    const tags = readMarkdownTags(readMarkdownField(section, 'Tags'))
    const summary = readMarkdownField(section, 'Summary')
    const body = readMarkdownBody(section)

    const existing = index?.nodesById.get(id) ?? null
    const operation = mergeNodeOperation(existing, {
      id,
      title,
      summary: summary === 'none' ? '' : summary,
      body,
      tags,
      status,
    }, mode)
    if (operation?.op === 'addNode') {
      operation.x = 120 + (sectionIndex % 4) * 360
      operation.y = 120 + Math.floor(sectionIndex / 4) * 220
    }
    if (operation) operations.push(operation)
  }
  return operations
}

function parseObsidianEdges(markdown: string, index?: CanvasIndex): AiPatchOperation[] {
  const operations: AiPatchOperation[] = []
  const currentEdges = index ? [...index.edgesById.values()] : []
  const existingPairs = new Set(currentEdges.map((edge) => `${edge.fromId}->${edge.toId}`))
  const edgeBlock = markdown.match(/^## Edges\s*\n([\s\S]*?)(?=\n##\s|$)/m)?.[1] ?? ''
  for (const match of edgeBlock.matchAll(/^- \[\[#.*?\(([^()]+)\)\|.*?\]\]\s*->\s*\[\[#.*?\(([^()]+)\)\|.*?\]\]\s*-\s*\*\*(.*?)\*\*\s*\(`([^`]+)`\)/g)) {
    const fromId = match[1].trim()
    const toId = match[2].trim()
    const label = match[3].trim()
    const kindField = match[4].trim()
    const kind = readEdgeKind(kindField) ? kindField : 'related'
    if (existingPairs.has(`${fromId}->${toId}`)) continue
    operations.push({ op: 'connectNodes', fromId, toId, kind, label })
    existingPairs.add(`${fromId}->${toId}`)
  }
  return operations
}

function parseFrontmatter(markdown: string) {
  if (!markdown.startsWith('---')) return { data: {} as Record<string, string>, body: markdown }
  const end = markdown.indexOf('\n---', 3)
  if (end < 0) return { data: {} as Record<string, string>, body: markdown }
  const raw = markdown.slice(3, end).trim()
  const data: Record<string, string> = {}
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (match) data[match[1]] = match[2].replace(/^["']|["']$/g, '').trim()
  }
  return { data, body: markdown.slice(end + 4).trim() }
}

function parseFrontmatterTags(value?: string) {
  if (!value) return []
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((tag) => tag.replace(/^["'#\s]+|["'\s]+$/g, ''))
    .filter(Boolean)
}

function parseGenericObsidianNote(markdown: string, index?: CanvasIndex, mode: ObsidianImportMode = 'merge') {
  const { data, body } = parseFrontmatter(markdown)
  const title = data.title || body.match(/^#\s+(.+)$/m)?.[1]?.trim() || 'Imported Obsidian Note'
  const id = data.id || nodeIdFromTitle(title)
  const tags = uniqueValues([
    ...parseFrontmatterTags(data.tags),
    ...readMarkdownTags(body),
    'obsidian',
  ])
  const summary = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('!') && !line.startsWith('[['))
    ?.slice(0, 180) ?? ''
  const existing = findNodeByTitleOrId(index, title, id)
  const mainId = existing?.id ?? id
  const operations: AiPatchOperation[] = []
  const mainOperation = mergeNodeOperation(existing, { id, title, summary, body, tags, status: 'exploring' }, mode)
  if (mainOperation) operations.push(mainOperation)

  const knownIds = new Set(index ? [...index.nodesById.keys()] : [])
  for (const operation of operations) if (operation.op === 'addNode' && operation.id) knownIds.add(operation.id)
  const existingPairs = new Set(index ? [...index.edgesById.values()].map((edge) => `${edge.fromId}->${edge.toId}`) : [])
  const links = uniqueValues([...body.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g)].map((match) => match[1]))
  links.forEach((linkTitle, indexOffset) => {
    const linkedExisting = findNodeByTitleOrId(index, linkTitle)
    const linkedId = linkedExisting?.id ?? nodeIdFromTitle(linkTitle)
    if (!linkedExisting && !knownIds.has(linkedId)) {
      operations.push({
        op: 'addNode',
        id: linkedId,
        title: linkTitle,
        summary: 'Imported wikilink reference',
        body: '',
        tags: ['obsidian-link'],
        status: 'exploring',
        x: 480 + (indexOffset % 3) * 320,
        y: 120 + Math.floor(indexOffset / 3) * 200,
      })
      knownIds.add(linkedId)
    }
    if (mainId !== linkedId && !existingPairs.has(`${mainId}->${linkedId}`)) {
      operations.push({ op: 'connectNodes', fromId: mainId, toId: linkedId, kind: 'related', label: 'wikilink' })
      existingPairs.add(`${mainId}->${linkedId}`)
    }
  })
  return operations
}

export function parseObsidianMarkdownPatch(
  text: string,
  index?: CanvasIndex,
  options: { importMode?: ObsidianImportMode } = {}
): { patch: AiPatch | null; errors: string[] } {
  const markdown = text.trim()
  const looksLikeObsidianExport =
    markdown.startsWith('---') && markdown.includes('type: canvas-context') && markdown.includes('## Nodes')
  const importMode = options.importMode ?? (looksLikeObsidianExport ? 'overwrite' : 'merge')

  const operations = looksLikeObsidianExport
    ? [
        ...parseObsidianNodes(markdown, index, importMode),
        ...parseObsidianEdges(markdown, index),
      ]
    : parseGenericObsidianNote(markdown, index, importMode)
  if (!operations.length) return { patch: null, errors: ['No nodes or edges were found in the Obsidian Markdown.'] }
  return {
    patch: {
      version: 1,
      intent: looksLikeObsidianExport ? 'Import Serenity Obsidian Markdown' : 'Import generic Obsidian Markdown note',
      operations,
    },
    errors: [],
  }
}

export function parsePatchText(
  text: string,
  index?: CanvasIndex,
  options: { importMode?: ObsidianImportMode } = {}
): { patch: AiPatch | null; errors: string[]; format: 'json' | 'obsidian' } {
  const trimmed = text.trim()
  if (trimmed.startsWith('{')) return { ...parseAiPatch(trimmed), format: 'json' }
  return { ...parseObsidianMarkdownPatch(trimmed, index, options), format: 'obsidian' }
}

function validateOperationShape(op: unknown, index: number, errors: string[]) {
  if (!isRecord(op)) {
    errors.push(`Operation ${index + 1} must be an object.`)
    return
  }
  if (!isString(op.op)) {
    errors.push(`Operation ${index + 1} is missing op.`)
    return
  }

  switch (op.op) {
    case 'addNode':
      if (!isString(op.title)) errors.push(`Operation ${index + 1} addNode requires title.`)
      if (op.tags !== undefined && !readStringArray(op.tags)) {
        errors.push(`Operation ${index + 1} addNode tags must be string[].`)
      }
      if (op.status !== undefined && !readStatus(op.status)) {
        errors.push(`Operation ${index + 1} addNode status is invalid.`)
      }
      if ((op.x !== undefined && !isNumber(op.x)) || (op.y !== undefined && !isNumber(op.y))) {
        errors.push(`Operation ${index + 1} addNode x/y must be numbers.`)
      }
      if (op.edgeKind !== undefined && !readEdgeKind(op.edgeKind)) {
        errors.push(`Operation ${index + 1} addNode edgeKind is invalid.`)
      }
      break
    case 'updateNode':
      if (!isString(op.id)) errors.push(`Operation ${index + 1} updateNode requires id.`)
      if (op.tags !== undefined && !readStringArray(op.tags)) {
        errors.push(`Operation ${index + 1} updateNode tags must be string[].`)
      }
      if (op.status !== undefined && !readStatus(op.status)) {
        errors.push(`Operation ${index + 1} updateNode status is invalid.`)
      }
      break
    case 'deleteNode':
      if (!isString(op.id)) errors.push(`Operation ${index + 1} deleteNode requires id.`)
      break
    case 'connectNodes':
      if (!isString(op.fromId) || !isString(op.toId)) {
        errors.push(`Operation ${index + 1} connectNodes requires fromId and toId.`)
      }
      if (op.kind !== undefined && !readEdgeKind(op.kind)) {
        errors.push(`Operation ${index + 1} connectNodes kind is invalid.`)
      }
      break
    case 'disconnectNodes':
      if (!isString(op.id) && (!isString(op.fromId) || !isString(op.toId))) {
        errors.push(`Operation ${index + 1} disconnectNodes requires id or fromId/toId.`)
      }
      break
    case 'moveNode':
      if (!isString(op.id) || !isNumber(op.x) || !isNumber(op.y)) {
        errors.push(`Operation ${index + 1} moveNode requires id, x, and y.`)
      }
      break
    default:
      errors.push(`Operation ${index + 1} has unknown op "${op.op}".`)
  }
}

export function validateAiPatch(patch: AiPatch, index: CanvasIndex): PatchValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const ids = new Set(index.nodesById.keys())
  const edgeIds = new Set(index.edgesById.keys())

  if (patch.version !== 1) errors.push('Patch version must be 1.')
  if (!Array.isArray(patch.operations)) errors.push('Patch operations must be an array.')

  for (const [i, operation] of patch.operations.entries()) {
    validateOperationShape(operation, i, errors)
    if (!isRecord(operation) || !isString(operation.op)) continue
    const op = operation as AiPatchOperation

    if (op.op === 'addNode') {
      const id = op.id
      if (id && ids.has(id)) errors.push(`Operation ${i + 1} addNode id already exists: ${id}.`)
      if (id) ids.add(id)
      if (op.connectFromId && !ids.has(op.connectFromId)) {
        errors.push(`Operation ${i + 1} addNode connectFromId does not exist: ${op.connectFromId}.`)
      }
    }

    if (op.op === 'updateNode' || op.op === 'deleteNode' || op.op === 'moveNode') {
      if (!ids.has(op.id)) errors.push(`Operation ${i + 1} references missing node: ${op.id}.`)
      if (op.op === 'deleteNode') ids.delete(op.id)
    }

    if (op.op === 'connectNodes') {
      if (!ids.has(op.fromId)) errors.push(`Operation ${i + 1} missing fromId: ${op.fromId}.`)
      if (!ids.has(op.toId)) errors.push(`Operation ${i + 1} missing toId: ${op.toId}.`)
      if (op.id && edgeIds.has(op.id)) errors.push(`Operation ${i + 1} edge id already exists: ${op.id}.`)
      if (op.fromId === op.toId) warnings.push(`Operation ${i + 1} connects a node to itself.`)
      if (op.id) edgeIds.add(op.id)
    }

    if (op.op === 'disconnectNodes' && op.id && !edgeIds.has(op.id)) {
      errors.push(`Operation ${i + 1} references missing edge: ${op.id}.`)
    }
  }

  return { ok: errors.length === 0, errors, warnings }
}

export function validatePatchForEditor(editor: Editor, patch: AiPatch) {
  return validateAiPatch(patch, buildCanvasIndex(editor))
}

function findCardShapeId(index: CanvasIndex, nodeId: string) {
  return index.shapeIdByNodeId.get(nodeId)
}

function findEdgeShapeId(editor: Editor, op: Extract<AiPatchOperation, { op: 'disconnectNodes' }>) {
  const { edges } = getLearningShapes(editor)
  if (op.id) {
    const found = edges.find((edge) => getEdgeData(edge)?.id === op.id)
    return found?.id
  }
  const found = edges.find((edge) => {
    const data = getEdgeData(edge)
    return data && data.fromId === op.fromId && data.toId === op.toId
  })
  return found?.id
}

export function applyAiPatch(editor: Editor, patch: AiPatch) {
  const validation = validatePatchForEditor(editor, patch)
  if (!validation.ok) return validation

  editor.run(() => {
    for (const operation of patch.operations) {
      const index = buildCanvasIndex(editor)
      if (operation.op === 'addNode') {
        const sourceShapeId = operation.connectFromId
          ? findCardShapeId(index, operation.connectFromId)
          : undefined
        const fallback = getNextBranchPosition(editor, sourceShapeId)
        const created = createLearningCard(editor, {
          id: operation.id,
          title: operation.title,
          body: operation.body,
          summary: operation.summary,
          tags: operation.tags,
          status: operation.status,
          x: operation.x ?? fallback.x + CARD_WIDTH / 2,
          y: operation.y ?? fallback.y + CARD_HEIGHT / 2,
        })
        if (sourceShapeId) {
          connectLearningCards(editor, sourceShapeId, created.shapeId, {
            kind: operation.edgeKind,
            label: operation.edgeLabel,
          })
        }
      }

      if (operation.op === 'updateNode') {
        const shapeId = findCardShapeId(index, operation.id)
        const shape = shapeId ? editor.getShape(shapeId) : null
        if (shape?.type === 'geo') updateLearningCard(editor, shape, operation)
      }

      if (operation.op === 'deleteNode') {
        const shapeId = findCardShapeId(index, operation.id)
        if (!shapeId) continue
        const connectedEdges = [...index.edgesById.values()]
          .filter((edge) => edge.fromId === operation.id || edge.toId === operation.id)
          .map((edge) => index.shapeIdByEdgeId.get(edge.id))
          .filter(Boolean) as TLShapeId[]
        editor.deleteShapes([shapeId, ...connectedEdges])
      }

      if (operation.op === 'connectNodes') {
        const fromShapeId = findCardShapeId(index, operation.fromId)
        const toShapeId = findCardShapeId(index, operation.toId)
        if (fromShapeId && toShapeId) {
          connectLearningCards(editor, fromShapeId, toShapeId, {
            id: operation.id,
            kind: operation.kind,
            label: operation.label,
          })
        }
      }

      if (operation.op === 'disconnectNodes') {
        const edgeShapeId = findEdgeShapeId(editor, operation)
        if (edgeShapeId) editor.deleteShapes([edgeShapeId])
      }

      if (operation.op === 'moveNode') {
        const shapeId = findCardShapeId(index, operation.id)
        if (shapeId) {
          const shape = editor.getShape(shapeId)
          if (shape?.type === 'geo') editor.updateShape({ id: shape.id, type: 'geo', x: operation.x, y: operation.y })
        }
      }
    }
  })

  return validation
}

export function summarizePatch(patch: AiPatch) {
  return patch.operations.map((operation, index) => {
    switch (operation.op) {
      case 'addNode':
        return `${index + 1}. add node "${operation.title}"`
      case 'updateNode':
        return `${index + 1}. update node ${operation.id}`
      case 'deleteNode':
        return `${index + 1}. delete node ${operation.id}`
      case 'connectNodes':
        return `${index + 1}. connect ${operation.fromId} -> ${operation.toId}`
      case 'disconnectNodes':
        return `${index + 1}. disconnect ${operation.id ?? `${operation.fromId} -> ${operation.toId}`}`
      case 'moveNode':
        return `${index + 1}. move node ${operation.id} to (${operation.x}, ${operation.y})`
    }
  })
}
