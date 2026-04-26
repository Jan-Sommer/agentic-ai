# Internal API: Commodity Price Forecasting

> Tracks and forecasts raw material prices (copper, aluminum, plastics, etc.) with LME data, hedging recommendations, and price-relevant news. Read-only from MCP perspective.

## Endpoints

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/commodity-price/materials`** | **JWT** | **Standard** | **F** | List all tracked commodities |
| GET | `/commodity-price/versions` | JWT | Standard | **F** | Available forecasted price versions |
| **GET** | **`/commodity-price/home-cards`** | **JWT** | **Standard** | **F** | Snapshot: current price, trend, alerts per commodity |
| **GET** | **`/commodity-price/trend`** | **JWT** | **Standard** | **F** | LME price trend over time |
| GET | `/commodity-price/chart-dataframe` | JWT | Standard | **F** | Chart data including hedging overlay |
| **POST** | **`/commodity-price/hedging`** | **JWT** | **Standard** | **F** | Calculate hedging recommendation |
| **GET** | **`/commodity-price/news`** | **JWT** | **Standard** | **F** | Latest price-relevant news articles |
| GET | `/commodity-price/data-source` | JWT | Standard | — | Data source metadata |
| POST | `/commodity-price/cpf` | JWT | Admin | — | Create a commodity price forecast run |
| POST | `/commodity-price/import` | API Key | — | — | Import price data (M2M ingestion) |

> **Note — hedging:** `POST /hedging` performs a pure calculation with no state mutation. Safe to call as a read-only tool despite being a POST.

## Example Agent Questions

- *"Is copper trending up or down? What's the 3-month trajectory?"*
- *"Should we hedge our aluminum purchases for Q4? Given our forecasted consumption of 500 tonnes, what's the recommendation?"*
- *"What's driving the current nickel price spike? Show me the relevant news."*
- *"Give me a snapshot of all tracked commodities — current price, direction, and any alerts."*

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `list_commodities` | `GET /commodity-price/materials` | "Which raw materials are we tracking?" |
| `get_commodity_snapshot` | `GET /commodity-price/home-cards` | "Give me a current price, trend, and alert snapshot for all commodities." |
| `get_price_trend` | `GET /commodity-price/trend` | "Is copper trending up or down over the last 3 months?" |
| `get_hedging_recommendation` | `POST /commodity-price/hedging` | "Should we hedge our Q4 aluminum purchases? We need 500 tonnes." |
| `get_commodity_news` | `GET /commodity-price/news` | "What's driving the current nickel price spike? Show relevant news." |

> **Note:** `get_hedging_recommendation` uses `POST /hedging` but is a pure calculation — no state mutation. Safe to use as a read-only analytical tool.

> **Feature flag guard:** Call `GET /feature-flags` before invoking any commodity-price tool to verify the module is enabled for the tenant.
