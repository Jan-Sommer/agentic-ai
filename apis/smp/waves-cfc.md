# waves-cfc-backend — Carbon Footprint Calculator API

> **Purpose:** Enterprise carbon accounting. Tracks GHG emissions by activity, business unit, and reporting period.  
> **Stack:** PHP 8.4 + Symfony 7.4 + API Platform 3.4.17  
> **Auth:** JWT Bearer (`Authorization: Bearer {token}`)  
> **OpenAPI:** Auto-generated at `/api/docs.json`

---

## Role Hierarchy

```
ROLE_SMP_ADMIN > ROLE_COMPANY_ADMIN > ROLE_CFC_ADMIN > ROLE_CFC_USER > ROLE_CFC_READ_ONLY
```

---

## Entries (Core Emission Records)

An **Entry** is a single carbon emission record tied to an activity, factor, and business unit.

| Method | Path | Min Role | Notes |
|--------|------|----------|-------|
| **GET** | `/api/entries` | CFC_USER | List all entries (filterable, paginated) |
| **POST** | `/api/entries` | CFC_USER | Create emission entry |
| **DELETE** | `/api/entries/delete` | CFC_USER | Delete entry (or batch delete) |

## Reports

| Method | Path | Min Role | Notes |
|--------|------|----------|-------|
| **GET** | `/api/reports` | CFC_USER | List reports |
| **POST** | `/api/reports` | CFC_USER | Create report |
| **GET** | `/api/reports/{id}` | CFC_USER | Get report detail |
| **PATCH** | `/api/reports/{id}` | CFC_USER | Update report |
| GET | `/api/reports/{id}/section-counts` | CFC_USER | Entry counts per section |
| GET | `/api/reports/by-url/{businessUrlId}/{reportUrlId}` | CFC_USER | Get (or auto-create) report by URL slug |
| POST | `/api/reports/export` | CFC_USER | Export reports (multiple, as file) |
| POST | `/api/reports/import` | CFC_USER | Import report data |
| POST | `/api/reports/export-entries/{reportId}/{sectionId}` | CFC_USER | Export entries for a specific section |
| POST | `/api/reports/power-method` | CFC_USER | Set electricity calculation method |
| POST | `/api/reports/thermal-method` | CFC_USER | Set thermal energy method |

## Report Results

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/report-results/{id}` | Get aggregated result for a report |
| PATCH | `/api/report-results/{id}` | Update result |

## Business Units

| Method | Path | Min Role | Notes |
|--------|------|----------|-------|
| GET | `/api/business-units` | CFC_USER | List business units |
| POST | `/api/business-units/new` | CFC_ADMIN | Create business unit |
| PATCH | `/api/business-units/{id}` | CFC_ADMIN | Update business unit |
| DELETE | `/api/business-units/{id}` | CFC_ADMIN | Delete business unit |

## Activities & Factors (Reference Data)

| Method | Path | Notes |
|--------|------|-------|
| **GET** | `/api/categories` | Emission category list |
| **GET** | `/api/categories/as-tree` | Category tree structure |
| **GET** | `/api/activities` | All activities |
| **GET** | `/api/activities/by-parent-category/{parentCategoryId}` | Activities in a category |
| **GET** | `/api/activities/search` | Search activities by keyword |
| **GET** | `/api/factors` | Emission factors |
| **GET** | `/api/factors/{id}` | Single emission factor |
| GET | `/api/emission-providers` | List emission factor data providers |
| GET | `/api/common-conversions` | Unit conversion factors |
| GET | `/api/factors-conversions` | Factor-specific conversions |
| GET | `/api/sections` | Report section definitions |
| GET | `/api/countries` | Country reference list |
| GET | `/api/countries/by-activity/{activityName}` | Countries where an activity has emission factors |

## Settings & Access

| Method | Path | Min Role | Notes |
|--------|------|----------|-------|
| GET | `/api/settings` | CFC_USER | All settings |
| GET | `/api/company-settings` | CFC_USER | Company-level settings |
| POST | `/api/settings/save` | CFC_USER | Save settings |
| POST | `/api/settings/base-year` | CFC_ADMIN | Set base year |
| POST | `/api/settings/sections` | CFC_ADMIN | Configure visible sections |
| POST | `/api/access-rights/{group}` | CFC_USER | Grant group access |
| DELETE | `/api/access-rights/{group}` | CFC_USER | Revoke group access |

## Files & Import

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/files` | Upload file (supporting docs) |
| GET | `/api/file/{id}` | Download file |
| DELETE | `/api/file/entry/{id}` | Delete file from entry |
| POST | `/api/import` | Import entries from file (CSV/Excel) |

## Utility

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/help-texts` | Help text content |
| PUT | `/api/update-help-text/{id}` | Update help text |
| GET | `/api/company-names/find/{searchText}` | Company name search |

## Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | Public |

---

## External Integrations

| Service | Purpose |
|---------|---------|
| Azure Blob Storage | Store uploaded documents and export files |
| PostgreSQL | Primary data store |

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `get_carbon_entries` | `GET /api/entries` | "What are our Scope 1 emissions for Q3 2025?" |
| `get_emission_factors` | `GET /api/factors` | "What emission factor should I use for business flights?" |
| `get_report_results` | `GET /api/report-results/{id}` | "What's our total carbon footprint for 2025?" |
| `get_activity_categories` | `GET /api/categories/as-tree` | "Show me the emission category tree." |
| `export_report` | `POST /api/reports/export` | "Export our 2025 CFC report as Excel." |
