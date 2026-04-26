# waves-tendering — Tendering Platform API

> Two components covering the same domain:
> - **`waves-tendering-backend`** — PHP REST API (Symfony, main backend)
> - **`waves-tendering-api`** — Python AWS Lambda (external submission gateway)

---

## waves-tendering-backend (PHP)

> **Purpose:** Transport order management with carbon footprint tracking. Covers orders, shipping legs, distance/emission calculations, routes, and master data.  
> **Stack:** PHP + Symfony 7.4 + API Platform 3.4.17  
> **Auth:** JWT Bearer  
> **External:** SMP Calculation API for distance + emission computations  
> **OpenAPI:** Auto-generated at `/api/docs.json`

### Orders

| Method | Path | Notes |
|--------|------|-------|
| **GET** | `/api/orders` | List orders (paginated, filterable) |
| **POST** | `/api/orders` | Create order |
| **GET** | `/api/orders/{id}` | Get order detail |
| **PATCH** | `/api/orders/{id}` | Update order |
| **DELETE** | `/api/orders/{id}` | Delete order |
| POST | `/api/orders/{id}/clone` | Clone existing order |
| **GET** | `/api/orders/{id}/alternatives` | Get alternative shipping routes |
| POST | `/api/orders/{id}/alternatives` | Save alternative routes |
| POST | `/api/orders/{id}/status` | Update status (`IN_PROGRESS` / `ACCEPTED` / `REJECTED` / `COMPLETED`) |
| GET | `/api/orders/invoicing/{month}` | Orders for invoicing in a given month |
| GET | `/api/orders/export` | Export orders as JSON |
| GET | `/api/order-dashboard` | Order dashboard metrics |
| GET | `/api/order-dashboard-climate-month` | Monthly climate metrics |
| POST | `/api/order-suggestion` | Get route/order suggestions |

### Shipping Legs

| Method | Path | Notes |
|--------|------|-------|
| **GET** | `/api/legs` | List legs |
| **POST** | `/api/legs` | Create leg |
| **GET** | `/api/legs/{id}` | Get leg detail |
| **PATCH** | `/api/legs/{id}` | Update leg |
| **DELETE** | `/api/legs/{id}` | Delete leg |
| **POST** | `/api/legs/distance` | Calculate distance via SMP Calculation API |
| **POST** | `/api/legs/emission` | Calculate emissions via SMP Calculation API |

> **MCP note — `legs/distance` and `legs/emission`:** These are pure calculation endpoints (no state mutation beyond caching). Natural MCP tools for a procurement agent doing cost/carbon optimisation.

### Clients & Locations

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/clients` | List clients |
| GET | `/api/locations` | List locations |

### Import

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/import-tasks` | List import tasks |
| POST | `/api/import-tasks` | Create import task |
| PATCH | `/api/import-tasks/{id}` | Update import task status |

### Reference Data

| Endpoint | Notes |
|----------|-------|
| `GET /api/countries` · `/{id}` | Country reference data |
| `GET /api/masters` | Master data (ports, airports, zip codes) |
| `POST /api/masters/import` | Import master data |
| `GET /api/zip-codes/search` | Zip code search by location |

### Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | Public |

### External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| SMP Calculation API | Distance + emission calculation | `SMP_API_URL`, `SMP_API_KEY` (`Ocp-Apim-Subscription-Key` header) |
| AWS S3 | File storage | Optional |

**SMP Calculation API endpoints called:**

| Path | Purpose |
|------|---------|
| `POST /api/v1/calculate/emission` | Emission calculation |
| `POST /api/v1/calculate/route-distance` | Single route distance |
| `POST /api/v1/calculate/matrix-distance` | Matrix of distances |
| `GET /api/v1/locations/coordinates` | Geocoordinates lookup |
| `POST /api/v1/locations/distance` | Location-based distance |
| `POST /api/v1/locations/matrix` | Location distance matrix |

---

## waves-tendering-api (Python Lambda)

> **Purpose:** External submission gateway for batch order ingestion. Receives orders from ERP/external systems, computes emissions per leg, stores in the tendering DB.  
> **Stack:** Python 3.12, AWS Lambda, API Gateway  
> **Auth:** API Key (`x-api-key`)  
> **OpenAPI spec:** `api/api.yaml` (479 lines) · **Partial ✅**

### Endpoints

| Method | Path | Notes |
|--------|------|-------|
| **POST** | `/orders` | Submit batch of orders |
| **POST** | `/order` | Submit single order |
| **DELETE** | `/order/{orderId}` | Delete order by ID |

### External APIs Called by Lambda

| Service | Purpose |
|---------|---------|
| Routing API | Distance estimation per leg (with retry + backoff) |
| Emission API (waves-cft) | `POST /cft` emission calculation per leg |
| API Key Validation API | Validate incoming API key, extract company/user |
| Log/Audit API | Record user actions |
| PostgreSQL | Store orders, legs, emissions |

### Secrets (AWS Secrets Manager)

`DBAccess` · `RoutingAPI` · `EmissionAPI` · `MappingAPI` · `APIKeyURL`

---

## MCP Opportunity

### waves-tendering-backend (PHP REST)

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `list_orders` | `GET /api/orders` | "Show me all open transport orders and their emission totals." |
| `get_order_detail` | `GET /api/orders/{id}` | "What's the status and per-leg CO2 breakdown for order #500?" |
| `get_order_alternatives` | `GET /api/orders/{id}/alternatives` | "What are the alternative routes and their emissions for order #500?" |
| `calculate_leg_distance` | `POST /api/legs/distance` | "What's the distance from Hamburg to Rotterdam by road?" |
| `calculate_leg_emission` | `POST /api/legs/emission` | "What CO2 is emitted shipping 20t from Hamburg to Rotterdam by sea?" |
| `update_order_status` | `POST /api/orders/{id}/status` | "Mark order #500 as ACCEPTED." |
| `get_orders_for_invoicing` | `GET /api/orders/invoicing/{month}` | "Which orders are ready for invoicing in April?" |

> **Key tools:** `calculate_leg_distance` and `calculate_leg_emission` are pure calculation endpoints — no state mutation, perfect for a cost/carbon optimisation agent comparing transport options.

### waves-tendering-api (Python Lambda — External Gateway)

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `submit_order_batch` | `POST /orders` | "Submit these 10 transport orders from our ERP system." |
| `submit_single_order` | `POST /order` | "Submit this one transport order for immediate emission calculation." |
| `delete_order` | `DELETE /order/{orderId}` | "Remove order ORD-999 from the tendering platform." |
