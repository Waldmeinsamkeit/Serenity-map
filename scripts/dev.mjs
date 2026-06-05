import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { createServer } from 'node:net'

const viteBin = join('node_modules', 'vite', 'bin', 'vite.js')
const defaultStorePort = Number(process.env.SERENITY_STORE_PORT ?? 8787)
const defaultVitePort = Number(process.env.SERENITY_VITE_PORT ?? 5173)

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '127.0.0.1')
  })
}

async function findAvailablePort(preferredPort) {
  for (let port = preferredPort; port < preferredPort + 100; port += 1) {
    if (await isPortAvailable(port)) return port
  }
  throw new Error(`No available port found near ${preferredPort}.`)
}

function createChildEnv(storePort) {
  const env = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (key.toLowerCase() === 'path') continue
    if (value !== undefined) env[key] = value
  }

  env.Path = process.env.Path ?? process.env.PATH ?? ''
  env.SERENITY_STORE_PORT = String(storePort)
  return env
}

const storePort = await findAvailablePort(defaultStorePort)
const vitePort = await findAvailablePort(defaultVitePort)
const childEnv = createChildEnv(storePort)

const children = [
  spawn(process.execPath, ['scripts/store-api.mjs'], {
    env: childEnv,
    stdio: 'inherit',
  }),
  spawn(process.execPath, [viteBin, '--host', '0.0.0.0', '--port', String(vitePort), '--strictPort'], {
    env: childEnv,
    stdio: 'inherit',
  }),
]

console.log(`Serenity dev server starting...`)
console.log(`Frontend: http://localhost:${vitePort}/`)
console.log(`Store API: http://localhost:${storePort}/`)

function shutdown(signal) {
  for (const child of children) child.kill(signal)
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shutdown(signal)
    process.exit(0)
  })
}

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      shutdown('SIGTERM')
      process.exit(code)
    }
  })
}
