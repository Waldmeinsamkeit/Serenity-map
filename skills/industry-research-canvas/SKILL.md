---
name: industry-research-canvas
description: Turn an industry, sector, theme, supply chain, or company universe into a Serenity canvas-ready research map. Use for industry research, supply-chain bottleneck analysis, A-share/HK/US candidate ranking, source-backed thesis checks, provider/data-source URL selection, Mermaid/AI Patch canvas outputs, evidence/risk mapping, and follow-up verification plans. Generic research support only; do not depend on local proprietary repositories and do not give guaranteed returns or direct buy/sell instructions.
---

# Industry Research Canvas

Use this skill to research an industry from system logic to evidence, then express the result as a Serenity learning canvas. The default output is not a generic report: it should become a map of market narrative, system change, value-chain layers, bottlenecks, companies, evidence, risks, and next checks.

## Core Loop

Always work in this order:

```text
market narrative -> system change -> value-chain layers -> scarce layers -> company mapping -> evidence -> risks -> next verification -> canvas structure
```

For Chinese output:

```text
市场叙事 -> 系统变化 -> 产业链层级 -> 稀缺/卡点层 -> 公司映射 -> 证据链 -> 风险/反证 -> 下一步验证 -> 画布节点
```

Do not start with company names. Rank value-chain layers first, then rank companies by closeness to the scarce layer and evidence quality.

## Request Router

- **Theme scan**: Map the chain, rank scarce layers, build a candidate universe, then return top research priorities and a canvas-ready structure.
- **Single-company challenge**: Identify where the company sits, whether it controls a bottleneck, what evidence supports it, and what would weaken the view.
- **Candidate comparison**: Compare by chain position, scarcity, evidence, financial quality, timing, and risk.
- **Canvas-ready output**: Produce a short human summary plus Mermaid and/or AI Patch operations.
- **Learning conversation**: Ask one focused question per turn and move the user from story to system change to scarce layer to proof.
- **Data-source selection**: Read `references/data-source-urls.md` before choosing provider URLs, public endpoints, or credentialed APIs.

## Resource Loading

Load only what the task needs:

- `references/deep-research-workflow.md`: full research procedure and minimum standards for theme scans.
- `references/evidence-ladder.md`: evidence grading and claim handling.
- `references/market-source-playbook.md`: market-specific source paths for US, A-share, HK, Taiwan, Japan, Korea, and Europe.
- `references/risk-and-compliance.md`: investment research boundaries and high-risk situations.
- `references/output-style-and-language.md`: answer shapes, Chinese style, and table guidance.
- `references/data-source-urls.md`: provider-oriented source URLs for filings, market data, research reports, news, search, and extraction.
- `assets/thesis-template.md`: structured memo template.
- `assets/canvas-patch-template.json`: AI Patch skeleton for Serenity canvas.
- `assets/bottleneck-scorecard.json`: scoring template for bottleneck/company ranking.
- `assets/research-prompt-pack.md`: reusable user prompts.
- `examples/`: canvas-ready examples.
- `evals/test-cases.md`: behavior tests for this skill.

## Canvas Rules

When the user asks for a Serenity canvas, mind map, or AI Patch:

- Keep visible card text short: title and summary only.
- Put detailed reasoning in `body`, not in the title.
- Use stable node ids such as `node-ai-semi-memory-interface`.
- Use tags such as `industry`, `narrative`, `system-change`, `layer`, `bottleneck`, `company`, `evidence`, `risk`, `next-check`.
- Use statuses deliberately: `seed`, `exploring`, `verified`, `question`, `archived`.
- Prefer AI Patch over direct file edits.
- Use Serenity edge kinds deliberately:
  - `contains`: industry -> layer, layer -> sublayer
  - `causes`: narrative -> system change -> bottleneck
  - `blocks`: bottleneck -> constrained layer, company -> bottleneck when it controls the constraint
  - `supports`: evidence -> claim/company/bottleneck
  - `questions`: risk or missing proof -> claim/company
  - `related`: adjacent but non-causal relationship

## Evidence And Ranking

For every important claim, mark evidence as:

- `Strong`: filings, exchange documents, official announcements, transcripts, tenders, patents, standards, regulatory/project records, signed orders/contracts.
- `Medium`: company IR, product pages, credible media, trade publications, specialist reports with visible assumptions.
- `Weak`: social posts, screenshots, unsourced channel checks, unexplained price action.
- `Needs checking`: plausible but not verified.

For top companies, always state:

```text
卡住的环节 / 产业链位置 / 排序原因 / 证据 / 主要风险 / 下一步验证
```

Strong market views are allowed only when supported by evidence. Trading decisions remain with the user.

## Data Source Guidance

This skill is generic. Do not assume a local proprietary repository, local wrapper classes, or project-specific cache/runtime exists.

Default routing:

- Use primary filings and exchange documents before secondary commentary.
- Use provider URLs from `references/data-source-urls.md` when the user asks which source/API/site to use.
- Use credentialed APIs such as Tushare, iTick, Tavily, FireCrawl, or MX only when access is available or the user explicitly says it is configured.
- Treat structured market data as strong evidence only for the fields returned; it does not prove business exposure by itself.
- Never store API keys, cookies, tokens, or private headers in canvas nodes, examples, prompts, or research output.

## Output Contract

For concise research answers:

1. Start with the layers worth prioritizing.
2. Explain the system constraint in plain language.
3. Rank companies as research priorities, not buy/sell commands.
4. Mark evidence strength and missing checks.
5. End with concrete next verification steps.

For canvas-ready answers, include:

- a short human summary;
- a Mermaid graph when useful;
- an AI Patch with valid Serenity operations when the user wants changes applied later;
- a note listing evidence gaps and what still needs checking.
