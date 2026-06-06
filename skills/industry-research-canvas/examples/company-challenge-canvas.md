# Example: Single Company Challenge

## Prompt Shape

```text
用 industry-research-canvas 挑战某公司是不是 CPO 核心供应商。
```

## Answer Shape

我的初步判断：先不要把它直接归为“控制卡点”。要先确认它是在光模块、光芯片、连接器、封装测试、设备、材料还是客户认证环节。

## Canvas Mapping

- Company node: 公司名称、代码、产业链位置。
- Bottleneck node: 它声称控制的卡点。
- Evidence nodes: 年报、公告、客户认证、订单、产能、毛利率。
- Risk nodes: 客户替代、价格压力、收入占比太小、估值已反映。
- Next-check node: 下一步查哪些文件和指标。

## AI Patch Sketch

```json
{
  "version": 1,
  "intent": "Challenge a company's claimed bottleneck position.",
  "operations": [
    {
      "op": "addNode",
      "id": "node-company-claim",
      "title": "公司卡点主张",
      "summary": "先验证它到底卡在哪一层。",
      "body": "需要确认产业链位置、客户认证、收入占比、毛利率和替代供应商。",
      "tags": ["company", "question"],
      "status": "question"
    }
  ]
}
```
