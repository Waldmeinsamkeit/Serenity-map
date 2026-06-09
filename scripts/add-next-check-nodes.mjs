#!/usr/bin/env node

/**
 * Add Next-Check Nodes to Canvas
 * Creates verification task nodes with specific methods and deadlines
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

// Next-check nodes to add
const nextCheckNodes = [
  {
    id: 'node-check-memory-vendor-certification',
    title: '待验证：内存互连厂商认证',
    summary: '确认澜起/钰泰在 Nvidia/AMD 平台的认证状态',
    body: '验证方法：\n1. 查询 CNINFO 互动平台投资者问答\n   - 搜索关键词：认证、Nvidia、AMD、服务器平台\n2. 追踪公司公告中的客户认证披露\n   - 重大合同公告\n   - 投资者关系活动记录\n3. 检索 Nvidia/AMD 供应商名单（如有公开）\n4. 查看年报/半年报"重大合同"章节\n\n截止时间：2026-06-30\n优先级：高\n\n相关公司：\n- 澜起科技 (688008.SH)\n- 钰泰半导体 (688515.SH)',
    tags: ['next-check', 'AI-semiconductor', 'certification', 'priority-high', 'A-share'],
    status: 'exploring',
    x: 800,
    y: -320,
    connectTo: 'node-evidence-memory-interconnect-order'
  },
  {
    id: 'node-check-packaging-capacity-plan',
    title: '待验证：先进封装产能规划',
    summary: '确认 CoWoS/Chiplet 封装产能和交付周期',
    body: '验证方法：\n1. 查询年报"募集资金投资项目"章节\n   - 先进封装扩产计划\n   - 预计投产时间\n   - 设计产能\n2. 追踪重大资产购置公告\n   - 设备采购\n   - 厂房建设\n3. 查询互动平台关于产能利用率的问答\n4. 检索行业研究报告估算\n\n截止时间：2026-07-15\n优先级：高\n\n相关公司：\n- 长电科技 (600584.SH)\n- 通富微电 (002156.SZ)\n- 华天科技 (002185.SZ)',
    tags: ['next-check', 'AI-semiconductor', 'packaging', 'capacity', 'priority-high', 'A-share'],
    status: 'exploring',
    x: 800,
    y: -120,
    connectTo: 'node-evidence-advanced-packaging-certification'
  },
  {
    id: 'node-check-pcb-ccl-order-share',
    title: '待验证：AI 服务器 PCB 订单占比',
    summary: '确认高速 PCB/CCL 厂商 AI 订单占比',
    body: '验证方法：\n1. 查询年报"主营业务分析"章节\n   - 产品结构\n   - 服务器 PCB 收入占比\n2. 追踪互动平台关于 AI 服务器订单的问答\n3. 查询行业研究报告估算\n4. 追踪毛利率变化（高速板毛利率通常更高）\n\n截止时间：2026-07-31\n优先级：中\n\n相关公司：\n- 沪电股份 (002463.SZ)\n- 深南电路 (002916.SZ)\n- 生益科技 (600183.SH)',
    tags: ['next-check', 'AI-semiconductor', 'pcb', 'revenue-mix', 'priority-medium', 'A-share'],
    status: 'exploring',
    x: 800,
    y: 80,
    connectTo: 'node-evidence-pcb-ccl-expansion'
  },
  {
    id: 'node-check-equipment-tender-track',
    title: '待跟踪：半导体设备招标',
    summary: '持续跟踪国产设备中标公告',
    body: '验证方法：\n1. 定期检索 CNINFO 重大合同公告\n   - 关键词：中标、订单、合同\n2. 追踪集成电路产线招标公示\n   - 中国招标投标公共服务平台\n   - 各省市公共资源交易中心\n3. 关注国家大基金二期投资动向\n4. 追踪晶圆厂扩产计划\n\n持续跟踪（每月检查）\n优先级：高\n\n相关公司：\n- 北方华创 (002371.SZ)\n- 中微公司 (688012.SH)\n- 华海清科 (688120.SH)\n- 拓荆科技 (688072.SH)',
    tags: ['next-check', 'AI-semiconductor', 'equipment', 'tender', 'priority-high', 'A-share', 'continuous'],
    status: 'exploring',
    x: 800,
    y: 280,
    connectTo: 'node-evidence-semiconductor-equipment-orders'
  },
  {
    id: 'node-check-reducer-certification-progress',
    title: '待验证：减速器认证进度',
    summary: '确认国产减速器在外资机器人品牌的认证',
    body: '验证方法：\n1. 查询年报"销售情况"章节\n   - 客户结构\n   - 内外资客户占比\n2. 追踪公告中的客户认证披露\n3. 查询互动平台关于外资品牌认证的问答\n4. 关注行业展会和产品发布\n\n截止时间：2026-08-31\n优先级：中\n\n相关公司：\n- 绿的谐波 (688017.SH)\n- 双环传动 (002472.SZ)\n- 来福谐波 (688166.SH)',
    tags: ['next-check', 'robotics', 'reducer', 'certification', 'priority-medium', 'A-share'],
    status: 'exploring',
    x: 1400,
    y: -200,
    connectTo: 'node-evidence-reducer-domestic-orders'
  },
  {
    id: 'node-check-purification-capacity-expansion',
    title: '待验证：电子级纯化产能',
    summary: '确认纯化环节产能和扩产计划',
    body: '验证方法：\n1. 查询相关公司年报和公告\n   - 产能数据\n   - 扩产计划\n   - 环评报告\n2. 检索项目备案信息\n   - 各省市发改委项目备案\n   - 环保部门环评公示\n3. 追踪下游客户认证状态\n4. 关注技术壁垒和认证周期\n\n截止时间：2026-07-31\n优先级：高\n\n待确认：\n- 具体涉及哪些 A 股公司\n- 是否有专业厂商还是材料厂商自建',
    tags: ['next-check', 'photoresist', 'purification', 'capacity', 'priority-high', 'A-share'],
    status: 'question',
    x: 1000,
    y: 500,
    connectTo: 'node-evidence-photoresist-purification-capacity'
  },
  {
    id: 'node-check-cloud-capex-quarterly',
    title: '待跟踪：云厂商 Capex 季度数据',
    summary: '每季度追踪美国云厂商资本开支指引',
    body: '验证方法：\n1. 追踪财报发布（每季度）\n   - AWS (Amazon Q1-Q4)\n   - Azure (Microsoft Q1-Q4)\n   - GCP (Alphabet Q1-Q4)\n2. 关注电话会议关键信息\n   - Capex 指引变化\n   - AI 投资占比\n   - GPU/服务器交付时间表\n3. 关注 Meta, Tesla 等 AI 大客户 Capex\n\n持续跟踪（每季度）\n优先级：高\n\n反证信号：\n- Capex 指引环比下调\n- AI 投资占比下降\n- 管理层对需求的谨慎表态',
    tags: ['next-check', 'AI-semiconductor', 'cloud', 'capex', 'demand', 'priority-high', 'US', 'continuous'],
    status: 'verified',
    x: 400,
    y: -500,
    connectTo: 'node-evidence-cloud-capex-guidance'
  },
  {
    id: 'node-check-rare-earth-price-index',
    title: '待跟踪：稀土价格指数',
    summary: '持续跟踪稀土产品价格和供需',
    body: '验证方法：\n1. 跟踪中国稀土行业协会价格指数\n   - 氧化镨钕\n   - 氧化镝\n   - 氧化铽\n2. 关注工信部稀土办政策\n   - 开采配额\n   - 环保督查\n3. 追踪下游需求\n   - 新能源汽车产量\n   - 工业电机需求\n   - 军工订单\n4. 关注海外稀土项目\n   - Lynas (澳大利亚)\n   - MP Materials (美国)\n\n持续跟踪（每月）\n优先级：中',
    tags: ['next-check', 'rare-earth', 'price', 'commodity', 'priority-medium', 'A-share', 'continuous'],
    status: 'exploring',
    x: 1700,
    y: 300,
    connectTo: 'node-evidence-rare-earth-supply-concentration'
  },
  {
    id: 'node-check-financial-quality-batch',
    title: '待验证：批量财务质量检查',
    summary: '对关键公司进行财务质量分析',
    body: '验证指标：\n1. 毛利率趋势\n   - 是否反映供需紧张\n   - 与行业平均对比\n2. 应收账款/收入比\n   - 是否恶化\n   - 账龄结构\n3. 存货/收入比\n   - 是否积压\n   - 存货跌价准备\n4. 经营现金流/净利润\n   - 盈利质量\n5. 资本开支/折旧\n   - 扩产力度\n\n数据来源：\n- CNINFO 年报/半年报/季报\n- Tushare Pro 财务数据接口\n- Eastmoney 财务数据中心\n\n截止时间：2026-07-15\n优先级：高',
    tags: ['next-check', 'financial', 'quality', 'batch', 'priority-high', 'A-share'],
    status: 'exploring',
    x: 1100,
    y: 100,
    connectTo: null
  }
]

async function addNextCheckNodes() {
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

  for (const check of nextCheckNodes) {
    const shapeId = createShapeId()

    // Create next-check card
    store[shapeId] = {
      x: check.x,
      y: check.y,
      rotation: 0,
      isLocked: false,
      opacity: 1,
      meta: {
        serenity: {
          kind: 'learning-card',
          data: {
            id: check.id,
            title: check.title,
            body: check.body,
            summary: check.summary,
            tags: check.tags,
            status: check.status,
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
        color: check.status === 'verified' ? 'green' : check.status === 'question' ? 'red' : 'blue',
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
                { type: 'text', text: check.title }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: check.summary }
              ]
            }
          ]
        }
      },
      parentId: currentPageId,
      index: `a${addedCount}check`,
      typeName: 'shape'
    }

    addedCount++
    console.log(`✅ Added next-check node: ${check.title}`)

    // Create edge if connectTo is specified and target exists
    if (check.connectTo && nodeMap.has(check.connectTo)) {
      const targetShapeId = nodeMap.get(check.connectTo)
      const arrowId = createShapeId()
      const bindingStartId = createBindingId()
      const bindingEndId = createBindingId()

      // Create arrow
      store[arrowId] = {
        x: Math.min(check.x, check.x + 260),
        y: Math.min(check.y, check.y + 152),
        rotation: 0,
        isLocked: false,
        opacity: 1,
        meta: {
          serenity: {
            kind: 'learning-edge',
            data: {
              id: `edge-${crypto.randomUUID()}`,
              fromId: check.id,
              toId: check.connectTo,
              kind: 'related',
              label: '待验证',
              createdAt: timestamp,
              updatedAt: timestamp
            }
          }
        },
        id: arrowId,
        type: 'arrow',
        props: {
          kind: 'arc',
          dash: 'dotted',
          size: 'm',
          fill: 'none',
          color: 'blue',
          labelColor: 'blue',
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
                content: [{ type: 'text', text: '待验证' }]
              }
            ]
          },
          labelPosition: 0.5,
          font: 'sans',
          scale: 1,
          elbowMidPoint: 0.5
        },
        parentId: currentPageId,
        index: `a${addedCount}checkedge`,
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

      console.log(`  → Connected to ${check.connectTo}`)
    }
  }

  // Update timestamp
  data.updatedAt = timestamp

  // Write back
  await writeFile(canvasFile, JSON.stringify(data, null, 2))
  console.log(`\n✅ Successfully added ${addedCount} next-check nodes to canvas`)
}

addNextCheckNodes().catch(error => {
  console.error('❌ Failed to add next-check nodes:', error.message)
  process.exit(1)
})
