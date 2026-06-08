import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { ZERO_INDEX_KEY, getIndexAbove } from '@tldraw/utils'

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
const VALID_IMPORT_MODES = ['overwrite', 'merge', 'add-only']

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

function escapeYamlString(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

function escapeMarkdown(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('[', '\\[').replaceAll(']', '\\]').replaceAll('|', '\\|')
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

function normalizeObsidianTag(value) {
  return String(value)
    .trim()
    .replace(/^#+/, '')
    .replaceAll(/[^\p{L}\p{N}_/-]+/gu, '-')
    .replaceAll(/^-+|-+$/g, '')
}

function uniqueValues(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))]
}

function hashText(value) {
  let hash = 0
  for (const char of String(value)) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0
  return Math.abs(hash).toString(36)
}

function nodeIdFromTitle(title) {
  const slug = String(title)
    .trim()
    .toLowerCase()
    .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
    .replaceAll(/^-+|-+$/g, '')
  return `node-obsidian-${slug || hashText(title)}`
}

function findNodeByTitleOrId(index, title, id = nodeIdFromTitle(title)) {
  if (!index) return null
  return index.nodesById.get(id) ?? [...index.nodesById.values()].find((node) => node.title === title) ?? null
}

function mergeNodeOperation(existing, next, mode = 'merge') {
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
    tags: normalizeTags([...(existing.tags ?? []), ...(next.tags ?? [])]),
    status: existing.status,
  }
}

function nodeAnchor(node) {
  return `${node.title || node.id} (${node.id})`
}

function nodeLink(node) {
  const label = node.title || node.id
  return `[[#${escapeMarkdown(nodeAnchor(node))}|${escapeMarkdown(label)}]]`
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

function pageRecordsForSnapshot(snapshot) {
  const store = getStore(snapshot)
  return Object.values(store)
    .filter((record) => record?.typeName === 'page' && isString(record.id))
    .sort((a, b) => String(a.index ?? '').localeCompare(String(b.index ?? '')))
}

function pageIdForSnapshot(snapshot, requestedPageId) {
  const pages = pageRecordsForSnapshot(snapshot)
  const pageIds = new Set(pages.map((page) => page.id))
  if (isString(requestedPageId)) {
    if (pageIds.has(requestedPageId)) return requestedPageId
    throw new Error(`Page not found: ${requestedPageId}.`)
  }
  if (isString(snapshot?.session?.currentPageId) && pageIds.has(snapshot.session.currentPageId)) return snapshot.session.currentPageId
  const pageStateId = snapshot?.session?.pageStates?.find((pageState) => pageIds.has(pageState?.pageId))?.pageId
  return pageStateId ?? pages[0]?.id ?? 'page:page'
}

function getStore(snapshot) {
  return snapshot?.document?.store ?? {}
}

function getShapeRecords(snapshot, pageId = pageIdForSnapshot(snapshot)) {
  return Object.values(getStore(snapshot)).filter((record) => record?.typeName === 'shape' && (!pageId || record.parentId === pageId))
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

function getCurrentPageState(snapshot, pageId = pageIdForSnapshot(snapshot)) {
  return snapshot?.session?.pageStates?.find((pageState) => pageState?.pageId === pageId) ?? null
}

function isAllowedEmptyPage(snapshot, pageId = pageIdForSnapshot(snapshot)) {
  const page = getStore(snapshot)[pageId]
  const meta = page?.meta?.[SERENITY_META_KEY]
  return isRecord(meta) && meta.kind === 'serenity-page' && meta.allowEmpty === true
}

function validateSerenitySnapshotForWrite(snapshot) {
  const store = getStore(snapshot)
  const records = Object.values(store)
  if (!isRecord(snapshot?.document?.schema)) return 'Snapshot is missing document.schema.'
  if (!isRecord(snapshot?.session)) return 'Snapshot is missing session state.'
  if (!records.some((record) => record?.typeName === 'document')) return 'Snapshot is missing a document record.'

  const pageIds = new Set(records.filter((record) => record?.typeName === 'page' && isString(record.id)).map((record) => record.id))
  if (pageIds.size === 0) return 'Snapshot is missing a page record.'

  const currentPageId = isString(snapshot.session.currentPageId) ? snapshot.session.currentPageId : pageIds.values().next().value
  if (!pageIds.has(currentPageId)) return 'Snapshot session points to a missing page.'

  const hasCurrentPageSerenityCard = records.some((record) => {
    const meta = getSerenityMeta(record)
    return record?.typeName === 'shape' &&
      record.type === 'geo' &&
      record.parentId === currentPageId &&
      meta?.kind === 'learning-card'
  })
  const hasAnySerenityCard = records.some((record) => {
    const meta = getSerenityMeta(record)
    return record?.typeName === 'shape' &&
      record.type === 'geo' &&
      meta?.kind === 'learning-card'
  })
  return hasCurrentPageSerenityCard || hasAnySerenityCard || isAllowedEmptyPage(snapshot, currentPageId)
    ? null
    : 'Snapshot has no Serenity learning-card records on the current page.'
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
  const validationError = validateSerenitySnapshotForWrite(payload?.snapshot)
  if (validationError) throw new Error(validationError)

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

export function listPagesFromSnapshot(snapshot) {
  const currentPageId = pageIdForSnapshot(snapshot)
  return pageRecordsForSnapshot(snapshot).map((page) => {
    const index = buildCanvasIndexFromSnapshot(snapshot, { pageId: page.id })
    const pageState = getCurrentPageState(snapshot, page.id)
    return {
      id: page.id,
      name: page.name ?? page.id,
      index: page.index ?? '',
      isCurrent: page.id === currentPageId,
      selectedShapeIds: pageState?.selectedShapeIds ?? [],
      nodeCount: index.nodesById.size,
      edgeCount: index.edgesById.size,
      allowEmpty: page.meta?.[SERENITY_META_KEY]?.allowEmpty === true,
    }
  })
}

export function setCurrentPageInSnapshot(snapshot, pageId) {
  const resolvedPageId = pageIdForSnapshot(snapshot, pageId)
  const nextSnapshot = structuredClone(snapshot)
  nextSnapshot.session = {
    ...(nextSnapshot.session ?? {}),
    currentPageId: resolvedPageId,
  }
  const pageStates = Array.isArray(nextSnapshot.session.pageStates) ? [...nextSnapshot.session.pageStates] : []
  if (!pageStates.some((pageState) => pageState?.pageId === resolvedPageId)) {
    pageStates.push({
      pageId: resolvedPageId,
      camera: { x: 0, y: 0, z: 1 },
      selectedShapeIds: [],
      focusedGroupId: null,
    })
  }
  nextSnapshot.session.pageStates = pageStates
  return nextSnapshot
}

function bindingTouchesShape(binding, shapeIds) {
  return shapeIds.has(binding?.fromId) || shapeIds.has(binding?.toId)
}

export function restorePageFromSnapshotBackup(currentSnapshot, backupSnapshot, pageId) {
  const resolvedPageId = pageIdForSnapshot(backupSnapshot, pageId)
  const backupStore = getStore(backupSnapshot)
  const backupPage = backupStore[resolvedPageId]
  if (!backupPage || backupPage.typeName !== 'page') throw new Error(`Backup page not found: ${resolvedPageId}.`)

  const nextSnapshot = structuredClone(currentSnapshot)
  const nextStore = getStore(nextSnapshot)
  const currentPageShapeIds = new Set(
    Object.values(nextStore)
      .filter((record) => record?.typeName === 'shape' && record.parentId === resolvedPageId)
      .map((record) => record.id)
  )
  const backupPageShapeIds = new Set(
    Object.values(backupStore)
      .filter((record) => record?.typeName === 'shape' && record.parentId === resolvedPageId)
      .map((record) => record.id)
  )

  for (const record of Object.values(nextStore)) {
    if (record?.typeName === 'shape' && record.parentId === resolvedPageId) delete nextStore[record.id]
    if (record?.typeName === 'binding' && bindingTouchesShape(record, currentPageShapeIds)) delete nextStore[record.id]
  }

  nextStore[resolvedPageId] = structuredClone(backupPage)
  for (const record of Object.values(backupStore)) {
    if (record?.typeName === 'shape' && record.parentId === resolvedPageId) nextStore[record.id] = structuredClone(record)
    if (record?.typeName === 'binding' && bindingTouchesShape(record, backupPageShapeIds)) {
      nextStore[record.id] = structuredClone(record)
    }
  }

  nextSnapshot.session = {
    ...(nextSnapshot.session ?? {}),
    currentPageId: resolvedPageId,
  }
  const backupPageState = getCurrentPageState(backupSnapshot, resolvedPageId)
  const pageStates = Array.isArray(nextSnapshot.session.pageStates) ? [...nextSnapshot.session.pageStates] : []
  const nextPageState = backupPageState
    ? structuredClone(backupPageState)
    : {
        pageId: resolvedPageId,
        camera: { x: 0, y: 0, z: 1 },
        selectedShapeIds: [],
        focusedGroupId: null,
      }
  const existingIndex = pageStates.findIndex((pageState) => pageState?.pageId === resolvedPageId)
  if (existingIndex >= 0) pageStates[existingIndex] = nextPageState
  else pageStates.push(nextPageState)
  nextSnapshot.session.pageStates = pageStates
  return nextSnapshot
}

export function buildCanvasIndexFromSnapshot(snapshot, options = {}) {
  const pageId = pageIdForSnapshot(snapshot, options.pageId)
  const nodesById = new Map()
  const edgesById = new Map()
  const shapeIdByNodeId = new Map()
  const shapeIdByEdgeId = new Map()

  for (const shape of getShapeRecords(snapshot, pageId)) {
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

  for (const shape of getShapeRecords(snapshot, pageId)) {
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

export function exportAiContextFromSnapshot(snapshot, options = {}) {
  const pageId = pageIdForSnapshot(snapshot, options.pageId)
  const index = buildCanvasIndexFromSnapshot(snapshot, { pageId })
  const nodes = [...index.nodesById.values()]
  const edges = [...index.edgesById.values()]
  const pageState = getCurrentPageState(snapshot, pageId)
  const selectedNodeIds = pageState?.selectedShapeIds
    ?.map((shapeId) => nodes.find((node) => node.shapeId === shapeId)?.id)
    .filter(Boolean) ?? []
  return {
    version: 1,
    exportedAt: nowIso(),
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      selectedNodeIds,
      currentPageId: pageId,
      pageId,
      pageName: getStore(snapshot)[pageId]?.name ?? pageId,
    },
    selectedNodeIds,
    nodes,
    edges,
    neighborhoods: buildNeighborhoods(nodes, edges),
    diagram: buildMermaidDiagram(nodes, edges),
  }
}

export function exportReadableContextFromSnapshot(snapshot, options = {}) {
  const context = exportAiContextFromSnapshot(snapshot, options)
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

export function exportObsidianMarkdownFromSnapshot(snapshot, options = {}) {
  const context = exportAiContextFromSnapshot(snapshot, options)
  const selected = context.selectedNodeIds.length ? context.selectedNodeIds.join(', ') : 'none'
  const nodeById = new Map(context.nodes.map((node) => [node.id, node]))
  const obsidianTags = uniqueValues([
    'serenity',
    'canvas',
    'industry-research',
    ...context.nodes.flatMap((node) => node.tags.map(normalizeObsidianTag)),
  ]).filter(Boolean)
  const relatedNotes = uniqueValues(context.nodes.map((node) => node.title || node.id))
  const filenameTitle = 'Serenity Canvas Export'

  const frontmatter = [
    '---',
    `title: ${escapeYamlString(filenameTitle)}`,
    `created: ${escapeYamlString(context.exportedAt)}`,
    'source: serenity',
    'type: canvas-context',
    'tags:',
    ...obsidianTags.map((tag) => `  - ${escapeYamlString(tag)}`),
    'aliases:',
    '  - Serenity AI Context',
    `node_count: ${context.summary.nodeCount}`,
    `edge_count: ${context.summary.edgeCount}`,
    'selected_node_ids:',
    ...(context.selectedNodeIds.length ? context.selectedNodeIds.map((id) => `  - ${escapeYamlString(id)}`) : ['  - none']),
    'related_notes:',
    ...relatedNotes.map((title) => `  - ${escapeYamlString(title)}`),
    '---',
  ]

  const nodeIndex = context.nodes.map((node) => {
    const tags = node.tags.map(normalizeObsidianTag).filter(Boolean).map((tag) => `#${tag}`).join(' ')
    return `- ${nodeLink(node)} - \`${node.status}\`${tags ? ` ${tags}` : ''}`
  })

  const edgeLines = context.edges.map((edge) => {
    const from = nodeById.get(edge.fromId)
    const to = nodeById.get(edge.toId)
    const fromText = from ? nodeLink(from) : `\`${edge.fromId}\``
    const toText = to ? nodeLink(to) : `\`${edge.toId}\``
    return `- ${fromText} -> ${toText} - **${escapeMarkdown(edge.label || edge.kind)}** (\`${edge.kind}\`)`
  })

  const nodeSections = context.nodes.flatMap((node) => {
    const inbound = node.inbound
      .map((edgeId) => context.edges.find((edge) => edge.id === edgeId))
      .filter(Boolean)
      .map((edge) => {
        const from = edge ? nodeById.get(edge.fromId) : null
        return edge && from ? `  - from ${nodeLink(from)}: ${escapeMarkdown(edge.label || edge.kind)}` : ''
      })
      .filter(Boolean)
    const outbound = node.outbound
      .map((edgeId) => context.edges.find((edge) => edge.id === edgeId))
      .filter(Boolean)
      .map((edge) => {
        const to = edge ? nodeById.get(edge.toId) : null
        return edge && to ? `  - to ${nodeLink(to)}: ${escapeMarkdown(edge.label || edge.kind)}` : ''
      })
      .filter(Boolean)
    const tags = node.tags.map(normalizeObsidianTag).filter(Boolean).map((tag) => `#${tag}`).join(' ')

    return [
      `### ${nodeAnchor(node)}`,
      '',
      `- ID: \`${node.id}\``,
      `- Status: \`${node.status}\``,
      `- Tags: ${tags || 'none'}`,
      `- Summary: ${node.summary || 'none'}`,
      '',
      node.body ? node.body : '_No body yet._',
      '',
      '#### Links',
      '- Inbound:',
      ...(inbound.length ? inbound : ['  - none']),
      '- Outbound:',
      ...(outbound.length ? outbound : ['  - none']),
      '',
    ]
  })

  return [
    ...frontmatter,
    '',
    `# ${filenameTitle}`,
    '',
    '> [!summary]',
    `> Nodes: ${context.summary.nodeCount} | Edges: ${context.summary.edgeCount} | Selected: ${selected}`,
    '',
    '## Node Index',
    ...nodeIndex,
    '',
    '## Relationship Map',
    '```mermaid',
    context.diagram,
    '```',
    '',
    '## Edges',
    ...edgeLines,
    '',
    '## Nodes',
    ...nodeSections,
  ].join('\n')
}

function readMarkdownField(section, name) {
  const match = section.match(new RegExp(`^- ${name}:\\s*(.*)$`, 'm'))
  return match?.[1]?.trim() ?? ''
}

function readBacktickValue(value) {
  return value.match(/^`([^`]+)`$/)?.[1] ?? value
}

function readMarkdownTags(value) {
  if (!value || value === 'none') return []
  return [...value.matchAll(/#([^\s#]+)/g)].map((match) => match[1]).filter(Boolean)
}

function readMarkdownBody(section) {
  const summaryMatch = section.match(/^- Summary:.*$/m)
  const linksIndex = section.search(/^#### Links\s*$/m)
  if (!summaryMatch || linksIndex < 0 || linksIndex <= summaryMatch.index) return ''
  return section
    .slice(summaryMatch.index + summaryMatch[0].length, linksIndex)
    .trim()
    .replace(/^_No body yet\._$/, '')
}

function parseNodeHeading(heading, fallbackId) {
  const match = heading.trim().match(/^(.*?)\s+\(([^()]+)\)$/)
  return {
    title: match?.[1]?.trim() || heading.trim() || fallbackId,
    id: match?.[2]?.trim() || fallbackId,
  }
}

function parseObsidianNodes(markdown, index, mode = 'merge') {
  const operations = []
  const sections = [...markdown.matchAll(/^###\s+(.+)$/gm)]
  for (const [sectionIndex, match] of sections.entries()) {
    const start = match.index + match[0].length
    const end = sections[sectionIndex + 1]?.index ?? markdown.length
    const section = markdown.slice(start, end)
    const idField = readBacktickValue(readMarkdownField(section, 'ID'))
    const { id, title } = parseNodeHeading(match[1], idField || `node-import-${sectionIndex + 1}`)
    const statusField = readBacktickValue(readMarkdownField(section, 'Status'))
    const status = VALID_STATUSES.includes(statusField) ? statusField : 'exploring'
    const tags = readMarkdownTags(readMarkdownField(section, 'Tags'))
    const summary = readMarkdownField(section, 'Summary')
    const body = readMarkdownBody(section)

    const operation = mergeNodeOperation(index?.nodesById.get(id) ?? null, {
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

function parseObsidianEdges(markdown, index) {
  const operations = []
  const currentEdges = index ? [...index.edgesById.values()] : []
  const existingPairs = new Set(currentEdges.map((edge) => `${edge.fromId}->${edge.toId}`))
  const edgeBlock = markdown.match(/^## Edges\s*\n([\s\S]*?)(?=\n##\s|$)/m)?.[1] ?? ''
  for (const match of edgeBlock.matchAll(/^- \[\[#.*?\(([^()]+)\)\|.*?\]\]\s*->\s*\[\[#.*?\(([^()]+)\)\|.*?\]\]\s*-\s*\*\*(.*?)\*\*\s*\(`([^`]+)`\)/g)) {
    const fromId = match[1].trim()
    const toId = match[2].trim()
    const label = match[3].trim()
    const kindField = match[4].trim()
    const kind = VALID_EDGE_KINDS.includes(kindField) ? kindField : 'related'
    if (existingPairs.has(`${fromId}->${toId}`)) continue
    operations.push({ op: 'connectNodes', fromId, toId, kind, label })
    existingPairs.add(`${fromId}->${toId}`)
  }
  return operations
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---')) return { data: {}, body: markdown }
  const end = markdown.indexOf('\n---', 3)
  if (end < 0) return { data: {}, body: markdown }
  const data = {}
  for (const line of markdown.slice(3, end).trim().split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (match) data[match[1]] = match[2].replace(/^["']|["']$/g, '').trim()
  }
  return { data, body: markdown.slice(end + 4).trim() }
}

function parseFrontmatterTags(value) {
  if (!value) return []
  return String(value)
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((tag) => tag.replace(/^["'#\s]+|["'\s]+$/g, ''))
    .filter(Boolean)
}

function parseGenericObsidianNote(markdown, index, mode = 'merge') {
  const { data, body } = parseFrontmatter(markdown)
  const title = data.title || body.match(/^#\s+(.+)$/m)?.[1]?.trim() || 'Imported Obsidian Note'
  const id = data.id || nodeIdFromTitle(title)
  const tags = normalizeTags([
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
  const operations = []
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

export function parseObsidianMarkdownPatchInput(text, snapshot, options = {}) {
  const markdown = String(text ?? '').trim()
  const looksLikeObsidianExport =
    markdown.startsWith('---') && markdown.includes('type: canvas-context') && markdown.includes('## Nodes')
  const index = buildCanvasIndexFromSnapshot(snapshot, options)
  const importMode = VALID_IMPORT_MODES.includes(options.importMode)
    ? options.importMode
    : looksLikeObsidianExport ? 'overwrite' : 'merge'
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

export function parsePatchTextInput(input, snapshot, options = {}) {
  if (typeof input !== 'string') return { ...parseAiPatchInput(input), format: 'json' }
  const trimmed = input.trim()
  if (trimmed.startsWith('{')) return { ...parseAiPatchInput(trimmed), format: 'json' }
  return { ...parseObsidianMarkdownPatchInput(trimmed, snapshot, options), format: 'obsidian' }
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

export function validateAiPatchForSnapshot(snapshot, patch, options = {}) {
  const errors = []
  const warnings = []
  if (!isRecord(patch)) return { ok: false, errors: ['Patch must be a JSON object.'], warnings, summary: [] }
  if (patch.version !== 1) errors.push('Patch version must be 1.')
  if (!Array.isArray(patch.operations)) errors.push('Patch must include an operations array.')
  let index
  try {
    index = buildCanvasIndexFromSnapshot(snapshot, options)
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Target page was not found.')
  }
  if (errors.length) return { ok: false, errors, warnings, summary: [] }

  const ids = new Set(index.nodesById.keys())
  const edgeIds = new Set(index.edgesById.keys())
  const edgesById = new Map(index.edgesById)
  const edgePairs = new Set([...index.edgesById.values()].map((edge) => `${edge.fromId}->${edge.toId}`))

  for (const [i, operation] of patch.operations.entries()) {
    validateOperationShape(operation, i, errors)
    if (!isRecord(operation) || !isString(operation.op)) continue
    if (operation.op === 'addNode') {
      if (operation.id && ids.has(operation.id)) errors.push(`Operation ${i + 1} addNode id already exists: ${operation.id}.`)
      if (operation.id && operation.connectFromId === operation.id) {
        errors.push(`Operation ${i + 1} addNode connectFromId cannot reference the node being added: ${operation.id}.`)
      }
      if (operation.connectFromId && !ids.has(operation.connectFromId)) {
        errors.push(`Operation ${i + 1} addNode connectFromId does not exist: ${operation.connectFromId}.`)
      }
      if (operation.id) ids.add(operation.id)
    }
    if (operation.op === 'updateNode' || operation.op === 'deleteNode' || operation.op === 'moveNode') {
      if (!ids.has(operation.id)) errors.push(`Operation ${i + 1} references missing node: ${operation.id}.`)
      if (operation.op === 'deleteNode') {
        ids.delete(operation.id)
        for (const [edgeId, edge] of edgesById) {
          if (edge.fromId === operation.id || edge.toId === operation.id) {
            edgeIds.delete(edgeId)
            edgePairs.delete(`${edge.fromId}->${edge.toId}`)
            edgesById.delete(edgeId)
          }
        }
      }
    }
    if (operation.op === 'connectNodes') {
      if (!ids.has(operation.fromId)) errors.push(`Operation ${i + 1} missing fromId: ${operation.fromId}.`)
      if (!ids.has(operation.toId)) errors.push(`Operation ${i + 1} missing toId: ${operation.toId}.`)
      if (operation.id && edgeIds.has(operation.id)) errors.push(`Operation ${i + 1} edge id already exists: ${operation.id}.`)
      if (operation.fromId === operation.toId) warnings.push(`Operation ${i + 1} connects a node to itself.`)
      if (operation.id) edgeIds.add(operation.id)
      const edgeId = operation.id ?? `operation-${i + 1}`
      edgesById.set(edgeId, {
        id: edgeId,
        fromId: operation.fromId,
        toId: operation.toId,
        kind: operation.kind ?? 'related',
        label: operation.label ?? operation.kind ?? 'related',
      })
      edgePairs.add(`${operation.fromId}->${operation.toId}`)
    }
    if (operation.op === 'disconnectNodes') {
      if (operation.id) {
        const edge = edgesById.get(operation.id)
        if (!edgeIds.has(operation.id) || !edge) {
          errors.push(`Operation ${i + 1} references missing edge: ${operation.id}.`)
        } else {
          edgeIds.delete(operation.id)
          edgePairs.delete(`${edge.fromId}->${edge.toId}`)
          edgesById.delete(operation.id)
        }
      } else if (!edgePairs.has(`${operation.fromId}->${operation.toId}`)) {
        errors.push(`Operation ${i + 1} references missing edge: ${operation.fromId} -> ${operation.toId}.`)
      } else {
        edgePairs.delete(`${operation.fromId}->${operation.toId}`)
        for (const [edgeId, edge] of edgesById) {
          if (edge.fromId === operation.fromId && edge.toId === operation.toId) {
            edgeIds.delete(edgeId)
            edgesById.delete(edgeId)
            break
          }
        }
      }
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

function nextShapeIndex(snapshot, pageId = pageIdForSnapshot(snapshot)) {
  const indexes = getShapeRecords(snapshot, pageId)
    .map((shape) => shape.index)
    .filter((index) => typeof index === 'string' && index.length > 0)
    .sort()
  return getIndexAbove(indexes.at(-1) ?? ZERO_INDEX_KEY)
}

function createLearningCardRecord(snapshot, input, pageId = pageIdForSnapshot(snapshot)) {
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
    parentId: pageId,
    index: nextShapeIndex(snapshot, pageId),
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

function createLearningEdgeRecords(snapshot, fromShape, toShape, input, pageId = pageIdForSnapshot(snapshot)) {
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
    parentId: pageId,
    index: nextShapeIndex(snapshot, pageId),
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

function shapeByNodeId(snapshot, nodeId, pageId = pageIdForSnapshot(snapshot)) {
  return getShapeRecords(snapshot, pageId).find((shape) => shape.type === 'geo' && nodeDataFromShape(shape)?.id === nodeId)
}

function edgeShapeByPatch(snapshot, op, pageId = pageIdForSnapshot(snapshot)) {
  return getShapeRecords(snapshot, pageId).find((shape) => {
    if (shape.type !== 'arrow') return false
    const data = edgeDataFromShape(shape)
    if (!data) return false
    if (op.id) return data.id === op.id
    return data.fromId === op.fromId && data.toId === op.toId
  })
}

function branchPosition(snapshot, sourceNodeId, pageId = pageIdForSnapshot(snapshot)) {
  const source = sourceNodeId ? shapeByNodeId(snapshot, sourceNodeId, pageId) : null
  if (!source) return { x: 120, y: 120 }
  const siblingCount = getShapeRecords(snapshot, pageId).filter((shape) => shape.type === 'geo' && Math.abs((shape.x ?? 0) - ((source.x ?? 0) + CARD_WIDTH + 120)) < 24).length
  return { x: (source.x ?? 0) + CARD_WIDTH + 120, y: (source.y ?? 0) + siblingCount * (CARD_HEIGHT + 48) }
}

export function applyAiPatchToSnapshot(snapshot, patch, options = {}) {
  const validation = validateAiPatchForSnapshot(snapshot, patch, options)
  if (!validation.ok) return { snapshot, validation }
  const nextSnapshot = structuredClone(snapshot)
  const store = getStore(nextSnapshot)
  const pageId = pageIdForSnapshot(nextSnapshot, options.pageId)

  for (const operation of patch.operations) {
    if (operation.op === 'addNode') {
      const fallback = branchPosition(nextSnapshot, operation.connectFromId, pageId)
      const card = createLearningCardRecord(nextSnapshot, {
        ...operation,
        x: operation.x ?? fallback.x,
        y: operation.y ?? fallback.y,
      }, pageId)
      store[card.id] = card
      if (operation.connectFromId) {
        const fromShape = shapeByNodeId(nextSnapshot, operation.connectFromId, pageId)
        const toShape = card
        if (fromShape) {
          const { arrow, startBinding, endBinding } = createLearningEdgeRecords(nextSnapshot, fromShape, toShape, {
            fromId: operation.connectFromId,
            toId: card.meta[SERENITY_META_KEY].data.id,
            kind: operation.edgeKind,
            label: operation.edgeLabel,
          }, pageId)
          store[arrow.id] = arrow
          store[startBinding.id] = startBinding
          store[endBinding.id] = endBinding
        }
      }
    }

    if (operation.op === 'updateNode') {
      const shape = shapeByNodeId(nextSnapshot, operation.id, pageId)
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
      const shape = shapeByNodeId(nextSnapshot, operation.id, pageId)
      if (!shape) continue
      delete store[shape.id]
      for (const edge of getShapeRecords(nextSnapshot, pageId)) {
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
      const fromShape = shapeByNodeId(nextSnapshot, operation.fromId, pageId)
      const toShape = shapeByNodeId(nextSnapshot, operation.toId, pageId)
      if (!fromShape || !toShape) continue
      const { arrow, startBinding, endBinding } = createLearningEdgeRecords(nextSnapshot, fromShape, toShape, {
        id: operation.id,
        fromId: operation.fromId,
        toId: operation.toId,
        kind: operation.kind,
        label: operation.label,
      }, pageId)
      store[arrow.id] = arrow
      store[startBinding.id] = startBinding
      store[endBinding.id] = endBinding
    }

    if (operation.op === 'disconnectNodes') {
      const edge = edgeShapeByPatch(nextSnapshot, operation, pageId)
      if (!edge) continue
      delete store[edge.id]
      for (const binding of getBindingRecords(nextSnapshot)) {
        if (binding.fromId === edge.id) delete store[binding.id]
      }
    }

    if (operation.op === 'moveNode') {
      const shape = shapeByNodeId(nextSnapshot, operation.id, pageId)
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
