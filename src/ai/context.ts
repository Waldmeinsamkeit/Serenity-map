import type { Editor } from 'tldraw'
import { buildCanvasIndex, getCardData, getLearningShapes, getSelectedLearningCards } from '../model/learningGraph'
import type { AiCanvasContext, LearningEdgeForAi, LearningNodeForAi } from '../model/types'

function escapeMermaid(value: string) {
  return value.replaceAll('"', "'").replaceAll('\n', ' ')
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

export function getSelectedCardData(editor: Editor) {
  const shape = getLearningShapes(editor).cards.find((card) => editor.getSelectedShapeIds().includes(card.id))
  return shape ? getCardData(shape) : null
}
