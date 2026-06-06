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
