import { describe, expect, it } from 'vitest'
import {
  applyAiPatchToSnapshot,
  buildCanvasIndexFromSnapshot,
  exportAiContextFromSnapshot,
  validateAiPatchForSnapshot,
} from '../../scripts/serenity-core.mjs'

function richText(text) {
  return {
    type: 'doc',
    content: text.split('\n').map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : undefined,
    })),
  }
}

function card(shapeId, nodeId, title, x, y) {
  const data = {
    id: nodeId,
    title,
    body: '',
    summary: `${title} summary`,
    tags: [],
    status: 'seed',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
  return {
    id: shapeId,
    typeName: 'shape',
    type: 'geo',
    parentId: 'page:page',
    index: 'a1',
    x,
    y,
    rotation: 0,
    props: {
      geo: 'rectangle',
      w: 260,
      h: 152,
      richText: richText(`${title}\n${data.summary}`),
      color: 'blue',
      fill: 'semi',
      dash: 'solid',
      size: 'm',
      font: 'sans',
      align: 'start',
      verticalAlign: 'start',
      url: '',
      scale: 1,
      growY: 0,
      labelColor: 'black',
    },
    meta: { serenity: { kind: 'learning-card', data } },
  }
}

function edge(shapeId, edgeId, fromId, toId) {
  const data = {
    id: edgeId,
    fromId,
    toId,
    kind: 'extends',
    label: 'extends',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
  return {
    id: shapeId,
    typeName: 'shape',
    type: 'arrow',
    parentId: 'page:page',
    index: 'a3',
    x: 0,
    y: 0,
    rotation: 0,
    props: {
      start: { x: 0, y: 0 },
      end: { x: 100, y: 100 },
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
      richText: richText('extends'),
      labelPosition: 0.5,
      scale: 1,
      elbowMidPoint: 0.5,
    },
    meta: { serenity: { kind: 'learning-edge', data } },
  }
}

function snapshot() {
  return {
    document: {
      store: {
        'document:document': { id: 'document:document', typeName: 'document', gridSize: 10, name: '', meta: {} },
        'page:page': { id: 'page:page', typeName: 'page', name: 'Page 1', index: 'a1', meta: {} },
        'shape:a': card('shape:a', 'node-a', 'A', 0, 0),
        'shape:b': card('shape:b', 'node-b', 'B', 400, 0),
        'shape:e': edge('shape:e', 'edge-ab', 'node-a', 'node-b'),
      },
      schema: { schemaVersion: 2, sequences: {} },
    },
    session: {
      version: 0,
      currentPageId: 'page:page',
      pageStates: [{ pageId: 'page:page', selectedShapeIds: ['shape:a'] }],
    },
  }
}

describe('Serenity Node snapshot core', () => {
  it('parses semantic nodes, edges, neighborhoods, and selected node context', () => {
    const context = exportAiContextFromSnapshot(snapshot())
    expect(context.summary.nodeCount).toBe(2)
    expect(context.summary.edgeCount).toBe(1)
    expect(context.selectedNodeIds).toEqual(['node-a'])
    expect(context.neighborhoods['node-a'].oneHop).toEqual(['node-b'])
    expect(context.diagram).toContain('node-a -->|"extends"| node-b')
  })

  it('rejects unknown operations and dangling links', () => {
    const result = validateAiPatchForSnapshot(snapshot(), {
      version: 1,
      operations: [
        { op: 'rewriteEverything' },
        { op: 'connectNodes', fromId: 'node-a', toId: 'missing' },
      ],
    })
    expect(result.ok).toBe(false)
    expect(result.errors.join('\n')).toContain('unknown op')
    expect(result.errors.join('\n')).toContain('missing toId')
  })

  it('applies add, update, connect, move, and delete operations to a cloned snapshot', () => {
    const result = applyAiPatchToSnapshot(snapshot(), {
      version: 1,
      operations: [
        { op: 'addNode', id: 'node-c', title: 'C', connectFromId: 'node-a', edgeKind: 'supports' },
        { op: 'updateNode', id: 'node-a', title: 'A updated', status: 'verified' },
        { op: 'connectNodes', id: 'edge-bc', fromId: 'node-b', toId: 'node-c', kind: 'related' },
        { op: 'moveNode', id: 'node-c', x: 700, y: 120 },
        { op: 'deleteNode', id: 'node-b' },
      ],
    })
    expect(result.validation.ok).toBe(true)
    const index = buildCanvasIndexFromSnapshot(result.snapshot)
    expect([...index.nodesById.keys()].sort()).toEqual(['node-a', 'node-c'])
    expect(index.nodesById.get('node-a')?.title).toBe('A updated')
    expect(index.nodesById.get('node-c')?.x).toBe(700)
    expect([...index.edgesById.values()].every((item) => item.fromId !== 'node-b' && item.toId !== 'node-b')).toBe(true)
  })
})
