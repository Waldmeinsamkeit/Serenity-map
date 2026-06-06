import type { Editor } from 'tldraw'
import { buildCanvasIndex, getCardData, getLearningShapes, getSelectedLearningCards } from '../model/learningGraph'
import type { AiCanvasContext, LearningEdgeForAi, LearningNodeForAi } from '../model/types'

function escapeMermaid(value: string) {
  return value.replaceAll('"', "'").replaceAll('\n', ' ')
}

function escapeYamlString(value: string) {
  return `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
}

function escapeMarkdown(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('[', '\\[').replaceAll(']', '\\]').replaceAll('|', '\\|')
}

function normalizeObsidianTag(value: string) {
  return value
    .trim()
    .replace(/^#+/, '')
    .replaceAll(/[^\p{L}\p{N}_/-]+/gu, '-')
    .replaceAll(/^-+|-+$/g, '')
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function nodeAnchor(node: Pick<LearningNodeForAi, 'title' | 'id'>) {
  return `${node.title || node.id} (${node.id})`
}

function nodeLink(node: Pick<LearningNodeForAi, 'title' | 'id'>) {
  const label = node.title || node.id
  return `[[#${escapeMarkdown(nodeAnchor(node))}|${escapeMarkdown(label)}]]`
}

function buildNeighborhoods(nodes: LearningNodeForAi[], edges: LearningEdgeForAi[]) {
  const adjacency = new Map<string, Set<string>>()
  for (const node of nodes) adjacency.set(node.id, new Set())
  for (const edge of edges) {
    adjacency.get(edge.fromId)?.add(edge.toId)
    adjacency.get(edge.toId)?.add(edge.fromId)
  }

  const neighborhoods: AiCanvasContext['neighborhoods'] = {}
  for (const node of nodes) {
    const oneHop = [...(adjacency.get(node.id) ?? [])]
    const twoHop = new Set<string>()
    for (const neighbor of oneHop) {
      for (const next of adjacency.get(neighbor) ?? []) {
        if (next !== node.id && !oneHop.includes(next)) twoHop.add(next)
      }
    }
    neighborhoods[node.id] = { oneHop, twoHop: [...twoHop] }
  }
  return neighborhoods
}

export function buildMermaidDiagram(nodes: LearningNodeForAi[], edges: LearningEdgeForAi[]) {
  const lines = ['flowchart LR']
  for (const node of nodes) {
    lines.push(`  ${node.id}["${escapeMermaid(node.title)}"]`)
  }
  for (const edge of edges) {
    const label = edge.label || edge.kind
    lines.push(`  ${edge.fromId} -->|"${escapeMermaid(label)}"| ${edge.toId}`)
  }
  return lines.join('\n')
}

export function exportAiContext(editor: Editor): AiCanvasContext {
  const index = buildCanvasIndex(editor)
  const nodes = [...index.nodesById.values()]
  const edges = [...index.edgesById.values()]
  const selectedNodeIds = getSelectedLearningCards(editor).map(({ data }) => data.id)

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    summary: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      selectedNodeIds,
    },
    selectedNodeIds,
    nodes,
    edges,
    neighborhoods: buildNeighborhoods(nodes, edges),
    diagram: buildMermaidDiagram(nodes, edges),
  }
}

export function exportReadableContext(editor: Editor) {
  const context = exportAiContext(editor)
  const selected = context.selectedNodeIds.length
    ? context.selectedNodeIds.join(', ')
    : 'none'
  const nodeLines = context.nodes.map((node) => {
    const tags = node.tags.length ? ` [${node.tags.join(', ')}]` : ''
    return `- ${node.id}: ${node.title}${tags} (${node.status})`
  })
  const edgeLines = context.edges.map((edge) => {
    const label = edge.label || edge.kind
    return `- ${edge.id}: ${edge.fromId} -> ${edge.toId} (${label})`
  })

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

export function exportObsidianMarkdown(editor: Editor) {
  const context = exportAiContext(editor)
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
    'node_count: ' + context.summary.nodeCount,
    'edge_count: ' + context.summary.edgeCount,
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

export function getSelectedCardData(editor: Editor) {
  const shape = getLearningShapes(editor).cards.find((card) => editor.getSelectedShapeIds().includes(card.id))
  return shape ? getCardData(shape) : null
}
