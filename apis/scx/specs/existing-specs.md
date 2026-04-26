# Existing API Specifications

> "Can I generate MCP tool stubs from an existing spec?"

## Summary

| Spec file | Domain | Size | Codegen-ready? |
|-----------|--------|------|----------------|
| `forecast_pipeline_v1.yaml` | ML forecasting service (Python) | 1,543 lines | ✅ Yes |
| `forecast_v1_external-data.yaml` | Events, event-variables | 653 lines | ⚠️ With verification |
| `forecast_v1_datasource.yaml` | Data source / mapping | 409 lines | ❌ Outdated paths |
| `forecast_v1_company.yaml` | Company CRUD | 268 lines | ⚠️ With verification |
| `forecast_v1_demo.yaml` | Demo company seeding | 47 lines | ❌ Not relevant |
| **Main forecast-backend REST API** | Everything else (~80%) | — | ❌ **No spec exists** |

All files live at: `apps/forecast-backend/src/app/adapters/rest/openapi/`

---

## Spec Details

### `forecast_pipeline_v1.yaml` ✅ Complete

- **Format:** OpenAPI 3.0.3 · **Version:** 2.0.1 · **Contact:** philipp.hallmeier@pacemaker.ai
- Full request/response schemas, tags, descriptions — the only production-quality spec in the repo
- Documents the **internal Python ML service**, not the NestJS API
- **Use for:** generating type stubs for result/prediction schemas used in Group C tools

Covered paths: `/run-forecast` · `/start-forecast` · `/forecast-status/{id}` · `/get-forecast-result` · `/calculate-future-measure` · `/calculate-benchmark-measure` · `/compare-benchmarks` · `/export-result-csv` · `/get-forecast-data` · `/repredict` · `/delete-forecast/{id}` · `/stop-forecast/{id}` · `/get-holiday-countries` · `/get-filters`

---

### `forecast_v1_external-data.yaml` ⚠️ Partial

- **Format:** OpenAPI 3.0.0 · **Version:** v1
- Covers events and event-variables — relevant for Group E tools
- **Verify paths** against the running NestJS server before using for codegen

Covered paths: `GET/POST /events` · `PUT/DELETE /events/{_id}` · `GET/POST /events/event-variables` · `PUT/DELETE /events/event-variables/{_id}` · `GET /events/event-variables/names` · `GET /forecasts/{forecastId}/extraForecasts`

> Note: `/event-extraction/*` endpoints are **not** in this spec — hand-write those tools.

---

### `forecast_v1_datasource.yaml` ❌ Outdated paths

- Paths use `/data/mapping` and `/data/input` patterns
- Current NestJS routes use `/datasource-info`
- Likely describes an older service layer — **do not use for codegen without updating**

---

### `forecast_v1_company.yaml` ⚠️ Partial

- Covers basic company CRUD — verify against current routes before using

---

### `forecast_v1_demo.yaml` ❌ Not relevant

- Single endpoint for seeding a demo company — not MCP-relevant

---

## NestJS Auto-Generated Swagger

The backend has Swagger configured in `main.ts` via `@nestjs/swagger`:

```typescript
// Only active in development mode
if (env.NODE_ENV === NodeEnv.Development) {
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('docs', app, document);
}
```

**Dev URL:** `http://localhost:{PORT}/docs`  
**JSON export:** `http://localhost:{PORT}/docs-json`

**Problem:** Only **1 file** across the entire codebase uses `@ApiProperty` / `@ApiOperation` decorators (`health.controller.ts`). The auto-generated spec exposes all route paths but has **no request body schemas, response types, or parameter descriptions** — not sufficient for codegen.

---

## Recommendations

**Immediate (hand-write tools):**
- Use the endpoint inventory in `internal-apis/*.md` as the source of truth
- Use `forecast_pipeline_v1.yaml` to generate TypeScript type stubs for ML result schemas
- Use `forecast_v1_external-data.yaml` as a reference for event tool schemas (verify paths first)

**Medium-term (generate a complete spec):**
1. Add `@ApiProperty` to the top 20 most MCP-relevant NestJS DTOs and controllers
2. Run the app in development and fetch `http://localhost:{PORT}/docs-json`
3. Use an OpenAPI-to-MCP generator for bulk tool generation

**Codegen tools worth evaluating:**
- [`openapi-mcp-generator`](https://www.npmjs.com/package/openapi-mcp-generator) (npm)
- [`@modelcontextprotocol/create-server`](https://www.npmjs.com/package/@modelcontextprotocol/create-server) (npm)
- [Stainless](https://stainlessapi.com) (spec → SDK + MCP tools, cloud)
