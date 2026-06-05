import { createServer } from 'node:http'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const storeDir = join(rootDir, 'store')
const canvasFile = join(storeDir, 'canvas-default.json')
const port = Number(process.env.SERENITY_STORE_PORT ?? 8787)
const maxBodyBytes = 10 * 1024 * 1024

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
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

  await mkdir(storeDir, { recursive: true })
  const nextPayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    ...payload,
  }
  const tempFile = `${canvasFile}.tmp`
  await writeFile(tempFile, `${JSON.stringify(nextPayload, null, 2)}\n`, 'utf8')
  await rename(tempFile, canvasFile)
  return nextPayload
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
      sendJson(response, 200, { ok: true, updatedAt: saved.updatedAt })
      return
    }

    sendJson(response, 404, { ok: false, error: 'Not found.' })
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown server error.',
    })
  }
})

server.listen(port, () => {
  console.log(`Serenity store API listening on http://localhost:${port}`)
  console.log(`Canvas snapshots will be saved to ${canvasFile}`)
})
