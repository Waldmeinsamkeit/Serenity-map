#!/usr/bin/env node

/**
 * Add Page Metadata to canvas-default.json
 * Adds Serenity page-level metadata based on content analysis
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

async function addPageMetadata() {
  const canvasFile = join(rootDir, 'store', 'canvas-default.json')
  const data = JSON.parse(await readFile(canvasFile, 'utf8'))

  const timestamp = new Date().toISOString()

  // Define page metadata based on analysis
  const pageMetadata = {
    'page:page': {
      kind: 'serenity-page',
      theme: 'AI 半导体与机器人产业链',
      description: '综合研究页面，包含 A股 AI 半导体产业链和机器人核心部件分析',
      researchStage: 'exploring',
      createdAt: '2026-06-09T04:52:43.000Z',
      updatedAt: timestamp,
      tags: ['AI-semiconductor', 'robotics', 'A-share', 'supply-chain'],
      priority: 'high',
      evidenceQuality: 'medium',
      nextChecks: [
        '验证内存互连厂商客户认证进度',
        '确认减速器国产替代订单情况',
        '追踪 AI 服务器扩产节奏'
      ]
    },
    'page:4OE7ckw9LvXHfs3o8HN0y': {
      kind: 'serenity-page',
      theme: '稀土产业链研究',
      description: '稀土产品价格、供应风险、上市公司年报线索收集',
      researchStage: 'exploring',
      createdAt: '2026-06-09T08:00:00.000Z',
      updatedAt: timestamp,
      tags: ['rare-earth', 'supply-chain', 'commodity', 'A-share'],
      priority: 'medium',
      evidenceQuality: 'medium',
      nextChecks: [
        '收集稀土产品价格历史数据',
        '验证供应商集中度',
        '追踪 2025 年报披露进度'
      ]
    },
    'page:JXiDbi0pErC-htURa44dI': {
      kind: 'serenity-page',
      theme: '光刻胶产业链卡点分析',
      description: '电子级纯化、晶圆光刻胶、PCB 感光油墨等稀缺环节深度研究',
      researchStage: 'exploring',
      createdAt: '2026-06-09T12:00:00.000Z',
      updatedAt: timestamp,
      tags: ['photoresist', 'bottleneck', 'scarce-layer', 'upstream', 'A-share'],
      priority: 'high',
      evidenceQuality: 'weak',
      nextChecks: [
        '验证电子级纯化厂商产能扩张计划',
        '确认光刻胶国产化认证进度',
        '追踪日本厂商供应风险',
        '收集财务数据验证毛利率'
      ]
    }
  }

  // Apply metadata to pages
  for (const [pageId, meta] of Object.entries(pageMetadata)) {
    if (data.snapshot.document.store[pageId]) {
      const page = data.snapshot.document.store[pageId]
      page.meta = page.meta || {}
      page.meta.serenity = meta
      console.log(`✅ Added metadata to ${pageId}: ${meta.theme}`)
    }
  }

  // Update global updatedAt
  data.updatedAt = timestamp

  // Write back to file
  await writeFile(canvasFile, JSON.stringify(data, null, 2))
  console.log(`\n✅ Successfully updated canvas-default.json with page metadata`)
}

addPageMetadata().catch(error => {
  console.error('❌ Failed to add page metadata:', error.message)
  process.exit(1)
})
