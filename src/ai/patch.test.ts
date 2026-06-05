import { describe, expect, it } from 'vitest'
import { buildMermaidDiagram } from './context'
import { parseAiPatch, validateAiPatch } from './patch'
import type { CanvasIndex, LearningEdgeForAi, LearningNodeForAi } from '../model/types'

function node(id: string): LearningNodeForAi {
  return {
    id,
    shapeId: `shape:${id}`,
    title: id,
    body: '',
    summary: '',
    tags: [],
    status: 'seed',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    x: 0,
    y: 0,
    width: 260,
    height: 152,
    inbound: [],
    outbound: [],
  }
}

function edge(id: string, fromId: string, toId: string): LearningEdgeForAi {
  return {
    id,
    shapeId: `shape:${id}`,
    fromId,
    toId,
    kind: 'extends',
    label: 'extends',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function index(nodes: LearningNodeForAi[], edges: LearningEdgeForAi[] = []): CanvasIndex {
  return {
    nodesById: new Map(nodes.map((item) => [item.id, item])),
    edgesById: new Map(edges.map((item) => [item.id, item])),
    shapeIdByNodeId: new Map(nodes.map((item) => [item.id, item.shapeId as any])),
    shapeIdByEdgeId: new Map(edges.map((item) => [item.id, item.shapeId as any])),
  }
}

describe('AI patch contract', () => {
  it('parses a valid patch envelope', () => {
    const result = parseAiPatch('{"version":1,"operations":[{"op":"addNode","title":"Concept"}]}')
    expect(result.errors).toEqual([])
    expect(result.patch?.operations).toHaveLength(1)
  })

  it('rejects unknown operations', () => {
    const result = validateAiPatch(
      { version: 1, operations: [{ op: 'rewriteEverything' } as any] },
      index([node('a')])
    )
    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('unknown op')
  })

  it('rejects dangling connections', () => {
    const result = validateAiPatch(
      { version: 1, operations: [{ op: 'connectNodes', fromId: 'a', toId: 'missing' }] },
      index([node('a')])
    )
    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('missing toId')
  })

  it('accepts add/update/connect/move operations against known ids', () => {
    const result = validateAiPatch(
      {
        version: 1,
        operations: [
          { op: 'addNode', id: 'b', title: 'B', connectFromId: 'a' },
          { op: 'updateNode', id: 'a', status: 'verified' },
          { op: 'connectNodes', fromId: 'a', toId: 'b', kind: 'supports' },
          { op: 'moveNode', id: 'b', x: 300, y: 120 },
        ],
      },
      index([node('a')])
    )
    expect(result.ok).toBe(true)
  })
})

describe('AI context diagram', () => {
  it('exports a compact mermaid graph', () => {
    const diagram = buildMermaidDiagram([node('a'), node('b')], [edge('e1', 'a', 'b')])
    expect(diagram).toContain('flowchart LR')
    expect(diagram).toContain('a["a"]')
    expect(diagram).toContain('a -->|"extends"| b')
  })
})
