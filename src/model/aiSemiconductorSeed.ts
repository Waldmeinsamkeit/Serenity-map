import type { Editor } from 'tldraw'
import { connectLearningCards, createLearningCard, getSelectedLearningCards } from './learningGraph'
import type { LearningEdgeKind, LearningStatus } from './types'

type SeedNode = {
  id: string
  title: string
  summary: string
  body: string
  tags: string[]
  status: LearningStatus
  x: number
  y: number
  connectFromId?: string
  edgeKind?: LearningEdgeKind
  edgeLabel?: string
}

const seedNodes: SeedNode[] = [
  {
    id: 'node-ashare-ai-semi-chain',
    title: 'A股 AI 半导体产业链',
    summary: '先看卡点层级，再排优先研究标的',
    body: '2026-06-06 研究画布。核心结论：国产AI算力、内存互连、先进封装、平台设备和高多层PCB/高速互连是优先层级。本图为研究优先级，不构成买卖建议。',
    tags: ['A股', 'AI半导体', '产业链', '研究'],
    status: 'seed',
    x: -1240,
    y: 1050,
  },
  {
    id: 'node-ai-chip-dcu',
    title: 'AI算力芯片/DCU',
    summary: '国产训练/推理算力的核心约束',
    body: '卡点来自芯片性能、软件生态、客户导入、供应链保障和量产良率。代表标的：寒武纪、海光信息。',
    tags: ['AI芯片', 'DCU', '国产算力'],
    status: 'verified',
    x: -760,
    y: 780,
    connectFromId: 'node-ashare-ai-semi-chain',
    edgeKind: 'contains',
    edgeLabel: '层级',
  },
  {
    id: 'node-memory-io',
    title: '内存互连/高速接口',
    summary: 'DDR5、MRCD/MDB、CXL等升级链路',
    body: 'AI服务器带宽瓶颈推动内存接口和高速互连升级，标准迭代和客户认证形成壁垒。代表标的：澜起科技。',
    tags: ['DDR5', 'MRCD', '高速互连'],
    status: 'verified',
    x: -760,
    y: 980,
    connectFromId: 'node-ashare-ai-semi-chain',
    edgeKind: 'contains',
    edgeLabel: '层级',
  },
  {
    id: 'node-advanced-packaging',
    title: '先进封装/测试',
    summary: 'Chiplet、SiP、2.5D/3D量产瓶颈',
    body: 'AI芯片从设计到量产绕不开封装测试，先进封装能力决定高端算力供给上限。代表标的：长电科技、通富微电。',
    tags: ['先进封装', 'Chiplet', '测试'],
    status: 'verified',
    x: -760,
    y: 1180,
    connectFromId: 'node-ashare-ai-semi-chain',
    edgeKind: 'contains',
    edgeLabel: '层级',
  },
  {
    id: 'node-semi-equipment',
    title: '半导体设备',
    summary: '刻蚀、沉积、清洗等平台设备',
    body: '国产晶圆制造和先进封装扩产的卖铲子环节，验证周期长、客户粘性强。代表标的：北方华创、中微公司。',
    tags: ['设备', '国产替代', 'capex'],
    status: 'verified',
    x: -760,
    y: 1380,
    connectFromId: 'node-ashare-ai-semi-chain',
    edgeKind: 'contains',
    edgeLabel: '层级',
  },
  {
    id: 'node-pcb-ccl',
    title: 'PCB/CCL/高速互连',
    summary: 'AI服务器高层数PCB和高速材料约束',
    body: 'AI服务器、交换机带来高层数、高速材料和良率要求。代表标的：沪电股份、胜宏科技、生益科技。',
    tags: ['PCB', 'CCL', 'AI服务器'],
    status: 'exploring',
    x: -760,
    y: 1580,
    connectFromId: 'node-ashare-ai-semi-chain',
    edgeKind: 'contains',
    edgeLabel: '层级',
  },
  {
    id: 'node-material-parts',
    title: '材料/零部件',
    summary: '硅片、抛光液、靶材、精密零部件',
    body: '材料与零部件通常弹性不如芯片本体，但验证周期和纯度要求会形成长期卡点。代表标的：安集科技、沪硅产业、江丰电子、富创精密。',
    tags: ['材料', '零部件'],
    status: 'exploring',
    x: -760,
    y: 1780,
    connectFromId: 'node-ashare-ai-semi-chain',
    edgeKind: 'contains',
    edgeLabel: '层级',
  },
  {
    id: 'node-cambricon',
    title: '1 寒武纪',
    summary: '国产AI训练/推理芯片，综合分87',
    body: '卡住环节：国产AI芯片和软件生态。排序理由：最接近国产AI算力核心约束，弹性高。风险：客户集中、供应链、研发投入和估值波动。',
    tags: ['Top5', '688256.SH'],
    status: 'verified',
    x: -300,
    y: 726,
    connectFromId: 'node-ai-chip-dcu',
    edgeKind: 'blocks',
    edgeLabel: '卡点',
  },
  {
    id: 'node-haiguang',
    title: '2 海光信息',
    summary: 'CPU+DCU算力平台，综合分86',
    body: '卡住环节：国产数据中心CPU/DCU平台。排序理由：平台型算力底座，财务兑现度相对可观察。风险：授权/架构限制、竞争和大客户节奏。',
    tags: ['Top5', '688041.SH'],
    status: 'verified',
    x: -300,
    y: 896,
    connectFromId: 'node-ai-chip-dcu',
    edgeKind: 'blocks',
    edgeLabel: '平台',
  },
  {
    id: 'node-montage',
    title: '3 澜起科技',
    summary: 'DDR5内存接口/高速互连，综合分84',
    body: '卡住环节：AI服务器内存带宽升级。排序理由：MRCD/MDB和内存接口认证壁垒高。风险：存储周期和新品放量节奏。',
    tags: ['Top5', '688008.SH'],
    status: 'verified',
    x: -300,
    y: 980,
    connectFromId: 'node-memory-io',
    edgeKind: 'blocks',
    edgeLabel: '接口',
  },
  {
    id: 'node-jcet',
    title: '5 长电科技',
    summary: '先进封装/测试，综合分77',
    body: '卡住环节：先进封装与测试产能。排序理由：AI芯片量产绕不开封测。风险：先进封装收入占比、价格竞争和周期波动。',
    tags: ['Top5', '600584.SH'],
    status: 'verified',
    x: -300,
    y: 1180,
    connectFromId: 'node-advanced-packaging',
    edgeKind: 'blocks',
    edgeLabel: '量产',
  },
  {
    id: 'node-naura',
    title: '4 北方华创',
    summary: '平台型半导体设备，综合分83',
    body: '卡住环节：刻蚀、沉积、清洗等制造设备。排序理由：国产替代和扩产确定性较强。风险：下游capex波动和估值拥挤。',
    tags: ['Top5', '002371.SZ'],
    status: 'verified',
    x: -300,
    y: 1380,
    connectFromId: 'node-semi-equipment',
    edgeKind: 'blocks',
    edgeLabel: '设备',
  },
  {
    id: 'node-ai-semi-report',
    title: '报告与图表',
    summary: 'reports目录已生成研究报告和评分图',
    body: '查看 reports/ai_semiconductor_chain.md、top5_scorecard.csv、financial_quality_chart.png、chain_priority_chart.png。',
    tags: ['交付物', 'reports'],
    status: 'seed',
    x: 180,
    y: 1580,
    connectFromId: 'node-ashare-ai-semi-chain',
    edgeKind: 'supports',
    edgeLabel: '交付',
  },
  {
    id: 'node-evidence-gap',
    title: '证据缺口',
    summary: 'Tushare token无效；需补问询函/互动易',
    body: 'Tushare 本地 token 存在但服务端返回 token 不对，本版财务质量采用公开资料近似评分。下一步补查交易所问询函、互动平台、环评/能评、客户认证和合同负债。',
    tags: ['风险', '待核验'],
    status: 'question',
    x: 180,
    y: 1780,
    connectFromId: 'node-ashare-ai-semi-chain',
    edgeKind: 'questions',
    edgeLabel: '待补证',
  },
]

const crossLinks: Array<[string, string, LearningEdgeKind, string]> = [
  ['node-semi-equipment', 'node-advanced-packaging', 'supports', '扩产'],
  ['node-material-parts', 'node-semi-equipment', 'supports', '供应'],
  ['node-pcb-ccl', 'node-ai-chip-dcu', 'supports', '服务器'],
]

export function createAiSemiconductorIndustryMap(editor: Editor) {
  const shapesByNodeId = new Map<string, string>()
  editor.run(() => {
    for (const node of seedNodes) {
      const created = createLearningCard(editor, node)
      shapesByNodeId.set(node.id, created.shapeId)
    }

    for (const node of seedNodes) {
      if (!node.connectFromId) continue
      const fromShapeId = shapesByNodeId.get(node.connectFromId)
      const toShapeId = shapesByNodeId.get(node.id)
      if (fromShapeId && toShapeId) {
        connectLearningCards(editor, fromShapeId as any, toShapeId as any, {
          kind: node.edgeKind,
          label: node.edgeLabel,
        })
      }
    }

    for (const [fromId, toId, kind, label] of crossLinks) {
      const fromShapeId = shapesByNodeId.get(fromId)
      const toShapeId = shapesByNodeId.get(toId)
      if (fromShapeId && toShapeId) connectLearningCards(editor, fromShapeId as any, toShapeId as any, { kind, label })
    }
  })

  const centerShapeId = shapesByNodeId.get('node-ashare-ai-semi-chain')
  if (centerShapeId) editor.select(centerShapeId as any)
  return getSelectedLearningCards(editor).length
}
