#!/usr/bin/env node

import {
  applyAiPatchToSnapshot,
  exportAiContextFromSnapshot,
  readStoredCanvas,
  validateAiPatchForSnapshot,
  writeStoredCanvas,
} from './serenity-core.mjs'

const pageId = 'page:fenghua-mlcc-chain'

const patch = {
  version: 1,
  intent: 'Generate Fenghua Advanced Technology MLCC upstream-downstream supply-demand research map.',
  operations: [
    { op: 'addNode', id: 'node-fh-mlcc-chain', title: '风华高科 MLCC 链', summary: '从风华高科切入，拆解被动元件上下游供需。', body: '范围：A股风华高科 000636.SZ 所在的 MLCC、片式阻容、电子材料链。核心判断：先排产业链卡点，再看风华是否靠近卡点。非买卖建议。', tags: ['industry', 'MLCC', 'passive-components', 'A-share'], status: 'seed', x: 0, y: 0 },
    { op: 'addNode', id: 'node-fh-narrative-ai-auto', title: 'AI 与车规拉动', summary: 'AI服务器和汽车电子推高高端 MLCC 需求。', body: 'Interpretation：高功耗服务器、汽车电子和端侧智能设备增加高容、高压、小型化、高可靠 MLCC 用量；消费电子仍是周期基本盘。', tags: ['narrative', 'AI-server', 'automotive', 'demand'], status: 'exploring', x: 360, y: -260, connectFromId: 'node-fh-mlcc-chain', edgeKind: 'causes', edgeLabel: 'drives' },
    { op: 'addNode', id: 'node-fh-system-high-end-split', title: '高端低端分化', summary: '紧缺集中在高端料号，通用料仍有周期性。', body: 'Interpretation：AI/车规高端料号更紧，通用消费类 MLCC 受库存和终端需求制约。验证关键是品类结构和客户认证，而不是板块整体涨价。', tags: ['system-change', 'segmentation', 'price'], status: 'exploring', x: 720, y: -420, connectFromId: 'node-fh-narrative-ai-auto', edgeKind: 'causes', edgeLabel: 'creates' },
    { op: 'addNode', id: 'node-fh-system-inventory-price', title: '库存价格传导', summary: '订单、库存、稼动率和价格决定景气兑现。', body: 'Interpretation：MLCC 供需会通过渠道库存、交期、订单出货比、稼动率和涨价函传导到制造端利润。', tags: ['system-change', 'inventory', 'utilization', 'price'], status: 'exploring', x: 720, y: -220, connectFromId: 'node-fh-narrative-ai-auto', edgeKind: 'causes', edgeLabel: 'transmits' },
    { op: 'addNode', id: 'node-fh-system-certification', title: '认证周期约束', summary: '车规和服务器认证决定国产替代速度。', body: 'Missing：需验证风华高科是否进入 AI 服务器、车规、电源或光模块客户 BOM，以及是否已有批量供货。', tags: ['system-change', 'certification', 'bottleneck'], status: 'question', x: 720, y: -20, connectFromId: 'node-fh-narrative-ai-auto', edgeKind: 'causes', edgeLabel: 'requires' },

    { op: 'addNode', id: 'node-fh-layer-downstream', title: '下游终端', summary: 'AI服务器、汽车电子、消费电子和工业控制决定需求节奏。', body: 'Layer：终端需求。风险在于 AI 高端需求强，但消费电子与通用工业需求可能不同步。', tags: ['layer', 'downstream', 'demand'], status: 'exploring', x: 1080, y: -560, connectFromId: 'node-fh-mlcc-chain', edgeKind: 'contains', edgeLabel: 'contains' },
    { op: 'addNode', id: 'node-fh-layer-oem', title: 'OEM 与模组', summary: '服务器、电源、汽车控制器把需求写入 BOM。', body: 'Layer：系统/OEM 与模组。关键证据是客户平台、料号认证、批供和订单能见度。', tags: ['layer', 'OEM', 'BOM'], status: 'exploring', x: 1080, y: -380, connectFromId: 'node-fh-mlcc-chain', edgeKind: 'contains', edgeLabel: 'contains' },
    { op: 'addNode', id: 'node-fh-layer-manufacturing', title: 'MLCC 制造', summary: '风华高科位于被动元件制造层。', body: 'Fact：本地 API 返回公司主营电子元器件、电子材料，产品含 MLCC、瓷介电容、电阻、电感、超级电容、陶瓷基板等。', tags: ['layer', 'manufacturing', 'MLCC', 'resistor'], status: 'verified', x: 1080, y: -200, connectFromId: 'node-fh-mlcc-chain', edgeKind: 'contains', edgeLabel: 'contains' },
    { op: 'addNode', id: 'node-fh-layer-materials', title: '陶瓷与电极材料', summary: '钛酸钡、镍粉、银浆等影响性能和成本。', body: 'Layer：上游材料。Missing：需确认风华电子材料自供比例、采购结构和成本传导能力。', tags: ['layer', 'materials', 'barium-titanate', 'nickel', 'silver-paste'], status: 'exploring', x: 1080, y: -20, connectFromId: 'node-fh-mlcc-chain', edgeKind: 'contains', edgeLabel: 'contains' },
    { op: 'addNode', id: 'node-fh-layer-equipment', title: '设备与检测', summary: '高层数、小型化和一致性依赖工艺设备。', body: 'Layer：流延、叠层、烧结、检测。高端扩产受良率、一致性和可靠性测试约束。', tags: ['layer', 'equipment', 'testing', 'yield'], status: 'exploring', x: 1080, y: 160, connectFromId: 'node-fh-mlcc-chain', edgeKind: 'contains', edgeLabel: 'contains' },
    { op: 'addNode', id: 'node-fh-layer-channel', title: '渠道与库存', summary: '库存周期会放大涨价，也会反噬需求。', body: 'Layer：渠道/库存。需要跟踪渠道报价、原厂交期、库存天数和订单出货比。', tags: ['layer', 'channel', 'inventory'], status: 'question', x: 1080, y: 340, connectFromId: 'node-fh-mlcc-chain', edgeKind: 'contains', edgeLabel: 'contains' },

    { op: 'addNode', id: 'node-fh-bn-high-end', title: '高端 MLCC 料号', summary: '高容、高压、小型化料号是第一卡点。', body: '排序原因：AI和车规要求高，客户认证慢，日韩份额高。风华是否受益取决于高端产品和客户证据。', tags: ['bottleneck', 'high-end-MLCC', 'scarce-layer'], status: 'exploring', x: 1440, y: -420, connectFromId: 'node-fh-layer-manufacturing', edgeKind: 'blocks', edgeLabel: 'constrains' },
    { op: 'addNode', id: 'node-fh-bn-auto-cert', title: '车规可靠性认证', summary: '车规认证决定高端需求能否转成收入。', body: 'Missing：风华车规客户名单、认证进度、供货比例和失效率数据。', tags: ['bottleneck', 'automotive', 'certification'], status: 'question', x: 1440, y: -240, connectFromId: 'node-fh-system-certification', edgeKind: 'blocks', edgeLabel: 'constrains' },
    { op: 'addNode', id: 'node-fh-bn-powder', title: '高纯陶瓷粉体', summary: '粉体材料影响高端 MLCC 性能和成本。', body: 'Lead：钛酸钡等介质材料是 MLCC 性能基础。需验证风华是否掌握关键材料或主要依赖外采。', tags: ['bottleneck', 'materials', 'barium-titanate'], status: 'exploring', x: 1440, y: -60, connectFromId: 'node-fh-layer-materials', edgeKind: 'blocks', edgeLabel: 'constrains' },
    { op: 'addNode', id: 'node-fh-bn-margin', title: '稼动率与毛利修复', summary: '供需景气最终要落到利润率。', body: 'Fact：本地 API 显示风华 2025 收入 57.56 亿元、净利润 2.83 亿元、ROE 2.29%；当前字段净利率 5.9%。', tags: ['bottleneck', 'utilization', 'margin', 'financial-quality'], status: 'question', x: 1440, y: 120, connectFromId: 'node-fh-system-inventory-price', edgeKind: 'blocks', edgeLabel: 'verifies' },

    { op: 'addNode', id: 'node-fh-company-fenghua', title: '风华高科', summary: '国内被动元件平台型公司，卡点控制力待验证。', body: 'Company：000636.SZ。定位：制造端受益候选，不直接认定控制全链条卡点。证据：本地 API 显示 2025 收入 57.56 亿元、收入增速 +16.5%、净利润 2.83 亿元、资产负债率 23.23%、质押比例 6.79%、非 ST。', tags: ['company', 'Fenghua', '000636.SZ', 'A-share'], status: 'exploring', x: 1800, y: -240, connectFromId: 'node-fh-layer-manufacturing', edgeKind: 'related', edgeLabel: 'sits-in' },
    { op: 'addNode', id: 'node-fh-company-sanhuan', title: '三环集团', summary: '制造端强对照，盈利质量明显更强。', body: 'Company：300408.SZ。本地 API：2025 收入 90.07 亿元、净利润 26.18 亿元、收入增速 +22.1%、净利率 29.5%、资产负债率 17.14%。', tags: ['company', 'peer', 'MLCC', 'manufacturing'], status: 'exploring', x: 1800, y: -60, connectFromId: 'node-fh-layer-manufacturing', edgeKind: 'related', edgeLabel: 'peer' },
    { op: 'addNode', id: 'node-fh-company-sinocera', title: '国瓷材料', summary: '偏陶瓷粉体和功能材料，上游材料对照。', body: 'Company：300285.SZ。本地 API：2025 收入 45.83 亿元、净利润 6.10 亿元、收入增速 +13.2%、净利率 13.9%、质押比例 10.93%。', tags: ['company', 'upstream', 'materials', 'ceramic-powder'], status: 'exploring', x: 1800, y: 120, connectFromId: 'node-fh-layer-materials', edgeKind: 'related', edgeLabel: 'supplies' },
    { op: 'addNode', id: 'node-fh-company-jiemei', title: '洁美科技', summary: '偏 MLCC 制程辅材，验证离型膜弹性。', body: 'Company：002859.SZ。本地 API：2025 收入 21.00 亿元、净利润 2.20 亿元、收入增速 +15.6%、净利率 9.0%、资产负债率 57.60%。', tags: ['company', 'upstream', 'release-film', 'materials'], status: 'exploring', x: 1800, y: 300, connectFromId: 'node-fh-layer-materials', edgeKind: 'related', edgeLabel: 'supplies' },

    { op: 'addNode', id: 'node-fh-evidence-financials', title: '证据：财务质量', summary: '收入恢复，但 ROE 和利润率仍需观察。', body: 'Fact：local-data-api /api/fetch 000636.SZ，2020-2025 收入 43.32、50.55、38.74、42.21、49.39、57.56 亿元；净利润 3.59、9.43、3.27、1.73、3.37、2.83 亿元。Strength：Medium，需年报复核。', tags: ['evidence', 'medium-evidence', 'financial'], status: 'verified', x: 2160, y: -520, connectFromId: 'node-fh-company-fenghua', edgeKind: 'supports', edgeLabel: 'supports' },
    { op: 'addNode', id: 'node-fh-evidence-valuation', title: '证据：估值分位', summary: 'PB 分位不低，题材拥挤度需要纳入风险。', body: 'Fact：local-data-api valuation_pctile，pb_market_mid=2.87，pb_quantile_10y=0.6697，pb_quantile_all=0.55389，pb_date=2026-06-09。Strength：Medium。', tags: ['evidence', 'medium-evidence', 'valuation'], status: 'verified', x: 2160, y: -340, connectFromId: 'node-fh-company-fenghua', edgeKind: 'supports', edgeLabel: 'supports' },
    { op: 'addNode', id: 'node-fh-evidence-cninfo', title: '证据：公告线索', summary: '近期公告含异动、股东变动、Q1 报告、募投结项和减值。', body: 'Fact：Tushare anns_d / CNINFO 返回 2026-04-21 至 2026-06-01 多条公告，包括 2026 一季报、股票交易异常波动、持股5%以上股东减持、部分募投项目结项、计提资产减值准备。Strength：Strong for filing existence。', tags: ['evidence', 'strong-evidence', 'filing', 'CNINFO'], status: 'verified', x: 2160, y: -160, connectFromId: 'node-fh-company-fenghua', edgeKind: 'supports', edgeLabel: 'supports' },
    { op: 'addNode', id: 'node-fh-evidence-industry-tight', title: '证据：高端缺货', summary: '行业报道指向 AI/车规高端 MLCC 结构性紧张。', body: 'Lead：21经济网/中国证券报报道 AI 服务器和车规需求推动高阶 MLCC 供需偏紧，日韩厂商部分产品涨价。Strength：Medium，需原厂订单和财务验证。', tags: ['evidence', 'medium-evidence', 'industry', 'MLCC'], status: 'exploring', x: 2160, y: 20, connectFromId: 'node-fh-bn-high-end', edgeKind: 'supports', edgeLabel: 'supports' },
    { op: 'addNode', id: 'node-fh-evidence-share', title: '证据：日韩高份额', summary: '全球 MLCC 高端供给仍由日韩龙头主导。', body: 'Lead：公开行业报道引用 2024 年全球 MLCC 前五合计约 77.3%。国内厂商份额仍低。Strength：Medium，需协会/招股书原始口径复核。', tags: ['evidence', 'medium-evidence', 'competition'], status: 'exploring', x: 2160, y: 200, connectFromId: 'node-fh-bn-high-end', edgeKind: 'supports', edgeLabel: 'supports' },
    { op: 'addNode', id: 'node-fh-evidence-material-cost', title: '证据：材料成本', summary: '银浆、镍粉、钛酸钡粉体是成本和性能验证点。', body: 'Lead：行业报道提到银浆、镍粉、钛酸钡粉体等原料价格影响 MLCC 成本。Strength：Needs checking。', tags: ['evidence', 'needs-checking', 'materials'], status: 'question', x: 2160, y: 380, connectFromId: 'node-fh-bn-powder', edgeKind: 'supports', edgeLabel: 'supports' },
    { op: 'addNode', id: 'node-fh-evidence-peer-financials', title: '证据：同业财务', summary: '三环盈利质量强，风华处于修复验证。', body: 'Fact：三环 2025 净利率 29.5%，国瓷 13.9%，洁美 9.0%，风华 5.9%。Interpretation：制造端、材料端、辅材端需要分开比较。Strength：Medium。', tags: ['evidence', 'medium-evidence', 'peer', 'financial-quality'], status: 'verified', x: 2160, y: 560, connectFromId: 'node-fh-company-sanhuan', edgeKind: 'supports', edgeLabel: 'supports' },

    { op: 'addNode', id: 'node-fh-risk-demand', title: '风险：需求不持续', summary: 'AI 高端紧缺不等于所有 MLCC 同步复苏。', body: 'Refutation：若消费电子、家电和工业需求偏弱，且风华 AI/车规料号占比低，则行业景气难充分传导。', tags: ['risk', 'demand', 'refutation'], status: 'question', x: 2520, y: -340, connectFromId: 'node-fh-company-fenghua', edgeKind: 'questions', edgeLabel: 'questions' },
    { op: 'addNode', id: 'node-fh-risk-valuation', title: '风险：估值拥挤', summary: '短期涨幅和 PB 分位提高验证压力。', body: 'Refutation：若订单和利润不能兑现，交易热度可能先于基本面回落。监控：PB、成交额、换手率、异动公告、业绩兑现。', tags: ['risk', 'valuation', 'crowding'], status: 'question', x: 2520, y: -160, connectFromId: 'node-fh-company-fenghua', edgeKind: 'questions', edgeLabel: 'questions' },
    { op: 'addNode', id: 'node-fh-risk-overseas', title: '风险：海外龙头压制', summary: '日韩龙头掌握高端份额，国产替代未必快速兑现。', body: 'Refutation：若村田、三星、太阳诱电继续锁定高端客户，国内厂商可能只受益于外溢订单或中低端价格修复。', tags: ['risk', 'competition', 'Japan', 'Korea'], status: 'question', x: 2520, y: 20, connectFromId: 'node-fh-bn-high-end', edgeKind: 'questions', edgeLabel: 'questions' },
    { op: 'addNode', id: 'node-fh-risk-financial', title: '风险：财务弹性不足', summary: '收入恢复不等于高质量利润恢复。', body: 'Refutation：2025 年收入增长但净利润低于 2024 年，ROE 仍低。需看毛利率、现金流、减值、存货和应收。', tags: ['risk', 'financial-quality', 'accounting'], status: 'question', x: 2520, y: 200, connectFromId: 'node-fh-bn-margin', edgeKind: 'questions', edgeLabel: 'questions' },
    { op: 'addNode', id: 'node-fh-risk-theme-basket', title: '风险：概念篮子误判', summary: '同涨不代表每家公司控制同一处卡点。', body: 'Refutation：三环/风华是制造端，国瓷偏材料端，洁美偏制程辅材。若不拆链条，容易把主题交易误当卡点兑现。', tags: ['risk', 'theme', 'misclassification'], status: 'question', x: 2520, y: 380, connectFromId: 'node-fh-company-fenghua', edgeKind: 'questions', edgeLabel: 'questions' },

    { op: 'addNode', id: 'node-fh-next-q1-report', title: '查：2026 一季报', summary: '提取收入、毛利率、存货、现金流和产品结构。', body: 'Method：打开 CNINFO 原文，查 MLCC/电阻/电感/材料收入或经营描述、毛利率、存货、应收、经营现金流、资本开支。', tags: ['next-check', 'filing', 'financial'], status: 'question', x: 2880, y: -420, connectFromId: 'node-fh-evidence-cninfo', edgeKind: 'related', edgeLabel: 'next' },
    { op: 'addNode', id: 'node-fh-next-customer-cert', title: '查：客户认证', summary: '验证是否进入 AI 服务器、车规或头部电源客户。', body: 'Method：查年报、投资者关系、互动易、公告、产品手册。强证据：明确客户、平台、料号、认证阶段、批量供货、收入贡献。', tags: ['next-check', 'certification', 'customer'], status: 'question', x: 2880, y: -240, connectFromId: 'node-fh-bn-auto-cert', edgeKind: 'related', edgeLabel: 'next' },
    { op: 'addNode', id: 'node-fh-next-price-order', title: '查：涨价与订单', summary: '确认涨价是否传导到风华订单和毛利。', body: 'Method：跟踪公司公告、投资者交流、经销商报价、行业周报。问题：涨价品类、订单能见度、交期、稼动率、毛利弹性。', tags: ['next-check', 'price', 'orders'], status: 'question', x: 2880, y: -60, connectFromId: 'node-fh-system-inventory-price', edgeKind: 'related', edgeLabel: 'next' },
    { op: 'addNode', id: 'node-fh-next-materials', title: '查：上游材料', summary: '确认材料对成本和供给的影响。', body: 'Method：查采购成本、供应商集中度、电子材料业务收入、材料自供比例、原材料价格走势。', tags: ['next-check', 'materials', 'cost'], status: 'question', x: 2880, y: 120, connectFromId: 'node-fh-layer-materials', edgeKind: 'related', edgeLabel: 'next' },
    { op: 'addNode', id: 'node-fh-next-peer', title: '查：同业对比', summary: '用三环、国瓷、洁美拆分链条位置。', body: 'Method：对比三环 MLCC 产品矩阵、国瓷陶瓷粉体、洁美离型膜。目的：区分控制卡点、供应卡点、受益需求、主题相邻。', tags: ['next-check', 'peer', 'ranking'], status: 'question', x: 2880, y: 300, connectFromId: 'node-fh-company-fenghua', edgeKind: 'related', edgeLabel: 'next' },
    { op: 'addNode', id: 'node-fh-dashboard', title: '验证仪表盘', summary: '用 6 个指标判断产业链逻辑是否兑现。', body: 'Track：1 高端 MLCC 交期；2 原厂涨价传导；3 风华毛利率/净利率修复；4 存货与应收健康；5 客户认证和批供；6 估值和交易热度是否透支。', tags: ['next-check', 'dashboard', 'verification'], status: 'question', x: 3240, y: -60, connectFromId: 'node-fh-mlcc-chain', edgeKind: 'related', edgeLabel: 'tracks' },
    { op: 'addNode', id: 'node-fh-current-positioning', title: '当前定位', summary: '优先研究高端 MLCC 卡点；风华暂列制造端候选。', body: 'Current view：第一优先层是高端 MLCC 料号与客户认证，第二是陶瓷粉体/电极材料，第三是制造端稼动率和毛利修复。风华高科为制造端受益候选，待高端料号、客户认证和财务兑现证据确认。', tags: ['summary', 'positioning', 'research-priority'], status: 'exploring', x: 3240, y: 140, connectFromId: 'node-fh-dashboard', edgeKind: 'related', edgeLabel: 'concludes' },
  ],
}

function removeGeneratedMap(snapshot) {
  const store = snapshot.document.store
  const nodeIds = new Set()
  const shapeIdsToDelete = new Set()
  const arrowIdsToDelete = new Set()

  for (const record of Object.values(store)) {
    const data = record?.meta?.serenity?.data
    if (record?.typeName === 'shape' && record.type === 'geo' && data?.id?.startsWith('node-fh-')) {
      nodeIds.add(data.id)
      shapeIdsToDelete.add(record.id)
    }
  }

  for (const record of Object.values(store)) {
    const data = record?.meta?.serenity?.data
    if (record?.typeName === 'shape' && record.type === 'arrow' && data && (nodeIds.has(data.fromId) || nodeIds.has(data.toId))) {
      shapeIdsToDelete.add(record.id)
      arrowIdsToDelete.add(record.id)
    }
  }

  for (const record of Object.values(store)) {
    if (record?.typeName === 'binding' && arrowIdsToDelete.has(record.fromId)) {
      shapeIdsToDelete.add(record.id)
    }
  }

  for (const id of shapeIdsToDelete) delete store[id]
}

function ensureFenghuaPage(snapshot) {
  const store = snapshot.document.store
  store[pageId] = {
    id: pageId,
    typeName: 'page',
    name: '风华高科 MLCC 供需链',
    index: 'a3',
    meta: {
      serenity: {
        kind: 'serenity-page',
        theme: '风华高科 MLCC 上下游供需解析',
        researchStage: 'exploring',
        priority: 'high',
        evidenceQuality: 'medium',
        allowEmpty: false,
        tags: ['MLCC', 'passive-components', 'Fenghua', 'A-share'],
        updatedAt: new Date().toISOString(),
      },
    },
  }

  snapshot.session.currentPageId = pageId
  snapshot.session.pageStates = (snapshot.session.pageStates ?? []).filter((state) => state.pageId !== pageId)
  snapshot.session.pageStates.push({
    pageId,
    camera: { x: -120, y: 620, z: 0.35 },
    selectedShapeIds: [],
    focusedGroupId: null,
  })
}

const stored = await readStoredCanvas()
const baseSnapshot = structuredClone(stored.snapshot)
removeGeneratedMap(baseSnapshot)
ensureFenghuaPage(baseSnapshot)

const validation = validateAiPatchForSnapshot(baseSnapshot, patch, { pageId })
if (!validation.ok) {
  console.error(JSON.stringify(validation, null, 2))
  process.exit(1)
}

const result = applyAiPatchToSnapshot(baseSnapshot, patch, { pageId })
if (!result.validation.ok) {
  console.error(JSON.stringify(result.validation, null, 2))
  process.exit(1)
}

const saved = await writeStoredCanvas({ ...stored, snapshot: result.snapshot })
const pageContext = exportAiContextFromSnapshot(saved.snapshot, { pageId })
const currentContext = exportAiContextFromSnapshot(saved.snapshot)

console.log(JSON.stringify({
  ok: true,
  updatedAt: saved.updatedAt,
  pageId,
  currentPageId: currentContext.summary.currentPageId,
  nodeCount: pageContext.summary.nodeCount,
  edgeCount: pageContext.summary.edgeCount,
  warnings: result.validation.warnings,
}, null, 2))
