import {
  type Editor,
  type TLArrowShape,
  type TLGeoShape,
  type TLShape,
  type TLShapeId,
  createShapeId,
  renderPlaintextFromRichText,
  toRichText,
} from 'tldraw'
import {
  SERENITY_META_KEY,
  type CanvasIndex,
  type LearningCardData,
  type LearningEdgeData,
  type LearningEdgeForAi,
  type LearningEdgeKind,
  type LearningNodeForAi,
  type LearningStatus,
  type SerenityCardMeta,
  type SerenityEdgeMeta,
  type SerenityMeta,
} from './types'

export const CARD_WIDTH = 260
export const CARD_HEIGHT = 152
export const DEFAULT_EDGE_KIND: LearningEdgeKind = 'extends'

const STATUS_COLOR: Record<LearningStatus, 'blue' | 'green' | 'yellow' | 'red' | 'grey'> = {
  seed: 'blue',
  exploring: 'yellow',
  verified: 'green',
  question: 'red',
  archived: 'grey',
}

export function nowIso() {
  return new Date().toISOString()
}

export function makeNodeId() {
  return `node-${crypto.randomUUID()}`
}

export function makeEdgeId() {
  return `edge-${crypto.randomUUID()}`
}

export function normalizeTags(tags?: string[]) {
  return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))]
}

export function formatCardText(data: Pick<LearningCardData, 'title' | 'summary'>) {
  return `${data.title}${data.summary ? `\n${data.summary}` : ''}`
}

export function createLearningCardData(input: {
  id?: string
  title: string
  body?: string
  summary?: string
  tags?: string[]
  status?: LearningStatus
}): LearningCardData {
  const timestamp = nowIso()
  return {
    id: input.id ?? makeNodeId(),
    title: input.title.trim() || 'Untitled',
    body: input.body?.trim() ?? '',
    summary: input.summary?.trim() ?? '',
    tags: normalizeTags(input.tags),
    status: input.status ?? 'seed',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function createLearningEdgeData(input: {
  id?: string
  fromId: string
  toId: string
  kind?: LearningEdgeKind
  label?: string
}): LearningEdgeData {
  const timestamp = nowIso()
  return {
    id: input.id ?? makeEdgeId(),
    fromId: input.fromId,
    toId: input.toId,
    kind: input.kind ?? DEFAULT_EDGE_KIND,
    label: input.label?.trim() ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function cardMeta(data: LearningCardData): Record<string, unknown> {
  return {
    [SERENITY_META_KEY]: {
      kind: 'learning-card',
      data,
    } satisfies SerenityCardMeta,
  }
}

export function edgeMeta(data: LearningEdgeData): Record<string, unknown> {
  return {
    [SERENITY_META_KEY]: {
      kind: 'learning-edge',
      data,
    } satisfies SerenityEdgeMeta,
  }
}

export function getSerenityMeta(shape: TLShape): SerenityMeta | null {
  const meta = shape.meta?.[SERENITY_META_KEY]
  if (!meta || typeof meta !== 'object' || !('kind' in meta)) return null
  if (meta.kind === 'learning-card' || meta.kind === 'learning-edge') return meta as unknown as SerenityMeta
  return null
}

export function isLearningCard(shape: TLShape): shape is TLGeoShape {
  return shape.type === 'geo' && getSerenityMeta(shape)?.kind === 'learning-card'
}

export function isLearningEdge(shape: TLShape): shape is TLArrowShape {
  return shape.type === 'arrow' && getSerenityMeta(shape)?.kind === 'learning-edge'
}

export function getCardData(shape: TLShape): LearningCardData | null {
  const meta = getSerenityMeta(shape)
  return meta?.kind === 'learning-card' ? meta.data : null
}

export function getEdgeData(shape: TLShape): LearningEdgeData | null {
  const meta = getSerenityMeta(shape)
  return meta?.kind === 'learning-edge' ? meta.data : null
}

export function createLearningCard(
  editor: Editor,
  input: Parameters<typeof createLearningCardData>[0] & { x?: number; y?: number }
) {
  const id = createShapeId()
  const data = createLearningCardData(input)
  const point =
    input.x !== undefined && input.y !== undefined
      ? { x: input.x, y: input.y }
      : editor.getViewportPageBounds().center

  editor.createShape<TLGeoShape>({
    id,
    type: 'geo',
    x: point.x - CARD_WIDTH / 2,
    y: point.y - CARD_HEIGHT / 2,
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
      richText: toRichText(formatCardText(data)),
    },
    meta: cardMeta(data) as any,
  })

  return { shapeId: id, data }
}

export function updateLearningCard(editor: Editor, shape: TLGeoShape, next: Partial<LearningCardData>) {
  const current = getCardData(shape)
  if (!current) return
  const data: LearningCardData = {
    ...current,
    ...next,
    tags: next.tags ? normalizeTags(next.tags) : current.tags,
    title: next.title?.trim() || current.title,
    updatedAt: nowIso(),
  }

  editor.updateShape<TLGeoShape>({
    id: shape.id,
    type: 'geo',
    props: {
      richText: toRichText(formatCardText(data)),
      color: STATUS_COLOR[data.status],
    },
    meta: cardMeta(data) as any,
  })
}

export function syncLearningCardText(editor: Editor) {
  const updates = getLearningShapes(editor).cards
    .map((shape) => {
      const data = getCardData(shape)
      if (!data) return null
      const text = formatCardText(data)
      const currentText = renderPlaintextFromRichText(editor, shape.props.richText).trim()
      if (currentText === text.trim()) return null
      return {
        id: shape.id,
        type: 'geo' as const,
        props: {
          richText: toRichText(text),
        },
      }
    })
    .filter(Boolean)

  if (updates.length) editor.updateShapes(updates)
}

export function syncLearningCardDataFromText(editor: Editor) {
  const updates = getLearningShapes(editor).cards
    .map((shape) => {
      const data = getCardData(shape)
      if (!data) return null

      const currentText = renderPlaintextFromRichText(editor, shape.props.richText).trim()
      if (!currentText) return null
      if (currentText === formatCardText(data).trim()) return null

      const [titleLine = '', ...summaryLines] = currentText.split(/\r?\n/)
      const nextTitle = titleLine.trim()
      const nextSummary = summaryLines.join('\n').trim()
      if (!nextTitle) return null

      return {
        id: shape.id,
        type: 'geo' as const,
        meta: cardMeta({
          ...data,
          title: nextTitle,
          summary: nextSummary,
          updatedAt: nowIso(),
        }) as any,
      }
    })
    .filter(Boolean)

  if (updates.length) editor.updateShapes(updates)
}

export function connectLearningCards(
  editor: Editor,
  fromShapeId: TLShapeId,
  toShapeId: TLShapeId,
  input?: { id?: string; kind?: LearningEdgeKind; label?: string }
) {
  const fromShape = editor.getShape(fromShapeId)
  const toShape = editor.getShape(toShapeId)
  const fromData = fromShape ? getCardData(fromShape) : null
  const toData = toShape ? getCardData(toShape) : null
  if (!fromShape || !toShape || !fromData || !toData) return null

  const fromBounds = editor.getShapePageBounds(fromShapeId)
  const toBounds = editor.getShapePageBounds(toShapeId)
  if (!fromBounds || !toBounds) return null

  const edgeData = createLearningEdgeData({
    id: input?.id,
    fromId: fromData.id,
    toId: toData.id,
    kind: input?.kind,
    label: input?.label,
  })
  const arrowId = createShapeId()
  const start = fromBounds.center
  const end = toBounds.center
  const origin = { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) }

  editor.run(() => {
    editor.createShape<TLArrowShape>({
      id: arrowId,
      type: 'arrow',
      x: origin.x,
      y: origin.y,
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
        richText: toRichText(edgeData.label || edgeData.kind),
        labelPosition: 0.5,
        scale: 1,
        elbowMidPoint: 0.5,
      },
      meta: edgeMeta(edgeData) as any,
    })
    editor.createBindings([
      {
        type: 'arrow',
        fromId: arrowId,
        toId: fromShapeId,
        props: {
          terminal: 'start',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
          snap: 'none',
        },
      },
      {
        type: 'arrow',
        fromId: arrowId,
        toId: toShapeId,
        props: {
          terminal: 'end',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
          snap: 'none',
        },
      },
    ])
  })

  return { shapeId: arrowId, data: edgeData }
}

export function getLearningShapes(editor: Editor) {
  const shapes = editor.getCurrentPageShapes()
  const cards = shapes.filter(isLearningCard)
  const edges = shapes.filter(isLearningEdge)
  return { cards, edges }
}

function getInferredArrowEdgeData(editor: Editor, arrow: TLArrowShape): LearningEdgeData | null {
  const semanticData = getEdgeData(arrow)
  if (semanticData) return semanticData

  const bindings = editor.getBindingsFromShape(arrow.id, 'arrow')
  const startBinding = bindings.find((binding) => binding.props.terminal === 'start')
  const endBinding = bindings.find((binding) => binding.props.terminal === 'end')
  if (!startBinding || !endBinding) return null

  const fromShape = editor.getShape(startBinding.toId)
  const toShape = editor.getShape(endBinding.toId)
  const fromData = fromShape ? getCardData(fromShape) : null
  const toData = toShape ? getCardData(toShape) : null
  if (!fromData || !toData) return null

  const label = renderPlaintextFromRichText(editor, arrow.props.richText).trim()
  const createdAt = nowIso()
  return {
    id: `inferred-${arrow.id.replace(/^shape:/, '')}`,
    fromId: fromData.id,
    toId: toData.id,
    kind: 'related',
    label,
    createdAt,
    updatedAt: createdAt,
  }
}

export function buildCanvasIndex(editor: Editor): CanvasIndex {
  const shapes = editor.getCurrentPageShapes()
  const cards = shapes.filter(isLearningCard)
  const arrows = shapes.filter((shape): shape is TLArrowShape => shape.type === 'arrow')
  const nodesById = new Map<string, LearningNodeForAi>()
  const edgesById = new Map<string, LearningEdgeForAi>()
  const shapeIdByNodeId = new Map<string, TLShapeId>()
  const shapeIdByEdgeId = new Map<string, TLShapeId>()

  for (const card of cards) {
    const data = getCardData(card)
    if (!data) continue
    const node: LearningNodeForAi = {
      ...data,
      shapeId: card.id,
      x: card.x,
      y: card.y,
      width: card.props.w,
      height: card.props.h,
      inbound: [],
      outbound: [],
    }
    nodesById.set(data.id, node)
    shapeIdByNodeId.set(data.id, card.id)
  }

  for (const edge of arrows) {
    const data = getInferredArrowEdgeData(editor, edge)
    if (!data) continue
    edgesById.set(data.id, { ...data, shapeId: edge.id })
    shapeIdByEdgeId.set(data.id, edge.id)
    nodesById.get(data.fromId)?.outbound.push(data.id)
    nodesById.get(data.toId)?.inbound.push(data.id)
  }

  return { nodesById, edgesById, shapeIdByNodeId, shapeIdByEdgeId }
}

export function getSelectedLearningCards(editor: Editor) {
  return editor
    .getSelectedShapes()
    .filter(isLearningCard)
    .map((shape) => ({ shape, data: getCardData(shape)! }))
}

export function getNextBranchPosition(editor: Editor, sourceShapeId?: TLShapeId) {
  if (!sourceShapeId) {
    const center = editor.getViewportPageBounds().center
    return { x: center.x - CARD_WIDTH / 2, y: center.y - CARD_HEIGHT / 2 }
  }
  const bounds = editor.getShapePageBounds(sourceShapeId)
  if (!bounds) return getNextBranchPosition(editor)
  const siblingCount = getLearningShapes(editor).cards.filter((card) => {
    const cardBounds = editor.getShapePageBounds(card.id)
    return cardBounds && Math.abs(cardBounds.x - (bounds.x + bounds.w + 120)) < 24
  }).length
  return {
    x: bounds.x + bounds.w + 120,
    y: bounds.y + siblingCount * (CARD_HEIGHT + 48),
  }
}
