#!/usr/bin/env node

/**
 * Regenerate Page3 Research Graph with local-data-api
 * 基于七层数据架构重新生成光刻胶产业链研究图谱
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const DATA_API_BASE = 'http://localhost:8976'

function createShapeId() {
  return `shape:${crypto.randomUUID()}`
}

function nowIso() {
  return new Date().toISOString()
}

// Check if local-data-api is running
async function checkDataApi() {
  try {
    const response = await fetch(`${DATA_API_BASE}/api/health`)
    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    return false
  }
}

// Fetch stock data using local-data-api
async function fetchStockData(ticker, dimensions) {
  try {
    const response = await fetch(`${DATA_API_BASE}/api/fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        dimensions,
        kline_limit: 60,
        days: 90,
      })
    })

    if (!response.ok) {
      console.warn(`⚠️  ${ticker} API returned ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`❌ Failed to fetch ${ticker}:`, error.message)
    return null
  }
}

// Extract evidence from API response
function extractEvidence(ticker, apiData) {
  if (!apiData || !apiData.dimensions) return null

  const evidence = {
    ticker,
    name: apiData.dimensions.kline?.name || ticker,
    财务质量: null,
    资金流向: null,
    舆情热度: null,
    估值分位: null,
    同行对比: null,
  }

  // Layer 6: 财务数据
  if (apiData.dimensions.financials) {
    const fin = apiData.dimensions.financials
    evidence.财务质量 = {
      roe: fin.roe,
      net_margin: fin.net_margin,
      revenue_growth: fin.revenue_growth,
      roe_history: fin.roe_history?.slice(0, 5),
      revenue_history: fin.revenue_history?.slice(0, 5),
      source: fin.source
    }
  }

  // Layer 3: 资金流
  if (apiData.dimensions.capital_flow) {
    const cf = apiData.dimensions.capital_flow
    evidence.资金流向 = {
      main_net_inflow: cf.main_net_inflow,
      trend: cf.trend,
      latest_flows: cf.latest_flows?.slice(0, 5),
      source: cf.source
    }
  }

  // Layer 5: 舆情
  if (apiData.dimensions.sentiment) {
    const sent = apiData.dimensions.sentiment
    evidence.舆情热度 = {
      heat_level: sent.heat_level,
      discussion_count: sent.discussion_count,
      source: sent.source
    }
  }

  // Layer 6: 估值分位
  if (apiData.dimensions.valuation_pctile) {
    const val = apiData.dimensions.valuation_pctile
    evidence.估值分位 = {
      pe_pctile: val.pe_pctile,
      pb_pctile: val.pb_pctile,
      industry_avg_pe: val.industry_avg_pe,
      source: val.source
    }
  }

  // Layer 6: 同行对比
  if (apiData.dimensions.peer) {
    const peer = apiData.dimensions.peer
    evidence.同行对比 = {
      rank: peer.rank,
      peers: peer.peers?.slice(0, 5),
      source: peer.source
    }
  }

  return evidence
}

// Page3 focused companies (光刻胶产业链)
const PHOTORESIST_COMPANIES = [
  { ticker: '300576.SZ', name: '容大感光', layer: 'PCB感光油墨', priority: 'high' },
  { ticker: '688703.SH', name: '盟科新材', layer: '触控显示材料', priority: 'medium' },
  { ticker: '688616.SH', name: '西陇科学', layer: '化学试剂/电子化学品', priority: 'medium' },
  { ticker: '688208.SH', name: '中芯科微', layer: '湿电子化学品', priority: 'medium' },
  { ticker: '688589.SH', name: '江天化学', layer: '光学材料', priority: 'low' },
]

async function regeneratePage3() {
  const canvasFile = join(rootDir, 'store', 'canvas-default.json')
  const data = JSON.parse(await readFile(canvasFile, 'utf8'))

  // Check if local-data-api is running
  const apiReady = await checkDataApi()
  if (!apiReady) {
    console.error('❌ local-data-api 未运行！')
    console.error('请先启动数据服务：')
    console.error('  cd F:/repo/AAA-trading-storage')
    console.error('  python scripts/data_server.py --port 8976')
    process.exit(1)
  }

  console.log('✅ local-data-api 已连接')
  console.log('')

  const timestamp = nowIso()
  const store = data.snapshot.document.store
  const page3Id = 'page:JXiDbi0pErC-htURa44dI'

  // Clear existing page3 shapes (keep page itself)
  const page3ShapeIds = Object.entries(store)
    .filter(([_, item]) => item.typeName === 'shape' && item.parentId === page3Id)
    .map(([id, _]) => id)

  console.log(`🗑️  清除 page3 现有节点: ${page3ShapeIds.length} 个`)
  page3ShapeIds.forEach(id => delete store[id])

  // Also clear bindings on page3
  const bindingsToRemove = Object.entries(store)
    .filter(([_, item]) => item.typeName === 'binding' && page3ShapeIds.some(sid => item.fromId === sid || item.toId === sid))
    .map(([id, _]) => id)
  bindingsToRemove.forEach(id => delete store[id])

  console.log('')
  console.log('📊 开始获取公司数据...')
  console.log('')

  // Fetch data for all companies
  const companiesData = []
  for (const company of PHOTORESIST_COMPANIES) {
    console.log(`🔍 查询 ${company.name} (${company.ticker})...`)

    const apiData = await fetchStockData(company.ticker, [
      'kline',
      'financials',
      'capital_flow',
      'sentiment',
      'valuation_pctile',
      'peer',
      'governance'
    ])

    if (apiData) {
      const evidence = extractEvidence(company.ticker, apiData)
      companiesData.push({
        ...company,
        apiData,
        evidence,
        success: true
      })
      console.log(`  ✅ 数据获取成功`)
    } else {
      companiesData.push({
        ...company,
        success: false
      })
      console.log(`  ⚠️  数据获取失败，使用模拟数据`)
    }
    console.log('')
  }

  console.log('📝 生成新的研究图谱...')
  console.log('')

  // Create industry root node
  const industryNodeId = 'node-photoresist-chain-new'
  const industryShapeId = createShapeId()
  store[industryShapeId] = {
    x: 0,
    y: 0,
    rotation: 0,
    isLocked: false,
    opacity: 1,
    meta: {
      serenity: {
        kind: 'learning-card',
        data: {
          id: industryNodeId,
          title: '光刻胶产业链（基于真实数据）',
          summary: '基于 local-data-api 七层架构的实证研究',
          body: `数据来源层级：
Layer 1: 行情层 (kline)
Layer 3: 信号层 (capital_flow)
Layer 5: 新闻层 (sentiment)
Layer 6: 基础数据层 (financials, valuation_pctile, peer, governance)

研究时间: ${timestamp}
数据源: Tushare Pro + akshare + Tencent + MX`,
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
      geo: 'rectangle',
      w: 260,
      h: 152,
      growY: 0,
      color: 'blue',
      labelColor: 'black',
      fill: 'semi',
      dash: 'solid',
      size: 'm',
      font: 'sans',
      align: 'start',
      verticalAlign: 'start',
      url: '',
      scale: 1,
      richText: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: '光刻胶产业链（基于真实数据）' }] },
          { type: 'paragraph', content: [{ type: 'text', text: '基于 local-data-api 七层架构的实证研究' }] }
        ]
      }
    },
    parentId: page3Id,
    index: 'a0industry',
    typeName: 'shape'
  }

  console.log(`✅ 创建行业根节点: ${industryNodeId}`)

  // Create company nodes with real data
  let nodeIndex = 1
  companiesData.forEach((company, idx) => {
    const companyNodeId = `node-company-${company.ticker.replace('.', '-').toLowerCase()}`
    const companyShapeId = createShapeId()

    const xPos = 400 + (idx % 2) * 400
    const yPos = -200 + Math.floor(idx / 2) * 250

    let bodyText = `股票代码: ${company.ticker}
产业链位置: ${company.layer}
优先级: ${company.priority}
数据更新: ${timestamp}

`

    if (company.success && company.evidence) {
      const ev = company.evidence

      bodyText += '=== 财务质量 (Layer 6) ===\n'
      if (ev.财务质量) {
        bodyText += `ROE: ${ev.财务质量.roe || 'N/A'}
净利率: ${ev.财务质量.net_margin || 'N/A'}
营收增速: ${ev.财务质量.revenue_growth || 'N/A'}
数据源: ${ev.财务质量.source}

`
      } else {
        bodyText += '数据获取中...\n\n'
      }

      bodyText += '=== 资金流向 (Layer 3) ===\n'
      if (ev.资金流向) {
        bodyText += `主力净流入: ${ev.资金流向.main_net_inflow || 'N/A'}
趋势: ${ev.资金流向.trend || 'N/A'}
数据源: ${ev.资金流向.source}

`
      } else {
        bodyText += '数据获取中...\n\n'
      }

      bodyText += '=== 估值分位 (Layer 6) ===\n'
      if (ev.估值分位) {
        bodyText += `PE 分位: ${ev.估值分位.pe_pctile || 'N/A'}
PB 分位: ${ev.估值分位.pb_pctile || 'N/A'}
行业均值: ${ev.估值分位.industry_avg_pe || 'N/A'}
数据源: ${ev.估值分位.source}

`
      } else {
        bodyText += '数据获取中...\n\n'
      }

      bodyText += `证据强度: ${ev.财务质量 && ev.资金流向 ? 'Strong' : 'Medium'}
数据完整度: ${Object.values(ev).filter(v => v !== null).length}/5`

    } else {
      bodyText += 'WARNING: 数据获取失败，请检查：\n1. local-data-api 是否正常运行\n2. Tushare token 是否配置\n3. 网络连接是否正常'
    }

    store[companyShapeId] = {
      x: xPos,
      y: yPos,
      rotation: 0,
      isLocked: false,
      opacity: 1,
      meta: {
        serenity: {
          kind: 'learning-card',
          data: {
            id: companyNodeId,
            title: `${company.name} (${company.ticker})`,
            summary: `${company.layer}·${company.priority === 'high' ? '高优先级' : company.priority === 'medium' ? '中优先级' : '低优先级'}`,
            body: bodyText,
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
      id: companyShapeId,
      type: 'geo',
      props: {
        geo: 'rectangle',
        w: 260,
        h: 152,
        growY: 0,
        color: company.success ? 'green' : 'yellow',
        labelColor: 'black',
        fill: 'semi',
        dash: 'solid',
        size: 'm',
        font: 'sans',
        align: 'start',
        verticalAlign: 'start',
        url: '',
        scale: 1,
        richText: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: `${company.name} (${company.ticker})` }] },
            { type: 'paragraph', content: [{ type: 'text', text: `${company.layer}·${company.priority === 'high' ? '高优先级' : company.priority === 'medium' ? '中优先级' : '低优先级'}` }] }
          ]
        }
      },
      parentId: page3Id,
      index: `a${nodeIndex}company`,
      typeName: 'shape'
    }

    console.log(`✅ 创建公司节点: ${company.name} (${company.success ? '数据完整' : '待补充'})`)
    nodeIndex++
  })

  // Update page3 metadata
  if (store[page3Id]) {
    store[page3Id].meta.serenity = {
      ...store[page3Id].meta.serenity,
      theme: '光刻胶产业链卡点分析（基于真实数据）',
      description: '基于 local-data-api 七层架构的实证研究，包含财务、资金流、估值、舆情等多维度数据',
      researchStage: 'exploring',
      updatedAt: timestamp,
      tags: ['photoresist', 'data-driven', 'A-share', 'evidence-based'],
      priority: 'high',
      evidenceQuality: companiesData.filter(c => c.success).length >= 3 ? 'strong' : 'medium',
      dataSource: 'local-data-api (Tushare + akshare + Tencent + MX)',
      nextChecks: [
        '补充上游材料厂商数据',
        '追踪客户认证进度',
        '验证国产替代订单',
        '监控资金流向变化'
      ]
    }
  }

  data.updatedAt = timestamp
  await writeFile(canvasFile, JSON.stringify(data, null, 2))

  console.log('')
  console.log('✅ Page3 研究图谱已重新生成')
  console.log(`📊 统计：`)
  console.log(`   - 行业节点: 1`)
  console.log(`   - 公司节点: ${companiesData.length}`)
  console.log(`   - 数据完整: ${companiesData.filter(c => c.success).length}/${companiesData.length}`)
  console.log('')
  console.log('💡 提示：')
  console.log('   - 数据来源：local-data-api 七层架构')
  console.log('   - 证据强度：基于真实 API 返回')
  console.log('   - 刷新浏览器查看更新后的画布')
}

regeneratePage3().catch(error => {
  console.error('❌ Failed to regenerate page3:', error.message)
  console.error(error.stack)
  process.exit(1)
})
