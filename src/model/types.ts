import type { TLShapeId } from 'tldraw'

export const SERENITY_META_KEY = 'serenity'

export type LearningStatus = 'seed' | 'exploring' | 'verified' | 'question' | 'archived'

export type LearningEdgeKind =
  | 'extends'
  | 'contains'
  | 'causes'
  | 'contrasts'
  | 'questions'
  | 'supports'
  | 'blocks'
  | 'related'

export interface LearningCardData {
  id: string
  title: string
  body: string
  summary: string
  tags: string[]
  status: LearningStatus
  createdAt: string
  updatedAt: string
}

export interface LearningEdgeData {
  id: string
  fromId: string
  toId: string
  kind: LearningEdgeKind
  label: string
  createdAt: string
  updatedAt: string
}

export interface SerenityCardMeta {
  kind: 'learning-card'
  data: LearningCardData
}

export interface SerenityEdgeMeta {
  kind: 'learning-edge'
  data: LearningEdgeData
}

export type SerenityMeta = SerenityCardMeta | SerenityEdgeMeta

export interface LearningNodeForAi extends LearningCardData {
  shapeId: string
  x: number
  y: number
  width: number
  height: number
  inbound: string[]
  outbound: string[]
}

export interface LearningEdgeForAi extends LearningEdgeData {
  shapeId: string
}

export interface AiCanvasContext {
  version: 1
  exportedAt: string
  summary: {
    nodeCount: number
    edgeCount: number
    selectedNodeIds: string[]
  }
  selectedNodeIds: string[]
  nodes: LearningNodeForAi[]
  edges: LearningEdgeForAi[]
  neighborhoods: Record<
    string,
    {
      oneHop: string[]
      twoHop: string[]
    }
  >
  diagram: string
}

export type AiPatchOperation =
  | {
      op: 'addNode'
      id?: string
      title: string
      body?: string
      summary?: string
      tags?: string[]
      status?: LearningStatus
      x?: number
      y?: number
      connectFromId?: string
      edgeKind?: LearningEdgeKind
      edgeLabel?: string
    }
  | {
      op: 'updateNode'
      id: string
      title?: string
      body?: string
      summary?: string
      tags?: string[]
      status?: LearningStatus
    }
  | { op: 'deleteNode'; id: string }
  | {
      op: 'connectNodes'
      id?: string
      fromId: string
      toId: string
      kind?: LearningEdgeKind
      label?: string
    }
  | { op: 'disconnectNodes'; id?: string; fromId?: string; toId?: string }
  | { op: 'moveNode'; id: string; x: number; y: number }

export interface AiPatch {
  version: 1
  intent?: string
  operations: AiPatchOperation[]
}

export interface PatchValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
}

export interface CanvasIndex {
  nodesById: Map<string, LearningNodeForAi>
  edgesById: Map<string, LearningEdgeForAi>
  shapeIdByNodeId: Map<string, TLShapeId>
  shapeIdByEdgeId: Map<string, TLShapeId>
}
