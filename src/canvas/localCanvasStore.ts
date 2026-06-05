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

  const payload = (await response.json()) as StoredCanvasSnapshot
  return payload.snapshot
}

export async function saveLocalCanvasSnapshot(snapshot: Partial<TLEditorSnapshot>) {
  const response = await fetch(CANVAS_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ snapshot }),
  })

  if (!response.ok) throw new Error(`Failed to save local canvas: ${response.status}`)
  return response.json() as Promise<{ ok: boolean; updatedAt: string }>
}
