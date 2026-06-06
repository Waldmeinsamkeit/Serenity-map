import type { CanvasIndex } from '../model/types'

export type SearchScope = 'all' | 'nodes' | 'edges' | 'tags' | 'status'

export interface CanvasSearchResult {
  key: string
  type: string
  shapeId?: string
  title: string
  detail: string
  meta: string
  haystack: string
}

export const SEARCH_SCOPES: Array<{ value: SearchScope; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'nodes', label: '节点' },
  { value: 'edges', label: '连线' },
  { value: 'tags', label: '标签' },
  { value: 'status', label: '状态' },
]

export function buildCanvasSearchResults(
  index: CanvasIndex,
  query = '',
  scope: SearchScope = 'all',
  limit = 12
): CanvasSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase()
  const nodes = [...index.nodesById.values()]
  const nodeResults = nodes.map((node) => ({
    key: `node:${node.id}`,
    type: '节点',
    shapeId: node.shapeId,
    title: node.title,
    detail: node.summary || node.body || node.id,
    meta: node.tags.length ? node.tags.join(', ') : node.status,
    haystack: [node.id, node.title, node.summary, node.body, node.status, ...node.tags].join(' ').toLowerCase(),
  }))
  const edgeResults = [...index.edgesById.values()].map((edge) => {
    const from = index.nodesById.get(edge.fromId)
    const to = index.nodesById.get(edge.toId)
    const title = `${from?.title ?? edge.fromId} → ${to?.title ?? edge.toId}`
    return {
      key: `edge:${edge.id}`,
      type: '连线',
      shapeId: edge.shapeId,
      title,
      detail: edge.label || edge.kind,
      meta: edge.kind,
      haystack: [edge.id, title, edge.fromId, edge.toId, edge.kind, edge.label].join(' ').toLowerCase(),
    }
  })
  const tagResults = [...new Set(nodes.flatMap((node) => node.tags))]
    .filter(Boolean)
    .map((tag) => {
      const first = nodes.find((node) => node.tags.includes(tag))
      const count = nodes.filter((node) => node.tags.includes(tag)).length
      return {
        key: `tag:${tag}`,
        type: '标签',
        shapeId: first?.shapeId ?? nodes[0]?.shapeId,
        title: tag,
        detail: `${count} 个节点使用此标签`,
        meta: 'tag',
        haystack: tag.toLowerCase(),
      }
    })
  const statusResults = [...new Set(nodes.map((node) => node.status))]
    .map((status) => {
      const first = nodes.find((node) => node.status === status)
      const count = nodes.filter((node) => node.status === status).length
      return {
        key: `status:${status}`,
        type: '状态',
        shapeId: first?.shapeId ?? nodes[0]?.shapeId,
        title: status,
        detail: `${count} 个节点处于此状态`,
        meta: 'status',
        haystack: status.toLowerCase(),
      }
    })
  const scopedResults = [
    ...(scope === 'all' || scope === 'nodes' ? nodeResults : []),
    ...(scope === 'all' || scope === 'edges' ? edgeResults : []),
    ...(scope === 'all' || scope === 'tags' ? tagResults : []),
    ...(scope === 'all' || scope === 'status' ? statusResults : []),
  ]

  return scopedResults
    .filter((result) => !normalizedQuery || result.haystack.includes(normalizedQuery))
    .slice(0, limit)
}
