# Internal API: Events & Event Extraction

> Two related sub-domains: **Events** (structured forecast inputs) and **Event Extraction** (NLP pipeline for external news/feeds).  
> Event Extraction is the most AI-native surface in SCX — designed for external automated systems.

## Events

Events represent external factors that affect demand: promotions, holidays, supply disruptions, campaigns. Each event has **variables** (quantitative impact factors) attached.

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/events`** | **JWT** | **Standard** | **E** | List all events currently in the forecast |
| **POST** | **`/events`** | **JWT** | **Standard** | **E** | Create a new forecast event |
| PUT | `/events/{id}` | JWT | Standard | — | Update an event |
| DELETE | `/events/{id}` | JWT | Admin | — | Delete an event |

> **Warning — create_event:** Modifies forecast inputs. Present event details to the user for confirmation before writing.

**Existing OpenAPI spec:** `forecast_v1_external-data.yaml` — covers events and event-variables. Verify paths against current routes before using for codegen.

## Event Variables

Event variables are quantitative impact factors attached to events (e.g. uplift factor = 1.3 for a promotion).

| Method | Path | Auth | Min Role | MCP Group | Notes |
|--------|------|------|----------|-----------|-------|
| GET | `/events/event-variables` | JWT | Standard | **E** | List all variable definitions |
| GET | `/events/event-variables/names` | JWT | Standard | — | Names + IDs only (lightweight lookup) |
| POST | `/events/event-variables` | JWT | Standard | — | Create variable (schema definition task) |
| PUT | `/events/event-variables/{id}` | JWT | Standard | — | Update variable |
| DELETE | `/events/event-variables/{id}` | JWT | Admin | — | Delete variable |

## Event Extraction (NLP Pipeline)

Accepts articles from external sources, extracts structured events, imports them into SCX. **API Key auth only** — no JWT required. Designed for machine-to-machine use.

| Method | Path | Auth | MCP Group | Use Case |
|--------|------|------|-----------|----------|
| **GET** | **`/event-extraction/topics`** | **JWT** | **E** | List topic categories the pipeline recognises |
| GET | `/event-extraction/articles-table` | JWT | **E** | View articles already processed |
| **POST** | **`/event-extraction/import`** | **API Key** | **E** | Import extracted events (M2M entry point) |

> **Warning — import:** Writes events that affect future forecast runs. Show proposed events to the user before importing.

## Agentic Workflow: News-to-Forecast Event Injection

End-to-end loop using Group E tools:

1. **Call `get_extraction_topics`** → learn what event types SCX understands (disruptions, promotions, etc.)
2. **Fetch news** via web search or feed (external tool)
3. **LLM extracts structured events** from article text, mapping them to SCX topic types
4. **Present proposed events to user** for review (no API call)
5. **Call `import_extracted_events`** with approved events (API Key auth)
6. **Optionally call `execute_forecast`** (Group C) to re-run with the new events included

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `list_events` | `GET /events` | "What events are currently factored into the forecast?" |
| `get_extraction_topics` | `GET /event-extraction/topics` | "What event types can the extraction pipeline recognise?" |
| `list_processed_articles` | `GET /event-extraction/articles-table` | "What news articles have already been processed?" |
| `create_event` | `POST /events` | "Add a summer promotion event for May–June with uplift factor 1.25." (requires human confirmation) |
| `import_extracted_events` | `POST /event-extraction/import` | "Import these 3 supply disruption events extracted from today's news." (API Key auth) |

> **End-to-end agent workflow:** `get_extraction_topics` → fetch external news → LLM extracts structured events → present to user for review → `import_extracted_events` → optionally trigger forecast re-run.

> **Warning:** `create_event` and `import_extracted_events` modify forecast inputs. Always present proposed events to the user before writing.
