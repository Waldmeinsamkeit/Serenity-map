import { createServer } from 'node:http'
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { restorePageFromSnapshotBackup } from './serenity-core.mjs'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const storeDir = join(rootDir, 'store')
const historyDir = join(storeDir, 'history')
const canvasFile = join(storeDir, 'canvas-default.json')
const port = Number(process.env.SERENITY_STORE_PORT ?? 8787)
const maxBodyBytes = 10 * 1024 * 1024
const serenityMetaKey = 'serenity'

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(body, null, 2))
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0

    request.on('data', (chunk) => {
      size += chunk.byteLength
      if (size > maxBodyBytes) {
        reject(new Error('Request body is too large.'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })

    request.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text ? JSON.parse(text) : null)
      } catch {
        reject(new Error('Request body must be valid JSON.'))
      }
    })

    request.on('error', reject)
  })
}

async function saveCanvas(payload) {
  if (!payload || typeof payload !== 'object' || !payload.snapshot) {
    throw new Error('Payload must contain a snapshot object.')
  }

  const validation = validateSerenitySnapshot(payload.snapshot)
  if (!validation.ok) {
    const error = new Error(validation.error)
    error.statusCode = 400
    throw error
  }

  if (typeof payload.baseUpdatedAt === 'string') {
    try {
      const current = JSON.parse(await readFile(canvasFile, 'utf8'))
      if (current.updatedAt && current.updatedAt !== payload.baseUpdatedAt) {
        return {
          conflict: true,
          currentUpdatedAt: current.updatedAt,
        }
      }
    } catch (error) {
      if (!error || typeof error !== 'object' || !('code' in error) || error.code !== 'ENOENT') throw error
    }
  }

  await mkdir(storeDir, { recursive: true })
  const nextPayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    snapshot: payload.snapshot,
  }
  const tempFile = `${canvasFile}.tmp`
  await writeFile(tempFile, `${JSON.stringify(nextPayload, null, 2)}\n`, 'utf8')
  await rename(tempFile, canvasFile)
  return nextPayload
}

function safeHistoryPart(value) {
  return String(value ?? 'page')
    .trim()
    .replaceAll(/[^a-zA-Z0-9_.:-]+/g, '-')
    .replaceAll(/^-+|-+$/g, '') || 'page'
}

function historyTimestamp() {
  return new Date().toISOString().replaceAll(/[:.]/g, '-')
}

function historyBackupId(pageId) {
  return `canvas-default-${safeHistoryPart(pageId)}-${historyTimestamp()}.json`
}

async function createHistoryBackup(payload) {
  if (!payload || typeof payload !== 'object' || !payload.snapshot) {
    throw new Error('Payload must contain a snapshot object.')
  }
  if (typeof payload.pageId !== 'string' || !payload.pageId.trim()) {
    throw new Error('Payload must contain pageId.')
  }

  const validation = validateSerenitySnapshot(payload.snapshot)
  if (!validation.ok) {
    const error = new Error(validation.error)
    error.statusCode = 400
    throw error
  }

  await mkdir(historyDir, { recursive: true })
  const backupId = historyBackupId(payload.pageId)
  const backup = {
    version: 1,
    createdAt: new Date().toISOString(),
    reason: typeof payload.reason === 'string' ? payload.reason : 'manual-backup',
    pageId: payload.pageId,
    snapshot: payload.snapshot,
  }
  await writeFile(join(historyDir, backupId), `${JSON.stringify(backup, null, 2)}\n`, 'utf8')
  return {
    ok: true,
    backupId,
    pageId: payload.pageId,
    createdAt: backup.createdAt,
    reason: backup.reason,
  }
}

async function listHistoryBackups(pageId) {
  const safePageId = safeHistoryPart(pageId)
  try {
    const names = await readdir(historyDir)
    return names
      .filter((name) => name.startsWith(`canvas-default-${safePageId}-`) && name.endsWith('.json'))
      .sort()
      .reverse()
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return []
    throw error
  }
}

async function readHistoryBackup(pageId, backupId) {
  let targetId = backupId
  if (targetId && (targetId.includes('/') || targetId.includes('\\') || !targetId.endsWith('.json'))) {
    throw new Error('Invalid backupId.')
  }
  if (!targetId) {
    const backups = await listHistoryBackups(pageId)
    targetId = backups[0]
  }
  if (!targetId) {
    const error = new Error('No backup found for this page.')
    error.statusCode = 404
    throw error
  }
  const backup = JSON.parse(await readFile(join(historyDir, targetId), 'utf8'))
  return { ...backup, backupId: targetId }
}

async function restorePageFromHistory(payload) {
  if (!payload || typeof payload !== 'object' || typeof payload.pageId !== 'string') {
    throw new Error('Payload must contain pageId.')
  }
  const current = JSON.parse(await readFile(canvasFile, 'utf8'))
  const backup = await readHistoryBackup(payload.pageId, payload.backupId)
  const snapshot = restorePageFromSnapshotBackup(current.snapshot, backup.snapshot, payload.pageId)
  const saved = await saveCanvas({ snapshot })
  return {
    ok: true,
    ...saved,
    pageId: payload.pageId,
    restoredFrom: backup.backupId,
  }
}

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function validateSerenitySnapshot(snapshot) {
  const store = snapshot?.document?.store
  if (!isRecord(store)) return { ok: false, error: 'Snapshot is missing document.store.' }
  if (!isRecord(snapshot?.document?.schema)) return { ok: false, error: 'Snapshot is missing document.schema.' }
  if (!isRecord(snapshot?.session)) return { ok: false, error: 'Snapshot is missing session state.' }

  const records = Object.values(store)
  const pageIds = new Set(records.filter((record) => record?.typeName === 'page' && typeof record.id === 'string').map((record) => record.id))
  if (!records.some((record) => record?.typeName === 'document')) return { ok: false, error: 'Snapshot is missing a document record.' }
  if (pageIds.size === 0) return { ok: false, error: 'Snapshot is missing a page record.' }

  const currentPageId = typeof snapshot.session.currentPageId === 'string' ? snapshot.session.currentPageId : pageIds.values().next().value
  if (!pageIds.has(currentPageId)) return { ok: false, error: 'Snapshot session points to a missing page.' }

  const currentPage = store[currentPageId]
  const serenityPageMeta = currentPage?.meta?.[serenityMetaKey]
  const allowEmptyCurrentPage = serenityPageMeta?.kind === 'serenity-page' && serenityPageMeta.allowEmpty === true
  const hasCurrentPageSerenityCard = records.some((record) => {
    const serenity = record?.meta?.[serenityMetaKey]
    return record?.typeName === 'shape' &&
      record.type === 'geo' &&
      record.parentId === currentPageId &&
      serenity?.kind === 'learning-card'
  })
  const hasAnySerenityCard = records.some((record) => {
    const serenity = record?.meta?.[serenityMetaKey]
    return record?.typeName === 'shape' &&
      record.type === 'geo' &&
      serenity?.kind === 'learning-card'
  })
  if (!hasCurrentPageSerenityCard && !hasAnySerenityCard && !allowEmptyCurrentPage) {
    return { ok: false, error: 'Snapshot has no Serenity learning-card records on the current page.' }
  }

  return { ok: true }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  try {
    if (url.pathname === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, { ok: true, storeDir })
      return
    }

    if (url.pathname === '/api/canvas/default' && request.method === 'GET') {
      try {
        const text = await readFile(canvasFile, 'utf8')
        sendJson(response, 200, JSON.parse(text))
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
          sendJson(response, 404, { ok: false, error: 'Canvas snapshot not found.' })
          return
        }
        throw error
      }
      return
    }

    if (url.pathname === '/api/canvas/default' && request.method === 'PUT') {
      const payload = await readJsonBody(request)
      const saved = await saveCanvas(payload)
      if (saved.conflict) {
        sendJson(response, 409, {
          ok: false,
          error: 'Canvas snapshot changed on disk. Reload before saving.',
          currentUpdatedAt: saved.currentUpdatedAt,
        })
        return
      }
      sendJson(response, 200, { ok: true, updatedAt: saved.updatedAt })
      return
    }

    if (url.pathname === '/api/canvas/default/history' && request.method === 'GET') {
      const pageId = url.searchParams.get('pageId')
      if (!pageId) {
        sendJson(response, 400, { ok: false, error: 'Missing pageId.' })
        return
      }
      sendJson(response, 200, { ok: true, pageId, backups: await listHistoryBackups(pageId) })
      return
    }

    if (url.pathname === '/api/canvas/default/history' && request.method === 'POST') {
      const payload = await readJsonBody(request)
      sendJson(response, 200, await createHistoryBackup(payload))
      return
    }

    if (url.pathname === '/api/canvas/default/restore-page' && request.method === 'POST') {
      const payload = await readJsonBody(request)
      sendJson(response, 200, await restorePageFromHistory(payload))
      return
    }

    sendJson(response, 404, { ok: false, error: 'Not found.' })
  } catch (error) {
    sendJson(response, error?.statusCode ?? 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown server error.',
    })
  }
})

server.listen(port, () => {
  console.log(`Serenity store API listening on http://localhost:${port}`)
  console.log(`Canvas snapshots will be saved to ${canvasFile}`)
})
