import { describe, expect, it } from 'vitest'
import {
  applyAiPatchToSnapshot,
  buildCanvasIndexFromSnapshot,
  exportAiContextFromSnapshot,
  exportObsidianMarkdownFromSnapshot,
  listPagesFromSnapshot,
  parsePatchTextInput,
  restorePageFromSnapshotBackup,
  setCurrentPageInSnapshot,
} from '../../scripts/serenity-core.mjs'
import { buildCanvasSearchResults } from './search'
import { inspectSerenitySnapshot } from './snapshotGuards'

function richText(text) {
  return {
    type: 'doc',
    content: text.split('\n').map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : undefined,
    })),
  }
}

function card(shapeId, nodeId, title, x, y, parentId = 'page:page', overrides = {}) {
  const data = {
    id: nodeId,
    title,
    body: overrides.body ?? `${title} body`,
    summary: overrides.summary ?? `${title} summary`,
    tags: overrides.tags ?? [],
    status: overrides.status ?? 'seed',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
  return {
    id: shapeId,
    typeName: 'shape',
    type: 'geo',
    parentId,
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

function edge(shapeId, edgeId, fromId, toId, parentId = 'page:page') {
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
    parentId,
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
        'shape:a': card('shape:a', 'node-a', 'Alpha Robotics', 0, 0, 'page:page', { tags: ['robotics'] }),
        'shape:b': card('shape:b', 'node-b', 'Beta Control', 400, 0, 'page:page', { status: 'verified' }),
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

function multiPageSnapshot() {
  const result = snapshot()
  result.document.store['page:second'] = { id: 'page:second', typeName: 'page', name: 'Page 2', index: 'a2', meta: {} }
  result.document.store['shape:c'] = card('shape:c', 'node-c', 'Second Page Driver', 0, 0, 'page:second')
  result.document.store['shape:d'] = card('shape:d', 'node-d', 'Second Page Target', 400, 0, 'page:second')
  result.document.store['shape:e2'] = edge('shape:e2', 'edge-cd', 'node-c', 'node-d', 'page:second')
  result.session.currentPageId = 'page:second'
  result.session.pageStates = [
    { pageId: 'page:page', selectedShapeIds: ['shape:a'] },
    { pageId: 'page:second', selectedShapeIds: ['shape:c'] },
  ]
  return result
}

function clearCurrentPage(input) {
  const cleared = structuredClone(input)
  const pageId = cleared.session.currentPageId
  const shapeIds = new Set(
    Object.values(cleared.document.store)
      .filter((record) => record?.typeName === 'shape' && record.parentId === pageId)
      .map((record) => record.id)
  )
  for (const shapeId of shapeIds) delete cleared.document.store[shapeId]
  for (const [id, record] of Object.entries(cleared.document.store)) {
    if (record?.typeName === 'binding' && shapeIds.has(record.fromId)) delete cleared.document.store[id]
  }
  cleared.document.store[pageId].meta = {
    ...cleared.document.store[pageId].meta,
    serenity: {
      kind: 'serenity-page',
      allowEmpty: true,
      clearedAt: '2026-01-01T00:00:00.000Z',
    },
  }
  return cleared
}

describe('Serenity UI smoke workflows', () => {
  it('keeps MCP default reads aligned with the current page after page switching', () => {
    const switched = setCurrentPageInSnapshot(multiPageSnapshot(), 'page:page')

    expect(listPagesFromSnapshot(switched).map((page) => [page.id, page.isCurrent])).toEqual([
      ['page:page', true],
      ['page:second', false],
    ])
    expect(exportAiContextFromSnapshot(switched).summary.pageId).toBe('page:page')
    expect(exportAiContextFromSnapshot(switched).nodes.map((node) => node.id).sort()).toEqual(['node-a', 'node-b'])
  })

  it('can restore the current page after a clear-page action', () => {
    const backup = multiPageSnapshot()
    const cleared = clearCurrentPage(backup)

    expect(exportAiContextFromSnapshot(cleared).summary.nodeCount).toBe(0)
    expect(inspectSerenitySnapshot(cleared).ok).toBe(true)

    const restored = restorePageFromSnapshotBackup(cleared, backup, 'page:second')
    expect(exportAiContextFromSnapshot(restored).nodes.map((node) => node.id).sort()).toEqual(['node-c', 'node-d'])
    expect(exportAiContextFromSnapshot(restored, { pageId: 'page:page' }).nodes.map((node) => node.id).sort()).toEqual(['node-a', 'node-b'])
  })

  it('round-trips Markdown export back through the import pipeline', () => {
    const base = snapshot()
    const markdown = exportObsidianMarkdownFromSnapshot(base)
    const parsed = parsePatchTextInput(markdown, base)

    expect(parsed.format).toBe('obsidian')
    expect(parsed.errors).toEqual([])

    const result = applyAiPatchToSnapshot(base, parsed.patch)
    expect(result.validation.ok).toBe(true)
    expect(exportAiContextFromSnapshot(result.snapshot).nodes.map((node) => node.id).sort()).toEqual(['node-a', 'node-b'])
  })

  it('returns a focusable shape id when searching for a node', () => {
    const results = buildCanvasSearchResults(buildCanvasIndexFromSnapshot(snapshot()), 'Beta', 'nodes')

    expect(results[0]).toMatchObject({
      key: 'node:node-b',
      type: '节点',
      shapeId: 'shape:b',
      title: 'Beta Control',
    })
  })

  it('guards refresh loads from replacing a valid canvas with an empty snapshot', () => {
    const saved = snapshot()
    const empty = structuredClone(saved)
    delete empty.document.store['shape:a']
    delete empty.document.store['shape:b']
    delete empty.document.store['shape:e']

    expect(inspectSerenitySnapshot(saved)).toMatchObject({ ok: true, cardCount: 2, edgeCount: 1 })
    expect(exportAiContextFromSnapshot(structuredClone(saved)).summary.nodeCount).toBe(2)
    expect(inspectSerenitySnapshot(empty)).toMatchObject({
      ok: false,
      reason: 'Snapshot has no Serenity learning-card records on the current page.',
    })
  })
})
