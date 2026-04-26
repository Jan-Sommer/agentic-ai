# Internal API: Admin & System

> Users, companies, settings, notifications, health probes, SSE, grid views.  
> Mostly not MCP-relevant — documented for completeness.

## Data Sources

Metadata about data sources connected to forecast configurations. Read-only; sources are connected via the UI upload flow.

| Method | Path | Auth | Min Role | MCP Group | Notes |
|--------|------|------|----------|-----------|-------|
| GET | `/datasource-info` | JWT | Standard | **A** (low priority) | List connected data sources |
| GET | `/datasource-info/{id}` | JWT | Standard | — | Data source detail |
| GET | `/datasource-info/{id}/numeric-columns` | JWT | Standard | — | Available numeric columns |
| GET | `/datasource-info/{id}/categorical-columns` | JWT | Standard | — | Available categorical columns |
| GET | `/datasource-info/{id}/distinct/{column}` | JWT | Standard | — | Distinct values (filter builder) |
| POST | `/datasource-info/{id}/update` | JWT | Standard | — | Refresh data source |
| DELETE | `/datasource-info/{id}` | JWT | Standard | — | Remove data source |
| GET | `/datasource-info/{id}/number-of-forecast-versions` | JWT | Standard | — | Version count |

## Feature Flags & Settings

| Method | Path | Auth | Min Role | MCP Group | Notes |
|--------|------|------|----------|-----------|-------|
| GET | `/feature-flags` | JWT | Standard | — | Active flags for user/tenant — check before calling gated endpoints |
| GET | `/settings` | JWT | Standard | — | Application settings |
| PUT | `/settings/{id}` | JWT | Admin | — | Update settings |

> **MCP tip:** Call `/feature-flags` before invoking commodity-price or replenishment tools — if a module is disabled for a tenant, the endpoint will return 403.

## Notifications & Comments

| Method | Path | Auth | Min Role | MCP Group | Notes |
|--------|------|------|----------|-----------|-------|
| GET | `/notifications` | JWT | Standard | — | User notifications |
| GET | `/notifications/unread-count` | JWT | Standard | — | Unread count (UI badge) |
| PUT | `/notifications/{id}/read` | JWT | Standard | — | Mark as read |
| GET | `/comments` | JWT | Standard | — | Comments on forecast items |
| POST | `/comments` | JWT | Standard | — | Create comment |
| DELETE | `/comments/{id}` | JWT | Standard | — | Delete comment |

## Users

All admin-only. Proxies to Keycloak Admin REST API.

| Method | Path | Auth | Min Role | Notes |
|--------|------|------|----------|-------|
| GET | `/admin/users/company/{companyId}` | JWT | Admin | List users for a company |
| POST | `/admin/users` | JWT | Admin | Create user |
| PUT | `/admin/users/{userId}` | JWT | Admin | Update user |
| DELETE | `/admin/users/{userId}` | JWT | Admin | Delete user |
| GET | `/admin/users/roles` | JWT | Admin | Available roles |
| GET | `/admin/users/roles/realm/{realmId}` | JWT | Admin | Roles in a realm |
| GET | `/admin/users/realm/{realmId}` | JWT | Admin | All users in a realm |
| POST | `/admin/users/{userId}/assign-superadmin` | JWT | SuperAdmin | Assign super admin |
| DELETE | `/admin/users/{userId}/revoke-superadmin` | JWT | SuperAdmin | Revoke super admin |
| POST | `/authentication/add-user-from-keycloak` | JWT | Standard | Register Keycloak user locally |

## Companies

| Method | Path | Auth | Min Role | Notes |
|--------|------|------|----------|-------|
| POST | `/companies` | JWT | Admin | Create company/tenant |
| GET | `/companies` | JWT | Admin | List all companies |
| POST | `/companies/shared-realm` | JWT | Admin | Create shared Keycloak realm |
| POST | `/companies/{id}/migrate-to-dedicated-realm` | JWT | SuperAdmin | Migrate to dedicated realm |
| DELETE | `/companies/{id}` | JWT | SuperAdmin | Delete company |
| GET | `/companies/in-realm/{realmId}` | JWT | Admin | Companies in a realm |
| GET | `/companies/{companyName}` | API Key | — | Get company by name (M2M) |

## Subscriptions

| Method | Path | Auth | Min Role | Notes |
|--------|------|------|----------|-------|
| GET | `/subscriptions` | JWT | Admin | Company subscriptions |
| POST | `/subscriptions` | JWT | Admin | Create subscription |
| GET | `/admin/subscriptions/{companyId}` | JWT | Admin | Subscription for a company |
| POST | `/admin/subscriptions` | JWT | Admin | Admin create subscription |

## Grid Views

Saved UI state for AG Grid (column layout, sort, filters). Not MCP-relevant.

`GET/POST /grid-views` · `GET /grid-views/default` · `PATCH /grid-views/{id}` · `DELETE /grid-views/{id}`

## Real-Time & Health

| Method | Path | Auth | MCP Group | Notes |
|--------|------|------|-----------|-------|
| **GET** | **`/sse/{tenantId}`** | **JWT** | **C (internal)** | SSE stream for job progress — MCP server subscribes to this, not exposed as a tool |
| GET | `/health/live` | Public | — | Kubernetes liveness probe |
| GET | `/health/ready` | Public | — | Readiness probe (DB, Redis, memory) |
| GET | `/health/replenishment` | Public | — | Snowflake connector health |

---

## MCP Opportunity

The admin API is mostly not MCP-relevant — it handles system administration, UI state, and user management. Two endpoints are useful as guard checks before invoking other tools.

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `check_feature_flags` | `GET /feature-flags` | Guard check — verify a module (commodity-price, replenishment) is enabled for the tenant before calling its tools. Prevents unexpected 403s. |
| `list_data_sources` | `GET /datasource-info` | "What data sources are connected to forecast configurations?" |

> **Agent pattern:** At session start, call `check_feature_flags` once and cache the result. Gate all module-specific tool calls on the relevant flag being active.
