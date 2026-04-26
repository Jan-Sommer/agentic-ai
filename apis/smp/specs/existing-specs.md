# SMP Ecosystem — OpenAPI Spec Inventory

> Coverage assessment for MCP server code generation and integration planning.

---

## Coverage Summary

| Repo | Spec File | Lines | Format | Coverage | Codegen Ready |
|------|-----------|-------|--------|----------|---------------|
| `waves-smp-backend` | `API_Specification_SMP.yaml` | 18,734 | OpenAPI 3.0 | Complete ✅ | Yes |
| `waves-tax-backend` | `api.yaml` | 3,162 | OpenAPI 3.0 (Hydra JSON-LD) | Complete ✅ | Partial (Hydra format) |
| `waves-tax-backend` | `TAXONOFY_API.yaml` | 826 | OpenAPI 3.0 (plain JSON) | Complete ✅ | Yes |
| `waves-tendering-api` | `api/api.yaml` | 479 | OpenAPI 3.0 | Partial ⚠️ | Yes (for covered routes) |
| `waves-cft` | `api/api.yaml` | — | OpenAPI 3.0 | Partial ⚠️ | Yes (for covered routes) |
| `waves-cfc-backend` | _(none)_ | — | Auto-generated | Runtime only | Via `/api/docs.json` |
| `waves-csrd-backend` | _(none)_ | — | Auto-generated | Runtime only | Via `/api/docs.json` |
| `waves-tendering-backend` | _(none)_ | — | Auto-generated | Runtime only | Via `/api/docs.json` |
| `pci` (GraphQL) | _(none)_ | — | GraphQL schema | Schema only | Not applicable |

---

## waves-smp-backend — `API_Specification_SMP.yaml`

> **The most complete spec in the ecosystem — the primary codegen target.**

| Property | Value |
|----------|-------|
| Path | `API_Specification_SMP.yaml` (repo root) |
| Size | 18,734 lines |
| Version | 2.11 |
| Format | OpenAPI 3.0, plain JSON responses |
| Auth | JWT Bearer (Keycloak OIDC) |
| Coverage | Full — all 179+ endpoints documented |

**Domains covered:** Bookings, Claims, Companies, Shipments, Tours, Shippers, Vehicles, Trailers, Tariffs, Invoices, Users/Groups, Data Mapping, Analytics, Exports, Reference Data, Tagging, Release Notes, Audit.

**MCP note:** This spec is directly usable with `openapi-mcp-server` or any codegen tool. With 179+ endpoints, recommended approach is tool group selection (not full exposure) — see `architecture.md` for suggested tool groups.

---

## waves-tax-backend — Two Specs

### Internal API — `api.yaml`

| Property | Value |
|----------|-------|
| Path | `api.yaml` (repo root) |
| Size | 3,162 lines |
| Version | 2.8.0 |
| Format | OpenAPI 3.0, **Hydra JSON-LD** (API Platform default) |
| Auth | JWT Bearer (Lexik) |
| Coverage | Complete — all internal endpoints |

**Codegen caveat:** Hydra JSON-LD response format adds `@context`, `@id`, `@type` fields and uses `hydra:member` for collections. Standard codegen tools produce working code but require Hydra-aware response parsing.

### TAXONOFY Public API — `TAXONOFY_API.yaml`

| Property | Value |
|----------|-------|
| Path | `TAXONOFY_API.yaml` (repo root) |
| Size | 826 lines |
| Version | 2.9.0 |
| Format | OpenAPI 3.0, **plain JSON** |
| Auth | `x-api-key` header |
| Coverage | Complete for external surface |

**MCP note:** TAXONOFY_API is the cleanest spec in the ecosystem — plain JSON, API key auth, no Hydra. Ideal for direct MCP code generation. Covers activities, EU reference data, NACE codes, and year-based exports (PDF/ZIP/Excel/JSON).

---

## waves-tendering-api — `api/api.yaml`

| Property | Value |
|----------|-------|
| Path | `api/api.yaml` |
| Size | 479 lines |
| Format | OpenAPI 3.0 |
| Auth | `x-api-key` header |
| Coverage | Partial — covers the 3 HTTP endpoints |

**Endpoints covered:**

| Method | Path |
|--------|------|
| POST | `/orders` |
| POST | `/order` |
| DELETE | `/order/{orderId}` |

**MCP note:** Spec is sufficient to generate the 3 tools for this Lambda. The Python Lambda has no other HTTP surface.

---

## waves-cft — `api/api.yaml`

| Property | Value |
|----------|-------|
| Path | `api/api.yaml` |
| Format | OpenAPI 3.0 |
| Auth | AWS API Gateway API Key |
| Coverage | Partial — covers `/cft` and `/hubs` |

**Endpoints covered:**

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/cft` | Multimodal emission calculation |
| POST | `/hubs` | Hub/storage emission calculation |

**MCP note:** `POST /cft` is the highest-value tool in the entire SMP ecosystem — pure calculation, no state, no side effects. This is the simplest possible MCP tool to implement and test.

---

## PHP Backends — Auto-Generated Specs (No Static File)

All three PHP backends (`waves-cfc-backend`, `waves-csrd-backend`, `waves-tendering-backend`) use **Symfony 7.4 + API Platform 3.4.17**, which generates OpenAPI specs at runtime.

| Repo | Runtime Spec URL | Auth Required |
|------|-----------------|---------------|
| `waves-cfc-backend` | `/api/docs.json` | No (public in dev) |
| `waves-csrd-backend` | `/api/docs.json` | No (public in dev) |
| `waves-tendering-backend` | `/api/docs.json` | No (public in dev) |

**To export a static spec:**
```bash
# From inside the container or with PHP available
php bin/console api:openapi:export --output=api.yaml
```

**Format note:** API Platform generates Hydra JSON-LD by default. For plain JSON responses, request with `Accept: application/json`. The spec includes both formats.

**MCP recommendation:** Export static specs for each backend before building MCP tools — runtime dependency on a live server is fragile for codegen.

---

## PCI — GraphQL Only (No OpenAPI)

| Component | Type | Location |
|-----------|------|----------|
| `data-management-api` | GraphQL (Apollo Federation subgraph) | Schema introspection at `/graphql` |
| `api-gateway` | Apollo Federation gateway | Introspection at `/graphql` |

**No OpenAPI spec exists or is generated.** The full schema is available via GraphQL introspection.

**MCP approach for PCI:** Use the `graphql-mcp-server` pattern — introspect the schema and expose curated queries/mutations as tools. The key mutations for agent use are `importPcf`, `generateColMappingWithAi`, and `recalculateEmissions`. Key queries: `products`, `productInstances`, `productCarbonFootprints`.

---

## Spec Quality Ranking (MCP Build Order)

| Priority | Repo | Reason |
|----------|------|--------|
| 1 | `waves-cft` (`POST /cft`) | Smallest surface, pure calculation, highest signal value |
| 2 | `TAXONOFY_API.yaml` | Clean spec, API key auth, plain JSON — fastest to integrate |
| 3 | `waves-smp-backend` | Most complete spec; select 10–15 high-value tools |
| 4 | `waves-tendering-api` | Small spec, complete coverage, external submission use case |
| 5 | PHP backends (CFC/CSRD/Tendering) | Export spec first, then codegen |
| 6 | PCI (GraphQL) | Requires GraphQL MCP approach, not OpenAPI codegen |
