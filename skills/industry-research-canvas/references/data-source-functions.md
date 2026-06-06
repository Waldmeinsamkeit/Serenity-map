# Data Source Function Reference

Extracted from `E:\repo\AAA-trading-storage\app`.

Use this as a source map for industry research. It lists reusable functions and where to look; it does not copy implementation code. Before relying on exact return fields, read the original function.

## Primary Router

`app.data.aggregation.DataAggregation` is the preferred high-level entry point.

- `get_daily(code, limit, name, force_refresh)`: daily K-line, auto-routes A-share / HK.
- `get_benchmark(benchmark_code, limit, force_refresh)`: benchmark index K-line.
- `get_batch(codes, limit)`: batch daily K-line.
- `get_stock_list(market, force_refresh)`: stock universe / basic info.
- `get_institutional_research(ts_code, start_date, end_date, force_refresh)`: institutional research records.
- `get_research_reports(ts_code, start_date, end_date, force_refresh)`: broker research reports.
- `get_sector_classify(level, force_refresh)`: Shenwan industry classification.
- `get_stock_sector(ts_code)`: stock-to-sector lookup.
- `get_capital_flow(code, market, days, force_refresh)`: individual capital flow.
- `get_lhb_detail(code, days, force_refresh)`: Dragon Tiger Board details.
- `get_chip_distribution(code, market, force_refresh)`: chip distribution.
- `get_financial_ratios(code, market, force_refresh)`: financial ratio history.
- `get_valuation_percentile(code, market, force_refresh)`: PE/PB historical percentile.
- `get_peer_comparison(code, market, force_refresh)`: peer ranking.
- `get_governance_risk(code, market, force_refresh)`: governance risk.
- `get_sentiment(code, market, force_refresh)`: sentiment and market attention.
- `get_trap_signals(code, market, force_refresh)`: abnormal trading / trap signal rules.
- `deep_search(query, depth, topic, max_results, time_range)`: Tavily deep search.
- `search_company_news(name, ticker, days, max_results)`: company news search.
- `search_industry_research(industry, focus, max_results)`: industry trend / policy / competition search.
- `search_policy(topic, max_results)`: policy search.
- `get_full_picture(code, start_date, end_date, force_refresh)`: combined K-line + benchmark + research + holdings.
- `cache_status()`, `clear_cache(category)`: cache inspection and cleanup.

Industry research use:

- Candidate universe: `get_stock_list`, `get_sector_classify`, `get_stock_sector`.
- Financial quality: `get_financial_ratios`, `get_valuation_percentile`, `get_peer_comparison`.
- Market behavior: `get_daily`, `get_benchmark`, `get_capital_flow`, `get_lhb_detail`.
- Evidence: `get_research_reports`, `get_institutional_research`, `search_company_news`, `search_industry_research`, `search_policy`.
- Risk: `get_governance_risk`, `get_sentiment`, `get_trap_signals`.

## Free A-Share Sources

Folder: `app.data.sources.free_a_stock`.

### `common.py`

- `normalize_ticker(code)`: normalize ticker to pure 6-digit code.
- `get_prefix(code)`: return `sh`, `sz`, or `bj`.
- `get_market_code(code)`: Eastmoney market code.
- `tencent_prefix(code)`: Tencent prefix such as `sh600519`.
- `eastmoney_datacenter(report_name, columns, filter_str, page_size, sort_columns, sort_types)`: unified Eastmoney datacenter query.

### `layer1_market.py`

- `mootdx_kline(symbol, category, offset)`: Tongdaxin K-line.
- `mootdx_quote(symbols)`: real-time quote fields.
- `mootdx_transaction(symbol, date)`: tick transactions.
- `tencent_quote(codes)`: free batch real-time quotes.
- `tencent_index(codes)`: index quotes.
- `tencent_etf(codes)`: ETF quotes.
- `baidu_kline(code, start_time)`: Baidu K-line with moving averages.

Use for market reaction, liquidity, relative strength, and event windows.

### `layer2_research.py`

- `eastmoney_reports(code, max_pages)`: Eastmoney research report list.
- `download_report_pdf(record, target_dir)`: download report PDF.
- `ths_eps_forecast(code)`: institutional EPS consensus from THS.
- `iwencai_search(query, channel, size)`: semantic iWencai search, requires API key.
- `iwencai_query(query, page, limit)`: structured iWencai query.
- `dedup_articles(articles)`: deduplicate iWencai articles.

Use for lead generation and consensus. Verify important claims with filings.

### `layer3_signals.py`

- `ths_hot_reason(date)`: strong stocks with sector attribution.
- `ths_hot_reason_tags(date)`: theme tag frequency.
- `hsgt_realtime()`: northbound minute flow.
- `save_northbound_snapshot(date, hgt, sgt)`: save northbound daily snapshot.
- `load_northbound_history(n)`: load recent northbound history.
- `baidu_concept_blocks(code)`: concept / industry / region classification.
- `eastmoney_fund_flow_minute(code)`: intraday fund flow.
- `dragon_tiger_board(code, trade_date, look_back)`: stock-level Dragon Tiger Board.
- `daily_dragon_tiger(trade_date, min_net_buy)`: market-wide Dragon Tiger Board.
- `lockup_expiry(code, trade_date, forward_days)`: lockup calendar.
- `industry_comparison(top_n)`: industry ranking.

Use for theme heat, crowding, capital attention, and trading-risk context.

### `layer4_capital.py`

- `margin_trading(code, page_size)`: margin trading details.
- `block_trade(code, page_size)`: block trades.
- `holder_num_change(code, page_size)`: shareholder count changes.
- `dividend_history(code, page_size)`: dividend history.
- `stock_fund_flow_120d(code)`: last ~120 trading days fund flow.

Use for capital structure, shareholder behavior, and liquidity context.

### `layer5_news.py`

- `eastmoney_stock_news(code, page_size)`: stock news.
- `cls_telegraph(page_size)`: market-wide Cailian Press flash news.
- `eastmoney_global_news(page_size)`: rolling global finance news.

Use for event leads. Confirm important claims with stronger evidence.

### `layer6_fundamentals.py`

- `mootdx_finance(symbol)`: quarterly financial snapshot.
- `mootdx_f10(symbol, category)`: one F10 text category.
- `mootdx_f10_all(symbol)`: all F10 categories.
- `eastmoney_stock_info(code)`: fundamental info.
- `sina_financial_report(code, report_type)`: financial statements.

Use for revenue, profit, margin, balance sheet, segment, and company profile checks.

### `layer7_filings.py`

- `cninfo_announcements(code, page_size)`: Cninfo full-text announcement search.
- `mootdx_f10_latest_announcements(symbol)`: latest announcement summaries.

Use as the primary A-share official disclosure path.

## Tushare Source

Module: `app.data.sources.tushare_source`.

Class: `TushareHKSource`.

- `fetch_a_daily(code, limit, name)`: A-share daily K-line.
- `fetch_hk_daily(code, limit, name)`: HK daily K-line.
- `fetch_daily(code, limit, name)`: auto A/H daily K-line.
- `fetch_hk_benchmark(limit)`: Hang Seng benchmark.
- `fetch_a_stock_list()`: A-share universe.
- `fetch_hk_stock_list()`: HK Stock Connect universe.
- `fetch_institutional_research(ts_code, start_date, end_date)`: institutional research.
- `fetch_hk_holdings(ts_code, start_date, end_date)`: Stock Connect holdings.
- `fetch_moneyflow_hsgt(start_date, end_date)`: HSGT daily money flow.
- `fetch_research_reports(ts_code, start_date, end_date)`: broker research reports.
- `fetch_sector_classify(level)`: Shenwan classification.
- `fetch_stock_sector(ts_code)`: stock-to-sector lookup.

Use when `TUSHARE_TOKEN` is available and endpoint permissions are sufficient.

## UZI Multi-Source Fallback

Module: `app.data.sources.uzi_source`.

Class: `UziHKSource`.

This source tries Tushare first and falls back to akshare / baostock / yfinance / MX / Tavily depending on market and data dimension.

- `fetch_financial_ratios_series(code, market)`: financial ratios.
- `fetch_valuation_percentile(code, market)`: valuation percentile.
- `fetch_peer_industry_rank(code, market)`: peer ranking.
- `fetch_governance_risk(code, market)`: governance risk.
- `fetch_sentiment(code, market)`: sentiment.
- `fetch_trap_signals(code, market)`: abnormal trading signal.
- `fetch_industry_growth(industry_name)`: industry prosperity.
- `fetch_individual_capital_flow(code, market, days)`: capital flow.
- `fetch_lhb_detail(code, days)`: Dragon Tiger Board.
- `fetch_chip_distribution(code, market)`: chip distribution.
- `fetch_sector_classify(level)`, `fetch_stock_sector(ts_code)`: sector data.

Use when fallback robustness matters.

## MX API Source

Module: `app.data.sources.mx_api`.

- `is_mx_available()`: check whether MX API is configured.
- `query_fin_data(tool_query, timeout)`: structured financial data query.
- `query_to_text(tool_query, timeout)`: text extraction for agents.
- `search_news(query, timeout)`: structured news search.
- `search_news_to_text(query, timeout)`: text news summary.
- `screen_stocks(keyword, page_no, page_size, timeout)`: natural-language stock screening.
- `resolve_entity(name)`: resolve company / ticker entity.

Use for natural-language screening and news lead generation.

## Tavily / FireCrawl Source

Module: `app.data.sources.tavily_source`.

- `is_tavily_available()`: whether Tavily is configured.
- `is_firecrawl_available()`: whether FireCrawl fallback is configured.
- `deep_search(query)`: structured search plus answer summary.
- `search_company_news(company_name, ticker, days, max_results)`: company news.
- `search_industry_research(industry_name, focus, max_results)`: industry trend / policy / competition.
- `search_policy_analysis(topic, max_results)`: policy search.
- `fetch_webpage(url, force_raw)`: clean webpage text extraction.
- `TavilyNewsSource`: class wrapper around these functions.

Use for current public evidence discovery.

## iTick Source

Modules: `app.data.client`, `app.data.sources.itick_source`.

Class: `ITickClient`.

- Stock: `get_stock_quote`, `get_stock_kline`, `get_stock_info`, and batch variants.
- Indices: `get_indices_quote`, `get_indices_kline`, and batch variants.
- Crypto: `get_crypto_quote`, `get_crypto_kline`, and batch variants.

Class: `ITickHKSource`.

- `fetch_hk_daily(code, limit, name)`.
- `fetch_hk_benchmark(limit)`.
- `fetch_hk_batch(codes, limit)`.

Use for global quotes and K-line data when iTick credentials are configured.

## Multi-Dimension Fetch

Modules: `app.data.dimensions`, `app.data.fetch_service`.

- `detect_market(code)`: infer A/H/U/BA market.
- `make_ts_code(code)`: normalize ticker forms.
- `normalize_dimensions(dimensions)`: normalize requested data dimensions.
- `call_dimension(agg, dim, body)`: call the matching aggregation method.
- `serialize_dimension_result(result)`: JSON-serializable result.
- `source_bucket_for_dim(dim)`: source bucket for concurrency control.
- `FetchService.fetch(body)`: multi-dimension fetch with bounded concurrency.
- `FetchService.sources_payload()`: source status payload.

Use when a task needs several dimensions at once.

## Storage Helpers

Modules: `app.storage.manager`, `app.storage.duckdb_store`, `app.storage.schema`.

`DatabaseManager`:

- `save`, `load`, `has`, `list_files`, `clear_cache`.
- `save_kline`, `save_benchmark`, `load_kline`.
- `save_json_cache`, `load_json_cache`, `has_json_cache`.

`DuckDBMarketStore`:

- `query`, `query_df`.
- `import_file(table, file_path)`.
- `load_daily_bar(ts_code)`.
- `supported_tables()`.

`StorageKey` / `Category`:

- canonical routing for K-line, benchmark, research, holdings, moneyflow, reports, sector, basic, signals, capital flow, LHB, chip, financial ratios, valuation percentile, peer comparison, governance, sentiment, and trap signals.

Use storage helpers for reproducible local research and caching. Do not store API keys or secrets in research outputs.

## Recommended Industry Research Sequence

1. Define universe:
   - `DataAggregation.get_stock_list`
   - `get_sector_classify`
   - `screen_stocks` or `iwencai_query` when available
2. Build market context:
   - `get_daily`
   - `get_benchmark`
   - `industry_comparison`
3. Pull company quality:
   - `get_financial_ratios`
   - `get_valuation_percentile`
   - `get_peer_comparison`
   - `sina_financial_report`
4. Pull evidence:
   - `cninfo_announcements`
   - `get_research_reports`
   - `search_company_news`
   - `search_industry_research`
   - `search_policy`
5. Pull risk signals:
   - `get_governance_risk`
   - `get_sentiment`
   - `get_trap_signals`
   - `get_lhb_detail`
   - `holder_num_change`
6. Turn into Serenity canvas:
   - industry -> layers -> bottlenecks -> companies -> evidence / risk / next-check nodes.

Always separate evidence-backed facts, interpretation, unverified leads, and missing checks.
