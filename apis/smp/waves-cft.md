# waves-cft — Carbon Footprint Tool (Emission Computation Engine)

> Four repos form the CFT compute layer. Three expose HTTP endpoints; one is blob-triggered.

---

## waves-cft (AWS Lambda)

> **Purpose:** Core emission computation engine for multimodal transport (road, sea, air, rail).  
> Uses the GLEC (Global Logistics Emissions Council) framework.  
> **Stack:** Python 3.11, AWS Lambda + API Gateway  
> **Auth:** AWS API Gateway API Key  
> **OpenAPI spec:** `api/api.yaml` — partial, covers both endpoints

### Endpoints

| Method | Path | Notes |
|--------|------|-------|
| **POST** | `/cft` | Compute carbon footprint for all transport modes |
| **POST** | `/hubs` | Compute emissions for hub/transshipment/storage operations |

**`POST /cft` — main emission calculation:**
```
Input:  order data (origin, destination, weight, mode, cargo type)
Output: co2_wtt (well-to-tank), co2_ttw (tank-to-wheel), co2_wtw (well-to-wheel)
        per leg + aggregated order total
```

**`POST /hubs` — hub/storage emissions:**
```
Input:  hub operations data (dwell time, energy type, storage mode)
Output: hub emissions (CO2e)
```

### Runtime Config

| Parameter | Value |
|-----------|-------|
| Python | 3.11 |
| Timeout | 300 s |
| Memory | 2,048 MB |
| Secrets | AWS Secrets Manager (`DISTANCE_API_KEY`, `DISTANCE_API_URL`, DB credentials) |

### External APIs Called

| Service | Purpose |
|---------|---------|
| Distance API (openrouteservice / Nominatim) | Route distance and geocoordinates |
| PostgreSQL | Emission factor cache, pre-computed distances |

---

## waves-tendering-api (AWS Lambda)

> **Purpose:** External order submission gateway — receives batch orders, computes emissions per leg, stores results.  
> **Stack:** Python 3.12, AWS Lambda + API Gateway  
> **Auth:** API Key (`x-api-key`) + custom validation service

### Endpoints

| Method | Path | Notes |
|--------|------|-------|
| **POST** | `/orders` | Submit batch of orders |
| **POST** | `/order` | Submit single order |
| **DELETE** | `/order/{orderId}` | Delete order |

### External APIs Called

| Service | Purpose |
|---------|---------|
| Routing API | Distance per leg (retry with 10 attempts + exponential backoff) |
| Emission API (`/cft`) | Emission calculation per leg |
| API Key Validation API | Validate key → extract company/user |
| Audit Log API | Record user actions |
| PostgreSQL | Store orders, results |

### Secrets (AWS Secrets Manager)

`DBAccess` · `RoutingAPI` · `EmissionAPI` · `MappingAPI` · `APIKeyURL`

---

## waves-cft-mapping-sam-azure (Azure HTTP Function)

> **Purpose:** Tour request mapping/normalisation layer. Validates and transforms tour data before submission to the emission engine.  
> **Stack:** Python 3.9, Azure Functions (HTTP trigger)  
> **Auth:** Managed Identity + API Key validation service  
> **Deployment:** Azure zip deploy with Managed Identity

### Implied Endpoints

| Path | Notes |
|------|-------|
| `/tour` | Process single tour request |
| `/tours` | Process batch of tours |
| `/vehicles` | Vehicle CRUD |
| `/trailers` | Trailer CRUD |
| `/log_useraction` | Log user action |

### External Services Used

| Service | Purpose |
|---------|---------|
| Azure Key Vault | Secrets (API endpoints, DB credentials) |
| Azure Blob Storage | Store calculation results |
| API Key Validation API | Validate incoming key → company/user |
| Emission Calculation Service | Submit normalised tours for emission calc |
| PostgreSQL | Persist tours, vehicles, trailers |

---

## waves-cft-parse-excel-azure (Azure Blob-Trigger Function)

> **Purpose:** Parse Excel files dropped into the `client-ingress` Azure Blob container and publish structured messages to Azure Service Bus.  
> **Stack:** Python 3.9, Azure Functions (Blob trigger — NOT HTTP)  
> **Auth:** Managed Identity (no HTTP auth — event-driven)  

This is **not an HTTP API** — it reacts to file uploads.

### Flow

```
Client uploads .xlsx to Azure Blob (client-ingress container)
      │
      ▼
parse-excel Function triggers
      │  downloads blob, parses with pandas/openpyxl
      ▼
Tour records extracted + structured
      │
      ▼
Azure Service Bus (SERVICEBUS_QUEUE)
      │  publishes one message per tour
      ▼
Downstream consumer (tendering pipeline)
```

### Config (App Settings)

| Var | Purpose |
|-----|---------|
| `AzureWebJobsStorage` | Blob storage connection |
| `BLOB_CONTAINER` | Source container (default: `client-ingress`) |
| `SERVICEBUS_QUEUE` | Target Service Bus queue |
| `SERVICEBUS_FQDN` | Service Bus namespace |
| `DB_USER/PASS/HOST/NAME` | PostgreSQL credentials |

---

## waves-cft-tendering (AWS Lambda — Compute Only)

> **Purpose:** Standalone emission computation for tendering orders. No HTTP trigger — invoked directly as a Lambda or called synchronously by the tendering pipeline.  
> **Stack:** Python 3.8, AWS Lambda  
> **Auth:** Lambda IAM role (no API Gateway)

### Computation Functions

| Function | Modes | Notes |
|----------|-------|-------|
| `compute(order_data)` | All | Main entry point |
| `compute_road_emissions` | Road | GLEC road factors from DB |
| `compute_sea_emissions` | Sea | GLEC sea factors from DB |
| `compute_air_emissions` | Air | GLEC air factors from DB |
| `compute_rail_emissions` | Rail | GLEC rail factors from DB |

**Output per leg:** `co2_wtt` · `co2_ttw` · `co2_wtw`  
**External dependency:** PostgreSQL only (emission factors DB)

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `calculate_transport_emissions` | `POST /cft` (waves-cft Lambda) | "What's the CO2 footprint of shipping 10t from Hamburg to Shanghai by sea?" |
| `calculate_hub_emissions` | `POST /hubs` (waves-cft Lambda) | "What emissions are generated storing goods in our Rotterdam hub?" |
| `submit_tendering_order` | `POST /orders` (waves-tendering-api) | "Submit these transport orders to the platform." |

> **Key insight:** `POST /cft` is a pure calculation endpoint — no state, no auth complexity beyond an API key. The simplest possible MCP tool to implement and the most useful for any agent reasoning about transport emissions.
