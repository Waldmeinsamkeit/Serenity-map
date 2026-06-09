#!/usr/bin/env node

/**
 * Regenerate Page3 Research Graph with local-data-api (Robust Version)
 * 基于七层数据架构重新生成光刻胶产业链研究图谱（增强版，含超时处理）
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const DATA_API_BASE = 'http://localhost:8976'
const FETCH_TIMEOUT = 30000 // 30 seconds timeout per stock

function createShapeId() {
  return `shape:${crypto.randomUUID()}`
}

function nowIso() {
  return new Date().toISOString()
}

// Fetch with timeout
async function fetchWithTimeout(url, options, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

// Check if local-data-api is running
async function checkDataApi() {
  try {
    const response = await fetchWithTimeout(`${DATA_API_BASE}/api/health`, {}, 5000)
    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    return false
  }
}

// Fetch stock data using local-data-api with timeout
async function fetchStockData(ticker, dimensions) {
  try {
    console.log(`  -> 请求 API (超时 ${FETCH_TIMEOUT/1000}s)...`)
    const response = await fetchWithTimeout(`${DATA_API_BASE}/api/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        dimensions,
        kline_limit: 60,
        days: 90,
      })
    }, FETCH_TIMEOUT)

    if (!response.ok) {
      console.log(`  ⚠️  API 返回 ${response.status}`)
      return null
    }

    const data = await response.json()
    console.log(`  -> 数据解析成功`)
    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`  ❌ 超时 (>${FETCH_TIMEOUT/1000}s)`)
    } else {
      console.log(`  ❌ 错误: ${error.message}`)
    }
    return null
  }
}

// Page3 focused companies
const PHOTORESIST_COMPANIES = [
  { ticker: '300576.SZ', name: '容大感光', layer: 'PCB感光油墨', priority: 'high' },
  { ticker: '688703.SH', name: '盟科新材', layer: '触控显示材料', priority: 'medium' },
  { ticker: '688616.SH', name: '西陇科学', layer: '化学试剂', priority: 'medium' },
]

async function regeneratePage3() {
  const canvasFile = join(rootDir, 'store', 'canvas-default.json')
  const data = JSON.parse(await readFile(canvasFile, 'utf8'))

  // Check API
  console.log('🔍 检查 local-data-api...')
  const apiReady = await checkDataApi()
  if (!apiReady) {
    console.error('❌ local-data-api 未响应！')
    console.error('请确认服务运行在 http://localhost:8976')
    process.exit(1)
  }
  console.log('✅ API 已连接\n')

  const timestamp = nowIso()
  const store = data.snapshot.document.store
  const page3Id = 'page:JXiDbi0pErC-htURa44dI'

  // Clear page3
  console.log('🗑️  清除 page3 现有节点...')
  const page3ShapeIds = Object.entries(store)
    .filter(([_, item]) => item.typeName === 'shape' && item.parentId === page3Id)
    .map(([id, _]) => id)

  page3ShapeIds.forEach(id => delete store[id])

  const bindingsToRemove = Object.entries(store)
    .filter(([_, item]) => item.typeName === 'binding' &&
      page3ShapeIds.some(sid => item.fromId === sid || item.toId === sid))
    .map(([id, _]) => id)
  bindingsToRemove.forEach(id => delete store[id])

  console.log(`   清除了 ${page3ShapeIds.length} 个节点\n`)

  // Fetch data
  console.log('📊 获取公司数据 (仅财务+行情)...\n')
  const companiesData = []

  for (const company of PHOTORESIST_COMPANIES) {
    console.log(`🔍 ${company.name} (${company.ticker})`)

    const apiData = await fetchStockData(company.ticker, [
      'kline',
      'financials',
      'capital_flow'
    ])

    if (apiData && apiData.dimensions) {
      const fin = apiData.dimensions.financials || {}
      const cf = apiData.dimensions.capital_flow || {}
      const kline = apiData.dimensions.kline || {}

      companiesData.push({
        ...company,
        success: true,
        data: {
          name: kline.name || company.name,
          roe: fin.roe,
          net_margin: fin.net_margin,
          revenue_growth: fin.revenue_growth,
          main_net_inflow: cf.main_net_inflow,
          trend: cf.trend,
          source: fin.source || 'api'
        }
      })
      console.log(`  ✅ 成功\n`)
    } else {
      companiesData.push({
        ...company,
        success: false
      })
      console.log(`  ⚠️  失败，使用占位符\n`)
    }
  }

  // Generate nodes
  console.log('📝 生成研究图谱...\n')

  // Industry node
  const industryNodeId = 'node-photoresist-chain-v2'
  const industryShapeId = createShapeId()

  store[industryShapeId] = {
    x: 0, y: 0, rotation: 0, isLocked: false, opacity: 1,
    meta: {
      serenity: {
        kind: 'learning-card',
        data: {
          id: industryNodeId,
          title: '光刻胶产业链研究 V2',
          summary: '基于 local-data-api 实时数据',
          body: `数据来源: local-data-api 七层架构
Layer 1: 行情 (kline)
Layer 3: 资金流 (capital_flow)
Layer 6: 财务 (financials)

更新时间: ${timestamp}
成功率: ${companiesData.filter(c => c.success).length}/${companiesData.length}`,
          tags: ['industry', 'photoresist', 'A-share', 'data-driven'],
          status: 'exploring',
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    },
    id: industryShapeId,
    type: 'geo',
    props: {
      geo: 'rectangle', w: 260, h: 152, growY: 0,
      color: 'blue', labelColor: 'black', fill: 'semi',
      dash: 'solid', size: 'm', font: 'sans',
      align: 'start', verticalAlign: 'start', url: '', scale: 1,
      richText: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: '光刻胶产业链研究 V2' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '基于 local-data-api 实时数据' }] }
        ]
      }
    },
    parentId: page3Id,
    index: 'a0',
    typeName: 'shape'
  }

  // Company nodes
  companiesData.forEach((company, idx) => {
    const nodeId = `node-${company.ticker.replace('.', '-').toLowerCase()}`
    const shapeId = createShapeId()
    const xPos = 400 + (idx % 2) * 400
    const yPos = -200 + Math.floor(idx / 2) * 300

    let body = `代码: ${company.ticker}
位置: ${company.layer}
优先级: ${company.priority}

`

    if (company.success && company.data) {
      body += `=== 财务指标 ===
ROE: ${company.data.roe || 'N/A'}
净利率: ${company.data.net_margin || 'N/A'}
营收增速: ${company.data.revenue_growth || 'N/A'}

=== 资金流向 ===
主力净流入: ${company.data.main_net_inflow || 'N/A'}
趋势: ${company.data.trend || 'N/A'}

数据源: ${company.data.source}
证据强度: Strong`
    } else {
      body += `数据获取失败
原因: API 超时或网络问题
状态: 需要重试`
    }

    store[shapeId] = {
      x: xPos, y: yPos, rotation: 0, isLocked: false, opacity: 1,
      meta: {
        serenity: {
          kind: 'learning-card',
          data: {
            id: nodeId,
            title: `${company.name} (${company.ticker})`,
            summary: `${company.layer}`,
            body,
            tags: [
              'company',
              'photoresist',
              'A-share',
              company.success ? 'strong-evidence' : 'needs-checking',
              `priority-${company.priority}`
            ],
            status: company.success ? 'verified' : 'exploring',
            createdAt: timestamp,
            updatedAt: timestamp
          }
        }
      },
      id: shapeId,
      type: 'geo',
      props: {
        geo: 'rectangle', w: 260, h: 152, growY: 0,
        color: company.success ? 'green' : 'yellow',
        labelColor: 'black', fill: 'semi',
        dash: 'solid', size: 'm', font: 'sans',
        align: 'start', verticalAlign: 'start', url: '', scale: 1,
        richText: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: `${company.name} (${company.ticker})` }] },
            { type: 'paragraph', content: [{ type: 'text', text: company.layer }] }
          ]
        }
      },
      parentId: page3Id,
      index: `a${idx + 1}`,
      typeName: 'shape'
    }

    console.log(`✅ ${company.name}`)
  })

  // Update page metadata
  if (store[page3Id]) {
    store[page3Id].meta.serenity = {
      kind: 'serenity-page',
      theme: '光刻胶产业链研究（真实数据版）',
      description: '基于 local-data-api 获取的实时财务和资金流数据',
      researchStage: 'exploring',
      updatedAt: timestamp,
      tags: ['photoresist', 'data-driven', 'A-share'],
      priority: 'high',
      evidenceQuality: companiesData.filter(c => c.success).length >= 2 ? 'strong' : 'weak',
      dataSource: 'local-data-api'
    }
  }

  data.updatedAt = timestamp
  await writeFile(canvasFile, JSON.stringify(data, null, 2))

  console.log('\n✅ Page3 重新生成完成！')
  console.log(`📊 统计: ${companiesData.filter(c => c.success).length}/${companiesData.length} 成功`)
}

regeneratePage3().catch(error => {
  console.error('\n❌ 失败:', error.message)
  process.exit(1)
})
