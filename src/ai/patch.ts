import type { Editor, TLShapeId } from 'tldraw'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  buildCanvasIndex,
  connectLearningCards,
  createLearningCard,
  getEdgeData,
  getLearningShapes,
  getNextBranchPosition,
  updateLearningCard,
} from '../model/learningGraph'
import type {
  AiPatch,
  AiPatchOperation,
  CanvasIndex,
  LearningEdgeKind,
  LearningStatus,
  PatchValidationResult,
} from '../model/types'

const VALID_STATUSES: LearningStatus[] = ['seed', 'exploring', 'verified', 'question', 'archived']
const VALID_EDGE_KINDS: LearningEdgeKind[] = [
  'extends',
  'contains',
  'causes',
  'contrasts',
  'questions',
  'supports',
  'blocks',
  'related',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function readStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function readStatus(value: unknown): value is LearningStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as LearningStatus)
}

function readEdgeKind(value: unknown): value is LearningEdgeKind {
  return typeof value === 'string' && VALID_EDGE_KINDS.includes(value as LearningEdgeKind)
}

export function parseAiPatch(text: string): { patch: AiPatch | null; errors: string[] } {
  try {
    const parsed = JSON.parse(text) as unknown
    if (!isRecord(parsed)) return { patch: null, errors: ['Patch must be a JSON object.'] }
    if (parsed.version !== 1) return { patch: null, errors: ['Patch version must be 1.'] }
    if (!Array.isArray(parsed.operations)) {
      return { patch: null, errors: ['Patch must include an operations array.'] }
    }
    return { patch: parsed as unknown as AiPatch, errors: [] }
  } catch (error) {
    return {
      patch: null,
      errors: [error instanceof Error ? error.message : 'Invalid JSON patch.'],
    }
  }
}

function validateOperationShape(op: unknown, index: number, errors: string[]) {
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
      if (op.tags !== undefined && !readStringArray(op.tags)) {
        errors.push(`Operation ${index + 1} addNode tags must be string[].`)
      }
      if (op.status !== undefined && !readStatus(op.status)) {
        errors.push(`Operation ${index + 1} addNode status is invalid.`)
      }
      if ((op.x !== undefined && !isNumber(op.x)) || (op.y !== undefined && !isNumber(op.y))) {
        errors.push(`Operation ${index + 1} addNode x/y must be numbers.`)
      }
      if (op.edgeKind !== undefined && !readEdgeKind(op.edgeKind)) {
        errors.push(`Operation ${index + 1} addNode edgeKind is invalid.`)
      }
      break
    case 'updateNode':
      if (!isString(op.id)) errors.push(`Operation ${index + 1} updateNode requires id.`)
      if (op.tags !== undefined && !readStringArray(op.tags)) {
        errors.push(`Operation ${index + 1} updateNode tags must be string[].`)
      }
      if (op.status !== undefined && !readStatus(op.status)) {
        errors.push(`Operation ${index + 1} updateNode status is invalid.`)
      }
      break
    case 'deleteNode':
      if (!isString(op.id)) errors.push(`Operation ${index + 1} deleteNode requires id.`)
      break
    case 'connectNodes':
      if (!isString(op.fromId) || !isString(op.toId)) {
        errors.push(`Operation ${index + 1} connectNodes requires fromId and toId.`)
      }
      if (op.kind !== undefined && !readEdgeKind(op.kind)) {
        errors.push(`Operation ${index + 1} connectNodes kind is invalid.`)
      }
      break
    case 'disconnectNodes':
      if (!isString(op.id) && (!isString(op.fromId) || !isString(op.toId))) {
        errors.push(`Operation ${index + 1} disconnectNodes requires id or fromId/toId.`)
      }
      break
    case 'moveNode':
      if (!isString(op.id) || !isNumber(op.x) || !isNumber(op.y)) {
        errors.push(`Operation ${index + 1} moveNode requires id, x, and y.`)
      }
      break
    default:
      errors.push(`Operation ${index + 1} has unknown op "${op.op}".`)
  }
}

export function validateAiPatch(patch: AiPatch, index: CanvasIndex): PatchValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const ids = new Set(index.nodesById.keys())
  const edgeIds = new Set(index.edgesById.keys())

  if (patch.version !== 1) errors.push('Patch version must be 1.')
  if (!Array.isArray(patch.operations)) errors.push('Patch operations must be an array.')

  for (const [i, operation] of patch.operations.entries()) {
    validateOperationShape(operation, i, errors)
    if (!isRecord(operation) || !isString(operation.op)) continue
    const op = operation as AiPatchOperation

    if (op.op === 'addNode') {
      const id = op.id
      if (id && ids.has(id)) errors.push(`Operation ${i + 1} addNode id already exists: ${id}.`)
      if (id) ids.add(id)
      if (op.connectFromId && !ids.has(op.connectFromId)) {
        errors.push(`Operation ${i + 1} addNode connectFromId does not exist: ${op.connectFromId}.`)
      }
    }

    if (op.op === 'updateNode' || op.op === 'deleteNode' || op.op === 'moveNode') {
      if (!ids.has(op.id)) errors.push(`Operation ${i + 1} references missing node: ${op.id}.`)
      if (op.op === 'deleteNode') ids.delete(op.id)
    }

    if (op.op === 'connectNodes') {
      if (!ids.has(op.fromId)) errors.push(`Operation ${i + 1} missing fromId: ${op.fromId}.`)
      if (!ids.has(op.toId)) errors.push(`Operation ${i + 1} missing toId: ${op.toId}.`)
      if (op.id && edgeIds.has(op.id)) errors.push(`Operation ${i + 1} edge id already exists: ${op.id}.`)
      if (op.fromId === op.toId) warnings.push(`Operation ${i + 1} connects a node to itself.`)
      if (op.id) edgeIds.add(op.id)
    }

    if (op.op === 'disconnectNodes' && op.id && !edgeIds.has(op.id)) {
      errors.push(`Operation ${i + 1} references missing edge: ${op.id}.`)
    }
  }

  return { ok: errors.length === 0, errors, warnings }
}

export function validatePatchForEditor(editor: Editor, patch: AiPatch) {
  return validateAiPatch(patch, buildCanvasIndex(editor))
}

function findCardShapeId(index: CanvasIndex, nodeId: string) {
  return index.shapeIdByNodeId.get(nodeId)
}

function findEdgeShapeId(editor: Editor, op: Extract<AiPatchOperation, { op: 'disconnectNodes' }>) {
  const { edges } = getLearningShapes(editor)
  if (op.id) {
    const found = edges.find((edge) => getEdgeData(edge)?.id === op.id)
    return found?.id
  }
  const found = edges.find((edge) => {
    const data = getEdgeData(edge)
    return data && data.fromId === op.fromId && data.toId === op.toId
  })
  return found?.id
}

export function applyAiPatch(editor: Editor, patch: AiPatch) {
  const validation = validatePatchForEditor(editor, patch)
  if (!validation.ok) return validation

  editor.run(() => {
    for (const operation of patch.operations) {
      const index = buildCanvasIndex(editor)
      if (operation.op === 'addNode') {
        const sourceShapeId = operation.connectFromId
          ? findCardShapeId(index, operation.connectFromId)
          : undefined
        const fallback = getNextBranchPosition(editor, sourceShapeId)
        const created = createLearningCard(editor, {
          id: operation.id,
          title: operation.title,
          body: operation.body,
          summary: operation.summary,
          tags: operation.tags,
          status: operation.status,
          x: operation.x ?? fallback.x + CARD_WIDTH / 2,
          y: operation.y ?? fallback.y + CARD_HEIGHT / 2,
        })
        if (sourceShapeId) {
          connectLearningCards(editor, sourceShapeId, created.shapeId, {
            kind: operation.edgeKind,
            label: operation.edgeLabel,
          })
        }
      }

      if (operation.op === 'updateNode') {
        const shapeId = findCardShapeId(index, operation.id)
        const shape = shapeId ? editor.getShape(shapeId) : null
        if (shape?.type === 'geo') updateLearningCard(editor, shape, operation)
      }

      if (operation.op === 'deleteNode') {
        const shapeId = findCardShapeId(index, operation.id)
        if (!shapeId) continue
        const connectedEdges = [...index.edgesById.values()]
          .filter((edge) => edge.fromId === operation.id || edge.toId === operation.id)
          .map((edge) => index.shapeIdByEdgeId.get(edge.id))
          .filter(Boolean) as TLShapeId[]
        editor.deleteShapes([shapeId, ...connectedEdges])
      }

      if (operation.op === 'connectNodes') {
        const fromShapeId = findCardShapeId(index, operation.fromId)
        const toShapeId = findCardShapeId(index, operation.toId)
        if (fromShapeId && toShapeId) {
          connectLearningCards(editor, fromShapeId, toShapeId, {
            id: operation.id,
            kind: operation.kind,
            label: operation.label,
          })
        }
      }

      if (operation.op === 'disconnectNodes') {
        const edgeShapeId = findEdgeShapeId(editor, operation)
        if (edgeShapeId) editor.deleteShapes([edgeShapeId])
      }

      if (operation.op === 'moveNode') {
        const shapeId = findCardShapeId(index, operation.id)
        if (shapeId) {
          const shape = editor.getShape(shapeId)
          if (shape?.type === 'geo') editor.updateShape({ id: shape.id, type: 'geo', x: operation.x, y: operation.y })
        }
      }
    }
  })

  return validation
}

export function summarizePatch(patch: AiPatch) {
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
    }
  })
}
