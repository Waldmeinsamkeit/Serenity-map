# Deep Research Workflow

Use this when the user asks for a theme scan, industry chain, supply chain, company universe, or current research priority list.

## Minimum Standard

- Rank value-chain layers before companies.
- Explain the system change that creates demand or scarcity.
- Build a broad candidate universe when time and tools allow.
- Mark every important claim as fact, interpretation, or needs checking.
- Give risk and refutation conditions for each top candidate.
- Convert the result into canvas nodes when the user asks for a mind map or Serenity output.

## Workflow

### 1. Scope the request

Lock the market, theme, time window, and output shape. If the user is vague, infer a reasonable scope and state it.

### 2. Translate narrative into system pressure

Ask what changed: demand, architecture, policy, cost, capacity, regulation, technical standard, customer behavior, or supply availability.

Examples:

- AI servers -> bandwidth, power, packaging, memory, PCB/CCL, cooling, and optical-link pressure.
- Robotics -> actuator density, reliability, sensor fusion, safety validation, and cost pressure.
- Biomanufacturing -> yield, compliance, consumables, equipment, and process validation pressure.

### 3. Build value-chain layers

Use this default map:

```text
downstream demand -> system/OEM -> modules/subsystems -> chips/devices ->
process/packaging/testing -> equipment/metrology -> materials/consumables ->
infrastructure -> channels/service/certification
```

Split mixed buckets when economics differ. Do not merge chips, packaging, equipment, materials, optical links, PCB, power, and cooling into one broad layer.

### 4. Find scarce layers

A layer is a real bottleneck when several signals stack:

- supplier count is low;
- qualification or certification is slow;
- expansion needs specialized equipment, permits, purity, yield, process know-how, or safety validation;
- customers cannot easily route around the supplier;
- orders, prepayments, capacity reservations, tenders, certifications, or price acceptance show urgency;
- margins, contract liabilities, inventory discipline, cash conversion, or capex confirm scarcity.

Do not treat "benefits from demand" as "controls the bottleneck."

### 5. Map companies

Classify each company:

- controls the bottleneck;
- supplies the bottleneck;
- benefits from demand;
- adjacent exposure;
- weak proof;
- watch/downgrade.

For each top candidate, write:

```text
卡住的环节:
产业链位置:
为什么排这里:
证据:
风险/反证:
下一步验证:
```

### 6. Gather and grade evidence

Prefer primary sources and explicit provider URLs when available. Use media and social sources as leads, not final proof.

For A-share work, prioritize announcements, annual/interim/quarterly reports, exchange inquiry replies, interactive investor platforms, tenders, project filings, environmental/energy approvals, patents, customer certification, and financial quality.

### 7. Rank priorities

Rank by:

- demand pressure;
- bottleneck severity;
- supplier concentration;
- expansion difficulty;
- company closeness to the scarce layer;
- evidence quality;
- financial quality;
- risk deduction.

Keep layer priority and company priority separate.

### 8. Explain and canvas

Start with the scarce layers. Then provide a concise ranking and a canvas-ready structure:

- industry node;
- narrative node;
- system-change node;
- layer nodes;
- bottleneck nodes;
- company nodes;
- evidence nodes;
- risk nodes;
- next-check nodes.
