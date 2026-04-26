# waves-smp-backend — Sustainable Mobility Platform API

> **Purpose:** Fleet logistics management with sustainable transportation tracking.  
> Manages vehicles, trailers, shipments, tours, bookings, tariffs, invoices, and emissions.  
> **Base URL:** `http://localhost:9529` · **Auth:** JWT Bearer + API Key  
> **Stack:** PHP 8.4 + Symfony 7.4 + API Platform 3.4.17  
> **OpenAPI spec:** `API_Specification_SMP.yaml` (18,734 lines) · Version: v2.11 · **Complete ✅**

---

## Auth & Response Format

| Auth type | Header | Notes |
|-----------|--------|-------|
| JWT | `Authorization: Bearer {token}` | Keycloak-issued JWT |
| API Key | `Authorization: {key}` | Fallback for machine-to-machine |

**Response formats:** `application/ld+json` (Hydra) · `application/json` · `text/csv` (exports)  
**Pagination:** Default 10 items/page, max 10,000

---

## Booking & Certificates

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/bookings` | JWT | List bookings (paginated) |
| POST | `/api/bookings` | JWT | Create booking |
| GET | `/api/bookings/{id}` | JWT | Get booking |
| PATCH | `/api/bookings/{id}` | JWT | Update booking |
| PATCH | `/api/bookings/{id}/cancel` | JWT | Cancel booking |
| GET | `/api/tariff-bookings` | JWT | List tariff bookings |
| POST | `/api/tariff-bookings` | JWT | Create tariff booking |
| GET | `/api/tariff-bookings/{id}` | JWT | Get tariff booking |
| PATCH | `/api/tariff-bookings/{id}` | JWT | Update tariff booking |
| PATCH | `/api/tariff-bookings/{id}/cancel` | JWT | Cancel tariff booking |
| POST | `/api/booking-certificate-files` | JWT | Upload certificate file |
| GET | `/api/booking-certificate-files/{id}` | JWT | Get certificate file |
| GET | `/api/booking-certificate-files/{id}/download` | JWT | Download certificate |
| DELETE | `/api/booking-certificate-files/{id}` | JWT | Delete certificate |

## Claims

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/claims` | JWT | List claims |
| POST | `/api/claims` | JWT | Create claim |
| GET | `/api/claims/{id}` | JWT | Get claim |
| PATCH | `/api/claims/{id}` | JWT | Update claim |
| POST | `/api/claims/{id}/export` | JWT | Export claim |

## Company Management

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/companies` | JWT | List companies |
| POST | `/api/companies` | JWT | Create company |
| GET | `/api/companies/{id}` | JWT | Get company |
| PATCH | `/api/companies/{id}` | JWT | Update company |
| DELETE | `/api/companies/{id}` | JWT | Delete company |
| GET | `/api/companies/export` | JWT | Export company list |
| GET | `/api/companies/list` | JWT | Simplified company list |
| POST | `/api/companies/registration` | JWT | Register company |
| POST | `/api/companies/registration/approve` | JWT | Approve registration |
| POST | `/api/companies/registration/confirm` | JWT | Confirm registration |
| GET | `/api/companies/{id}/address` | JWT | Get company address |
| GET | `/api/companies/{id}/matching-configuration` | JWT | Get matching config |
| PATCH | `/api/companies/{id}/unlock` | JWT | Unlock company |
| GET | `/api/companies/{id}/book-tax-demo/{userId}` | JWT | Book tax demo |
| GET | `/api/companies/{id}/tax-demo-booking-date` | JWT | Get tax demo date |

## Shipments

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| **GET** | **`/api/shipments`** | JWT | List shipments (paginated + filterable) |
| POST | `/api/shipments` | JWT | Create shipment |
| **GET** | **`/api/shipments/{id}`** | JWT | Get shipment detail |
| GET | `/api/shipments/export` | JWT | Export shipments (CSV/JSON) |

## Tours

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| **GET** | **`/api/tours`** | JWT | List tours |
| POST | `/api/tours` | JWT | Create tour |
| **GET** | **`/api/tours/{id}`** | JWT | Get tour detail |
| PATCH | `/api/tours/{id}` | JWT | Update tour |
| GET | `/api/tours/export` | JWT | Export tours |
| GET | `/api/tour-codes` | JWT | List tour codes |
| POST | `/api/tour-codes` | JWT | Create tour code |
| GET | `/api/tour-codes/{id}` | JWT | Get tour code |

## Shippers

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/shippers` | JWT | List shippers |
| POST | `/api/shippers` | JWT | Create shipper |
| GET | `/api/shippers/{id}` | JWT | Get shipper |
| GET | `/api/shippers/user-group/{userGroupId}` | JWT | Shippers in user group |
| GET | `/api/shippers/{id}/shipments` | JWT | Shipments for shipper |
| GET | `/api/shippers/{id}/shipperCustomerNumbers` | JWT | Customer numbers |

## Fleet — Vehicles

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/vehicles` | JWT | List vehicles |
| POST | `/api/vehicles` | JWT | Create vehicle |
| GET | `/api/vehicles/{id}` | JWT | Get vehicle |
| PATCH | `/api/vehicles/{id}` | JWT | Update vehicle |
| GET | `/api/vehicles/export` | JWT | Export vehicle list |
| PATCH | `/api/vehicles/{id}/decommission` | JWT | Decommission vehicle |
| PATCH | `/api/vehicles/{id}/restore` | JWT | Restore decommissioned vehicle |

## Fleet — Trailers

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/trailers` | JWT | List trailers |
| POST | `/api/trailers` | JWT | Create trailer |
| GET | `/api/trailers/{id}` | JWT | Get trailer |
| PATCH | `/api/trailers/{id}` | JWT | Update trailer |
| GET | `/api/trailers/export` | JWT | Export trailer list |
| PATCH | `/api/trailers/{id}/decommission` | JWT | Decommission trailer |
| PATCH | `/api/trailers/{id}/restore` | JWT | Restore trailer |

## Tariffs

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/tariffs` | JWT | List tariffs |
| POST | `/api/tariffs` | JWT | Create tariff |
| GET | `/api/tariffs/{id}` | JWT | Get tariff |
| PATCH | `/api/tariffs/{id}` | JWT | Update tariff |
| DELETE | `/api/tariffs/{id}` | JWT | Delete tariff |
| GET | `/api/tariffs/types` | JWT | Available tariff types |
| GET | `/api/active-tariffs` | JWT | Currently active tariffs |
| GET | `/api/base-years` | JWT | Available base years |
| GET/POST | `/api/tariff-translations` | JWT | Tariff translations |
| GET/PATCH/DELETE | `/api/tariff-translations/{id}` | JWT | Manage translation |

## Invoices

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/invoices` | JWT | List invoices |
| POST | `/api/invoices` | JWT | Create invoice |
| GET | `/api/invoices/{id}` | JWT | Get invoice |
| PATCH | `/api/invoices/{id}` | JWT | Update invoice |
| DELETE | `/api/invoices/{id}` | JWT | Delete invoice |
| GET | `/api/invoices/invoice-report` | JWT | Invoice report |
| GET | `/api/invoices/invoice-report/export` | JWT | Export invoice report |

## Users & Groups

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/users` | JWT | List users |
| POST | `/api/users` | JWT | Create user |
| GET | `/api/users/{id}` | JWT | Get user |
| PATCH | `/api/users/{id}` | JWT | Update user |
| DELETE | `/api/users/{id}` | JWT | Delete user |
| GET | `/api/users/for-groups` | JWT | Users available for groups |
| GET | `/api/users/own-company` | JWT | Users in own company |
| PATCH | `/api/users/{id}/set-language` | JWT | Set user language |
| PATCH | `/api/users/{id}/intro-shown` | JWT | Mark intro as seen |
| PATCH | `/api/users/{id}/release-notes-shown` | JWT | Mark release notes as seen |
| GET/POST | `/api/user-groups` | JWT | User groups |
| GET/PATCH/DELETE | `/api/user-groups/{id}` | JWT | Manage user group |
| GET/POST/DELETE | `/api/user-preferences/{id}` | JWT | User preferences |

## Data Mapping & Import

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET/POST | `/api/mappings` | JWT | List/create data mappings |
| GET/PATCH | `/api/mappings/{id}` | JWT | Get/update mapping |
| POST | `/api/mappings/{id}/upload` | JWT | Upload mapping file |
| POST | `/api/mappings/check-required-field` | JWT | Validate required fields |
| POST | `/api/mappings/matching` | JWT | Run matching algorithm |
| GET | `/api/mapping-import-tasks` | JWT | List import tasks |
| GET | `/api/mapping-import-tasks/{id}` | JWT | Get import task |
| PATCH | `/api/mapping-import-tasks/{id}/cancel` | JWT | Cancel import |
| GET | `/api/mapping-import-tasks/{id}/download` | JWT | Download result |
| GET/POST | `/api/mapping-formats` | JWT | Mapping format definitions |
| GET/POST | `/api/mapping-fields` | JWT | Mapping field definitions |

## Analytics & Dashboard

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/dashboard-customer-stats` | JWT | Customer KPIs |
| GET | `/api/dashboard-shipment-stats` | JWT | Shipment KPIs |
| GET | `/api/dashboard-invoicing-stats` | JWT | Invoicing KPIs |
| GET | `/api/dashboard-tour-stats` | JWT | Tour emission KPIs |
| GET | `/api/transaction-kpi` | JWT | Transaction-level KPIs |
| GET | `/api/transaction-history` | JWT | Transaction history |

## Exports & Files

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/export-jobs` | JWT | List export jobs |
| GET | `/api/export-jobs/progress` | JWT | Job progress |
| GET | `/api/export-jobs/{id}` | JWT | Get export job |
| GET | `/api/export-jobs/{id}/download` | JWT | Download export |
| POST | `/api/file-objects` | JWT | Upload file object |

## Reference Data (Read-Only)

| Endpoint | Notes |
|----------|-------|
| `GET /api/countries` · `/api/countries/{id}` | Country list |
| `GET /api/fuel-types` | Fuel type options |
| `GET /api/glec-vehicle-types` | GLEC vehicle classification |
| `GET /api/glec-trailer-types` | GLEC trailer classification |
| `GET /api/transport-modes` · `/{id}` | Transport mode options |
| `GET /api/units` | Unit types |
| `GET /api/source-versions` | Data source versions |
| `GET /api/modules` | Enabled modules for company |
| `GET /api/texts` | Localised text content |

## Tagging & Filtering

| Endpoint | Notes |
|----------|-------|
| `GET/POST /api/tags` · `/api/tags/{id}` | Custom tags |
| `GET/POST /api/tag-groups` · `/{id}` | Tag groups |
| `GET/POST /api/filter-shipment-tags` | Shipment filter tags |
| `GET /api/filter-tour-tags` | Tour filter tags |

## Release Notes

| Endpoint | Notes |
|----------|-------|
| `GET/POST /api/release-notes` · `/{id}` | Release notes CRUD |
| `GET /api/release-notes/texts` | Release note text content |
| `GET/POST /api/release-versions` · `/{id}` | Version entries |

## Sales & Audit

| Endpoint | Notes |
|----------|-------|
| `GET/POST /api/sales-datas` · `/{id}` | Sales data records |
| `GET /api/log-useractions` · `/{id}` · `/export` | User action audit log |

## Tasks

| Endpoint | Notes |
|----------|-------|
| `GET/POST /api/tasks` · `/{id}` | Task management |

## Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | Public |

---

## External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Keycloak | JWT auth, user management | `AUTH_PRIVATE_URL`, `AUTH_PUBLIC_URL` |
| Azure Blob Storage | Exports, uploads, mapping data | `SMP_STORAGE_DSN_STRING` |
| Bitwarden | Secrets management | `BITWARDEN_API_URL`, `BITWARDEN_ORGANIZATION_ID` |
| SMTP (Google) | Email notifications | `MAILER_DSN` |

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `get_shipments` | `GET /api/shipments` | "Show me all shipments for carrier X this month." |
| `get_shipment_detail` | `GET /api/shipments/{id}` | "Give me the full detail for shipment S-789." |
| `get_tour_detail` | `GET /api/tours/{id}` | "What's the CO2 footprint and route breakdown for tour T-1234?" |
| `get_tour_emission_stats` | `GET /api/dashboard-tour-stats` | "Give me a KPI overview of fleet emissions this quarter." |
| `get_active_tariffs` | `GET /api/active-tariffs` | "What tariffs are currently active for road transport?" |
| `list_vehicles` | `GET /api/vehicles` | "How many active vehicles do we have by fuel type?" |
| `get_audit_log` | `GET /api/log-useractions` | "Who made changes to tour T-456 and when?" |
| `create_booking` | `POST /api/bookings` | "Create a booking for shipment S-789 under tariff T-5." |
| `cancel_booking` | `PATCH /api/bookings/{id}/cancel` | "Cancel booking B-112." |
| `export_shipments` | `GET /api/shipments/export` | "Export all shipments from Q1 as CSV." |
| `get_invoice_report` | `GET /api/invoices/invoice-report` | "Show me the invoicing summary for March." |

> **Spec note:** The complete `API_Specification_SMP.yaml` (18,734 lines, v2.11) makes this the easiest MCP integration surface in the SMP ecosystem — standard codegen tools will work directly against it.
