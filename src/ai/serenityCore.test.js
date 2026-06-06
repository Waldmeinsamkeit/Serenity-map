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

function card(shapeId, nodeId, title, x, y, parentId = 'page:page') {
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

function multiPageSnapshot() {
  const result = snapshot()
  result.document.store['page:second'] = { id: 'page:second', typeName: 'page', name: 'Page 2', index: 'a2', meta: {} }
  result.document.store['shape:c'] = card('shape:c', 'node-c', 'C', 0, 0, 'page:second')
  result.document.store['shape:d'] = card('shape:d', 'node-d', 'D', 400, 0, 'page:second')
  result.document.store['shape:e2'] = edge('shape:e2', 'edge-cd', 'node-c', 'node-d', 'page:second')
  result.session.currentPageId = 'page:second'
  result.session.pageStates = [
    { pageId: 'page:page', selectedShapeIds: ['shape:a'] },
    { pageId: 'page:second', selectedShapeIds: ['shape:c'] },
  ]
  return result
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

  it('uses the current tldraw page when exporting and applying patches', () => {
    const context = exportAiContextFromSnapshot(multiPageSnapshot())
    expect(context.summary.currentPageId).toBe('page:second')
    expect(context.summary.nodeCount).toBe(2)
    expect(context.selectedNodeIds).toEqual(['node-c'])
    expect([...context.nodes.map((node) => node.id)].sort()).toEqual(['node-c', 'node-d'])

    const result = applyAiPatchToSnapshot(multiPageSnapshot(), {
      version: 1,
      operations: [{ op: 'addNode', id: 'node-e', title: 'E', connectFromId: 'node-c' }],
    })
    expect(result.validation.ok).toBe(true)
    const added = Object.values(result.snapshot.document.store).find((record) => record?.meta?.serenity?.data?.id === 'node-e')
    expect(added?.parentId).toBe('page:second')

    const missingMainPageRef = validateAiPatchForSnapshot(multiPageSnapshot(), {
      version: 1,
      operations: [{ op: 'updateNode', id: 'node-a', title: 'Should not see page one' }],
    })
    expect(missingMainPageRef.ok).toBe(false)
    expect(missingMainPageRef.errors.join('\n')).toContain('references missing node: node-a')
  })

  it('can list pages, read a specific page, set current page, and patch a target page', () => {
    const pages = listPagesFromSnapshot(multiPageSnapshot())
    expect(pages.map((page) => [page.id, page.nodeCount, page.edgeCount, page.isCurrent])).toEqual([
      ['page:page', 2, 1, false],
      ['page:second', 2, 1, true],
    ])

    const firstPageContext = exportAiContextFromSnapshot(multiPageSnapshot(), { pageId: 'page:page' })
    expect(firstPageContext.summary.pageId).toBe('page:page')
    expect(firstPageContext.summary.currentPageId).toBe('page:page')
    expect(firstPageContext.selectedNodeIds).toEqual(['node-a'])
    expect(firstPageContext.nodes.map((node) => node.id).sort()).toEqual(['node-a', 'node-b'])

    const switched = setCurrentPageInSnapshot(multiPageSnapshot(), 'page:page')
    expect(switched.session.currentPageId).toBe('page:page')
    expect(exportAiContextFromSnapshot(switched).nodes.map((node) => node.id).sort()).toEqual(['node-a', 'node-b'])

    const validOnFirstPage = validateAiPatchForSnapshot(multiPageSnapshot(), {
      version: 1,
      operations: [{ op: 'updateNode', id: 'node-a', title: 'A target page update' }],
    }, { pageId: 'page:page' })
    expect(validOnFirstPage.ok).toBe(true)

    const result = applyAiPatchToSnapshot(multiPageSnapshot(), {
      version: 1,
      operations: [
        { op: 'updateNode', id: 'node-a', title: 'A target page update' },
        { op: 'addNode', id: 'node-first-new', title: 'First page new', connectFromId: 'node-a' },
      ],
    }, { pageId: 'page:page' })
    expect(result.validation.ok).toBe(true)
    expect(result.snapshot.session.currentPageId).toBe('page:second')

    const updatedFirstPage = exportAiContextFromSnapshot(result.snapshot, { pageId: 'page:page' })
    expect(updatedFirstPage.nodes.map((node) => node.id).sort()).toEqual(['node-a', 'node-b', 'node-first-new'])
    expect(updatedFirstPage.nodes.find((node) => node.id === 'node-a')?.title).toBe('A target page update')

    const untouchedSecondPage = exportAiContextFromSnapshot(result.snapshot, { pageId: 'page:second' })
    expect(untouchedSecondPage.nodes.map((node) => node.id).sort()).toEqual(['node-c', 'node-d'])
  })

  it('keeps an empty current page visible to MCP when other pages contain Serenity nodes', () => {
    const result = multiPageSnapshot()
    delete result.document.store['shape:c']
    delete result.document.store['shape:d']
    delete result.document.store['shape:e2']

    const context = exportAiContextFromSnapshot(result)
    expect(context.summary.currentPageId).toBe('page:second')
    expect(context.summary.nodeCount).toBe(0)
    expect(context.summary.edgeCount).toBe(0)
    expect(context.selectedNodeIds).toEqual([])
  })

  it('restores one page from a backup snapshot without rolling back other pages', () => {
    const backup = multiPageSnapshot()
    const current = applyAiPatchToSnapshot(multiPageSnapshot(), {
      version: 1,
      operations: [{ op: 'updateNode', id: 'node-a', title: 'A changed after backup' }],
    }, { pageId: 'page:page' }).snapshot

    delete current.document.store['shape:c']
    delete current.document.store['shape:d']
    delete current.document.store['shape:e2']
    current.document.store['page:second'].meta = {
      serenity: { kind: 'serenity-page', allowEmpty: true, clearedAt: '2026-01-01T00:00:00.000Z' },
    }

    const restored = restorePageFromSnapshotBackup(current, backup, 'page:second')
    const firstPage = exportAiContextFromSnapshot(restored, { pageId: 'page:page' })
    const secondPage = exportAiContextFromSnapshot(restored, { pageId: 'page:second' })

    expect(firstPage.nodes.find((node) => node.id === 'node-a')?.title).toBe('A changed after backup')
    expect(secondPage.nodes.map((node) => node.id).sort()).toEqual(['node-c', 'node-d'])
    expect(secondPage.summary.currentPageId).toBe('page:second')
    expect(restored.session.currentPageId).toBe('page:second')
  })

  it('exports and imports Obsidian Markdown through the Node core protocol', () => {
    const markdown = exportObsidianMarkdownFromSnapshot(snapshot())
    expect(markdown).toContain('type: canvas-context')
    expect(markdown).toContain('[[#A (node-a)|A]]')
    expect(markdown).toContain('## Relationship Map')

    const editedMarkdown = [
      '---',
      'title: "Serenity Canvas Export"',
      'type: canvas-context',
      '---',
      '',
      '## Edges',
      '- [[#A (node-a)|A]] -> [[#C (node-c)|C]] - **supports** (`supports`)',
      '',
      '## Nodes',
      '### A updated (node-a)',
      '',
      '- ID: `node-a`',
      '- Status: `verified`',
      '- Tags: #core #obsidian',
      '- Summary: Existing node changed',
      '',
      'Updated body',
      '',
      '#### Links',
      '- Inbound:',
      '  - none',
      '- Outbound:',
      '  - none',
      '',
      '### C (node-c)',
      '',
      '- ID: `node-c`',
      '- Status: `exploring`',
      '- Tags: #new',
      '- Summary: New imported node',
      '',
      '_No body yet._',
      '',
      '#### Links',
      '- Inbound:',
      '  - none',
      '- Outbound:',
      '  - none',
    ].join('\n')
    const parsed = parsePatchTextInput(editedMarkdown, snapshot())
    expect(parsed.format).toBe('obsidian')
    expect(parsed.errors).toEqual([])
    expect(parsed.patch.operations).toEqual([
      {
        op: 'updateNode',
        id: 'node-a',
        title: 'A updated',
        summary: 'Existing node changed',
        body: 'Updated body',
        tags: ['core', 'obsidian'],
        status: 'verified',
      },
      {
        op: 'addNode',
        id: 'node-c',
        title: 'C',
        summary: 'New imported node',
        body: '',
        tags: ['new'],
        status: 'exploring',
        x: 480,
        y: 120,
      },
      {
        op: 'connectNodes',
        fromId: 'node-a',
        toId: 'node-c',
        kind: 'supports',
        label: 'supports',
      },
    ])
    expect(validateAiPatchForSnapshot(snapshot(), parsed.patch).ok).toBe(true)
  })

  it('parses a generic Obsidian note through the Node core protocol', () => {
    const markdown = [
      '---',
      'title: "Physical AI Note"',
      'tags: [physical-ai, robotics]',
      '---',
      '',
      '# Physical AI Note',
      'Embodied deployment depends on [[Simulation]] and [[Actuators]].',
    ].join('\n')
    const parsed = parsePatchTextInput(markdown, snapshot(), { importMode: 'merge' })

    expect(parsed.format).toBe('obsidian')
    expect(parsed.errors).toEqual([])
    expect(parsed.patch.operations).toEqual([
      expect.objectContaining({ op: 'addNode', id: 'node-obsidian-physical-ai-note', title: 'Physical AI Note' }),
      expect.objectContaining({ op: 'addNode', id: 'node-obsidian-simulation', title: 'Simulation' }),
      expect.objectContaining({ op: 'connectNodes', fromId: 'node-obsidian-physical-ai-note', toId: 'node-obsidian-simulation' }),
      expect.objectContaining({ op: 'addNode', id: 'node-obsidian-actuators', title: 'Actuators' }),
      expect.objectContaining({ op: 'connectNodes', fromId: 'node-obsidian-physical-ai-note', toId: 'node-obsidian-actuators' }),
    ])
  })
})
