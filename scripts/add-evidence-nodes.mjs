#!/usr/bin/env node

/**
 * Add Evidence Nodes to Canvas
 * Creates evidence nodes with proper tagging and connections
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

// Evidence nodes to add
const evidenceNodes = [
  {
    id: 'node-evidence-memory-interconnect-order',
    title: '证据：内存互连需求增长',
    summary: 'DDR5/MRCD 相关芯片订单环比增长',
    body: '来源待查：澜起科技/钰泰半导体投资者关系活动记录（CNINFO）\n证据强度：需要查证（Needs checking）\n支持观点：AI 服务器带宽升级带来内存接口芯片需求\n待验证：\n- 确认 2025Q1/Q2 订单数据\n- 查询客户认证状态\n- 验证毛利率是否反映供需紧张',
    tags: ['evidence', 'needs-checking', 'AI-semiconductor', 'A-share', 'memory'],
    status: 'exploring',
    x: 520,
    y: -320,
    connectTo: 'node-ai-semi-memory-interface' // 如果存在
  },
  {
    id: 'node-evidence-advanced-packaging-certification',
    title: '证据：先进封装认证进度',
    summary: 'Chiplet/CoWoS 封装认证状态待确认',
    body: '来源待查：长电科技/通富微电/华天科技年报、公告、互动平台\n证据强度：需要查证（Needs checking）\n支持观点：先进封装是 AI 芯片扩产瓶颈\n待验证：\n- 查询在 Nvidia/AMD 平台的认证状态\n- 确认 CoWoS/Chiplet 产能规划\n- 验证扩产投资和交付周期',
    tags: ['evidence', 'needs-checking', 'AI-semiconductor', 'A-share', 'packaging'],
    status: 'exploring',
    x: 520,
    y: -120,
    connectTo: null
  },
  {
    id: 'node-evidence-pcb-ccl-expansion',
    title: '证据：高速 PCB/CCL 扩产',
    summary: 'AI 服务器 PCB 层数和材料升级',
    body: '来源待查：沪电股份/深南电路/生益科技年报、扩产公告\n证据强度：需要查证（Needs checking）\n支持观点：AI 服务器对高速 PCB/低损耗 CCL 需求增长\n待验证：\n- 确认 AI 服务器 PCB 订单占比\n- 查询高速材料认证进度\n- 验证产能利用率和毛利率',
    tags: ['evidence', 'needs-checking', 'AI-semiconductor', 'A-share', 'pcb', 'materials'],
    status: 'exploring',
    x: 520,
    y: 80,
    connectTo: null
  },
  {
    id: 'node-evidence-semiconductor-equipment-orders',
    title: '证据：半导体设备中标公告',
    summary: '国产设备厂商订单和客户验证',
    body: '来源待查：北方华创/中微公司/华海清科等公告、招标公示\n证据强度：强证据（Strong）- 如有中标公告\n支持观点：国产设备替代加速\n已知线索：\n- CNINFO 重大合同公告\n- 集成电路产线招标公示\n- 国家大基金持仓公司',
    tags: ['evidence', 'strong-evidence', 'AI-semiconductor', 'A-share', 'equipment'],
    status: 'verified',
    x: 520,
    y: 280,
    connectTo: null
  },
  {
    id: 'node-evidence-reducer-domestic-orders',
    title: '证据：减速器国产替代订单',
    summary: '国产谐波/RV 减速器客户认证',
    body: '来源待查：绿的谐波/双环传动/来福谐波公告、年报\n证据强度：需要查证（Needs checking）\n支持观点：机器人核心部件国产化\n待验证：\n- 确认国产机器人厂商采购占比\n- 查询外资品牌认证进度\n- 验证毛利率与进口品牌差距',
    tags: ['evidence', 'needs-checking', 'robotics', 'A-share', 'reducer'],
    status: 'exploring',
    x: 1200,
    y: -200,
    connectTo: 'node-reducer'
  },
  {
    id: 'node-evidence-photoresist-purification-capacity',
    title: '证据：电子级纯化产能',
    summary: '光刻胶上游纯化环节产能和客户',
    body: '来源待查：相关公司公告、环评报告、项目备案\n证据强度：需要查证（Needs checking）\n支持观点：电子级纯化是光刻胶上游卡点\n待验证：\n- 确认纯化产能和扩产计划\n- 查询下游客户认证状态\n- 验证技术壁垒和认证周期',
    tags: ['evidence', 'needs-checking', 'photoresist', 'A-share', 'upstream'],
    status: 'question',
    x: 800,
    y: 500,
    connectTo: 'node-rd-purification'
  },
  {
    id: 'node-evidence-rare-earth-supply-concentration',
    title: '证据：稀土供应集中度',
    summary: '稀土产品生产商集中度和价格',
    body: '来源：中国稀土行业协会、工信部稀土办公室\n证据强度：强证据（Strong）- 官方数据\n支持观点：稀土供应链高度集中\n已知事实：\n- 中国稀土产量占全球 60%+\n- 北方稀土/中国稀土集团占国内主要份额\n- 配额制+环保审批构成供应约束',
    tags: ['evidence', 'strong-evidence', 'rare-earth', 'supply-chain', 'A-share'],
    status: 'verified',
    x: 1200,
    y: 300,
    connectTo: null
  },
  {
    id: 'node-evidence-cloud-capex-guidance',
    title: '证据：云厂商 Capex 指引',
    summary: '美国云厂商资本开支和 AI 投资',
    body: '来源：AWS/Azure/GCP 财报和电话会议\n证据强度：强证据（Strong）- 官方披露\n支持观点：AI 服务器需求持续性判断\n关键指标：\n- 2025/2026 Capex 指引\n- AI 相关投资占比\n- GPU/服务器交付时间表\n反证信号：Capex 指引下调或推迟',
    tags: ['evidence', 'strong-evidence', 'AI-semiconductor', 'US', 'cloud', 'demand'],
    status: 'verified',
    x: 200,
    y: -500,
    connectTo: null
  }
]

async function addEvidenceNodes() {
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

  for (const evidence of evidenceNodes) {
    const shapeId = createShapeId()

    // Create evidence card
    store[shapeId] = {
      x: evidence.x,
      y: evidence.y,
      rotation: 0,
      isLocked: false,
      opacity: 1,
      meta: {
        serenity: {
          kind: 'learning-card',
          data: {
            id: evidence.id,
            title: evidence.title,
            body: evidence.body,
            summary: evidence.summary,
            tags: evidence.tags,
            status: evidence.status,
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
        color: evidence.status === 'verified' ? 'green' : evidence.status === 'question' ? 'red' : 'yellow',
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
                { type: 'text', text: evidence.title }
              ]
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: evidence.summary }
              ]
            }
          ]
        }
      },
      parentId: currentPageId,
      index: `a${addedCount}evidence`,
      typeName: 'shape'
    }

    addedCount++
    console.log(`✅ Added evidence node: ${evidence.title}`)

    // Create edge if connectTo is specified and target exists
    if (evidence.connectTo && nodeMap.has(evidence.connectTo)) {
      const targetShapeId = nodeMap.get(evidence.connectTo)
      const arrowId = createShapeId()
      const bindingStartId = createBindingId()
      const bindingEndId = createBindingId()

      // Create arrow
      store[arrowId] = {
        x: Math.min(evidence.x, evidence.x + 260),
        y: Math.min(evidence.y, evidence.y + 152),
        rotation: 0,
        isLocked: false,
        opacity: 1,
        meta: {
          serenity: {
            kind: 'learning-edge',
            data: {
              id: `edge-${crypto.randomUUID()}`,
              fromId: evidence.id,
              toId: evidence.connectTo,
              kind: 'supports',
              label: '支持',
              createdAt: timestamp,
              updatedAt: timestamp
            }
          }
        },
        id: arrowId,
        type: 'arrow',
        props: {
          kind: 'arc',
          dash: 'solid',
          size: 'm',
          fill: 'none',
          color: 'black',
          labelColor: 'black',
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
                content: [{ type: 'text', text: '支持' }]
              }
            ]
          },
          labelPosition: 0.5,
          font: 'sans',
          scale: 1,
          elbowMidPoint: 0.5
        },
        parentId: currentPageId,
        index: `a${addedCount}edge`,
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

      console.log(`  → Connected to ${evidence.connectTo}`)
    }
  }

  // Update timestamp
  data.updatedAt = timestamp

  // Write back
  await writeFile(canvasFile, JSON.stringify(data, null, 2))
  console.log(`\n✅ Successfully added ${addedCount} evidence nodes to canvas`)
}

addEvidenceNodes().catch(error => {
  console.error('❌ Failed to add evidence nodes:', error.message)
  process.exit(1)
})
