#!/usr/bin/env node

/**
 * Backup Canvas Snapshot Script
 * Creates timestamped backups of canvas-default.json
 * Usage: node scripts/backup-canvas.mjs [--milestone=name]
 */

import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

async function backupCanvas(options = {}) {
  const { milestone = null } = options
  const sourceFile = join(rootDir, 'store', 'canvas-default.json')

  if (!existsSync(sourceFile)) {
    console.error('❌ Error: canvas-default.json not found')
    process.exit(1)
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const data = await readFile(sourceFile, 'utf8')
  const parsed = JSON.parse(data)

  // Count nodes and edges
  const shapes = Object.values(parsed.snapshot?.document?.store || {})
    .filter(item => item.typeName === 'shape')
  const learningCards = shapes.filter(s =>
    s.type === 'geo' && s.meta?.serenity?.kind === 'learning-card'
  )
  const learningEdges = shapes.filter(s =>
    s.type === 'arrow' && s.meta?.serenity?.kind === 'learning-edge'
  )

  console.log(`📊 Canvas snapshot: ${learningCards.length} cards, ${learningEdges.length} edges`)

  if (milestone) {
    // Create milestone backup
    const milestoneDir = join(rootDir, 'store', 'milestones')
    await mkdir(milestoneDir, { recursive: true })

    const milestoneName = milestone.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const milestoneFile = join(milestoneDir, `${milestoneName}.json`)
    await writeFile(milestoneFile, data)
    console.log(`✅ Milestone backup created: milestones/${milestoneName}.json`)
  } else {
    // Create timestamped snapshot
    const snapshotDir = join(rootDir, 'store', 'snapshots')
    await mkdir(snapshotDir, { recursive: true })

    const snapshotFile = join(snapshotDir, `${timestamp}.json`)
    await writeFile(snapshotFile, data)
    console.log(`✅ Snapshot backup created: snapshots/${timestamp}.json`)
  }
}

// Parse CLI arguments
const args = process.argv.slice(2)
const options = {}

for (const arg of args) {
  if (arg.startsWith('--milestone=')) {
    options.milestone = arg.split('=')[1]
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Backup Canvas Snapshot

Usage:
  node scripts/backup-canvas.mjs [options]

Options:
  --milestone=<name>    Create a named milestone backup
  --help, -h            Show this help message

Examples:
  node scripts/backup-canvas.mjs
  node scripts/backup-canvas.mjs --milestone="ai-semiconductor-v1"
`)
    process.exit(0)
  }
}

backupCanvas(options).catch(error => {
  console.error('❌ Backup failed:', error.message)
  process.exit(1)
})
