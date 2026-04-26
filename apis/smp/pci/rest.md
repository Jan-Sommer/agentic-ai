# PCI — REST API

> **Base URL:** `http://localhost:3001/api` (data-management-api direct) or via gateway at `http://localhost:3000/api/data-management/*`  
> **Auth:** `Authorization: Bearer {JWT}` (Keycloak)  
> **Framework:** NestJS

All REST endpoints use **Server-Sent Events (SSE)** for real-time streaming — the server pushes calculation progress and results as they become available. Clients subscribe and receive updates without polling.

---

## Product Carbon Footprint (SSE Streams)

| Method | Path | Query Params | Returns | Use Case |
|--------|------|-------------|---------|----------|
| **GET** | `/api/product-carbon-footprints` | `skip, first, search, filter, sort` | SSE stream of `ProductCarbonFootprintSummaryPageResponse` | Portfolio-level PCF list with live calculation status |
| **GET** | `/api/product-carbon-footprints/:productInstanceId` | — | SSE stream of `ProductCarbonFootprintOverviewResponse` | Full PCF detail for one product instance |
| **GET** | `/api/product-carbon-footprints/:productInstanceId/components` | `skip, first, sort` | SSE stream of `SegmentComponentsEntriesPageResponse` | Component segment entries (supplier materials) |
| **GET** | `/api/product-carbon-footprints/:productInstanceId/transport` | `skip, first, sort` | SSE stream of `SegmentTransportEntriesPageResponse` | Transport segment entries (EcoTransit data) |
| **GET** | `/api/product-carbon-footprints/:productInstanceId/production` | `skip, first, sort` | SSE stream of `SegmentProductionEntriesPageResponse` | Production segment entries (plant consumptions) |

> **MCP note:** SSE endpoints require an HTTP client that supports streaming. For an MCP tool, subscribe, collect all events until `[DONE]`, and return the final state as a single tool response.

## PCF Actions

| Method | Path | Auth | Returns | Use Case |
|--------|------|------|---------|----------|
| **POST** | `/api/product-carbon-footprints/:pcfId/retrigger` | JWT | 202 Accepted | Re-trigger PCF calculation (same as `calculateProductCarbonFootprint` mutation) |

## File Export

| Method | Path | Returns | Use Case |
|--------|------|---------|----------|
| **GET** | `/api/export-reports/pcf-:fileType/:productInstanceId/:language` | File download | Export PCF report |

**Parameters:**
- `fileType`: `excel` · `json` · `pdf`
- `language`: `en-US` · `de-DE`

## File Management (BOM uploads)

| Method | Path | Notes |
|--------|------|-------|
| `*` | `/api/manage-products/*` | Azure Blob Storage proxy — upload/download Bill of Materials files |

## Queue Dashboards (Admin)

| URL | Auth | Purpose |
|-----|------|---------|
| `http://localhost:3001/api/queues` | Basic Auth (`BULL_BOARD_BASIC_AUTH_*`) | BullMQ job monitor — data-management-api |
| `http://localhost:3002/api/queues` | Basic Auth | BullMQ job monitor — carbon-footprint-service |

## Health

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/health` | Public | Kubernetes liveness/readiness probe |

---

## MCP Opportunity

| Tool | Endpoint | Pattern |
|------|----------|---------|
| `get_pcf_portfolio` | `GET /api/product-carbon-footprints` | Subscribe SSE → collect → return summary |
| `get_pcf_detail` | `GET /api/product-carbon-footprints/:id` | Subscribe SSE → return final PCF state |
| `export_pcf_report` | `GET /api/export-reports/pcf-excel/:id/en-US` | Return download URL / stream file |
| `trigger_pcf_calculation` | `POST /api/product-carbon-footprints/:id/retrigger` | Fire + subscribe to SSE stream for completion |

The GraphQL mutations (`calculateProductCarbonFootprint`, `triggerSupplierComponentEmissions`) are the recommended way to trigger calculations from an MCP server — use the REST SSE endpoints to monitor completion.
