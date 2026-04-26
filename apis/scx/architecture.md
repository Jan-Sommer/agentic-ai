# SCX System Architecture

> Reference for understanding the system before designing MCP tools.

## Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Nx |
| Backend | NestJS (TypeScript) |
| Frontend | Angular 20 (2 apps: user-facing + admin) |
| Primary DB | PostgreSQL — Sequelize ORM, per-tenant database |
| Cache / Queue | Redis — BullMQ jobs + pub/sub |
| Identity | Keycloak — OAuth2/OIDC, multi-tenant realms |
| Data Warehouse | Snowflake — replenishment data (per-tenant) |
| File Storage | Azure Blob Storage |
| ML Service | Python — separate internal REST service |

## Components

| ID | Type | Description |
|----|------|-------------|
| `forecast-backend` | API server (NestJS) | Central REST API — ~47 controllers, ~120 endpoints. Global prefix `/api`, versioned `/api/v1/`. Swagger UI at `/docs` (dev only). |
| `forecast-frontend` | SPA (Angular 20) | End-user forecasting interface |
| `admin-frontend` | SPA (Angular 20) | Admin dashboard for company and user management |
| `forecast-pipeline` | ML service (Python) | Internal forecasting engine — ARIMA, Prophet, XGBoost. Full OpenAPI spec available. |
| `batch-api` | Job queue service | Long-running async forecast jobs. Auth: `x-api-key`. |
| `keycloak` | Identity provider | OAuth2/OIDC + Admin REST API |

## Multi-Tenancy

- **Strategy:** per-tenant PostgreSQL database + separate Keycloak realm
- **Isolation:** CLS (Continuation Local Storage) in NestJS — tenant context injected per request
- **MCP implication:** every tool call must carry a tenant identifier; the MCP server maps agent sessions to tenants

## Authentication

| Mechanism | Header | Used For |
|-----------|--------|----------|
| **JWT Bearer** | `Authorization: Bearer {token}` | All standard user-facing endpoints |
| **API Key** | `x-api-key: {key}` | Machine-to-machine: event extraction import, commodity price import, batch triggers, company lookup |
| **Multi-Auth** | JWT or API Key (either) | `POST /configurations/{id}/execute`, `GET /results/of-configuration/{configId}` |
| **Public** | — | Health check probes only |

### Roles

| Role | Scope |
|------|-------|
| `superadmin` | Cross-tenant operations |
| `admin` | Company-level management |
| `standard` | Read/write forecast data, no admin operations |

## Global API Config

| Setting | Value |
|---------|-------|
| Global prefix | `/api` |
| Versioning | URI-based — `/api/v1/` |
| Default version | `1` |
| Payload limit | 3 MB |
| Swagger UI | `http://localhost:{PORT}/docs` (development only) |

**Middlewares:** AuthGuard → CompanyAttachment → LanguageMiddleware → TenancyService (CLS)

## Real-Time

The backend pushes job progress via **Server-Sent Events**:

```
GET /api/v1/sse/{tenantId}   Auth: JWT
```

Used for: forecast job completion, export progress. The MCP server subscribes to this stream when triggering async jobs and waits for completion before returning a tool result.

## MCP Placement

```
[AI Agent / Claude]
      │  MCP protocol
[SCX MCP Server]
  ├── Holds credentials (JWT + API Key) — agents never see them
  ├── Injects tenant context per session
  ├── Abstracts SSE polling → synchronous tool responses
  └── Enforces read-only vs. write tool separation
      │  HTTP/REST
[forecast-backend  /api/v1/]
```

**Local dev transport:** stdio (Claude Desktop)  
**Production transport:** Streamable HTTP — stateless, single `POST /mcp` endpoint, horizontally scalable
