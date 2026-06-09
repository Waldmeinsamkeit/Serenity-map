#!/usr/bin/env node

/**
 * Standardize Node Tags
 * Updates all learning cards to use standard tag taxonomy
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

function nowIso() {
  return new Date().toISOString()
}

// Standard tag mapping
const TAG_MAPPING = {
  // Domain tags
  'A股': 'A-share',
  'AI半导体': 'AI-semiconductor',
  '产业链': 'supply-chain',
  '研究': null, // Remove generic tag
  '材料': 'materials',
  '零部件': 'components',
  'robotics': 'robotics',
  'upstream': 'upstream',
  'downstream': 'downstream',
  'components': 'components',
  'DDR5': 'memory',
  'source': 'evidence',
  'nbd': null,
  'supply-risk': 'risk',
  'layer': 'layer',
  'product': null,
  'price': null,
  'evidence': 'evidence',
  'annual-report': 'evidence',
  'stcn': null,
  'zirconium': 'rare-earth',
  'bottleneck': 'bottleneck',
  'scarce-layer': 'scarce-layer',
  'risk': 'risk',
  'photoresist': 'photoresist',
  'next-check': 'next-check',
  'pcb': 'pcb',
  'packaging': 'packaging',
  'equipment': 'equipment',
  'reducer': 'reducer',
  'cloud': 'cloud',
  'demand': 'demand',
  'valuation': 'valuation',
  'substitution': 'substitution',
  'geopolitics': 'geopolitics',
  'policy': 'policy',
  'commodity': 'commodity',
  'rare-earth': 'rare-earth',
  'certification': 'certification',
  'capacity': 'capacity',
  'tender': 'tender',
  'revenue-mix': 'revenue-mix',
  'financial': 'financial',
  'quality': 'quality',
  'batch': 'batch'
}

// Infer node type from existing tags and title
function inferNodeType(card) {
  const { tags, title, status } = card

  // Evidence nodes
  if (tags.includes('evidence') || tags.includes('source') || title.includes('证据') || title.includes('来源')) {
    return 'evidence'
  }

  // Risk nodes
  if (tags.includes('risk') || title.includes('风险')) {
    return 'risk'
  }

  // Next-check nodes
  if (tags.includes('next-check') || title.includes('待验证') || title.includes('待跟踪')) {
    return 'next-check'
  }

  // Bottleneck nodes
  if (tags.includes('bottleneck') || tags.includes('scarce-layer') || title.includes('稀缺') || title.includes('卡点')) {
    return 'bottleneck'
  }

  // Layer nodes
  if (tags.includes('layer') || tags.includes('upstream') || tags.includes('downstream')) {
    return 'layer'
  }

  // Industry nodes
  if (title.includes('产业链') || title.includes('Industry') || status === 'seed') {
    return 'industry'
  }

  // Company nodes (contains specific company names or ticker patterns)
  if (/\d{6}\.(SH|SZ|HK)/.test(title)) {
    return 'company'
  }

  // Default to layer for exploratory nodes
  return 'layer'
}

// Infer domain from tags and title
function inferDomain(card) {
  const { tags, title } = card
  const domains = []

  if (tags.some(t => ['AI半导体', 'AI-semiconductor', 'memory', 'packaging'].includes(t)) ||
      title.includes('AI 半导体') || title.includes('内存') || title.includes('封装')) {
    domains.push('AI-semiconductor')
  }

  if (tags.includes('robotics') || title.includes('机器人') || title.includes('减速器')) {
    domains.push('robotics')
  }

  if (tags.includes('photoresist') || title.includes('光刻胶')) {
    domains.push('photoresist')
  }

  if (tags.some(t => ['rare-earth', 'zirconium'].includes(t)) || title.includes('稀土')) {
    domains.push('rare-earth')
  }

  return domains
}

// Infer evidence strength
function inferEvidenceStrength(card) {
  const { tags, title, body, status } = card

  if (!tags.includes('evidence') && !title.includes('证据')) {
    return null
  }

  if (status === 'verified' || body.includes('强证据') || body.includes('Strong')) {
    return 'strong-evidence'
  }

  if (body.includes('需要查证') || body.includes('Needs checking') || body.includes('待查')) {
    return 'needs-checking'
  }

  if (body.includes('中等证据') || body.includes('Medium')) {
    return 'medium-evidence'
  }

  return 'needs-checking'
}

// Infer priority
function inferPriority(card) {
  const { tags, title, body } = card

  if (tags.some(t => t.includes('priority-high')) || body.includes('优先级：高') || body.includes('Priority: High')) {
    return 'priority-high'
  }

  if (tags.some(t => t.includes('priority-medium')) || body.includes('优先级：中') || body.includes('Priority: Medium')) {
    return 'priority-medium'
  }

  if (tags.some(t => t.includes('priority-low')) || body.includes('优先级：低') || body.includes('Priority: Low')) {
    return 'priority-low'
  }

  return null
}

async function standardizeTags() {
  const canvasFile = join(rootDir, 'store', 'canvas-default.json')
  const data = JSON.parse(await readFile(canvasFile, 'utf8'))

  const timestamp = nowIso()
  const store = data.snapshot.document.store

  let updatedCount = 0

  for (const [key, item] of Object.entries(store)) {
    if (item.typeName !== 'shape' || item.type !== 'geo' || item.meta?.serenity?.kind !== 'learning-card') {
      continue
    }

    const card = item.meta.serenity.data
    const oldTags = [...card.tags]

    // Map old tags to new tags
    let newTags = []
    for (const tag of oldTags) {
      const mapped = TAG_MAPPING[tag]
      if (mapped) {
        newTags.push(mapped)
      } else if (mapped !== null && !TAG_MAPPING.hasOwnProperty(tag)) {
        // Keep unknown tags
        newTags.push(tag)
      }
    }

    // Infer and add missing standard tags
    const nodeType = inferNodeType(card)
    if (!newTags.includes(nodeType)) {
      newTags.unshift(nodeType)
    }

    const domains = inferDomain(card)
    for (const domain of domains) {
      if (!newTags.includes(domain)) {
        newTags.push(domain)
      }
    }

    // Add market tag if not present
    if (!newTags.some(t => ['A-share', 'HK', 'US'].includes(t))) {
      if (oldTags.includes('A股') || card.title.includes('A股')) {
        newTags.push('A-share')
      }
    }

    // Add evidence strength
    const evidenceStrength = inferEvidenceStrength(card)
    if (evidenceStrength && !newTags.includes(evidenceStrength)) {
      newTags.push(evidenceStrength)
    }

    // Add priority
    const priority = inferPriority(card)
    if (priority && !newTags.includes(priority)) {
      newTags.push(priority)
    }

    // Remove duplicates and sort
    newTags = [...new Set(newTags)]

    // Update if changed
    if (JSON.stringify(oldTags.sort()) !== JSON.stringify(newTags.sort())) {
      card.tags = newTags
      card.updatedAt = timestamp
      updatedCount++
      console.log(`✅ Updated tags for: ${card.title}`)
      console.log(`   Old: [${oldTags.join(', ')}]`)
      console.log(`   New: [${newTags.join(', ')}]`)
    }
  }

  // Update timestamp
  data.updatedAt = timestamp

  // Write back
  await writeFile(canvasFile, JSON.stringify(data, null, 2))
  console.log(`\n✅ Successfully standardized tags for ${updatedCount} nodes`)
}

standardizeTags().catch(error => {
  console.error('❌ Failed to standardize tags:', error.message)
  process.exit(1)
})
