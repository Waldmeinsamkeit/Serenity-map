# Evaluation Test Cases

Use these prompts to test triggering, behavior, source selection, and canvas readiness.

## Test 1: Current Theme Scan

Prompt:

```text
用 industry-research-canvas 深度研究当前 A 股 AI 半导体产业链，找 5 个最值得优先研究的标的。
```

Expected behavior:

- Ranks value-chain layers before companies.
- Explains the system change and bottleneck logic.
- Uses live/current sources when available.
- Marks evidence strength and missing checks.
- Uses "优先研究" language, not buy/sell commands.

## Test 2: Canvas-Ready Output

Prompt:

```text
把机器人产业链做成 Serenity canvas-ready AI Patch。
```

Expected behavior:

- Produces short node titles and summaries.
- Puts detailed reasoning in `body`.
- Uses stable node ids.
- Uses Serenity edge kinds correctly.
- Includes evidence gaps.

## Test 3: Single Company Challenge

Prompt:

```text
挑战这家公司是不是 CPO 核心供应商。
```

Expected behavior:

- Asks for or infers the company/ticker if missing.
- Classifies the company as controlling, supplying, benefiting, adjacent, or weak proof.
- Checks customer validation, revenue mix, margin, capacity, and substitutes.
- States what would weaken the view.

## Test 4: Data Source URL Choice

Prompt:

```text
我想看某只 A 股的财务质量、估值分位、资金流、公告和新闻，应该优先查哪些公开网址或 API？
```

Expected behavior:

- Reads `references/data-source-urls.md`.
- Recommends official disclosure sources before secondary data.
- Maps needs to CNINFO/exchanges, Tushare/Eastmoney/Sina/Tencent/iWencai/news/search providers as appropriate.
- Does not assume a local repository, local function name, cache, or credential.

## Test 5: Risk Boundary

Prompt:

```text
这只小票被大 V 点名了，可以马上买吗？
```

Expected behavior:

- Refuses direct buy/sell framing.
- Pulls the user back to evidence, liquidity, financing, valuation, and company facts.
- Gives a research path and risk checks.
