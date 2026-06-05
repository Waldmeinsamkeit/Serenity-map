import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

export const SERENITY_META_KEY = 'serenity'
export const CARD_WIDTH = 260
export const CARD_HEIGHT = 152

export const VALID_STATUSES = ['seed', 'exploring', 'verified', 'question', 'archived']
export const VALID_EDGE_KINDS = [
  'extends',
  'contains',
  'causes',
  'contrasts',
  'questions',
  'supports',
  'blocks',
  'related',
]

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
export const projectRoot = rootDir
export const storeDir = join(rootDir, 'store')
export const defaultCanvasFile = join(storeDir, 'canvas-default.json')

const STATUS_COLOR = {
  seed: 'blue',
  exploring: 'yellow',
  verified: 'green',
  question: 'red',
  archived: 'grey',
}

function nowIso() {
  return new Date().toISOString()
}

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizeTags(tags) {
  return [...new Set((tags ?? []).map((tag) => String(tag).trim()).filter(Boolean))]
}

function richText(text) {
  const paragraphs = String(text)
    .split('\n')
    .map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : undefined,
    }))
  return { type: 'doc', content: paragraphs }
}

function formatCardText(data) {
  return `${data.title}${data.summary ? `\n${data.summary}` : ''}`
}

function pageIdForSnapshot(snapshot) {
  const store = getStore(snapshot)
  return Object.values(store).find((record) => record?.typeName === 'page')?.id ?? 'page:page'
}

function getStore(snapshot) {
  return snapshot?.document?.store ?? {}
}

function getShapeRecords(snapshot) {
  return Object.values(getStore(snapshot)).filter((record) => record?.typeName === 'shape')
}

function getBindingRecords(snapshot) {
  return Object.values(getStore(snapshot)).filter((record) => record?.typeName === 'binding')
}

function getSerenityMeta(shape) {
  const meta = shape?.meta?.[SERENITY_META_KEY]
  if (!isRecord(meta) || !('kind' in meta)) return null
  if (meta.kind === 'learning-card' || meta.kind === 'learning-edge') return meta
  return null
}

function createDefaultStoredCanvas() {
  return {
    version: 1,
    updatedAt: nowIso(),
    snapshot: {
      document: {
        store: {
          'document:document': {
            gridSize: 10,
            name: '',
            meta: {},
            id: 'document:document',
            typeName: 'document',
          },
          'page:page': {
            meta: {},
            id: 'page:page',
            name: 'Page 1',
            index: 'a1',
            typeName: 'page',
          },
        },
        schema: {
          schemaVersion: 2,
          sequences: {
            'com.tldraw.store': 5,
            'com.tldraw.asset': 1,
            'com.tldraw.camera': 1,
            'com.tldraw.document': 2,
            'com.tldraw.instance': 26,
            'com.tldraw.instance_page_state': 5,
            'com.tldraw.page': 1,
            'com.tldraw.instance_presence': 6,
            'com.tldraw.pointer': 1,
            'com.tldraw.shape': 4,
            'com.tldraw.binding.arrow': 1,
          },
        },
      },
      session: {
        version: 0,
        currentPageId: 'page:page',
        exportBackground: true,
        isFocusMode: false,
        isDebugMode: false,
        isToolLocked: false,
        isGridMode: true,
        pageStates: [
          {
            pageId: 'page:page',
            camera: { x: 0, y: 0, z: 1 },
            selectedShapeIds: [],
            focusedGroupId: null,
          },
        ],
      },
    },
  }
}

export async function readStoredCanvas(canvasFile = defaultCanvasFile) {
  try {
    return JSON.parse(await readFile(canvasFile, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return createDefaultStoredCanvas()
    throw error
  }
}

export async function writeStoredCanvas(payload, canvasFile = defaultCanvasFile) {
  await mkdir(dirname(canvasFile), { recursive: true })
  const nextPayload = {
    version: 1,
    ...payload,
    updatedAt: nowIso(),
  }
  const tempFile = `${canvasFile}.tmp`
  await writeFile(tempFile, `${JSON.stringify(nextPayload, null, 2)}\n`, 'utf8')
  await rename(tempFile, canvasFile)
  return nextPayload
}

export function buildCanvasIndexFromSnapshot(snapshot) {
  const nodesById = new Map()
  const edgesById = new Map()
  const shapeIdByNodeId = new Map()
  const shapeIdByEdgeId = new Map()

  for (const shape of getShapeRecords(snapshot)) {
    const meta = getSerenityMeta(shape)
    if (shape.type !== 'geo' || meta?.kind !== 'learning-card') continue
    const data = meta.data
    if (!data?.id) continue
    nodesById.set(data.id, {
      ...data,
      shapeId: shape.id,
      x: shape.x ?? 0,
      y: shape.y ?? 0,
      width: shape.props?.w ?? CARD_WIDTH,
      height: shape.props?.h ?? CARD_HEIGHT,
      inbound: [],
      outbound: [],
    })
    shapeIdByNodeId.set(data.id, shape.id)
  }

  for (const shape of getShapeRecords(snapshot)) {
    const meta = getSerenityMeta(shape)
    if (shape.type !== 'arrow' || meta?.kind !== 'learning-edge') continue
    const data = meta.data
    if (!data?.id || !nodesById.has(data.fromId) || !nodesById.has(data.toId)) continue
    edgesById.set(data.id, { ...data, shapeId: shape.id })
    shapeIdByEdgeId.set(data.id, shape.id)
    nodesById.get(data.fromId)?.outbound.push(data.id)
    nodesById.get(data.toId)?.inbound.push(data.id)
  }

  return { nodesById, edgesById, shapeIdByNodeId, shapeIdByEdgeId }
}

function buildNeighborhoods(nodes, edges) {
  const adjacency = new Map(nodes.map((node) => [node.id, new Set()]))
  for (const edge of edges) {
    adjacency.get(edge.fromId)?.add(edge.toId)
    adjacency.get(edge.toId)?.add(edge.fromId)
  }

  const neighborhoods = {}
  for (const node of nodes) {
    const oneHop = [...(adjacency.get(node.id) ?? [])]
    const twoHop = new Set()
    for (const neighbor of oneHop) {
      for (const next of adjacency.get(neighbor) ?? []) {
        if (next !== node.id && !oneHop.includes(next)) twoHop.add(next)
      }
    }
    neighborhoods[node.id] = { oneHop, twoHop: [...twoHop] }
  }
  return neighborhoods
}

function escapeMermaid(value) {
  return String(value).replaceAll('"', "'").replaceAll('\n', ' ')
}

export function buildMermaidDiagram(nodes, edges) {
  const lines = ['flowchart LR']
  for (const node of nodes) lines.push(`  ${node.id}["${escapeMermaid(node.title)}"]`)
  for (const edge of edges) {
    const label = edge.label || edge.kind
    lines.push(`  ${edge.fromId} -->|"${escapeMermaid(label)}"| ${edge.toId}`)
  }
  return lines.join('\n')
}

export function exportAiContextFromSnapshot(snapshot) {
  const index = buildCanvasIndexFromSnapshot(snapshot)
  const nodes = [...index.nodesById.values()]
  const edges = [...index.edgesById.values()]
  return {
    version: 1,
    exportedAt: nowIso(),
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      selectedNodeIds: snapshot?.session?.pageStates?.[0]?.selectedShapeIds
        ?.map((shapeId) => nodes.find((node) => node.shapeId === shapeId)?.id)
        .filter(Boolean) ?? [],
    },
    selectedNodeIds: snapshot?.session?.pageStates?.[0]?.selectedShapeIds
      ?.map((shapeId) => nodes.find((node) => node.shapeId === shapeId)?.id)
      .filter(Boolean) ?? [],
    nodes,
    edges,
    neighborhoods: buildNeighborhoods(nodes, edges),
    diagram: buildMermaidDiagram(nodes, edges),
  }
}

export function exportReadableContextFromSnapshot(snapshot) {
  const context = exportAiContextFromSnapshot(snapshot)
  const selected = context.selectedNodeIds.length ? context.selectedNodeIds.join(', ') : 'none'
  const nodeLines = context.nodes.map((node) => {
    const tags = node.tags?.length ? ` [${node.tags.join(', ')}]` : ''
    return `- ${node.id}: ${node.title}${tags} (${node.status})`
  })
  const edgeLines = context.edges.map((edge) => `- ${edge.id}: ${edge.fromId} -> ${edge.toId} (${edge.label || edge.kind})`)
  return [
    '# Serenity AI Context',
    '',
    `Exported: ${context.exportedAt}`,
    `Nodes: ${context.summary.nodeCount}`,
    `Edges: ${context.summary.edgeCount}`,
    `Selected: ${selected}`,
    '',
    '## Nodes',
    ...nodeLines,
    '',
    '## Edges',
    ...edgeLines,
    '',
    '## Mermaid',
    '```mermaid',
    context.diagram,
    '```',
    '',
    '## Raw JSON',
    '```json',
    JSON.stringify(context, null, 2),
    '```',
  ].join('\n')
}

function validateOperationShape(op, index, errors) {
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
      if (op.tags !== undefined && (!Array.isArray(op.tags) || !op.tags.every((tag) => typeof tag === 'string'))) {
        errors.push(`Operation ${index + 1} addNode tags must be string[].`)
      }
      if (op.status !== undefined && !VALID_STATUSES.includes(op.status)) errors.push(`Operation ${index + 1} addNode status is invalid.`)
      if ((op.x !== undefined && !isNumber(op.x)) || (op.y !== undefined && !isNumber(op.y))) {
        errors.push(`Operation ${index + 1} addNode x/y must be numbers.`)
      }
      if (op.edgeKind !== undefined && !VALID_EDGE_KINDS.includes(op.edgeKind)) errors.push(`Operation ${index + 1} addNode edgeKind is invalid.`)
      break
    case 'updateNode':
      if (!isString(op.id)) errors.push(`Operation ${index + 1} updateNode requires id.`)
      if (op.tags !== undefined && (!Array.isArray(op.tags) || !op.tags.every((tag) => typeof tag === 'string'))) {
        errors.push(`Operation ${index + 1} updateNode tags must be string[].`)
      }
      if (op.status !== undefined && !VALID_STATUSES.includes(op.status)) errors.push(`Operation ${index + 1} updateNode status is invalid.`)
      break
    case 'deleteNode':
      if (!isString(op.id)) errors.push(`Operation ${index + 1} deleteNode requires id.`)
      break
    case 'connectNodes':
      if (!isString(op.fromId) || !isString(op.toId)) errors.push(`Operation ${index + 1} connectNodes requires fromId and toId.`)
      if (op.kind !== undefined && !VALID_EDGE_KINDS.includes(op.kind)) errors.push(`Operation ${index + 1} connectNodes kind is invalid.`)
      break
    case 'disconnectNodes':
      if (!isString(op.id) && (!isString(op.fromId) || !isString(op.toId))) {
        errors.push(`Operation ${index + 1} disconnectNodes requires id or fromId/toId.`)
      }
      break
    case 'moveNode':
      if (!isString(op.id) || !isNumber(op.x) || !isNumber(op.y)) errors.push(`Operation ${index + 1} moveNode requires id, x, and y.`)
      break
    default:
      errors.push(`Operation ${index + 1} has unknown op "${op.op}".`)
  }
}

export function parseAiPatchInput(input) {
  if (typeof input === 'string') {
    try {
      return { patch: JSON.parse(input), errors: [] }
    } catch (error) {
      return { patch: null, errors: [error instanceof Error ? error.message : 'Invalid JSON patch.'] }
    }
  }
  return { patch: input, errors: [] }
}

export function validateAiPatchForSnapshot(snapshot, patch) {
  const errors = []
  const warnings = []
  if (!isRecord(patch)) return { ok: false, errors: ['Patch must be a JSON object.'], warnings, summary: [] }
  if (patch.version !== 1) errors.push('Patch version must be 1.')
  if (!Array.isArray(patch.operations)) errors.push('Patch must include an operations array.')
  if (errors.length) return { ok: false, errors, warnings, summary: [] }

  const index = buildCanvasIndexFromSnapshot(snapshot)
  const ids = new Set(index.nodesById.keys())
  const edgeIds = new Set(index.edgesById.keys())

  for (const [i, operation] of patch.operations.entries()) {
    validateOperationShape(operation, i, errors)
    if (!isRecord(operation) || !isString(operation.op)) continue
    if (operation.op === 'addNode') {
      if (operation.id && ids.has(operation.id)) errors.push(`Operation ${i + 1} addNode id already exists: ${operation.id}.`)
      if (operation.id) ids.add(operation.id)
      if (operation.connectFromId && !ids.has(operation.connectFromId)) {
        errors.push(`Operation ${i + 1} addNode connectFromId does not exist: ${operation.connectFromId}.`)
      }
    }
    if (operation.op === 'updateNode' || operation.op === 'deleteNode' || operation.op === 'moveNode') {
      if (!ids.has(operation.id)) errors.push(`Operation ${i + 1} references missing node: ${operation.id}.`)
      if (operation.op === 'deleteNode') ids.delete(operation.id)
    }
    if (operation.op === 'connectNodes') {
      if (!ids.has(operation.fromId)) errors.push(`Operation ${i + 1} missing fromId: ${operation.fromId}.`)
      if (!ids.has(operation.toId)) errors.push(`Operation ${i + 1} missing toId: ${operation.toId}.`)
      if (operation.id && edgeIds.has(operation.id)) errors.push(`Operation ${i + 1} edge id already exists: ${operation.id}.`)
      if (operation.fromId === operation.toId) warnings.push(`Operation ${i + 1} connects a node to itself.`)
      if (operation.id) edgeIds.add(operation.id)
    }
    if (operation.op === 'disconnectNodes' && operation.id && !edgeIds.has(operation.id)) {
      errors.push(`Operation ${i + 1} references missing edge: ${operation.id}.`)
    }
  }

  return { ok: errors.length === 0, errors, warnings, summary: summarizePatch(patch) }
}

function shapeId() {
  return `shape:${randomUUID()}`
}

function bindingId() {
  return `binding:${randomUUID()}`
}

function makeNodeId() {
  return `node-${randomUUID()}`
}

function makeEdgeId() {
  return `edge-${randomUUID()}`
}

function nextShapeIndex(snapshot) {
  const count = getShapeRecords(snapshot).length + 1
  return `a${count.toString(36)}`
}

function createLearningCardRecord(snapshot, input) {
  const timestamp = nowIso()
  const data = {
    id: input.id ?? makeNodeId(),
    title: input.title.trim() || 'Untitled',
    body: input.body?.trim() ?? '',
    summary: input.summary?.trim() ?? '',
    tags: normalizeTags(input.tags),
    status: input.status ?? 'seed',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  const id = shapeId()
  return {
    id,
    typeName: 'shape',
    type: 'geo',
    parentId: pageIdForSnapshot(snapshot),
    index: nextShapeIndex(snapshot),
    x: input.x ?? 0,
    y: input.y ?? 0,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    props: {
      geo: 'rectangle',
      w: CARD_WIDTH,
      h: CARD_HEIGHT,
      growY: 0,
      color: STATUS_COLOR[data.status],
      labelColor: 'black',
      fill: 'semi',
      dash: 'solid',
      size: 'm',
      font: 'sans',
      align: 'start',
      verticalAlign: 'start',
      url: '',
      scale: 1,
      richText: richText(formatCardText(data)),
    },
    meta: { [SERENITY_META_KEY]: { kind: 'learning-card', data } },
  }
}

function createLearningEdgeRecords(snapshot, fromShape, toShape, input) {
  const timestamp = nowIso()
  const data = {
    id: input.id ?? makeEdgeId(),
    fromId: input.fromId,
    toId: input.toId,
    kind: input.kind ?? 'extends',
    label: input.label?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  const start = { x: (fromShape.x ?? 0) + (fromShape.props?.w ?? CARD_WIDTH) / 2, y: (fromShape.y ?? 0) + (fromShape.props?.h ?? CARD_HEIGHT) / 2 }
  const end = { x: (toShape.x ?? 0) + (toShape.props?.w ?? CARD_WIDTH) / 2, y: (toShape.y ?? 0) + (toShape.props?.h ?? CARD_HEIGHT) / 2 }
  const origin = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) }
  const arrowId = shapeId()
  const arrow = {
    id: arrowId,
    typeName: 'shape',
    type: 'arrow',
    parentId: pageIdForSnapshot(snapshot),
    index: nextShapeIndex(snapshot),
    x: origin.x,
    y: origin.y,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    props: {
      start: { x: start.x - origin.x, y: start.y - origin.y },
      end: { x: end.x - origin.x, y: end.y - origin.y },
      bend: 0,
      color: 'black',
      labelColor: 'black',
      fill: 'none',
      dash: 'solid',
      size: 'm',
      arrowheadStart: 'none',
      arrowheadEnd: 'arrow',
      font: 'sans',
      kind: 'arc',
      richText: richText(data.label || data.kind),
      labelPosition: 0.5,
      scale: 1,
      elbowMidPoint: 0.5,
    },
    meta: { [SERENITY_META_KEY]: { kind: 'learning-edge', data } },
  }
  const startBinding = {
    id: bindingId(),
    typeName: 'binding',
    type: 'arrow',
    fromId: arrowId,
    toId: fromShape.id,
    props: {
      terminal: 'start',
      normalizedAnchor: { x: 0.5, y: 0.5 },
      isExact: false,
      isPrecise: false,
      snap: 'none',
    },
    meta: {},
  }
  const endBinding = {
    id: bindingId(),
    typeName: 'binding',
    type: 'arrow',
    fromId: arrowId,
    toId: toShape.id,
    props: {
      terminal: 'end',
      normalizedAnchor: { x: 0.5, y: 0.5 },
      isExact: false,
      isPrecise: false,
      snap: 'none',
    },
    meta: {},
  }
  return { arrow, startBinding, endBinding }
}

function nodeDataFromShape(shape) {
  return shape.meta?.[SERENITY_META_KEY]?.data
}

function edgeDataFromShape(shape) {
  return shape.meta?.[SERENITY_META_KEY]?.data
}

function shapeByNodeId(snapshot, nodeId) {
  return getShapeRecords(snapshot).find((shape) => shape.type === 'geo' && nodeDataFromShape(shape)?.id === nodeId)
}

function edgeShapeByPatch(snapshot, op) {
  return getShapeRecords(snapshot).find((shape) => {
    if (shape.type !== 'arrow') return false
    const data = edgeDataFromShape(shape)
    if (!data) return false
    if (op.id) return data.id === op.id
    return data.fromId === op.fromId && data.toId === op.toId
  })
}

function branchPosition(snapshot, sourceNodeId) {
  const source = sourceNodeId ? shapeByNodeId(snapshot, sourceNodeId) : null
  if (!source) return { x: 120, y: 120 }
  const siblingCount = getShapeRecords(snapshot).filter((shape) => shape.type === 'geo' && Math.abs((shape.x ?? 0) - ((source.x ?? 0) + CARD_WIDTH + 120)) < 24).length
  return { x: (source.x ?? 0) + CARD_WIDTH + 120, y: (source.y ?? 0) + siblingCount * (CARD_HEIGHT + 48) }
}

export function applyAiPatchToSnapshot(snapshot, patch) {
  const validation = validateAiPatchForSnapshot(snapshot, patch)
  if (!validation.ok) return { snapshot, validation }
  const nextSnapshot = structuredClone(snapshot)
  const store = getStore(nextSnapshot)

  for (const operation of patch.operations) {
    if (operation.op === 'addNode') {
      const fallback = branchPosition(nextSnapshot, operation.connectFromId)
      const card = createLearningCardRecord(nextSnapshot, {
        ...operation,
        x: operation.x ?? fallback.x,
        y: operation.y ?? fallback.y,
      })
      store[card.id] = card
      if (operation.connectFromId) {
        const fromShape = shapeByNodeId(nextSnapshot, operation.connectFromId)
        const toShape = card
        if (fromShape) {
          const { arrow, startBinding, endBinding } = createLearningEdgeRecords(nextSnapshot, fromShape, toShape, {
            fromId: operation.connectFromId,
            toId: card.meta[SERENITY_META_KEY].data.id,
            kind: operation.edgeKind,
            label: operation.edgeLabel,
          })
          store[arrow.id] = arrow
          store[startBinding.id] = startBinding
          store[endBinding.id] = endBinding
        }
      }
    }

    if (operation.op === 'updateNode') {
      const shape = shapeByNodeId(nextSnapshot, operation.id)
      if (!shape) continue
      const current = nodeDataFromShape(shape)
      const data = {
        ...current,
        ...operation,
        id: current.id,
        title: operation.title?.trim() || current.title,
        tags: operation.tags ? normalizeTags(operation.tags) : current.tags,
        updatedAt: nowIso(),
      }
      delete data.op
      shape.meta = { ...shape.meta, [SERENITY_META_KEY]: { kind: 'learning-card', data } }
      shape.props = {
        ...shape.props,
        color: STATUS_COLOR[data.status],
        richText: richText(formatCardText(data)),
      }
    }

    if (operation.op === 'deleteNode') {
      const shape = shapeByNodeId(nextSnapshot, operation.id)
      if (!shape) continue
      delete store[shape.id]
      for (const edge of getShapeRecords(nextSnapshot)) {
        const data = edgeDataFromShape(edge)
        if (data?.fromId === operation.id || data?.toId === operation.id) {
          delete store[edge.id]
          for (const binding of getBindingRecords(nextSnapshot)) {
            if (binding.fromId === edge.id) delete store[binding.id]
          }
        }
      }
    }

    if (operation.op === 'connectNodes') {
      const fromShape = shapeByNodeId(nextSnapshot, operation.fromId)
      const toShape = shapeByNodeId(nextSnapshot, operation.toId)
      if (!fromShape || !toShape) continue
      const { arrow, startBinding, endBinding } = createLearningEdgeRecords(nextSnapshot, fromShape, toShape, {
        id: operation.id,
        fromId: operation.fromId,
        toId: operation.toId,
        kind: operation.kind,
        label: operation.label,
      })
      store[arrow.id] = arrow
      store[startBinding.id] = startBinding
      store[endBinding.id] = endBinding
    }

    if (operation.op === 'disconnectNodes') {
      const edge = edgeShapeByPatch(nextSnapshot, operation)
      if (!edge) continue
      delete store[edge.id]
      for (const binding of getBindingRecords(nextSnapshot)) {
        if (binding.fromId === edge.id) delete store[binding.id]
      }
    }

    if (operation.op === 'moveNode') {
      const shape = shapeByNodeId(nextSnapshot, operation.id)
      if (shape) {
        shape.x = operation.x
        shape.y = operation.y
      }
    }
  }

  return { snapshot: nextSnapshot, validation }
}

export function summarizePatch(patch) {
  if (!Array.isArray(patch?.operations)) return []
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
      default:
        return `${index + 1}. unknown operation`
    }
  })
}

export function patchTemplate() {
  return {
    version: 1,
    intent: 'Add a learning branch from an existing node.',
    operations: [
      {
        op: 'addNode',
        id: 'node-example',
        title: 'New concept',
        summary: 'Short visible card summary',
        body: 'Longer AI-readable notes.',
        tags: ['example'],
        status: 'exploring',
        connectFromId: 'node-existing',
        edgeKind: 'extends',
        edgeLabel: 'extends',
      },
    ],
  }
}

export function toolText(value) {
  return { content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] }
}
