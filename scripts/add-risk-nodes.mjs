#!/usr/bin/env node

/**
 * Add Risk Nodes to Canvas
 * Creates risk nodes with 'questions' edge type
 */

import { readFile, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

function createShapeId() {
  return `shape:${crypto.randomUUID()}`
}

function createBindingId() {
  return `binding:${crypto.randomUUID()}`
}

function nowIso() {
  return new Date().toISOString()
}

// Risk nodes to add
const riskNodes = [
  {
    id: 'node-risk-ai-demand-rhythm',
    title: '风险：AI 需求节奏不确定',
    summary: '服务器厂商库存调整可能导致需求波动',
    body: '反证条件：\n1. 云厂商 Capex 指引下调或推迟\n2. GPU 交付延迟导致服务器订单推迟\n3. 内存/PCB/CCL 厂商库存水位上升\n4. AI 服务器出货量环比下滑\n\n需要监控：\n- Nvidia/AMD 财报和交付指引\n- AWS/Azure/GCP Capex 季度变化\n- DDR5/HBM spot 价格\n- 服务器 ODM 厂商订单\n\n影响范围：内存互连、先进封装、高速 PCB/CCL、半导体设备',
    tags: ['risk', 'AI-semiconductor', 'demand', 'next-check'],
    status: 'question',
    x: 200,
    y: 400,
    connectTo: 'node-ashare-ai-semi-chain'
  },
  {
    id: 'node-risk-valuation-pricing-in',
    title: '风险：估值已 Price In',
    summary: 'AI 主题公司估值可能透支未来增长',
    body: '反证条件：\n1. 动态 PE 超过历史 90% 分位\n2. 业绩增速低于市场预期\n3. 主题热度下降导致估值回归\n4. 竞争格局恶化导致盈利能力下降\n\n需要验证：\n- 历史估值分位数\n- 一致预期 EPS 增速\n- 行业竞争格局变化\n- 毛利率/净利率趋势\n\n影响范围：所有 AI 半导体相关标的',
    tags: ['risk', 'AI-semiconductor', 'valuation', 'A-share'],
    status: 'question',
    x: 200,
    y: 600,
    connectTo: 'node-ashare-ai-semi-chain'
  },
  {
    id: 'node-risk-substitution-progress',
    title: '风险：国产替代进度不及预期',
    summary: '客户认证周期、技术差距、供应链配套可能延缓替代',
    body: '反证条件：\n1. 客户认证失败或推迟\n2. 良率/性能不达标\n3. 上游材料/设备供应不足\n4. 海外厂商降价竞争\n\n需要验证：\n- 认证时间表和里程碑\n- 技术指标对比\n- 上游供应链配套\n- 海外厂商定价策略\n\n影响范围：半导体设备、先进封装、材料、减速器等国产替代主线',
    tags: ['risk', 'AI-semiconductor', 'robotics', 'substitution', 'A-share'],
    status: 'question',
    x: 900,
    y: -500,
    connectTo: null
  },
  {
    id: 'node-risk-photoresist-supply-shock',
    title: '风险：光刻胶供应冲击',
    summary: '日本厂商供应中断或限制出口',
    body: '反证条件：\n1. 日本政府出口管制政策变化\n2. JSR/TOK/住友化学供应中断\n3. 地缘政治因素导致供应链重构\n\n历史案例：\n- 2019 年日本限制对韩出口光刻胶\n- 2011 年福岛地震影响半导体材料供应\n\n需要监控：\n- 日本经产省出口管制政策\n- 国产光刻胶认证进度\n- 电子级纯化国产化进度\n\n影响范围：晶圆光刻胶、PCB 感光油墨、上游纯化环节',
    tags: ['risk', 'photoresist', 'supply-chain', 'geopolitics', 'A-share'],
    status: 'question',
    x: 500,
    y: 700,
    connectTo: 'node-rd-semi-wafer'
  },
  {
    id: 'node-risk-rare-earth-policy',
    title: '风险：稀土政策和价格波动',
    summary: '配额、环保、出口管制政策变化影响供应和价格',
    body: '反证条件：\n1. 配额政策放松导致供应增加\n2. 环保审批加速\n3. 海外稀土矿产能释放\n4. 下游需求不及预期\n\n政策因素：\n- 稀土开采配额\n- 环保督查力度\n- 出口管制政策\n- 战略收储计划\n\n需要监控：\n- 工信部稀土办政策\n- 中国稀土行业协会价格指数\n- 海外稀土项目进展\n- 下游新能源/军工需求\n\n影响范围：稀土产品、稀土永磁、下游应用',
    tags: ['risk', 'rare-earth', 'policy', 'commodity', 'A-share'],
    status: 'question',
    x: 1500,
    y: 500,
    connectTo: null
  }
]

async function addRiskNodes() {
  const canvasFile = join(rootDir, 'store', 'canvas-default.json')
  const data = JSON.parse(await readFile(canvasFile, 'utf8'))

  const timestamp = nowIso()
  const store = data.snapshot.document.store

  // Find existing nodes to connect to
  const nodeMap = new Map()
  Object.values(store).forEach(item => {
    if (item.typeName === 'shape' && item.type === 'geo' && item.meta?.serenity?.kind === 'learning-card') {
      nodeMap.set(item.meta.serenity.data.id, item.id)
    }
  })

  let addedCount = 0
  const currentPageId = data.snapshot.session.currentPageId

  for (const risk of riskNodes) {
    const shapeId = createShapeId()

    // Create risk card
    store[shapeId] = {
      x: risk.x,
      y: risk.y,
      rotation: 0,
      isLocked: false,
      opacity: 1,
      meta: {
        serenity: {
          kind: 'learning-card',
          data: {
            id: risk.id,
            title: risk.title,
            body: risk.body,
            summary: risk.summary,
            tags: risk.tags,
            status: risk.status,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        }
      },
      id: shapeId,
      type: 'geo',
      props: {
        geo: 'rectangle',
        w: 260,
        h: 152,
        growY: 0,
        color: 'red',
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
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: risk.title }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: risk.summary }
              ]
            }
          ]
        }
      },
      parentId: currentPageId,
      index: `a${addedCount}risk`,
      typeName: 'shape'
    }

    addedCount++
    console.log(`✅ Added risk node: ${risk.title}`)

    // Create edge if connectTo is specified and target exists
    if (risk.connectTo && nodeMap.has(risk.connectTo)) {
      const targetShapeId = nodeMap.get(risk.connectTo)
      const arrowId = createShapeId()
      const bindingStartId = createBindingId()
      const bindingEndId = createBindingId()

      // Create arrow
      store[arrowId] = {
        x: Math.min(risk.x, risk.x + 260),
        y: Math.min(risk.y, risk.y + 152),
        rotation: 0,
        isLocked: false,
        opacity: 1,
        meta: {
          serenity: {
            kind: 'learning-edge',
            data: {
              id: `edge-${crypto.randomUUID()}`,
              fromId: risk.id,
              toId: risk.connectTo,
              kind: 'questions',
              label: '质疑',
              createdAt: timestamp,
              updatedAt: timestamp
            }
          }
        },
        id: arrowId,
        type: 'arrow',
        props: {
          kind: 'arc',
          dash: 'dashed',
          size: 'm',
          fill: 'none',
          color: 'red',
          labelColor: 'red',
          bend: 0,
          start: { x: 0, y: 0 },
          end: { x: 100, y: 100 },
          arrowheadStart: 'none',
          arrowheadEnd: 'arrow',
          richText: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '质疑' }]
              }
            ]
          },
          labelPosition: 0.5,
          font: 'sans',
          scale: 1,
          elbowMidPoint: 0.5
        },
        parentId: currentPageId,
        index: `a${addedCount}riskedge`,
        typeName: 'shape'
      }

      // Create bindings
      store[bindingStartId] = {
        id: bindingStartId,
        typeName: 'binding',
        type: 'arrow',
        fromId: arrowId,
        toId: shapeId,
        props: {
          terminal: 'start',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
          snap: 'none'
        },
        meta: {}
      }

      store[bindingEndId] = {
        id: bindingEndId,
        typeName: 'binding',
        type: 'arrow',
        fromId: arrowId,
        toId: targetShapeId,
        props: {
          terminal: 'end',
          normalizedAnchor: { x: 0.5, y: 0.5 },
          isExact: false,
          isPrecise: false,
          snap: 'none'
        },
        meta: {}
      }

      console.log(`  → Connected to ${risk.connectTo}`)
    }
  }

  // Update timestamp
  data.updatedAt = timestamp

  // Write back
  await writeFile(canvasFile, JSON.stringify(data, null, 2))
  console.log(`\n✅ Successfully added ${addedCount} risk nodes to canvas`)
}

addRiskNodes().catch(error => {
  console.error('❌ Failed to add risk nodes:', error.message)
  process.exit(1)
})
