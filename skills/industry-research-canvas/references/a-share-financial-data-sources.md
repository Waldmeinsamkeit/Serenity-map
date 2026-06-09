# A-Share Financial Data Sources

Use this when an A-share industry research task needs browser-accessible financial data sources, AkShare endpoint provenance, policy sources, news leads, sentiment checks, or industry/commodity fallback data.

Prefer primary filings and official regulators for evidence. Use market-data portals, news portals, and communities as leads or structured helpers, not as proof of business exposure.

## AkShare Endpoint Provenance

| # | Function prefix | Actual data source | Official URL |
|---|---|---|---|
| A01 | `stock_individual_*`, `stock_zh_a_hist`, `stock_*_em` | EastMoney | `https://quote.eastmoney.com/` |
| A02 | `stock_financial_*_sina`, `futures_main_sina` | Sina Finance | `https://finance.sina.com.cn/` |
| A03 | `stock_a_indicator_lg` | LiXinger | `https://www.lixinger.com/` |
| A04 | `macro_china_*` | NBS / PBoC | `http://www.stats.gov.cn/`, `http://www.pbc.gov.cn/` |
| A05 | `stock_hsgt_*` | HKEX / Stock Connect | `https://www.hkex.com.hk/` |
| A06 | `stock_lhb_*` | EastMoney Dragon-Tiger Board | `https://data.eastmoney.com/stock/tradedetail.html` |
| A07 | `stock_board_industry_*`, `stock_board_concept_*` | EastMoney sector/concept | `https://quote.eastmoney.com/center/boardlist.html` |
| A08 | `stock_notice_report`, `stock_share_change_cninfo` | CNINFO | `http://www.cninfo.com.cn/` |
| A09 | `stock_research_report_em` | EastMoney research reports | `https://data.eastmoney.com/report/` |
| A10 | `stock_dzjy_*` | EastMoney block trades | `https://data.eastmoney.com/dzjy/` |
| A11 | `stock_margin_*` | SSE/SZSE margin trading | `http://www.sse.com.cn/`, `http://www.szse.cn/` |
| A12 | `stock_zh_ah_spot_em`, `stock_zh_ah_daily`, `stock_zh_ah_name` | EastMoney AH premium | `https://data.eastmoney.com/stock/ahcomparison.html` |
| A13 | `stock_hsgt_individual_em`, `stock_hk_ggt_components_em` | Northbound/southbound flow | `https://data.eastmoney.com/hsgt/index.html` |
| A14 | `fund_etf_*`, `fund_new_found_em` | EastMoney Fund | `https://fund.eastmoney.com/` |
| A15 | `option_*_em` | EastMoney options | `https://data.eastmoney.com/other/cqj.html` |

## Official And Regulatory Sources

| # | Organization | URL | Use |
|---|---|---|---|
| B01 | State Council / Gov.cn | `http://www.gov.cn/` | State Council meetings, top-level policy |
| B02 | Xinhua News Agency | `http://www.xinhuanet.com/` | Politburo and official policy transcripts |
| B03 | People's Daily | `http://paper.people.com.cn/` | Official commentary and policy tone |
| B04 | People's Bank of China | `http://www.pbc.gov.cn/` | Monetary policy reports, LPR, MLF |
| B05 | NDRC | `https://www.ndrc.gov.cn/` | Industrial policy and subsidy catalogs |
| B06 | MIIT | `https://www.miit.gov.cn/` | Manufacturing plans, industry policy, production controls |
| B07 | MOST | `https://www.most.gov.cn/` | Science and technology policy |
| B08 | Ministry of Finance | `http://www.mof.gov.cn/` | Fiscal subsidies, tax policy |
| B09 | CSRC | `http://www.csrc.gov.cn/` | Listed-company regulation, IPO, delisting |
| B10 | NFRA | `http://www.nfra.gov.cn/` | Banking and insurance regulation |
| B11 | CAC | `http://www.cac.gov.cn/` | Internet, data security, platform regulation |
| B12 | National Bureau of Statistics | `http://www.stats.gov.cn/` | GDP, CPI, PPI, PMI and raw macro data |
| B13 | General Administration of Customs | `http://www.customs.gov.cn/` | Import/export data |
| B14 | CNINFO | `http://www.cninfo.com.cn/` | Statutory listed-company disclosures |
| B15 | Shanghai Stock Exchange | `http://www.sse.com.cn/disclosure/` | Shanghai market statutory disclosures |
| B16 | Shenzhen Stock Exchange | `http://www.szse.cn/disclosure/` | Shenzhen market statutory disclosures |

## Financial News And Research Leads

| # | Platform | URL | Use |
|---|---|---|---|
| C01 | CLS | `https://www.cls.cn/telegraph` | Flash news and event leads |
| C02 | THS F10 | `https://basic.10jqka.com.cn/` | Company profile, industry chain, F10 |
| C03 | THS iWencai | `http://www.iwencai.com/` | Natural-language stock screening and financial queries |
| C04 | EastMoney Guba | `https://guba.eastmoney.com/` | Retail sentiment and crowding leads |
| C05 | Economic Daily | `http://paper.ce.cn/` | State-media economic commentary |
| C06 | Yicai | `https://www.yicai.com/` | In-depth financial reporting |
| C07 | 21st Century Business Herald | `http://www.21jingji.com/` | Industry investigations |
| C08 | EastMoney reports | `https://data.eastmoney.com/report/` | Sell-side report leads |

## Sentiment Sources

Double-verify sentiment sources before using them in research conclusions.

| # | Platform | URL | Use |
|---|---|---|---|
| D01 | Xueqiu | `https://xueqiu.com/S/{code}` | Investor discussions and popular theses |
| D02 | Weibo Finance | `https://finance.weibo.com/` | Financial topics and rumor origin |
| D03 | Xiaohongshu | `https://www.xiaohongshu.com/` | Consumer product reviews for consumer stocks |
| D04 | Zhihu Finance | `https://www.zhihu.com/topic/19551432` | Long-form analytical discussions |
| D05 | Sogou WeChat search | `https://weixin.sogou.com/` | WeChat article discovery |

## Paid Or Professional Data Vendors

Use these only when the user has access. Do not invent data or imply access.

| # | Platform | URL | Use |
|---|---|---|---|
| E01 | Wind | `https://www.wind.com.cn/` | Institutional financial data |
| E02 | Choice | `https://choice.eastmoney.com/` | EastMoney terminal data |
| E03 | THS iFinD | `https://www.51ifind.com/` | THS institutional data |
| E04 | Hibor | `https://www.hibor.com.cn/` | Sell-side research report library |
| E05 | Qixinbao | `https://www.qixin.com/` | Business registration and equity penetration |
| E06 | Tianyancha | `https://www.tianyancha.com/` | Business registration, equity, litigation |

## Industry And Commodity Fallbacks

| # | Platform | URL | Use |
|---|---|---|---|
| F01 | Baiinfo / Chem99 | `http://www.chem99.com/` | Chemical, energy, and materials prices |
| F02 | 100PPI | `https://www.100ppi.com/` | Commodity spot prices |
| F03 | Wenhua Finance | `https://www.wenhua.com.cn/` | Futures quotes |
| F04 | iResearch | `https://www.iresearch.com.cn/` | Internet and consumer market share |
| F05 | CIC Consulting | `https://www.cir-inc.com/` | Consulting reports cited in HK prospectuses |
| F06 | CAAM | `http://www.caam.org.cn/` | Auto production and sales data |
| F07 | CSIA | `http://www.csia.net.cn/` | Semiconductor production, sales, and policy |
| F08 | CINNO / Sigmaintell | `https://www.cinno.com.cn/` | Display panel and consumer electronics data |

## Browser Collection Pattern

Use browser collection for pages that need interaction, dynamic loading, or visible source inspection.

```bash
agent-browser open https://data.eastmoney.com/report/
agent-browser snapshot -i

agent-browser open http://www.csrc.gov.cn/
agent-browser snapshot -i
```

For company pages, replace placeholders explicitly, for example:

```text
https://xueqiu.com/S/{code}
```

Do not store cookies, authorization headers, paid terminal screenshots, or private exports in skill examples or canvas outputs.
