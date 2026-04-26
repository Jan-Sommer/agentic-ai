# External API: Forecast Pipeline (ML Backend)

> Internal Python service consumed by `forecast-backend`. MCP tools should target `forecast-backend`, not this service directly.

## Service Details

| | |
|---|---|
| **Type** | Internal REST (Python, separate container) |
| **Base URL env** | `FORECAST_PIPELINE_URL` |
| **Default URL** | `http://localhost:5000` |
| **Auth** | None (internal network only) |
| **HTTP client** | Axios (custom wrapper in `forecast-pipeline.client.ts`) |
| **OpenAPI spec** | `apps/forecast-backend/src/app/adapters/rest/openapi/forecast_pipeline_v1.yaml` |
| **Spec version** | 2.0.1 — **complete**, 1,543 lines, full request/response schemas |
| **ML models** | ARIMA, Prophet, XGBoost |

## Endpoints

| Method | Path | Mode | Called by | Notes |
|--------|------|------|-----------|-------|
| POST | `/run-forecast` | Sync | forecast-backend | Run single forecast, receive result immediately |
| POST | `/run-forecasts` | Sync | forecast-backend | Batch synchronous |
| POST | `/start-forecast` | Async | forecast-backend | Submit job, returns `forecast_id` |
| POST | `/start-forecasts` | Async | forecast-backend | Batch async submit |
| GET | `/forecast-status/{forecast_id}` | — | forecast-backend | Poll job status (pending/running/done/failed) |
| POST | `/get-forecast-result` | — | forecast-backend | Fetch completed result |
| POST | `/calculate-future-measure` | — | forecast-backend | Error measures over forecast versions |
| POST | `/calculate-benchmark-measure` | — | forecast-backend | Benchmark accuracy |
| POST | `/compare-benchmarks` | — | forecast-backend | Statistical benchmark comparison |
| POST | `/export-result-csv` | — | forecast-backend | Export as CSV |
| POST | `/get-forecast-data` | — | forecast-backend | Forecast period data with filters |
| POST | `/repredict` | — | forecast-backend | New predictions for altered future data |
| DELETE | `/delete-forecast/{forecast_id}` | — | forecast-backend | Free memory |
| POST | `/stop-forecast/{forecast_id}` | — | forecast-backend | Cancel running job |
| GET | `/get-holiday-countries` | — | forecast-backend | Countries with holiday calendars |
| GET | `/get-filters` | — | forecast-backend | Available group filter options |

## MCP Opportunity

MCP tools must **not** call this service directly — it is internal-network only with no auth and no stable public contract. Always use `forecast-backend` as the proxy.

| Tool | Via forecast-backend endpoint | Use Case |
|------|-------------------------------|----------|
| `execute_forecast` | `POST /configurations/{id}/execute` | Triggers `/start-forecast` on the pipeline internally. MCP waits on SSE for completion. |
| `get_forecast_series` | `POST /forecasts/{versionId}/forecast-series` | Retrieves ML model output (ARIMA / Prophet / XGBoost predictions). |
| `get_forecast_explanation` | `GET /forecasts/{forecastId}/prediction-explanation` | Surfaces feature importance from the ML model. |
| `get_forecast_accuracy` | `POST /results/{id}/measures` | Returns MAPE, RMSE, bias computed by `/calculate-future-measure`. |

> **Spec value:** `forecast_pipeline_v1.yaml` (1,543 lines, v2.0.1) is the most complete OpenAPI spec in the SCX repo. Use it to generate TypeScript type stubs for forecast result structures when building Group C MCP tools — even though the spec is for the internal service, the response shapes flow through to forecast-backend unchanged.
