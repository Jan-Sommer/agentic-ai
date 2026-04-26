# waves-csrd-backend — CSRD Sustainability Reporting API

> **Purpose:** Corporate Sustainability Reporting Directive (CSRD) compliance. Manages sustainability indicators, materiality analyses, IRO tracking, and report generation.  
> **Stack:** PHP 8.4 + Symfony 7.4 + API Platform 3.4.17  
> **Auth:** JWT Bearer (`Authorization: Bearer {token}`)  
> **OpenAPI:** Auto-generated at `/api/docs.json` (no static spec file)

---

## Role Hierarchy

```
ROLE_SMP_ADMIN > ROLE_COMPANY_ADMIN > ROLE_CSRD_ADMIN > ROLE_CSRD_USER > ROLE_CSRD_READ_ONLY
```

---

## Reports

| Method | Path | Min Role | Notes |
|--------|------|----------|-------|
| **GET** | `/api/csrd-reports` | CSRD_USER | List reports (paginated) |
| **POST** | `/api/csrd-reports` | CSRD_ADMIN | Create report |
| **GET** | `/api/csrd-reports/{id}` | CSRD_USER | Get report detail |
| **PATCH** | `/api/csrd-reports/{id}` | CSRD_USER | Update report |
| **DELETE** | `/api/csrd-reports/{id}` | CSRD_ADMIN | Delete report |
| GET | `/api/csrd-reports/{id}/scopes` | CSRD_USER | Get report scopes |
| GET | `/api/csrd-reports/{id}/navigation` | CSRD_USER | Report navigation structure |
| POST | `/api/csrd-reports/{id}/update-scopes` | CSRD_USER | Update report scopes |
| **GET** | `/api/csrd-reports/{id}/export` | CSRD_USER | Export report as PDF |
| **GET** | `/api/csrd-reports/{id}/get-excel-reports` | CSRD_USER | Generate Excel reports |
| POST | `/api/csrd-reports/import` | CSRD_USER | Import report from file |
| POST | `/api/csrd-report-initial` | CSRD_USER | Get initial scope structure for new report |

## Indicators

CSRD indicators are the standardised data points companies must disclose (e.g. GHG emissions, employee metrics).

| Method | Path | Min Role | Notes |
|--------|------|----------|-------|
| **GET** | `/api/csrd-indicators` | CSRD_USER | List all indicators (paginated) |
| **GET** | `/api/csrd-indicators/{id}` | CSRD_USER | Get indicator definition |
| **GET** | `/api/csrd-indicator-values` | CSRD_USER | List indicator values (actual data) |
| **POST** | `/api/csrd-indicator-values` | CSRD_USER | Create indicator value |
| **GET** | `/api/csrd-indicator-values/{id}` | CSRD_USER | Get indicator value |
| **PATCH** | `/api/csrd-indicator-values/{id}` | CSRD_USER | Update indicator value |

## Scopes & Scope Entries

| Method | Path | Min Role | Notes |
|--------|------|----------|-------|
| GET | `/api/csrd-scopes` | CSRD_USER | List CSRD scopes |
| GET | `/api/csrd-scopes/{id}` | CSRD_USER | Get scope |
| GET | `/api/csrd-scope-entries` | CSRD_USER | Scope entry list |
| GET | `/api/csrd-scope-entries/{id}` | CSRD_USER | Get scope entry |

## Reference Data

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/csrd-units` | Unit types used in indicators |
| GET | `/api/csrd-unit-types` | Unit type definitions |

## Materiality Analysis (MA) & IROs

**Materiality Analysis** identifies which sustainability topics are material to the company.  
**IRO** = Impact, Risk, Opportunity — the structured assessment of each material topic.

| Method | Path | Min Role | Notes |
|--------|------|----------|-------|
| GET | `/api/ma-scopes` | CSRD_USER | List materiality analysis scopes |
| GET | `/api/ma-scopes/navigation` | CSRD_USER | Navigation structure |
| **GET** | `/api/ma-materiality-analyses` | CSRD_USER | List materiality analyses |
| **POST** | `/api/ma-materiality-analyses` | CSRD_ADMIN | Create analysis |
| **GET** | `/api/ma-materiality-analyses/{id}` | CSRD_USER | Get analysis detail |
| GET | `/api/ma-materiality-analyses/{id}/inventory` | CSRD_USER | IRO inventory for analysis |
| GET | `/api/ma-materiality-analyses/{id}/export` | CSRD_USER | Export materiality analysis |
| GET | `/api/ma-iros` | CSRD_USER | List IROs |
| GET | `/api/ma-iros/{id}` | CSRD_USER | Get IRO detail |
| POST | `/api/ma-iros/{id}` | CSRD_USER | Create IRO entry |
| GET | `/api/ma-iro-entries` | CSRD_USER | List IRO entries |

## File Uploads & Excel Import

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/files` | Upload file (supporting docs, evidence) |
| GET | `/api/file/{id}` | Download file |
| DELETE | `/api/file/indicator-value/{id}` | Delete indicator file |
| POST | `/api/csrd-excel-imports` | Create Excel import task |
| GET | `/api/csrd-excel-imports` | List import tasks |
| GET | `/api/csrd-excel-imports/{id}` | Get import status |
| POST | `/api/csrd-excel-imports/{id}/upload-indicators` | Upload indicator data from Excel |

## Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | Public |

---

## External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| `waves-smp-backend` | Fetch company address for reports | `BACKEND_API_URL` |
| Azure Blob Storage | File uploads and export storage | `SMP_STORAGE_DSN_STRING` |

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `list_csrd_indicators` | `GET /api/csrd-indicators` | "What CSRD indicators does our company need to report?" |
| `get_indicator_values` | `GET /api/csrd-indicator-values` | "What data have we collected for GHG emissions?" |
| `get_report_status` | `GET /api/csrd-reports/{id}` | "How complete is our 2025 CSRD report?" |
| `export_csrd_report` | `GET /api/csrd-reports/{id}/export` | "Generate the CSRD PDF report for 2025." |
| `get_materiality_analysis` | `GET /api/ma-materiality-analyses/{id}` | "Which sustainability topics are material for us?" |
