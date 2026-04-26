# Internal API: Forecast

> Covers the full forecasting lifecycle: configurations, triggering runs, retrieving series data, results, and exports.

## Forecast Configurations

A **Configuration** is the central entity — it defines what to forecast (data source, columns, horizon) and triggers the ML pipeline.

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| GET | `/configurations/visible` | JWT | Standard | **A** | Entry point — list what can be forecast |
| GET | `/configurations/{id}` | JWT | Standard | **A** | Get a specific configuration |
| POST | `/configurations` | JWT | Admin | — | Create configuration (UI-driven setup) |
| PUT | `/configurations/{id}` | JWT | Standard | — | Update configuration |
| DELETE | `/configurations/{id}` | JWT | Admin | — | Delete configuration |
| **POST** | **`/configurations/{id}/execute`** | **JWT or API Key** | **Admin** | **C** | **Trigger a forecast run** |
| GET | `/configurations/{id}/latest-predictions` | JWT | Standard | **A** | Get current forecast output |
| PUT | `/configurations/{id}/widget-view` | JWT | Admin | — | Update dashboard widget layout |

> **MCP note — execute:** Async operation. The MCP server should subscribe to `GET /sse/{tenantId}` and wait for job completion before returning a result. Present the configuration name to the user before triggering.

## Forecast Data & Series

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **POST** | **`/forecasts/{versionId}/forecast-series`** | **JWT** | **Standard** | **A** | Get time-series data, filtered by dimension |
| PUT | `/forecasts/{pipelineForecastId}/forecast-series` | JWT | Standard | — | Override series values |
| GET | `/forecasts/{versionId}/available-filters` | JWT | Standard | **A** | Discover filterable dimensions |
| GET | `/forecasts/{forecastId}/get-timespan` | JWT | Standard | **A** | Date range of a forecast |
| **GET** | **`/forecasts/{forecastId}/prediction-explanation`** | **JWT** | **Standard** | **A** | ML explainability — feature drivers |
| GET | `/forecasts/{configId}/filter-combinations` | JWT | Standard | — | Saved filter presets (UI state) |
| POST | `/forecasts/{configId}/filter-combinations` | JWT | Standard | — | Save a filter preset |
| DELETE | `/forecasts/{configId}/filter-combinations/{id}` | JWT | Standard | — | Delete a filter preset |
| GET | `/forecasts/{forecastId}/download-batch-api-logs` | JWT | Standard | — | Download job logs |

> **MCP use case — prediction-explanation:** "Why is the forecast for SKU-123 so high in Q3?" Returns feature importance and key demand drivers from the ML model.

## Results & Reporting

A **Result** (forecast version) is produced by executing a configuration. It contains the actual predictions, accuracy measures, and reporting data.

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/results/of-configuration/{configId}`** | **JWT or API Key** | **Standard** | **A** | List all forecast runs for a config |
| GET | `/results/{id}` | JWT | Standard | **A** | Get a single result set |
| GET | `/results/` | JWT | Standard | **A** | Get multiple results by IDs |
| **POST** | **`/results/{id}/measures`** | **JWT** | **Standard** | **A** | Calculate accuracy metrics (MAPE, RMSE, bias) |
| **POST** | **`/results/{id}/future-measures`** | **JWT** | **Standard** | **A** | Accuracy metrics for the forecast horizon |
| POST | `/results/{id}/export` | JWT | Standard | **C** | Queue an export job (CSV/Excel) |
| PUT | `/results/{id}` | JWT | Admin | — | Update result metadata |
| DELETE | `/results/{id}` | JWT | Admin | — | Delete a result set |
| GET | `/results/{versionId}/invalid-quick-filters` | JWT | Standard | — | Check filter validity |
| POST | `/results/of-configuration/{configId}/reporting-data/init` | JWT | Standard | — | Initialize SSRM (AG Grid server-side row model) |
| POST | `/results/of-configuration/{configId}/reporting-data/query` | JWT | Standard | — | Paginated SSRM query (UI-specific) |
| POST | `/results/of-configuration/{configId}/reporting-data/import` | JWT | Admin | — | Import reporting data |

## Export

| Method | Path | Auth | Min Role | MCP Group | Notes |
|--------|------|------|----------|-----------|-------|
| POST | `/export/{id}/generate-export` | JWT | Standard | **C** | Queue export; returns job ID |
| GET | `/export/download/{exportId}` | JWT | Standard | — | Binary download — return the URL instead |

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `list_forecast_configs` | `GET /configurations/visible` | "What forecast configurations are available?" |
| `get_forecast_series` | `POST /forecasts/{versionId}/forecast-series` | "Show me the weekly forecast for SKU-123 for the next 6 months." |
| `get_forecast_explanation` | `GET /forecasts/{forecastId}/prediction-explanation` | "Why is the Q3 forecast for Electronics so high? What are the key demand drivers?" |
| `get_forecast_results` | `GET /results/of-configuration/{configId}` | "List all forecast runs for configuration C-5." |
| `get_forecast_accuracy` | `POST /results/{id}/measures` | "What's the MAPE and bias for the current forecast?" |
| `execute_forecast` | `POST /configurations/{id}/execute` | "Re-run the forecast for configuration C-5." (async — waits on SSE completion) |
| `export_forecast` | `POST /export/{id}/generate-export` | "Export the latest forecast results as Excel." |

> **Async note:** `execute_forecast` triggers a long-running job. The MCP server must subscribe to `GET /sse/{tenantId}` and block until the job completion event arrives before returning a result to the agent.
