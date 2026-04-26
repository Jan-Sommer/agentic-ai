# Internal API: Replenishment Planning

> Entirely read-only. High-value MCP surface for proactive supply chain alerting.  
> Data sourced from **Snowflake** (per-tenant) — not PostgreSQL.

## Critical Stock

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/replenishment/critical-stock`** | **JWT** | **Standard** | **B** | List all at-risk materials |
| **POST** | **`/replenishment/critical-stock/count/stock-alert-summary`** | **JWT** | **Standard** | **B** | Aggregated counts by severity (red/yellow/green) |
| **GET** | **`/replenishment/critical-stock/forward-plan/{materialId}`** | **JWT** | **Standard** | **B** | Forward replenishment plan for a material |
| GET | `/replenishment/critical-stock/forward-plan/{materialId}/areas` | JWT | Standard | **B** | Storage/distribution areas |
| **GET** | **`/replenishment/critical-stock/forward-plan/{materialId}/location/{locationId}/safety-stock-days`** | **JWT** | **Standard** | **B** | Safety stock coverage in days |
| GET | `/replenishment/critical-stock/forward-plan/{materialId}/suppliers` | JWT | Standard | **B** | Supplier list for a material |
| GET | `/replenishment/critical-stock/forward-plan/{materialId}/material-description` | JWT | Standard | **B** | Material master data |
| GET | `/replenishment/critical-stock/forward-plan/{materialId}/params` | JWT | Standard | **B** | Lead times, MOQ, planning parameters |
| GET | `/replenishment/critical-stock/forward-plan/{materialId}/uom-conversions` | JWT | Standard | — | UOM conversion factors (internal use) |

**Example agent question:** *"Which materials are at risk of stockout in the next two weeks? For each, show the recommended order date and quantity."*

## Sales History

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/replenishment/critical-stock/forecast-sales-history/{materialId}/data`** | **JWT** | **Standard** | **B** | Raw sales history time series |
| **GET** | **`/replenishment/critical-stock/forecast-sales-history/{materialId}/comparison`** | **JWT** | **Standard** | **B** | Sales actuals vs. forecast side-by-side |
| GET | `/replenishment/critical-stock/forecast-sales-history/forecast-versions` | JWT | Standard | — | Available versions for comparison (selector data) |
| GET | `/replenishment/critical-stock/forecast-sales-history/{materialId}/source-ids` | JWT | Standard | — | Sales history source IDs |

## Stock Development & Metadata

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/replenishment/stock-development`** | **JWT** | **Standard** | **B** | Projected stock levels over time |
| **GET** | **`/replenishment/data-upload-timestamp`** | **JWT** | **Standard** | **B** | Last Snowflake data refresh timestamp |
| GET | `/replenishment/planning-filter` | JWT | Standard | — | Available filter dimensions (UI use) |

**Example agent question:** *"When will material M-4721 dip below safety stock? How fresh is the underlying data?"*

---

> **Data freshness note:** Always call `data-upload-timestamp` before making replenishment decisions to confirm the Snowflake data is current.

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `get_critical_stock` | `GET /replenishment/critical-stock` | "Which materials are at risk of stockout in the next two weeks?" |
| `get_stock_alert_summary` | `POST /replenishment/critical-stock/count/stock-alert-summary` | "How many materials are in red/yellow/green stock status?" |
| `get_forward_plan` | `GET /replenishment/critical-stock/forward-plan/{materialId}` | "What's the recommended order date and quantity for material M-4721?" |
| `get_safety_stock_days` | `GET /replenishment/.../safety-stock-days` | "How many days of safety stock coverage does M-4721 have at location L-5?" |
| `get_sales_vs_forecast` | `GET /replenishment/critical-stock/forecast-sales-history/{materialId}/comparison` | "How does actual sales compare to the forecast for M-4721?" |
| `get_stock_development` | `GET /replenishment/stock-development` | "When will material M-4721 dip below safety stock? Show the projected timeline." |
| `get_data_freshness` | `GET /replenishment/data-upload-timestamp` | "How current is the replenishment data? When was Snowflake last refreshed?" |

> **Agent pattern:** Always call `get_data_freshness` first. If data is stale (>24h), warn the user before presenting replenishment recommendations.
