import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

declare const process: { env: Record<string, string | undefined> }

const storePort = process.env.SERENITY_STORE_PORT ?? '8787'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${storePort}`,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
