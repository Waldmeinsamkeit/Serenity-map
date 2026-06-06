---
name: industry-research-canvas
description: Use this skill when the user wants to analyze any industry, sector, theme, supply chain, or company universe through a reusable methodology and express the result as a mind map or Serenity canvas. It turns broad themes into an AI-readable structure: market narrative, system change, value-chain layers, bottlenecks, companies, evidence, risks, and next verification steps. Useful for industry research, investment research support, learning maps, supply-chain mapping, and expanding ideas with AI Context / AI Patch.
author: Serenity
version: 0.1.0
---

# Industry Research Canvas

Use this skill to turn an industry question into a structured thinking map.

The goal is not to produce a generic report. The goal is to help a human and an agent think together on a canvas: first clarify the system, then find the scarce layers, then map companies, evidence, risks, and next checks.

## Core Principle

Do not start with company names. Start with the system.

Use this chain:

```text
market narrative -> system change -> value-chain layers -> scarce layers -> company mapping -> evidence -> risks -> next verification
```

For Chinese output, prefer:

```text
市场叙事 -> 系统变化 -> 产业链层级 -> 卡点环节 -> 公司映射 -> 证据链 -> 风险/反证 -> 下一步验证
```

## When To Use

Use this skill when the user asks for:

- 分析一个行业、产业链、供应链、主题或赛道；
- 画一张行业思维导图、产业链图、卡点图、研究框架图；
- 找某个行业最值得研究的公司；
- 判断谁控制卡点、谁只是受益、谁只是概念；
- 将已有研究沉淀成 Serenity 画布、AI Context、AI Patch；
- 从机器人、AI 半导体、新能源、医药制造、军工电子、AI 基建等案例中抽象通用方法。

If the task is current investment research, also use live sources and market/financial data when available. This skill gives research structure; it does not replace evidence gathering.

## The Method

### 1. Market Narrative

Write the plain-language reason this industry matters now.

Ask:

- What demand, technology, cost, policy, or supply change made the theme important?
- Is this a real system change or only a market story?
- What old constraint is becoming visible?

Canvas node type: `行业节点` or `市场叙事节点`.

### 2. System Change

Translate the narrative into a concrete system pressure.

Examples:

- Humanoid robots -> actuator density and reliability pressure -> reducers, motors, sensors, safety validation.
- AI servers -> bandwidth and power pressure -> memory interfaces, advanced packaging, PCB/CCL, cooling, power.
- Biomanufacturing -> yield and compliance pressure -> equipment, consumables, process validation.

Canvas edge: use `causes` from narrative to system change.

### 3. Value-Chain Layers

Break the industry into layers before naming companies.

Default layer checklist:

- downstream demand and capex source;
- system integrators / OEMs;
- modules and subsystems;
- core components / chips / devices;
- process, assembly, packaging, testing;
- equipment and metrology;
- materials, consumables, specialty inputs;
- physical infrastructure;
- channels, service, certification, maintenance.

Canvas edge: use `contains` from the industry node to each layer.

### 4. Bottleneck Discovery

A layer becomes a real bottleneck when several signals stack:

- supplier count is low;
- qualification or certification is slow;
- expansion requires specialized equipment, permits, process know-how, purity, yield, or safety validation;
- customers cannot easily route around the supplier;
- customers show urgency through orders, prepayments, capacity reservations, tender wins, accelerated certification, or price acceptance;
- financial data shows pricing power, margin resilience, contract liabilities, inventory discipline, or cash conversion.

Do not treat “benefits from demand” as “controls the bottleneck”.

Canvas edge: use `blocks` from bottleneck nodes to the constrained layer or downstream system.

### 5. Company Mapping

For each company, classify it clearly:

- `controls the bottleneck`: directly owns scarce capacity, process, certification, IP, or customer qualification;
- `supplies the bottleneck`: sells key inputs to the scarce layer;
- `benefits from demand`: has exposure but limited control;
- `weak proof`: has a story but lacks hard evidence;
- `watch / downgrade`: popular but not close enough to the constraint.

Each company node should answer:

```text
卡住的环节:
产业链位置:
为什么排这里:
证据:
风险/反证:
下一步验证:
```

Canvas edge: use `blocks` if the company controls or sits very close to a bottleneck; use `supports` if it supplies the bottleneck; use `related` if it is only adjacent.

### 6. Evidence Chain

Every important claim needs an evidence label:

- `Strong`: annual reports, interim reports, quarterly reports, official announcements, exchange inquiry replies, tenders, patents, certifications, project filings, customer/order documents.
- `Medium`: company IR, product pages, credible media, trade publications, industry associations, specialist research with visible assumptions.
- `Weak`: social posts, screenshots, rumors, unexplained price action, unsourced channel checks.
- `Needs checking`: important but not yet verified.

For A-share work, prioritize:

- 年报、半年报、季报、临时公告；
- 交易所问询函/回复、互动易/上证 e 互动；
- 招投标、中标、客户认证；
- 环评/能评、项目备案、产能建设记录；
- 专利、标准、行业协会资料；
- 应收、存货、合同负债、经营现金流、毛利率、在建工程、资本开支。

For local data-source functions extracted from `E:\repo\AAA-trading-storage\app`, read `references/data-source-functions.md`. Use it as a source map for行情、财务、公告、研报、资金、舆情、政策和网页搜索入口.

Canvas edge: use `supports` from evidence nodes to company or bottleneck nodes.

### 7. Risk And Refutation

For each top company or top bottleneck, state what would make the thesis weaker.

Common refutations:

- demand is delayed or cyclical;
- customers qualify multiple alternatives;
- capacity expands faster than expected;
- margin does not improve despite claimed scarcity;
- receivables and inventory rise faster than revenue;
- cash flow lags earnings;
- product is important technically but too small financially;
- company is only thematically related;
- valuation already prices in success.

Canvas edge: use `questions` from risk nodes to company or bottleneck nodes.

### 8. Next Verification

End with concrete research actions:

- which filings to read;
- which financial metrics to pull;
- which customer certifications to verify;
- which tenders, patents, project approvals, or capacity records to check;
- what upcoming disclosure could change the ranking.

Canvas node type: `下一步行动节点`.

## Mind Map Structure

When creating a mind map, use this default layout:

```text
Left column:
  market narrative
  system change
  demand source

Middle column:
  value-chain layers
  bottleneck layers
  scarce mechanisms

Right column:
  companies
  evidence
  risks
  next verification
```

Suggested node types:

- `行业节点`
- `市场叙事节点`
- `系统变化节点`
- `产业链层级节点`
- `卡点节点`
- `公司节点`
- `证据节点`
- `风险节点`
- `问题节点`
- `下一步行动节点`

Suggested Serenity tags:

```text
industry, narrative, system-change, layer, bottleneck, company, evidence, risk, question, next-check
```

## AI Patch Guidance For Serenity

When using Serenity canvas, prefer AI Patch instead of direct file edits.

Create cards with:

```json
{
  "op": "addNode",
  "id": "node-stable-id",
  "title": "短标题",
  "summary": "画布上可见的短摘要",
  "body": "定义：...\n为什么重要：...\n卡点逻辑：...\n代表公司：...\n证据：...\n风险：...\n下一步验证：...",
  "tags": ["industry", "bottleneck"],
  "status": "exploring",
  "x": 0,
  "y": 0
}
```

Use edges deliberately:

- `contains`: industry -> layer, layer -> sublayer;
- `causes`: narrative -> system change -> bottleneck;
- `blocks`: bottleneck -> constrained layer, company -> bottleneck when it controls the scarce resource;
- `supports`: evidence -> claim/company/bottleneck;
- `questions`: risk or missing proof -> claim/company;
- `related`: adjacent but non-causal relationship.

Keep card visible text short. Put detailed reasoning in `body`, not in the card title.

## Scorecard

Use a 100-point score when ranking companies or bottlenecks:

```text
需求压力 15
卡点强度 20
供应集中度 10
扩张难度 15
公司贴近程度 15
证据质量 10
财务质量 10
风险折扣 5
```

Interpretation:

- 85+: highest-priority research candidate;
- 75-84: strong candidate, needs more evidence;
- 65-74: watchlist or secondary layer;
- below 65: likely adjacent exposure or weak proof.

Do not let financial momentum override weak bottleneck control. A fast-growing company can still rank lower if it does not control the scarce layer.

## Output Contract

For a concise answer:

```text
先排层级：
1. ...
2. ...
3. ...

最值得优先研究的卡点：
- 卡点：...
- 为什么卡：...
- 对应公司：...
- 证据：...
- 风险：...

下一步验证：
- ...
```

For a canvas-ready output, produce:

- a short human explanation;
- a Mermaid diagram if useful;
- an AI Patch with stable node ids;
- a note listing evidence gaps and what needs checking.

## Safety Boundary

This skill supports research and learning. Do not give guaranteed returns or direct buy/sell instructions.

When securities are involved, phrase conclusions as research priority:

```text
这是优先研究名单，不是买卖建议。交易决策由用户自己决定。
```

Never invent evidence, customers, certifications, orders, patents, financial numbers, or regulatory documents. Mark unknowns as `Needs checking`.
