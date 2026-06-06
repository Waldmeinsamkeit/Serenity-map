import type { TLEditorSnapshot } from 'tldraw'
import { SERENITY_META_KEY } from '../model/types'

type UnknownRecord = Record<string, unknown>

export interface SnapshotHealth {
  ok: boolean
  reason?: string
  cardCount: number
  edgeCount: number
  recordCount: number
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function getDocumentStore(snapshot: unknown): UnknownRecord | null {
  if (!isRecord(snapshot) || !isRecord(snapshot.document) || !isRecord(snapshot.document.store)) return null
  return snapshot.document.store
}

function getCurrentPageId(snapshot: unknown, pageIds: Set<string>) {
  if (isRecord(snapshot) && isRecord(snapshot.session) && typeof snapshot.session.currentPageId === 'string') {
    return pageIds.has(snapshot.session.currentPageId) ? snapshot.session.currentPageId : null
  }
  return pageIds.values().next().value ?? null
}

function hasSchema(snapshot: unknown) {
  return isRecord(snapshot) && isRecord(snapshot.document) && isRecord(snapshot.document.schema)
}

function hasSession(snapshot: unknown) {
  return isRecord(snapshot) && isRecord(snapshot.session)
}

function getSerenityKind(record: unknown) {
  if (!isRecord(record) || !isRecord(record.meta)) return null
  const serenity = record.meta[SERENITY_META_KEY]
  if (!isRecord(serenity) || typeof serenity.kind !== 'string') return null
  return serenity.kind
}

function isAllowedEmptyPage(store: UnknownRecord, pageId: string) {
  const page = store[pageId]
  if (!isRecord(page) || !isRecord(page.meta)) return false
  const serenity = page.meta[SERENITY_META_KEY]
  return isRecord(serenity) && serenity.kind === 'serenity-page' && serenity.allowEmpty === true
}

export function inspectSerenitySnapshot(snapshot: Partial<TLEditorSnapshot> | unknown): SnapshotHealth {
  const store = getDocumentStore(snapshot)
  if (!store) return { ok: false, reason: 'Snapshot is missing document.store.', cardCount: 0, edgeCount: 0, recordCount: 0 }

  const records = Object.values(store)
  const pageIds = new Set(
    records
      .filter((record): record is UnknownRecord => isRecord(record) && record.typeName === 'page' && typeof record.id === 'string')
      .map((record) => record.id as string)
  )
  const hasDocument = records.some((record) => isRecord(record) && record.typeName === 'document')
  if (!hasDocument) return { ok: false, reason: 'Snapshot is missing a document record.', cardCount: 0, edgeCount: 0, recordCount: records.length }
  if (pageIds.size === 0) return { ok: false, reason: 'Snapshot is missing a page record.', cardCount: 0, edgeCount: 0, recordCount: records.length }
  if (!hasSchema(snapshot)) return { ok: false, reason: 'Snapshot is missing document.schema.', cardCount: 0, edgeCount: 0, recordCount: records.length }
  if (!hasSession(snapshot)) return { ok: false, reason: 'Snapshot is missing session state.', cardCount: 0, edgeCount: 0, recordCount: records.length }

  const currentPageId = getCurrentPageId(snapshot, pageIds)
  if (!currentPageId) return { ok: false, reason: 'Snapshot session points to a missing page.', cardCount: 0, edgeCount: 0, recordCount: records.length }

  let cardCount = 0
  let edgeCount = 0
  let totalCardCount = 0
  for (const record of records) {
    if (!isRecord(record) || record.typeName !== 'shape') continue
    const serenityKind = getSerenityKind(record)
    if (record.type === 'geo' && serenityKind === 'learning-card') totalCardCount += 1
    if (record.parentId !== currentPageId) continue
    if (record.type === 'geo' && serenityKind === 'learning-card') cardCount += 1
    if (record.type === 'arrow' && serenityKind === 'learning-edge') edgeCount += 1
  }

  if (cardCount === 0 && totalCardCount === 0 && !isAllowedEmptyPage(store, currentPageId)) {
    return {
      ok: false,
      reason: 'Snapshot has no Serenity learning-card records on the current page.',
      cardCount,
      edgeCount,
      recordCount: records.length,
    }
  }

  return { ok: true, cardCount, edgeCount, recordCount: records.length }
}

export function isSaveableSerenitySnapshot(snapshot: Partial<TLEditorSnapshot> | unknown) {
  return inspectSerenitySnapshot(snapshot).ok
}
