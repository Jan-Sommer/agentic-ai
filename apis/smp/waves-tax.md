# waves-tax-backend — EU Taxonomy & TAXONOFY API

> **Purpose:** EU Taxonomy compliance reporting. Tracks financial activities (turnover, CapEx, OpEx) against EU Taxonomy classification codes and DNSH (Do No Significant Harm) criteria.  
> **Stack:** PHP 8.4 + Symfony 7.4 + API Platform 3.4.17  
> **Two OpenAPI specs:** internal `api.yaml` (v2.8.0, 3,162 lines) + public `TAXONOFY_API.yaml` (v2.9.0, 826 lines)

---

## Two Distinct APIs

| API | Spec file | Auth | Format | For |
|-----|-----------|------|--------|-----|
| **Internal** | `api.yaml` | JWT (lexik) | Hydra JSON-LD | Frontend / internal services |
| **TAXONOFY** | `TAXONOFY_API.yaml` | API Key (`x-api-key`) | Plain JSON | External clients / M2M |

---

## Internal API (api.yaml)

**Base path:** `/api` · **Auth:** `Authorization: Bearer {JWT}`

### Tax Activities

| Method | Path | Notes |
|--------|------|-------|
| **GET** | `/api/tax-activities` | List all activities (filterable, paginated) |
| **POST** | `/api/tax-activities` | Create new activity |
| **PATCH** | `/api/tax-activities/{id}` | Update activity |
| **DELETE** | `/api/tax-activities/{id}` | Delete activity |

### Activity Overviews (Reporting)

| Method | Path | Notes |
|--------|------|-------|
| **GET** | `/api/tax-activity-overviews` | Aggregated overview across all activities |
| **GET** | `/api/tax-activity-overviews/export/excel` | Export overview as Excel |
| **GET** | `/api/tax-activity-overviews/export/report` | Export as PDF report |

### EU Taxonomy Reference Data

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/tax-eu-activities` | List all EU Taxonomy activities (static data) |
| GET | `/api/tax-eu-activities/{id}` | Get EU activity detail |
| GET | `/api/tax-eu-activities/{id}/criteria` | Get criteria for an EU activity |
| GET | `/api/tax-eu-activity-criteria/dnsh` | DNSH criteria list |
| GET | `/api/tax-eu-activity-criterias` | All criteria |
| GET | `/api/tax-eu-activity-criteria-text` | Criteria description texts |
| GET | `/api/tax-eu-activity-criteria-dnsh-text` | DNSH criterion text |
| GET | `/api/tax-eu-activity-criteria-dnsh-texts` | All DNSH texts |

### Financial Years

| Method | Path | Notes |
|--------|------|-------|
| **GET** | `/api/tax-financial-years` | List reporting years |
| **POST** | `/api/tax-financial-years` | Create financial year |
| **DELETE** | `/api/tax-financial-years/{id}` | Delete financial year |

### NACE Codes (Industry Classification)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/tax-nace-codes` | All NACE codes (reference data) |

---

## TAXONOFY Public API (TAXONOFY_API.yaml)

**Auth:** `x-api-key` header · **Format:** plain JSON · **Version:** 2.9.0  
Simplified, cleaner API intended for external integrations.

### Tax Activities

| Method | Path | Notes |
|--------|------|-------|
| **GET** | `/tax-activities` | List activities (with financial metrics) |
| **POST** | `/tax-activities` | Create activity |
| **GET** | `/tax-activities/{id}` | Get single activity |
| **PATCH** | `/tax-activities/{id}` | Update activity |
| **DELETE** | `/tax-activities/{id}` | Delete activity |

### Reference Data

| Method | Path | Notes |
|--------|------|-------|
| GET | `/eu-activities` | EU Taxonomy activity list (static) |
| GET | `/eu-activities/{id}` | EU activity detail |
| GET | `/nace-codes` | NACE industry codes |
| GET | `/nace-codes/{id}` | NACE code detail |

### Exports

| Method | Path | Notes |
|--------|------|-------|
| GET | `/export/pdf/{year}` | Full PDF compliance report for a year |
| GET | `/export/zip/{year}` | ZIP archive (PDF + supporting docs) |
| GET | `/export/excel/{year}` | Excel workbook |
| GET | `/export/result/{year}` | JSON result data |

---

## External Integrations

| Service | Purpose |
|---------|---------|
| Azure Blob Storage | Store uploaded supporting documents, export files |
| PostgreSQL (`taxonofy` DB) | Primary data store |

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `get_tax_activities` | `GET /api/tax-activities` | "What EU Taxonomy activities does our company report?" |
| `get_taxonomy_overview` | `GET /api/tax-activity-overviews` | "What % of our turnover is taxonomy-aligned?" |
| `export_taxonomy_report` | `GET /export/pdf/{year}` | "Generate the EU Taxonomy report for 2025." |
| `list_eu_activities` | `GET /eu-activities` | "What EU Taxonomy categories exist for energy?" |

> **TAXONOFY API Key** makes this a natural M2M surface — the MCP server holds the key and agents never see it.
