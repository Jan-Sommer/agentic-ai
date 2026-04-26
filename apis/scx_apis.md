# Pacemaker v2 (SCX) — API Inventory

> Scanned from `pacemaker-v2` monorepo (NestJS + Angular 20, Nx workspace).  
> Goal: identify where an MCP server could be placed to expose SCX capabilities to AI agents.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
│          forecast-frontend  │  admin-frontend                │
└────────────────┬────────────┴────────────┬───────────────────┘
                 │                          │
                 ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│               forecast-backend  (NestJS API)                 │
│  Global prefix: /api  │  Versioned: /api/v1/                 │
│  Swagger UI:   /api/docs  (dev only)                         │
│  Auth:         Keycloak JWT  +  API Key (x-api-key)          │
└──┬──────────┬──────────┬───────────┬───────────┬────────────┘
   │          │          │           │           │
   ▼          ▼          ▼           ▼           ▼
Forecast   Batch API  Keycloak  Snowflake  PostgreSQL
Pipeline   (jobs)     (auth)    (replen.)  (primary DB)
(ML/Python)
```

**Apps:**
- `apps/forecast-backend` — NestJS REST API (primary, ~47 controllers)
- `apps/forecast-frontend` — Angular 20 user-facing SPA
- `apps/admin-frontend` — Angular 20 admin dashboard
- `apps/keycloak` — Keycloak identity provider config

---

## Part 1 — Internal APIs (Exposed by forecast-backend)

All endpoints are versioned under `/api/v1/`. Auth is JWT (Bearer) unless noted.

> **Roles:** `SuperAdmin > Admin > Standard`

---

### 1.1 Forecast Configuration

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/configurations` | Admin | Create a new forecast configuration |
| GET | `/configurations` | Admin | List all configurations |
| GET | `/configurations/visible` | Standard+ | List configurations visible to user |
| GET | `/configurations/:id` | Standard+ | Get single configuration |
| PUT | `/configurations/:id` | Standard+ | Update configuration |
| DELETE | `/configurations/:id` | Admin | Delete configuration |
| POST | `/configurations/:id/execute` | Admin | Trigger forecast run (JWT or API Key) |
| GET | `/configurations/:id/latest-predictions` | Standard+ | Fetch latest prediction output |
| PUT | `/configurations/:configId/widget-view` | Admin | Update dashboard widget layout |

**MCP opportunity:** An agent could list available configurations, trigger a forecast run, and poll for results — core automation loop.

---

### 1.2 Forecast Data & Series

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/forecasts/:versionId/forecast-series` | Standard+ | Retrieve forecast series data |
| PUT | `/forecasts/:pipelineForecastId/forecast-series` | Standard+ | Override/update series values |
| GET | `/forecasts/:configId/filter-combinations` | Standard+ | List saved filter presets |
| POST | `/forecasts/:configId/filter-combinations` | Standard+ | Save a filter preset |
| DELETE | `/forecasts/:configId/filter-combinations/:id` | Standard+ | Delete filter preset |
| GET | `/forecasts/:versionId/available-filters` | Standard+ | Get filterable dimensions for version |
| GET | `/forecasts/:forecastId/get-timespan` | Standard+ | Get date range of forecast |
| GET | `/forecasts/:forecastId/prediction-explanation` | Standard+ | ML explainability output |
| GET | `/forecasts/:forecastId/download-batch-api-logs` | Standard+ | Download job logs |

---

### 1.3 Results & Reporting

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/results/:id` | Standard+ | Get a forecast result set |
| GET | `/results/of-configuration/:configId` | Standard+ | All results for a config (JWT or API Key) |
| GET | `/results/` | Standard+ | Get multiple results by IDs |
| POST | `/results/:id/measures` | Standard+ | Calculate accuracy measures |
| POST | `/results/:id/future-measures` | Standard+ | Calculate future accuracy measures |
| POST | `/results/:id/export` | Standard+ | Queue an export job |
| PUT | `/results/:id` | Admin | Update forecast version metadata |
| DELETE | `/results/:id` | Admin | Delete result set |
| GET | `/results/:versionId/invalid-quick-filters` | Standard+ | Check filter validity |
| POST | `/results/of-configuration/:configId/reporting-data/init` | Standard+ | Initialize server-side row model (SSRM) |
| POST | `/results/of-configuration/:configId/reporting-data/query` | Standard+ | Paginated SSRM query |
| POST | `/results/of-configuration/:configId/reporting-data/import` | Admin | Import reporting data |

**MCP opportunity:** Querying results and accuracy measures is a high-value read surface for agents doing demand review.

---

### 1.4 Data Sources

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/datasource-info` | Standard+ | List connected data sources |
| GET | `/datasource-info/:id` | Standard+ | Get data source details |
| DELETE | `/datasource-info/:id` | Standard+ | Remove data source |
| GET | `/datasource-info/:id/numeric-columns` | Standard+ | Numeric columns available |
| GET | `/datasource-info/:id/categorical-columns` | Standard+ | Categorical columns available |
| GET | `/datasource-info/:id/distinct/:column` | Standard+ | Distinct values in a column |
| POST | `/datasource-info/:id/update` | Standard+ | Refresh data source |
| GET | `/datasource-info/:id/number-of-forecast-versions` | Standard+ | Count of versions |

---

### 1.5 Export

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/export/:id/generate-export` | Standard+ | Queue export job (CSV/Excel) |
| GET | `/export/download/:exportId` | Standard+ | Download completed export file |

---

### 1.6 Insights & Analytics

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/insights/portfolio-totals/forecast/:forecastId/` | Standard+ | Portfolio-level totals summary |
| GET | `/insights/portfolio-totals-multi-year/forecast/:forecastId/` | Standard+ | Multi-year portfolio totals |
| POST | `/insights/results/:resultSetId/year-to-date-trend/:filterName` | Standard+ | YTD trend analysis |
| POST | `/insights/results/:resultSetId/single-forecasts` | Standard+ | Single item forecast insights |
| POST | `/insights/results/:resultSetId/yearly-comparison` | Standard+ | Year-over-year comparison |
| GET | `/insights/analysis-results/:analysisId/abc-xyz` | Standard+ | ABC-XYZ classification |
| GET | `/insights/analysis-results/:analysisId/planning-accuracy` | Standard+ | Planning accuracy report |
| GET | `/insights/yearly-portfolio-totals/:resultSetId` | Standard+ | Yearly breakdown |
| GET | `/insights/planning-accuracy/:resultSetId` | Standard+ | Forecast vs. actuals accuracy |

**MCP opportunity:** Highest-value read surface. An agent could answer "how accurate is our forecast?" or "which SKUs have high XYZ volatility?" without any custom integration.

---

### 1.7 Consensus Planning

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/consensus/:configId/dimension-groups` | Standard+ | Get hierarchical dimensions |
| GET | `/consensus/:configId/available-columns` | Standard+ | List editable columns |
| GET | `/consensus/:consensusId/history-logs` | Standard+ | Full edit audit trail |
| GET | `/consensus/templates` | Standard+ | List consensus templates |
| POST | `/consensus/templates` | Standard+ | Create consensus template |
| GET | `/consensus/predictions/:predictionId` | Standard+ | Get prediction for consensus edit |
| POST | `/consensus/reconciliation/:configId` | Standard+ | Reconcile and commit forecast |

**MCP opportunity:** Enables a human-in-the-loop agent pattern: agent reads forecast, proposes adjustments, human reviews in UI, agent triggers reconciliation.

---

### 1.8 Events & Event Variables

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/events` | Standard+ | List all events |
| POST | `/events` | Standard+ | Create event (promotion, holiday, etc.) |
| PUT | `/events/:id` | Standard+ | Update event |
| DELETE | `/events/:id` | Standard+ | Delete event |
| GET | `/events/event-variables` | Standard+ | List event variables |
| POST | `/events/event-variables` | Standard+ | Create event variable |
| PUT | `/events/event-variables/:id` | Standard+ | Update event variable |
| DELETE | `/events/event-variables/:id` | Standard+ | Delete event variable |
| GET | `/events/event-variables/names` | Standard+ | List variable names |

---

### 1.9 Event Extraction (NLP Pipeline)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/event-extraction/import` | API Key | Import events extracted from external articles |
| GET | `/event-extraction/articles-table` | Standard+ | Get processed articles data |
| GET | `/event-extraction/topics` | Standard+ | List available topic categories |

**MCP opportunity:** An agent could read articles/topics and push structured events into the system — clear AI-first feature.

---

### 1.10 Replenishment Planning

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/replenishment/critical-stock` | Standard+ | List critical stock items |
| POST | `/replenishment/critical-stock/count/stock-alert-summary` | Standard+ | Aggregate stock alert summary |
| GET | `/replenishment/critical-stock/forward-plan/:materialId` | Standard+ | Forward replenishment plan |
| GET | `/replenishment/critical-stock/forward-plan/:materialId/areas` | Standard+ | Replenishment areas |
| GET | `/replenishment/critical-stock/forward-plan/:materialId/location/:locationId/safety-stock-days` | Standard+ | Safety stock days |
| GET | `/replenishment/critical-stock/forward-plan/:materialId/suppliers` | Standard+ | Suppliers for material |
| GET | `/replenishment/critical-stock/forward-plan/:materialId/material-description` | Standard+ | Material master data |
| GET | `/replenishment/critical-stock/forward-plan/:materialId/params` | Standard+ | Forward plan parameters |
| GET | `/replenishment/critical-stock/forward-plan/:materialId/uom-conversions` | Standard+ | Unit-of-measure conversions |
| GET | `/replenishment/critical-stock/forecast-sales-history/:materialId/source-ids` | Standard+ | Sales history source IDs |
| GET | `/replenishment/critical-stock/forecast-sales-history/forecast-versions` | Standard+ | Available forecast versions |
| GET | `/replenishment/critical-stock/forecast-sales-history/:materialId/data` | Standard+ | Raw sales history |
| GET | `/replenishment/critical-stock/forecast-sales-history/:materialId/comparison` | Standard+ | Sales vs. forecast comparison |
| GET | `/replenishment/stock-development` | Standard+ | Stock level development over time |
| GET | `/replenishment/data-upload-timestamp` | Standard+ | Last data refresh timestamp |
| GET | `/replenishment/planning-filter` | Standard+ | Available planning filters |

**MCP opportunity:** An agent could answer "which materials are at risk?" and surface critical stock situations without requiring a user to open the UI.

---

### 1.11 Commodity Price Forecasting

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/commodity-price/materials` | Standard+ | List tracked commodity materials |
| GET | `/commodity-price/versions` | Standard+ | Get forecasted price versions |
| GET | `/commodity-price/chart-dataframe` | Standard+ | Chart data including hedging |
| GET | `/commodity-price/trend` | Standard+ | LME price trend data |
| GET | `/commodity-price/home-cards` | Standard+ | Summary cards per material |
| GET | `/commodity-price/data-source` | Standard+ | Data source metadata |
| POST | `/commodity-price/cpf` | Admin | Create commodity price forecast |
| POST | `/commodity-price/hedging` | Standard+ | Calculate hedging recommendation |
| POST | `/commodity-price/import` | API Key | Import price data |
| GET | `/commodity-price/news` | Standard+ | Latest price-relevant news |

**MCP opportunity:** An agent could retrieve commodity price forecasts and hedging recommendations to support procurement decisions.

---

### 1.12 Analysis & Portfolio

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/analysis` | Standard+ | List analysis configurations |
| POST | `/analysis` | Admin | Create new analysis |
| DELETE | `/analysis/:id` | Admin | Delete analysis |
| GET | `/analysis-configurations/:configId` | Standard+ | Get analysis config detail |
| POST | `/analysis-exports/:analysisId` | Standard+ | Export analysis results |

---

### 1.13 Grid Views (UI State)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/grid-views` | Standard+ | List saved grid views |
| GET | `/grid-views/default` | Standard+ | Get default view |
| POST | `/grid-views` | Standard+ | Save current view |
| PATCH | `/grid-views/:id` | Standard+ | Update view |
| DELETE | `/grid-views/:id` | Standard+ | Delete view |

---

### 1.14 Feature Flags & Settings

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/feature-flags` | Standard+ | Get active feature flags for user |
| GET | `/settings` | Standard+ | Get application settings |
| PUT | `/settings/:id` | Admin | Update application settings |

---

### 1.15 Users & Authentication

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/authentication/add-user-from-keycloak` | Standard+ | Register a Keycloak user locally |
| GET | `/admin/users/company/:companyId` | Admin | List users for a company |
| POST | `/admin/users` | Admin | Create user |
| PUT | `/admin/users/:userId` | Admin | Update user |
| DELETE | `/admin/users/:userId` | Admin | Delete user |
| GET | `/admin/users/roles` | Admin | Get available roles |
| GET | `/admin/users/roles/realm/:realmId` | Admin | Get roles in realm |
| GET | `/admin/users/realm/:realmId` | Admin | List users in realm |
| POST | `/admin/users/:userId/assign-superadmin` | SuperAdmin | Assign super admin |
| DELETE | `/admin/users/:userId/revoke-superadmin` | SuperAdmin | Revoke super admin |

---

### 1.16 Company Management

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/companies` | Admin | Create company |
| GET | `/companies` | Admin | List all companies |
| POST | `/companies/shared-realm` | Admin+ | Create shared Keycloak realm |
| POST | `/companies/:companyId/migrate-to-dedicated-realm` | SuperAdmin | Migrate to dedicated realm |
| DELETE | `/companies/:companyId` | SuperAdmin | Delete company |
| GET | `/companies/in-realm/:realmId` | Admin | Get companies in realm |
| GET | `/companies/:companyName` | API Key | Get company by name (machine-to-machine) |

---

### 1.17 Notifications & Comments

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Standard+ | Get notifications for user |
| GET | `/notifications/unread-count` | Standard+ | Get unread notification count |
| PUT | `/notifications/:id/read` | Standard+ | Mark notification as read |
| GET | `/comments` | Standard+ | List comments |
| POST | `/comments` | Standard+ | Create comment |
| DELETE | `/comments/:id` | Standard+ | Delete comment |

---

### 1.18 Subscriptions

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/subscriptions` | Admin | Get subscriptions |
| POST | `/subscriptions` | Admin | Create subscription |
| GET | `/admin/subscriptions/:companyId` | Admin | Get company subscription |
| POST | `/admin/subscriptions` | Admin | Admin create subscription |

---

### 1.19 Real-Time (SSE) & Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sse/:tenantId` | JWT | Server-Sent Events stream for job progress |
| GET | `/health/live` | Public | Kubernetes liveness probe |
| GET | `/health/ready` | Public | Readiness probe (DB, Redis, memory) |
| GET | `/health/replenishment` | Public | Replenishment connector health |

---

## Part 2 — External APIs (Consumed by forecast-backend)

### 2.1 Forecast Pipeline (ML Service)

| | |
|---|---|
| **Type** | Internal REST (Python) |
| **Base URL** | `FORECAST_PIPELINE_URL` (default: `http://localhost:5000`) |
| **Auth** | None (internal network) |
| **Client** | Custom Axios wrapper |

**Operations:**
- Submit forecast jobs (async fire-and-forget)
- Fetch forecast results and accuracy metrics
- Export CSV/Excel predictions
- Query aggregated results

**MCP opportunity:** Wrap as a tool that submits a job and polls for completion, abstracting the async complexity.

---

### 2.2 Batch API (Job Queue)

| | |
|---|---|
| **Type** | Internal REST |
| **Base URL** | `BATCH_API_URL` (default: `http://localhost:8000`) |
| **Auth** | API Key (`x-api-key` header) |

**Operations:**
- `POST /submit_task` — Queue a forecast calculation job
- `POST /delete_task` — Cancel/delete a queued job
- Download job execution logs

---

### 2.3 Keycloak (Identity & Access Management)

| | |
|---|---|
| **Type** | OAuth2/OIDC + Admin REST API |
| **Base URL** | `KEYCLOAK_URL` (e.g. `https://auth.pacemaker.ai`) |
| **Auth** | Admin credentials (`KEYCLOAK_ADMIN_USER` / `KEYCLOAK_ADMIN_PASSWORD`) |

**Operations:**
- JWT token validation (all inbound requests)
- Realm creation/deletion (multi-tenancy)
- User CRUD, role assignment
- Azure AD identity provider configuration

---

### 2.4 Snowflake (Replenishment Data Warehouse)

| | |
|---|---|
| **Type** | SQL/SDK |
| **Auth** | Private key (`SNOWFLAKE_REPLENISHMENT_TU_PRIVATE_KEY`) |
| **Tenancy** | Separate connection per tenant |

**Operations:**
- Critical stock queries
- Forward planning data (supplier, material, UOM)
- Sales history and purchase/sales orders
- Safety stock parameters

---

### 2.5 Flagsmith (Feature Flags)

| | |
|---|---|
| **Type** | REST API + `flagsmith-nodejs` SDK |
| **Base URL** | `FLAGSMITH_URL` |
| **Auth** | `FLAGSMITH_ENVIRONMENT_KEY` |

**Operations:**
- Check feature flag state per identity (user/company)
- Read flag values (e.g. batch pool ID, hedging toggle)

---

### 2.6 Azure Graph API (Enterprise Integration)

| | |
|---|---|
| **Type** | OAuth2 REST API |
| **Base URLs** | `login.microsoftonline.com`, `graph.microsoft.com` |
| **Auth** | Client credentials flow (`AZURE_DIRECTORY_TENANT_ID`, `AZURE_APPLICATION_CLIENT_ID`, `AZURE_APPLICATION_CLIENT_SECRET`) |

**Operations:**
- Read/update Azure AD app registrations
- Add/remove OAuth2 redirect URIs (for Keycloak OIDC setup)
- Create shared realms

---

### 2.7 Azure Blob Storage

| | |
|---|---|
| **Type** | Cloud object storage |
| **Auth** | Account key (`AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_ACCOUNT_KEY`) |

**Operations:**
- Upload forecast exports and reports
- Download export files
- Periodic file cleanup

---

### 2.8 SMTP / Email (Office 365)

| | |
|---|---|
| **Type** | SMTP via Nodemailer |
| **Host** | `MAIL_SMTP_HOST` (default: `smtp.office365.com:587`) |
| **Auth** | `MAIL_SMTP_USER` / `MAIL_SMTP_PASSWORD` |

**Operations:**
- Send system notifications
- Deliver scheduled reports

---

### 2.9 Redis

| | |
|---|---|
| **Type** | In-memory store + BullMQ queue |
| **Config** | `REDIS_HOST:REDIS_PORT`, topic prefix: `scx` |
| **Auth** | Optional password |

**Operations:**
- Response caching
- BullMQ-backed async export job queue
- Real-time SSE progress relay
- Cross-tab synchronization

---

### 2.10 PostgreSQL (Primary Database)

| | |
|---|---|
| **Type** | SQL via Sequelize ORM |
| **Config** | `POSTGRES_HOST/PORT/USER/PASSWORD/DB` |
| **Tenancy** | Separate database per tenant |

**Operations:**
- Store configurations, forecasts, events, consensus plans, users, comments, notifications
- Umzug-based schema migrations

---

### 2.11 Sentry (Observability)

| | |
|---|---|
| **Type** | SDK (`@sentry/nestjs`) |
| **Auth** | DSN (environment-based) |

**Operations:**
- Exception capture with multi-tenant context
- Performance tracing
- Release tracking

---

## Part 3 — Authentication Summary

| Mechanism | Header | Used For |
|-----------|--------|----------|
| **JWT Bearer** | `Authorization: Bearer {token}` | All standard user-facing endpoints |
| **API Key** | `x-api-key: {key}` | Machine-to-machine: event extraction import, commodity price import, batch triggers, company lookup |
| **Multi-Auth** | JWT or API Key | `/configurations/:id/execute`, `/results/of-configuration/:configId` |
| **Public** | — | `/health/*` probes only |

---

## Part 4 — Existing API Specifications

Understanding what machine-readable specs already exist is critical for deciding how to build the MCP server — whether to code-gen from a spec or hand-write tools against the live API.

---

### 4.1 Hand-Written OpenAPI 3.0 YAML Files

Five partial OpenAPI specs live in `apps/forecast-backend/src/app/adapters/rest/openapi/`. These appear to document **inbound API contracts for external consumers** and the **ML backend**:

| File | Size | Domain | Version | Coverage |
|------|------|--------|---------|----------|
| `forecast_pipeline_v1.yaml` | 1,543 lines | ML forecasting backend (Python) | 2.0.1 | **Complete** — full request/response schemas |
| `forecast_v1_external-data.yaml` | 653 lines | Events, event-variables, extra forecasts | v1 | Partial |
| `forecast_v1_datasource.yaml` | 409 lines | Data source / mapping operations | v1 | Partial |
| `forecast_v1_company.yaml` | 268 lines | Company CRUD, logo upload | v2 | Partial |
| `forecast_v1_demo.yaml` | 47 lines | Demo company seeding | v2 | Minimal |

**What these specs cover (paths):**

`forecast_pipeline_v1.yaml` — The ML backend (not the NestJS API):
- `POST /run-forecast`, `POST /run-forecasts` — synchronous forecast execution
- `POST /start-forecast`, `POST /start-forecasts` — async forecast submission
- `GET /forecast-status/{forecast_id}` — job polling
- `POST /get-forecast-result` — fetch completed result
- `POST /calculate-future-measure`, `POST /calculate-benchmark-measure`, `POST /compare-benchmarks`
- `POST /export-result-csv`, `POST /get-forecast-data`, `POST /repredict`
- `DELETE /delete-forecast/{forecast_id}`, `POST /clear-forecasts`
- `POST /stop-forecast/{forecast_id}`, `POST /stop-forecasts`
- `GET /get-holiday-countries`, `GET /get-filters`

`forecast_v1_external-data.yaml`:
- `GET/POST /events`, `PUT/DELETE /events/{_id}`
- `GET/POST /events/event-variables`, `PUT/DELETE /events/event-variables/{_id}`
- `GET /events/event-variables/names`
- `GET /forecasts/{forecastId}/extraForecasts`
- `GET /configurations/holiday/countires-with-subdivisions`

`forecast_v1_datasource.yaml`:
- `GET /data/mapping`, `GET /data/mapping/filters-for-multiple`
- `GET/PUT /data/mapping/{_id}`
- `GET /data/input/{_id}/range/{date}`
- `GET /data/input/distinct/{_id}/{column}`
- `GET /data/input/{_id}/{limit}` (preview)

`forecast_v1_company.yaml`:
- `POST/GET /companies`
- `POST /companies/{_id}/upload-logo`, `DELETE /companies/{_id}/logo`
- `DELETE /companies/{_id}`
- `POST /companies/change-admin-password`

> **Note:** The path patterns in some hand-written specs (e.g. `/data/mapping`, `/data/input`) differ from the current NestJS routes (e.g. `/datasource-info`), suggesting these specs were written for an **older version** of the API or a separate service layer and may not be fully aligned with the current codebase.

---

### 4.2 NestJS Auto-Generated Swagger (Development Only)

The NestJS backend (`main.ts`) sets up Swagger UI via `@nestjs/swagger`, but with two critical limitations:

```typescript
// Only enabled in development
if (env.NODE_ENV === NodeEnv.Development) {
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Forecast-Backend API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs', app, document);
}
```

**Swagger UI URL (dev):** `http://localhost:{PORT}/docs`

**Coverage of `@Api*` decorators across the codebase:**

| Decorator | Files using it |
|-----------|---------------|
| `@ApiProperty`, `@ApiOperation`, `@ApiResponse`, `@ApiTags`, `@ApiBody`, `@ApiParam` | **1 file** (`health.controller.ts`) |

The auto-generated spec is **structurally present but nearly empty** — almost no controller uses the NestJS Swagger decorators, so the generated document will expose endpoint paths but without request body schemas, response types, or parameter descriptions.

---

### 4.3 Summary: Specification Coverage

| API Surface | OpenAPI Spec? | Quality | Usable for MCP codegen? |
|-------------|--------------|---------|------------------------|
| Forecast Pipeline (ML backend) | ✅ `forecast_pipeline_v1.yaml` | Complete, versioned (2.0.1) | **Yes — ready to use** |
| Events & Event Variables | ✅ `forecast_v1_external-data.yaml` | Partial, may be outdated | With verification |
| Company Management | ✅ `forecast_v1_company.yaml` | Partial, may be outdated | With verification |
| Data Sources | ✅ `forecast_v1_datasource.yaml` | Partial, different path patterns | Needs update |
| Demo seeding | ✅ `forecast_v1_demo.yaml` | Minimal | Not relevant for MCP |
| **All other endpoints** (Results, Insights, Replenishment, Consensus, Commodity Prices, Exports, etc.) | ❌ None | — | **Must be hand-written or spec generated** |
| NestJS Swagger auto-gen (`/docs`) | ⚠️ Dev only | Paths only, no schemas | Not sufficient alone |

**Bottom line:** The main `forecast-backend` REST API — covering roughly 80% of the endpoints documented in Parts 1–3 — has **no machine-readable spec**. The most complete spec is for the internal ML pipeline service. Building an MCP server will require either:

1. **Adding `@ApiDecorators` to NestJS controllers** and generating the spec from the running dev server, or
2. **Hand-authoring tools** against the live API using the endpoint inventory in this document, or
3. **Using the Forecast Pipeline spec directly** for the ML-layer MCP tools (Group C in Part 5)

---

## Part 5 — MCP Server Placement Analysis

### Where to place an MCP server

An MCP server would sit between an AI agent (Claude, GPT, etc.) and the `forecast-backend` REST API, translating tool calls into authenticated HTTP requests. Here are the most valuable surfaces:

---

#### MCP Tool Group A — Forecast Intelligence (Read-Only, High Value)

> **Goal:** Let agents answer questions about forecast quality and demand signals.

| MCP Tool | Maps to |
|----------|---------|
| `list_configurations` | `GET /configurations/visible` |
| `get_forecast_results` | `GET /results/of-configuration/:configId` |
| `get_accuracy_metrics` | `POST /results/:id/measures` |
| `get_abc_xyz_analysis` | `GET /insights/analysis-results/:analysisId/abc-xyz` |
| `get_portfolio_totals` | `GET /insights/portfolio-totals/forecast/:forecastId/` |
| `get_yearly_comparison` | `POST /insights/results/:resultSetId/yearly-comparison` |
| `get_prediction_explanation` | `GET /forecasts/:forecastId/prediction-explanation` |

**Use case:** *"Which product categories have forecast accuracy below 70% this quarter?"*

---

#### MCP Tool Group B — Replenishment Risk (Read-Only, Operational)

> **Goal:** Surface supply chain risk without requiring a user to log in.

| MCP Tool | Maps to |
|----------|---------|
| `get_critical_stock` | `GET /replenishment/critical-stock` |
| `get_stock_alert_summary` | `POST /replenishment/critical-stock/count/stock-alert-summary` |
| `get_forward_plan` | `GET /replenishment/critical-stock/forward-plan/:materialId` |
| `get_stock_development` | `GET /replenishment/stock-development` |

**Use case:** *"Alert me if any material drops below safety stock in the next 2 weeks."*

---

#### MCP Tool Group C — Forecast Execution (Write, Automation)

> **Goal:** Enable agents to trigger and monitor forecast runs end-to-end.

| MCP Tool | Maps to |
|----------|---------|
| `execute_forecast` | `POST /configurations/:id/execute` |
| `get_latest_predictions` | `GET /configurations/:id/latest-predictions` |
| `stream_job_progress` | `GET /sse/:tenantId` |

**Use case:** *"Run the weekly forecast every Monday at 6 AM and notify me when done."*

---

#### MCP Tool Group D — Consensus Workflow (Human-in-the-Loop)

> **Goal:** Agent proposes overrides, human approves, agent commits.

| MCP Tool | Maps to |
|----------|---------|
| `get_consensus_dimensions` | `GET /consensus/:configId/dimension-groups` |
| `get_prediction_for_edit` | `GET /consensus/predictions/:predictionId` |
| `reconcile_forecast` | `POST /consensus/reconciliation/:configId` |
| `get_edit_history` | `GET /consensus/:consensusId/history-logs` |

**Use case:** *"Adjust the Q3 forecast for Category X by +15% due to the summer promotion and commit."*

---

#### MCP Tool Group E — Event & News Injection (AI-Native)

> **Goal:** NLP pipeline integration — agent reads signals and injects structured events.

| MCP Tool | Maps to |
|----------|---------|
| `list_event_topics` | `GET /event-extraction/topics` |
| `get_articles` | `GET /event-extraction/articles-table` |
| `import_events` | `POST /event-extraction/import` (API Key) |
| `create_event` | `POST /events` |

**Use case:** *"Scan today's news, extract supply chain disruptions, and add them as forecast events."*

---

#### MCP Tool Group F — Commodity Pricing (Procurement Support)

> **Goal:** Support procurement teams with price intelligence.

| MCP Tool | Maps to |
|----------|---------|
| `get_commodity_materials` | `GET /commodity-price/materials` |
| `get_price_trend` | `GET /commodity-price/trend` |
| `get_hedging_recommendation` | `POST /commodity-price/hedging` |
| `get_commodity_news` | `GET /commodity-price/news` |

**Use case:** *"Should we hedge copper purchases for Q4 given the current LME trend?"*

---

### Recommended MCP Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Agent / Claude                     │
└──────────────────────────┬──────────────────────────────┘
                           │  MCP protocol
┌──────────────────────────▼──────────────────────────────┐
│               SCX MCP Server                             │
│  ┌────────────┐ ┌──────────────┐ ┌───────────────────┐  │
│  │ Auth layer │ │ Tool registry│ │ Tenant context    │  │
│  │ (JWT/API   │ │ (Groups A-F) │ │ (inject tenantId) │  │
│  │  Key mgmt) │ │              │ │                   │  │
│  └────────────┘ └──────────────┘ └───────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │  HTTP/REST
┌──────────────────────────▼──────────────────────────────┐
│           forecast-backend  /api/v1/                     │
└─────────────────────────────────────────────────────────┘
```

**Key design considerations:**
- The MCP server holds the API Key or acts as an OAuth client to Keycloak — agents never see credentials
- Tenant ID must be injected per-session to respect multi-tenant isolation
- Start with **read-only tools (Groups A + B)** for safety, add write tools (Groups C–F) with explicit confirmation steps
- The `POST /event-extraction/import` endpoint (API Key only) is the most "AI-native" existing surface — likely the lowest-friction entry point

---

*Last updated: 2026-04-24 | Source: `pacemaker-v2` monorepo scan*
