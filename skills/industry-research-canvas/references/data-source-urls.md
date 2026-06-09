# Data Source URL Reference

Use this when a research task needs market data, filings, news, research reports, or web evidence. This file is provider-oriented, not project-oriented: do not assume any local repository, wrapper class, cache, or private runtime exists.

Never include API keys, bearer tokens, cookies, or private request headers in canvas nodes, examples, prompts, or final outputs.

## Source Selection

Choose sources by evidence need:

- Universe and classification: exchanges, official company lists, Tushare, AkShare, Eastmoney datacenter, iWencai.
- Price, volume, valuation, and liquidity: Tushare, iTick, Tencent quote, Eastmoney quote/fund-flow endpoints, yfinance.
- Financial statements and ratios: official filings first; Tushare, Eastmoney, Sina finance, yfinance as structured helpers.
- Announcements and primary disclosure: exchange websites and CNINFO/HKEX/SEC first.
- Research reports and consensus leads: Eastmoney report API, broker reports, company IR, transcripts.
- News and policy: official regulators, company announcements, credible media, Eastmoney/CLS feeds, Tavily/FireCrawl for discovery.
- Sentiment and crowding: fund-flow, hot-reason, Dragon Tiger Board, northbound flow, social/news leads. Treat as context, not proof.

## A-Share Sources

For a fuller browser-collection catalog and AkShare function provenance, also read `references/a-share-financial-data-sources.md`.

Primary evidence:

- CNINFO announcements and disclosures: `https://www.cninfo.com.cn`
- CNINFO historical announcement query: `https://www.cninfo.com.cn/new/hisAnnouncement/query`
- CNINFO disclosure pages: `https://www.cninfo.com.cn/new/disclosure`
- Shanghai Stock Exchange: `https://www.sse.com.cn`
- Shenzhen Stock Exchange: `https://www.szse.cn`
- Beijing Stock Exchange: `https://www.bse.cn`

Structured and market data:

- Tushare Pro: `https://tushare.pro`
- AkShare project: `https://github.com/akshare/akshare`
- Eastmoney datacenter: `https://datacenter-web.eastmoney.com/api/data/v1/get`
- Eastmoney quote/fund flow: `https://push2.eastmoney.com/api/qt/stock/get`, `https://push2.eastmoney.com/api/qt/stock/fflow/kline/get`, `https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get`
- Eastmoney list/sector data: `https://push2.eastmoney.com/api/qt/clist/get`
- Eastmoney quote pages: `https://quote.eastmoney.com`
- Tencent quote: `https://qt.gtimg.cn/q=`
- Tencent adjusted K-line: `http://web.ifzq.gtimg.cn/appstock/app/fqkline/get`
- Baidu stock quote: `https://finance.pae.baidu.com/selfselect/getstockquotation`
- Baidu related blocks: `https://finance.pae.baidu.com/api/getrelatedblock`
- Sina financial reports: `https://quotes.sina.cn/cn/api/openapi.php/CompanyFinanceService.getFinanceReport2022`

Research, news, and theme leads:

- Eastmoney report list: `https://reportapi.eastmoney.com/report/list`
- Eastmoney report PDFs: `https://pdf.dfcfw.com`
- Eastmoney search/news: `https://search-api-web.eastmoney.com/search/jsonp`, `https://so.eastmoney.com`
- Eastmoney fast news: `https://np-weblist.eastmoney.com/comm/web/getFastNewsList`, `https://kuaixun.eastmoney.com`
- CLS telegraph: `https://www.cls.cn/nodeapi/telegraphList`
- iWencai OpenAPI: `https://openapi.iwencai.com`
- iWencai/basic pages: `https://basic.10jqka.com.cn`
- Tonghuashun hot reason: `http://zx.10jqka.com.cn/event/api/getharden/`
- Hexin northbound/market data: `https://data.hexin.cn`

## Hong Kong Sources

Primary evidence:

- HKEXnews disclosures: `https://www.hkexnews.hk`
- HKEX market site: `https://www.hkex.com.hk`
- Company IR pages and annual/interim reports.

Structured and market data:

- Tushare Pro: `https://tushare.pro`
- iTick API: `https://api0.itick.org`
- AkShare project: `https://github.com/akshare/akshare`
- yfinance package/project: `https://github.com/ranaroussi/yfinance`

## US Sources

Primary evidence:

- SEC EDGAR: `https://www.sec.gov/edgar`
- Company IR pages, earnings transcripts, 10-K, 10-Q, 8-K, S-1/S-3, proxy filings.

Structured and market data:

- yfinance package/project: `https://github.com/ranaroussi/yfinance`
- iTick API: `https://api0.itick.org`
- Tushare Pro when coverage/permission is available: `https://tushare.pro`

## Web Search And Extraction

Use these for discovery, not as final proof when primary filings are available:

- Tavily API: `https://api.tavily.com`
- FireCrawl API: `https://api.firecrawl.dev/v2`
- Eastmoney MX / 妙想 structured API, when the user has access: `https://mkapi2.dfcfs.com/finskillshub/api/claw`

## Evidence Rules

- Treat official filings, exchange documents, signed contracts, tenders, standards, patents, and regulator/project records as Strong.
- Treat structured market data from reputable providers as Strong for the specific numeric field returned, but not for business-exposure claims.
- Treat media, web search, and social/sentiment endpoints as Medium or Weak unless they point to primary evidence.
- Always separate facts, interpretation, unverified leads, and missing checks.
- When a provider requires credentials or paid permission, state that access is needed; do not invent data.

## Generic Research Sequence

1. Define universe and market using exchange lists, classification sources, Tushare/AkShare/Eastmoney/iWencai, or user-provided tickers.
2. Pull market context: daily price, volume, valuation, benchmark, sector movement, and liquidity.
3. Pull company quality: financial statements, margins, cash flow, capex, leverage, receivables, inventory, and valuation history.
4. Pull primary evidence: announcements, annual/interim/quarterly reports, inquiry replies, tenders, patents, project filings, and customer validation.
5. Pull lead sources: research reports, news, policy, theme heat, fund flow, and sentiment.
6. Convert findings into Serenity canvas nodes: industry -> narrative -> system change -> layers -> bottlenecks -> companies -> evidence -> risks -> next checks.
