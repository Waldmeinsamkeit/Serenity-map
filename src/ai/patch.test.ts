import { describe, expect, it } from 'vitest'
import { buildMermaidDiagram } from './context'
import { parseAiPatch, parsePatchText, validateAiPatch } from './patch'
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

  it('rejects addNode when connectFromId points to the node being added', () => {
    const result = validateAiPatch(
      { version: 1, operations: [{ op: 'addNode', id: 'b', title: 'B', connectFromId: 'b' }] },
      index([node('a')])
    )

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('connectFromId cannot reference the node being added')
  })

  it('rejects disconnectNodes when the requested edge pair does not exist', () => {
    const result = validateAiPatch(
      { version: 1, operations: [{ op: 'disconnectNodes', fromId: 'a', toId: 'c' }] },
      index([node('a'), node('b'), node('c')], [edge('edge-ab', 'a', 'b')])
    )

    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('references missing edge: a -> c')
  })

  it('tracks edges added and removed within the same patch', () => {
    const result = validateAiPatch(
      {
        version: 1,
        operations: [
          { op: 'addNode', id: 'b', title: 'B' },
          { op: 'connectNodes', id: 'edge-ab', fromId: 'a', toId: 'b' },
          { op: 'disconnectNodes', fromId: 'a', toId: 'b' },
        ],
      },
      index([node('a')])
    )

    expect(result.ok).toBe(true)
  })

  it('converts Serenity Obsidian Markdown into patch operations', () => {
    const markdown = [
      '---',
      'title: "Serenity Canvas Export"',
      'type: canvas-context',
      '---',
      '',
      '## Edges',
      '- [[#A (node-a)|A]] -> [[#B (node-b)|B]] - **supports** (`supports`)',
      '',
      '## Nodes',
      '### A (node-a)',
      '',
      '- ID: `node-a`',
      '- Status: `verified`',
      '- Tags: #robotics #600584-SH',
      '- Summary: Existing node',
      '',
      'Updated body',
      '',
      '#### Links',
      '- Inbound:',
      '  - none',
      '- Outbound:',
      '  - none',
      '',
      '### B (node-b)',
      '',
      '- ID: `node-b`',
      '- Status: `exploring`',
      '- Tags: #robotics',
      '- Summary: New node',
      '',
      '_No body yet._',
      '',
      '#### Links',
      '- Inbound:',
      '  - none',
      '- Outbound:',
      '  - none',
    ].join('\n')
    const result = parsePatchText(markdown, index([node('node-a')]))

    expect(result.format).toBe('obsidian')
    expect(result.errors).toEqual([])
    expect(result.patch?.operations).toEqual([
      {
        op: 'updateNode',
        id: 'node-a',
        title: 'A',
        summary: 'Existing node',
        body: 'Updated body',
        tags: ['robotics', '600584-SH'],
        status: 'verified',
      },
      {
        op: 'addNode',
        id: 'node-b',
        title: 'B',
        summary: 'New node',
        body: '',
        tags: ['robotics'],
        status: 'exploring',
        x: 480,
        y: 120,
      },
      {
        op: 'connectNodes',
        fromId: 'node-a',
        toId: 'node-b',
        kind: 'supports',
        label: 'supports',
      },
    ])
  })

  it('converts a generic Obsidian note with frontmatter and wikilinks', () => {
    const markdown = [
      '---',
      'title: "机器人产业链笔记"',
      'tags: [robotics, industry]',
      '---',
      '',
      '# 机器人产业链笔记',
      '执行器和控制器是关键环节，相关主题见 [[减速器]] 和 [[运动控制|控制层]]。',
      '',
      '#physical-ai',
    ].join('\n')
    const result = parsePatchText(markdown, index([]), { importMode: 'merge' })

    expect(result.format).toBe('obsidian')
    expect(result.errors).toEqual([])
    expect(result.patch?.operations).toEqual([
      expect.objectContaining({
        op: 'addNode',
        id: 'node-obsidian-机器人产业链笔记',
        title: '机器人产业链笔记',
        tags: ['robotics', 'industry', 'physical-ai', 'obsidian'],
      }),
      expect.objectContaining({
        op: 'addNode',
        id: 'node-obsidian-减速器',
        title: '减速器',
      }),
      expect.objectContaining({
        op: 'connectNodes',
        fromId: 'node-obsidian-机器人产业链笔记',
        toId: 'node-obsidian-减速器',
        label: 'wikilink',
      }),
      expect.objectContaining({
        op: 'addNode',
        id: 'node-obsidian-运动控制',
        title: '运动控制',
      }),
      expect.objectContaining({
        op: 'connectNodes',
        fromId: 'node-obsidian-机器人产业链笔记',
        toId: 'node-obsidian-运动控制',
        label: 'wikilink',
      }),
    ])
  })

  it('respects add-only mode for existing Obsidian note nodes', () => {
    const markdown = [
      '---',
      'title: "Existing"',
      '---',
      'Existing body with [[New Link]].',
    ].join('\n')
    const result = parsePatchText(markdown, index([node('node-obsidian-existing')]), { importMode: 'add-only' })

    expect(result.errors).toEqual([])
    expect(result.patch?.operations.some((operation) => operation.op === 'updateNode')).toBe(false)
    expect(result.patch?.operations).toEqual([
      expect.objectContaining({ op: 'addNode', id: 'node-obsidian-new-link' }),
      expect.objectContaining({
        op: 'connectNodes',
        fromId: 'node-obsidian-existing',
        toId: 'node-obsidian-new-link',
      }),
    ])
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
