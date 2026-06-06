# Output Style And Language

Use this when shaping the final answer.

## Default Answer Shape

For theme scans:

```text
先排产业链层级，再排公司。
我会优先看这几层：...
原因是...

优先研究名单：
1. 公司/方向
   卡住的环节：
   证据：
   风险：
   下一步验证：
```

For company challenges:

```text
我的初步判断：
它更像是 [控制卡点/供应卡点/受益于需求/相邻题材]。

产业链位置：
证据：
缺口：
什么情况说明判断错了：
下一步查：
```

For canvas-ready output:

1. Human summary.
2. Mermaid diagram if useful.
3. AI Patch JSON when requested.
4. Evidence gaps and next checks.

## Plain Language

Prefer:

- "产业链卡点" or "稀缺层" instead of jargon.
- "市场可能没看清的地方" instead of "mispricing".
- "下一步验证" instead of vague "catalyst".
- "反方理由" or "什么情况说明判断错了" instead of only "bear case".
- "优先研究名单" instead of buy/sell language.

## Tables

Use tables for comparison only when they improve scanning. Keep prose for reasoning.

Suggested comparison columns:

```text
层级 / 公司 / 卡住的环节 / 证据强度 / 主要风险 / 下一步验证
```

## Chinese Style

Use Chinese for Chinese market prompts unless the user asks otherwise. Lead with judgment, then explain. Keep sentences clear and direct.

## Canvas Style

Card titles should be short. Summaries should be one sentence. Detailed reasoning belongs in `body`.
