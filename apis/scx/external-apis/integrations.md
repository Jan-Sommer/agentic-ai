# External Integrations

> Services consumed by `forecast-backend`. Not surfaced as MCP tools — documented to understand the dependency chain.

## Batch API (Job Queue)

| | |
|---|---|
| **Purpose** | Long-running async forecast jobs and deletion queue |
| **Base URL env** | `BATCH_API_URL` (default: `http://localhost:8000`) |
| **Auth** | `x-api-key` header — key from `BATCH_API_KEY` |
| **Client file** | `apps/forecast-backend/src/app/adapters/batch-api/batch-api.client.ts` |

Endpoints: `POST /submit_task` · `POST /delete_task` · `GET /logs/{jobId}`

**MCP note:** Not called directly. The MCP server calls `/configurations/{id}/execute` on forecast-backend, which submits to the Batch API internally. The MCP server then subscribes to SSE for completion.

---

## Keycloak (Identity & Access Management)

| | |
|---|---|
| **Purpose** | OAuth2/OIDC identity, multi-tenant realm management |
| **Base URL env** | `KEYCLOAK_URL` (e.g. `https://auth.pacemaker.ai`) |
| **Auth** | Admin credentials (`KEYCLOAK_ADMIN_USER` / `KEYCLOAK_ADMIN_PASSWORD`) |
| **Client file** | `apps/forecast-backend/src/app/auth/services/keycloak-client.service.ts` |

**MCP relevance:** The MCP server can authenticate as a service account using the **Client Credentials flow** to obtain a JWT for endpoints requiring bearer auth:

```
POST {KEYCLOAK_URL}/realms/{realm}/protocol/openid-connect/token
Body: grant_type=client_credentials
      &client_id={MCP_CLIENT_ID}
      &client_secret={MCP_CLIENT_SECRET}
→ { access_token, expires_in }
```

Cache the token and refresh before expiry. Use a dedicated MCP service account with minimum required roles.

---

## Snowflake (Replenishment Data Warehouse)

| | |
|---|---|
| **Purpose** | Inventory, suppliers, sales history, orders, safety stock |
| **Auth** | Private key — `SNOWFLAKE_REPLENISHMENT_TU_PRIVATE_KEY` |
| **Tenancy** | Separate connection per tenant |
| **Client file** | `apps/forecast-backend/src/app/adapters/snowflake/snowflake.service.ts` |

**MCP note:** Group B replenishment tools call forecast-backend endpoints, which query Snowflake internally. The MCP server does not need direct Snowflake access.

---

## Flagsmith (Feature Flags)

| | |
|---|---|
| **Purpose** | Runtime feature gating — controls module availability per tenant |
| **SDK** | `flagsmith-nodejs` |
| **Base URL env** | `FLAGSMITH_URL` |
| **Auth** | `FLAGSMITH_ENVIRONMENT_KEY` |
| **Client file** | `apps/forecast-backend/src/app/adapters/flagsmith/flagsmith.client.ts` |

**MCP tip:** Call `GET /api/v1/feature-flags` before invoking tools for modules that may be disabled (commodity-price, replenishment). Avoids 403s from disabled features.

---

## Azure Graph API

| | |
|---|---|
| **Purpose** | Manage Azure AD app registrations for Keycloak OIDC |
| **Auth** | Client credentials — `AZURE_DIRECTORY_TENANT_ID`, `AZURE_APPLICATION_CLIENT_ID`, `AZURE_APPLICATION_CLIENT_SECRET` |
| **Client file** | `apps/forecast-backend/src/app/admin/services/azure/azure.client.ts` |

Not relevant for MCP.

---

## Azure Blob Storage

| | |
|---|---|
| **Purpose** | Forecast exports, analysis results, temporary files |
| **Auth** | `AZURE_STORAGE_ACCOUNT_NAME` + `AZURE_STORAGE_ACCOUNT_KEY` |

**MCP note:** Export download URLs (Group C tools) point to Azure Blob. Return the SAS URL to the agent rather than streaming the binary.

---

## SMTP / Email (Office 365)

| | |
|---|---|
| **Purpose** | System notifications, scheduled reports |
| **Type** | SMTP via Nodemailer |
| **Host env** | `MAIL_SMTP_HOST` (default: `smtp.office365.com:587`) |
| **Auth** | `MAIL_SMTP_USER` / `MAIL_SMTP_PASSWORD` |

Not relevant for MCP.

---

## Redis

| | |
|---|---|
| **Purpose** | Caching, BullMQ export job queue, SSE progress relay, cross-tab sync |
| **Config** | `REDIS_HOST:REDIS_PORT` — topic prefix: `scx` |
| **Client file** | `apps/forecast-backend/src/app/adapters/redis/redis.service.ts` |

**MCP note:** The MCP server does not need direct Redis access. The SSE stream at `/api/v1/sse/{tenantId}` exposes job progress over HTTP — subscribe to that, not Redis directly.

---

## PostgreSQL (Primary Database)

| | |
|---|---|
| **Purpose** | Configurations, forecasts, events, consensus plans, users, comments |
| **ORM** | Sequelize + Umzug migrations |
| **Config** | `POSTGRES_HOST/PORT/USER/PASSWORD/DB` |
| **Tenancy** | Separate database per tenant |

Not relevant for MCP — accessed only via forecast-backend REST API.

---

## Sentry (Observability)

| | |
|---|---|
| **Purpose** | Exception tracking, performance tracing, release monitoring |
| **SDK** | `@sentry/nestjs` |
| **Auth** | DSN (environment-based) |

Not relevant for MCP.

---

## MCP Opportunity

External integrations are not exposed as MCP tools — they are internal dependencies of `forecast-backend`. The MCP server talks only to forecast-backend endpoints, which coordinate with these services internally.

| Integration | MCP relevance |
|-------------|---------------|
| **Batch API** | Not called directly. Use the `execute_forecast` tool, which submits to Batch API internally. |
| **Keycloak** | MCP server authenticates via Client Credentials flow to obtain a JWT. Holds credentials, never exposes them to the agent. |
| **Snowflake** | Not called directly. Group B replenishment tools call forecast-backend, which queries Snowflake. |
| **Flagsmith** | Call `check_feature_flags` before invoking module-gated tools (commodity-price, replenishment). |
| **Azure Blob** | Export download links point to Blob SAS URLs — return the URL to the agent rather than streaming binary data. |
| **SSE stream** | MCP server subscribes to `GET /sse/{tenantId}` to poll async job progress. Not exposed as a tool; used internally by `execute_forecast`. |
| **Redis / PostgreSQL / SMTP / Sentry** | Not relevant for MCP. |
