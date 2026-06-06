import type { TLEditorSnapshot } from 'tldraw'

export interface StoredCanvasSnapshot {
  version: 1
  updatedAt?: string
  snapshot: Partial<TLEditorSnapshot>
}

const CANVAS_ENDPOINT = '/api/canvas/default'

export async function loadLocalCanvasSnapshot() {
  const response = await fetch(CANVAS_ENDPOINT)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Failed to load local canvas: ${response.status}`)

  return (await response.json()) as StoredCanvasSnapshot
}

export async function saveLocalCanvasSnapshot(snapshot: Partial<TLEditorSnapshot>, baseUpdatedAt?: string) {
  const response = await fetch(CANVAS_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snapshot, baseUpdatedAt }),
  })

  if (response.status === 409) throw new Error('Canvas changed on disk. Reload before saving.')
  if (response.status === 400) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? 'Canvas snapshot failed validation.')
  }
  if (!response.ok) throw new Error(`Failed to save local canvas: ${response.status}`)
  return response.json() as Promise<{ ok: boolean; updatedAt: string }>
}

export async function createLocalCanvasBackup(
  snapshot: Partial<TLEditorSnapshot>,
  pageId: string,
  reason = 'manual-backup'
) {
  const response = await fetch(`${CANVAS_ENDPOINT}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snapshot, pageId, reason }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to create canvas backup: ${response.status}`)
  }
  return response.json() as Promise<{ ok: boolean; backupId: string; pageId: string; createdAt: string; reason: string }>
}

export async function restoreLocalCanvasPageFromBackup(pageId: string) {
  const response = await fetch(`${CANVAS_ENDPOINT}/restore-page`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pageId }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `Failed to restore canvas page: ${response.status}`)
  }
  return response.json() as Promise<StoredCanvasSnapshot & { ok: boolean; pageId: string; restoredFrom: string }>
}
