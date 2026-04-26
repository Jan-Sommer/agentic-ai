# MCP Tool Definitions

> All proposed tools organised by group (A–F). Each tool maps to one or more `forecast-backend` REST endpoints.

**SDK:** `@modelcontextprotocol/sdk@^1.26.0`  
**Auth env vars:** `SCX_API_URL` · `SCX_API_KEY` · `SCX_JWT_TOKEN` · `SCX_TENANT_ID`

---

## Group A — Forecast Intelligence

**Goal:** Answer questions about forecast quality, accuracy, and demand signals  
**Auth:** JWT · **Read-only:** Yes · **Phase:** 1 (implement first)

| Tool name | Maps to | Priority | Use case |
|-----------|---------|----------|----------|
| `list_configurations` | `GET /configurations/visible` | High | Entry point — "what can I forecast?" |
| `get_latest_predictions` | `GET /configurations/{id}/latest-predictions` | High | Current forecast output without navigating versions |
| `get_forecast_series` | `POST /forecasts/{versionId}/forecast-series` | High | "Show me the forecast for product X in region Y" |
| `get_accuracy_measures` | `POST /results/{id}/measures` | High | "How accurate is our forecast? Give me MAPE by category." |
| `list_forecast_results` | `GET /results/of-configuration/{configId}` | Medium | List all runs for a config with statuses |
| `get_portfolio_totals` | `GET /insights/portfolio-totals/forecast/{forecastId}` | High | Total forecasted units/revenue across portfolio |
| `get_planning_accuracy` | `GET /insights/planning-accuracy/{resultSetId}` | High | "Where is our forecast error coming from?" |
| `get_abc_xyz_analysis` | `GET /insights/analysis-results/{analysisId}/abc-xyz` | High | SKU segmentation by value and variability |
| `get_yearly_comparison` | `POST /insights/results/{resultSetId}/yearly-comparison` | High | Year-over-year forecast vs. actuals |
| `get_prediction_explanation` | `GET /forecasts/{forecastId}/prediction-explanation` | Medium | "Why is the forecast for SKU-123 so high?" |

### Tool: `get_accuracy_measures`

```
Input:
  resultId    string  (required)  Forecast result set ID
  groupBy     string[]            Dimensions to group by (e.g. ["product_category"])

Maps to:
  POST /api/v1/results/{resultId}/measures
  Auth: JWT Bearer
```

### Tool: `get_abc_xyz_analysis`

```
Input:
  analysisId  string  (required)  Analysis configuration ID
  filter      string              Optional class filter (e.g. "AX", "CZ")

Maps to:
  GET /api/v1/insights/analysis-results/{analysisId}/abc-xyz
  Auth: JWT Bearer
```

---

## Group B — Replenishment Risk

**Goal:** Surface supply chain risk without requiring a user in the UI  
**Auth:** JWT · **Read-only:** Yes · **Phase:** 1

| Tool name | Maps to | Priority | Use case |
|-----------|---------|----------|----------|
| `get_critical_stock` | `GET /replenishment/critical-stock` | High | "What materials are at risk of stockout?" |
| `get_stock_alert_summary` | `POST /replenishment/critical-stock/count/stock-alert-summary` | High | Counts by severity (red/yellow/green) |
| `get_material_forward_plan` | `GET /replenishment/critical-stock/forward-plan/{materialId}` | High | Replenishment plan: order dates, quantities, lead times |
| `get_safety_stock_days` | `GET /replenishment/critical-stock/forward-plan/{materialId}/location/{locationId}/safety-stock-days` | Medium | Coverage in days at a specific location |
| `get_stock_development` | `GET /replenishment/stock-development` | Medium | "When will stock drop below safety level?" |
| `get_data_freshness` | `GET /replenishment/data-upload-timestamp` | Low | Confirm Snowflake data is current before deciding |

### Tool: `get_critical_stock`

```
Input:
  filters     object   Optional filter by material group, location, plant
                       e.g. { "plant": "DE01", "material_group": "RAW" }

Maps to:
  GET /api/v1/replenishment/critical-stock
  Auth: JWT Bearer
```

---

## Group C — Forecast Execution

**Goal:** Trigger and monitor forecast runs end-to-end  
**Auth:** JWT (Admin) or API Key · **Read-only:** No · **Phase:** 2

> **Async pattern:** `execute_forecast` triggers a long-running job. The MCP server subscribes to `GET /api/v1/sse/{tenantId}`, polls for job completion, then returns the result. Set a 10-minute timeout.

| Tool name | Maps to | Priority | Use case |
|-----------|---------|----------|----------|
| `execute_forecast` | `POST /configurations/{id}/execute` | High | "Run the weekly demand forecast for config X" |

### Tool: `execute_forecast`

```
Input:
  configurationId  string  (required)  Forecast configuration to run

Maps to:
  POST /api/v1/configurations/{configurationId}/execute
  Auth: JWT Bearer or x-api-key

Warning: presents the config name to user before triggering.
         Subscribes to SSE stream for async completion.
```

---

## Group D — Consensus Workflow

**Goal:** Agent proposes overrides, human approves, agent commits  
**Auth:** JWT · **Read-only:** Mixed · **Phase:** 3 (human-in-the-loop required)

| Tool name | Maps to | Read-only | Priority |
|-----------|---------|-----------|----------|
| `get_prediction_for_consensus` | `GET /consensus/predictions/{predictionId}` | Yes | High |
| `get_consensus_dimensions` | `GET /consensus/{configId}/dimension-groups` | Yes | Medium |
| `get_consensus_history` | `GET /consensus/{consensusId}/history-logs` | Yes | Medium |
| `reconcile_forecast` | `POST /consensus/reconciliation/{configurationId}` | **No** | High |

### Tool: `reconcile_forecast`

```
Input:
  configurationId  string    (required)  Forecast config to reconcile
  overrides        object[]  (required)  Array of { predictionId, value, dimension }
  comment          string    (required)  Reason for override — mandatory

Maps to:
  POST /api/v1/consensus/reconciliation/{configurationId}
  Auth: JWT Bearer

Warning: commits overrides that change the active plan.
         ALWAYS require explicit human confirmation before executing.
```

**Workflow:** read prediction → read dimensions → propose to human → human approves → reconcile → verify in history

---

## Group E — Event Injection

**Goal:** News/feed → LLM extraction → push structured events into SCX  
**Auth:** API Key (import), JWT (reads) · **Read-only:** Mixed · **Phase:** 2  
**Note:** The import endpoint is the most AI-native surface in the system — designed for M2M use.

| Tool name | Maps to | Auth | Priority | Use case |
|-----------|---------|------|----------|----------|
| `get_extraction_topics` | `GET /event-extraction/topics` | JWT | Medium | Discover what event types SCX understands |
| `list_events` | `GET /events` | JWT | Medium | Check what events are already in the forecast |
| `import_extracted_events` | `POST /event-extraction/import` | **API Key** | High | Push LLM-extracted events from news into SCX |
| `create_event` | `POST /events` | JWT | Medium | Create a single event manually |

### Tool: `import_extracted_events`

```
Input:
  extractedEvents  object[]  (required)
    - type               string   Event type (from get_extraction_topics)
    - name               string
    - startDate          string   ISO date (YYYY-MM-DD)
    - endDate            string   ISO date
    - affectedDimensions object   e.g. { "region": "EMEA" }
    - description        string   (optional)
  source           string   News source or feed name
  articles         object[] Source articles for audit trail

Maps to:
  POST /api/v1/event-extraction/import
  Auth: x-api-key header

Warning: affects future forecast runs. Show proposed events for review first.
```

**Agentic loop:** get topics → fetch news → LLM extracts events → human reviews → import → optionally execute forecast

---

## Group F — Commodity Pricing

**Goal:** Price intelligence and hedging recommendations for procurement  
**Auth:** JWT · **Read-only:** Yes · **Phase:** 1

| Tool name | Maps to | Priority | Use case |
|-----------|---------|----------|----------|
| `list_commodity_materials` | `GET /commodity-price/materials` | Medium | Discover tracked commodities |
| `get_commodity_summary` | `GET /commodity-price/home-cards` | High | Snapshot: price, trend, alerts per commodity |
| `get_commodity_price_trend` | `GET /commodity-price/trend` | High | "Is copper trending up or down?" |
| `get_hedging_recommendation` | `POST /commodity-price/hedging` | High | "Should we hedge Q4 copper purchases?" |
| `get_commodity_news` | `GET /commodity-price/news` | Medium | "What's driving the aluminum price spike?" |

### Tool: `get_hedging_recommendation`

```
Input:
  materialId  string  (required)  Commodity material ID
  horizon     string  (required)  Planning horizon (e.g. "Q4-2026" or "6M")
  volume      number              Forecasted consumption in base UOM
  strategy    enum                conservative | balanced | aggressive (default: balanced)

Maps to:
  POST /api/v1/commodity-price/hedging
  Auth: JWT Bearer

Note: pure calculation — no state mutation despite being a POST.
```

---

## Rollout Phases

| Phase | Groups | Risk | Description |
|-------|--------|------|-------------|
| 1 | A, B, F | None | Read-only — zero risk of data mutation |
| 2 | C, E | Low–Medium | Write operations with user confirmation |
| 3 | D | Medium | Consensus commits — full human-in-the-loop flow |
