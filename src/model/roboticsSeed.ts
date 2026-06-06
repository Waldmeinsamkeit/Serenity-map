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
    id: 'node-robotics-chain',
    title: '机器人产业链',
    summary: '从上游核心零部件到下游应用的学习总图',
    body: '机器人产业链可按上游核心零部件与材料、中游机器人本体与系统集成、软件与AI能力层、下游行业应用、商业化瓶颈与趋势来拆解。',
    tags: ['robotics', 'industry-chain'],
    status: 'seed',
    x: 0,
    y: 0,
  },
  {
    id: 'node-upstream',
    title: '上游：核心零部件',
    summary: '决定成本、性能、可靠性的供给层',
    body: '核心零部件包括减速器、伺服系统、控制器、传感器、末端执行器、芯片与材料。',
    tags: ['upstream', 'components'],
    status: 'seed',
    x: -620,
    y: -360,
    connectFromId: 'node-robotics-chain',
    edgeKind: 'contains',
    edgeLabel: '上游',
  },
  {
    id: 'node-midstream',
    title: '中游：本体与系统',
    summary: '把零部件集成为可交付机器人产品',
    body: '包括工业机器人、协作机器人、移动机器人、服务机器人、人形/四足机器人，以及系统集成、调试、交付和运维。',
    tags: ['midstream', 'robot-body'],
    status: 'seed',
    x: 0,
    y: -360,
    connectFromId: 'node-robotics-chain',
    edgeKind: 'contains',
    edgeLabel: '中游',
  },
  {
    id: 'node-software-ai',
    title: '软件与AI能力层',
    summary: '感知、规划、控制和人机交互',
    body: '软件能力包括运动控制、路径规划、视觉识别、多模态感知、仿真、数字孪生、调度系统、具身智能和大模型交互。',
    tags: ['software', 'ai', 'embodied-ai'],
    status: 'exploring',
    x: 620,
    y: -360,
    connectFromId: 'node-robotics-chain',
    edgeKind: 'contains',
    edgeLabel: '能力层',
  },
  {
    id: 'node-downstream',
    title: '下游：应用场景',
    summary: '需求由制造业、物流、医疗和服务业拉动',
    body: '工业机器人主要服务汽车、电子电气、金属机械等制造业。服务机器人覆盖物流运输、清洁、医疗、餐饮、巡检、家庭陪伴等场景。',
    tags: ['downstream', 'applications'],
    status: 'seed',
    x: 0,
    y: 340,
    connectFromId: 'node-robotics-chain',
    edgeKind: 'contains',
    edgeLabel: '下游',
  },
  {
    id: 'node-bottlenecks',
    title: '关键瓶颈',
    summary: '国产化、可靠性、成本与场景闭环',
    body: '瓶颈包括高端减速器/伺服/传感器能力、整机可靠性、真实场景数据、长尾任务泛化、安全认证、渠道与售后服务。',
    tags: ['bottleneck', 'risk'],
    status: 'question',
    x: 620,
    y: 340,
    connectFromId: 'node-robotics-chain',
    edgeKind: 'questions',
    edgeLabel: '瓶颈',
  },
  {
    id: 'node-market-signal',
    title: '市场信号',
    summary: '工业机器人高位运行，服务机器人物流领先',
    body: 'IFR World Robotics 2025显示2024年全球工业机器人安装量约54.2万台，为历史第二高；专业服务机器人2024年销量接近20万台，运输与物流是最大应用组。',
    tags: ['market', 'IFR'],
    status: 'verified',
    x: -620,
    y: 340,
    connectFromId: 'node-robotics-chain',
    edgeKind: 'supports',
    edgeLabel: '数据支撑',
  },
  ['node-reducer', '减速器', '机器人关节精密传动核心', -1040, -640, 'node-upstream'],
  ['node-servo', '伺服系统', '电机、驱动器、编码器闭环控制', -1040, -440, 'node-upstream'],
  ['node-controller', '控制器', '机器人运动控制与安全逻辑中枢', -1040, -240, 'node-upstream'],
  ['node-sensors', '传感器', '视觉、力觉、触觉、激光雷达、IMU', -1040, -40, 'node-upstream'],
  ['node-end-effector', '末端执行器', '夹爪、焊枪、吸盘、工具快换', -1040, 160, 'node-upstream'],
  ['node-chips-materials', '芯片与材料', '算力、功率器件、结构件与电池', -1040, 360, 'node-upstream'],
  ['node-industrial-robot', '工业机器人', '焊接、搬运、装配、喷涂、码垛', -250, -680, 'node-midstream'],
  ['node-cobot', '协作机器人', '安全、易部署、中小批量柔性作业', -250, -500, 'node-midstream'],
  ['node-amr-agv', '移动机器人 AMR/AGV', '仓储、工厂、医院的自主搬运', -250, -320, 'node-midstream'],
  ['node-humanoid', '人形/四足机器人', '通用具身智能与高自由度本体', -250, -140, 'node-midstream'],
  ['node-integrator', '系统集成商', '方案设计、工艺适配、调试交付', -250, 40, 'node-midstream'],
  ['node-perception', '感知与视觉', '2D/3D视觉、力控、多模态融合', 1040, -640, 'node-software-ai'],
  ['node-motion-planning', '运动规划与控制', '轨迹、避障、抓取、全身控制', 1040, -440, 'node-software-ai'],
  ['node-simulation', '仿真与数字孪生', '离线编程、数据生成、产线验证', 1040, -240, 'node-software-ai'],
  ['node-sim-physics-engine', '物理引擎与动力学模型', '接触、摩擦、执行器和环境模型决定仿真可信度', 1460, -720, 'node-simulation'],
  ['node-sim-synthetic-data', '合成数据生成', '用仿真补足长尾场景和低频异常样本', 1460, -520, 'node-simulation'],
  ['node-sim-virtual-commissioning', '虚拟调试与离线编程', '上线前验证节拍、路径、碰撞和工艺窗口', 1460, -320, 'node-simulation'],
  ['node-sim-to-real-gap', 'Sim-to-real 差距', '仿真到真实的误差校准是核心瓶颈', 1460, -120, 'node-simulation'],
  ['node-sim-embodied-training', '具身智能训练场', '仿真环境承载强化学习和任务泛化训练', 1460, 80, 'node-simulation'],
  ['node-sim-line-digital-twin', '产线级数字孪生', '从单机仿真升级到工厂节拍、物流和维护优化', 1460, 280, 'node-simulation'],
  ['node-fleet-os', '调度系统与机器人OS', '多机器人协同与任务编排', 1040, -40, 'node-software-ai'],
  ['node-foundation-models', '大模型与具身智能', '语言、多模态、任务泛化、人机交互', 1040, 160, 'node-software-ai'],
  ['node-auto', '汽车制造', '焊装、涂装、总装、零部件', -420, 640, 'node-downstream'],
  ['node-electronics', '电子电气', '装配、检测、搬运、精密制造', -120, 640, 'node-downstream'],
  ['node-logistics', '仓储物流', '运输、拣选、分拣、配送', 180, 640, 'node-downstream'],
  ['node-medical-care', '医疗与养老', '手术、康复、护理、配送', 480, 640, 'node-downstream'],
  ['node-commercial-home', '商业与家庭服务', '清洁、餐饮、巡检、陪伴', 780, 640, 'node-downstream'],
  ['node-cost', '成本下降路径', '国产化、规模化、模块化、标准化', 1040, 360, 'node-bottlenecks'],
  ['node-reliability', '可靠性与安全', 'MTBF、功能安全、认证、售后', 1040, 560, 'node-bottlenecks'],
  ['node-data-gap', '真实场景数据', '长尾任务、低频异常、仿真到现实差距', 1040, 760, 'node-bottlenecks'],
].map((item): SeedNode =>
  Array.isArray(item)
    ? {
        id: item[0] as string,
        title: item[1] as string,
        summary: item[2] as string,
        body: item[2] as string,
        tags: ['robotics'],
        status: 'exploring' as const,
        x: item[3] as number,
        y: item[4] as number,
        connectFromId: item[5] as string,
        edgeKind: 'contains' as const,
        edgeLabel: '包含',
      }
    : (item as SeedNode)
)

const crossLinks: Array<[string, string, LearningEdgeKind, string]> = [
  ['node-reducer', 'node-humanoid', 'supports', '关节价值量'],
  ['node-servo', 'node-industrial-robot', 'supports', '运动性能'],
  ['node-sensors', 'node-perception', 'supports', '感知输入'],
  ['node-fleet-os', 'node-logistics', 'supports', '多机调度'],
  ['node-foundation-models', 'node-humanoid', 'supports', '任务泛化'],
  ['node-simulation', 'node-integrator', 'supports', '缩短部署'],
  ['node-sim-synthetic-data', 'node-perception', 'supports', '训练感知'],
  ['node-sim-virtual-commissioning', 'node-integrator', 'supports', '缩短交付'],
  ['node-sim-to-real-gap', 'node-data-gap', 'questions', '真实数据缺口'],
  ['node-sim-embodied-training', 'node-foundation-models', 'supports', '任务泛化训练'],
  ['node-sim-line-digital-twin', 'node-downstream', 'supports', '落地验证'],
  ['node-market-signal', 'node-industrial-robot', 'supports', '装机高位'],
  ['node-market-signal', 'node-logistics', 'supports', '服务机器人增长'],
  ['node-cost', 'node-downstream', 'causes', '扩大应用'],
  ['node-reliability', 'node-downstream', 'blocks', '制约落地'],
]

export function createRoboticsIndustryMap(editor: Editor) {
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

  const centerShapeId = shapesByNodeId.get('node-robotics-chain')
  if (centerShapeId) editor.select(centerShapeId as any)
  return getSelectedLearningCards(editor).length
}
