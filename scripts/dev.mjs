import { spawn } from 'node:child_process'

const storePort = process.env.SERENITY_STORE_PORT ?? '8787'
const viteBin = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const children = [
  spawn(process.execPath, ['scripts/store-api.mjs'], {
    env: { ...process.env, SERENITY_STORE_PORT: storePort },
    stdio: 'inherit',
  }),
  spawn(viteBin, ['vite', '--host', '0.0.0.0'], {
    env: { ...process.env, SERENITY_STORE_PORT: storePort },
    stdio: 'inherit',
  }),
]

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
