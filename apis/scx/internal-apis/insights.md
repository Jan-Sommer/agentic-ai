# Internal API: Insights & Analytics

> Entirely read-only. Highest-value MCP surface — all endpoints answer analytical questions without any state mutation.

## Portfolio & Trend Insights

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/insights/portfolio-totals/forecast/{forecastId}`** | **JWT** | **Standard** | **A** | Total forecasted units/revenue across the portfolio |
| GET | `/insights/portfolio-totals-multi-year/forecast/{forecastId}` | JWT | Standard | **A** | Multi-year portfolio totals |
| GET | `/insights/yearly-portfolio-totals/{resultSetId}` | JWT | Standard | **A** | Yearly breakdown per result set |
| **POST** | **`/insights/results/{resultSetId}/year-to-date-trend/{filterName}`** | **JWT** | **Standard** | **A** | YTD forecast vs. actual trend |
| **POST** | **`/insights/results/{resultSetId}/yearly-comparison`** | **JWT** | **Standard** | **A** | Year-over-year comparison |
| POST | `/insights/results/{resultSetId}/single-forecasts` | JWT | Standard | **A** | Insights per individual forecast item |

**Example agent question:** *"How is our year-to-date forecast tracking vs actual for category Electronics?"*

## Accuracy & Classification

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/insights/planning-accuracy/{resultSetId}`** | **JWT** | **Standard** | **A** | MAPE, bias, accuracy by time period |
| **GET** | **`/insights/analysis-results/{analysisId}/abc-xyz`** | **JWT** | **Standard** | **A** | ABC-XYZ SKU segmentation |
| GET | `/insights/analysis-results/{analysisId}/planning-accuracy` | JWT | Standard | **A** | Accuracy scoped to an analysis config |

### ABC-XYZ Explained

| Axis | A | B | C |
|------|---|---|---|
| **Revenue contribution** | High | Medium | Low |

| Axis | X | Y | Z |
|------|---|---|---|
| **Demand variability** | Stable | Moderate | Erratic |

**AX** = high-value, predictable → prioritize service level  
**CZ** = low-value, erratic → consider stocking out or long replenishment cycles

**Example agent question:** *"Which SKUs are AZ — high revenue but hard to forecast? Where should we invest in better data?"*

## Analysis Configurations

Analysis configs define how ABC-XYZ and accuracy analyses are run. Create/manage via UI; query results via MCP.

| Method | Path | Auth | Min Role | MCP Group | Notes |
|--------|------|------|----------|-----------|-------|
| GET | `/analysis` | JWT | Standard | **A** | List configs (discover available analyses) |
| GET | `/analysis-configurations/{configId}` | JWT | Standard | — | Config detail |
| POST | `/analysis` | JWT | Admin | — | Create analysis |
| DELETE | `/analysis/{id}` | JWT | Admin | — | Delete analysis |
| POST | `/analysis-exports/{analysisId}` | JWT | Standard | — | Export results (return URL) |

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `get_portfolio_totals` | `GET /insights/portfolio-totals/forecast/{forecastId}` | "What's the total forecasted revenue across our portfolio this year?" |
| `get_ytd_trend` | `POST /insights/results/{id}/year-to-date-trend/{filterName}` | "How is our YTD forecast tracking vs actuals for category Electronics?" |
| `get_yearly_comparison` | `POST /insights/results/{id}/yearly-comparison` | "Compare this year's forecast to last year, broken down by category." |
| `get_planning_accuracy` | `GET /insights/planning-accuracy/{resultSetId}` | "What's our MAPE and bias for this quarter's forecast?" |
| `get_abc_xyz_classification` | `GET /insights/analysis-results/{analysisId}/abc-xyz` | "Which of our SKUs are AZ — high revenue but hard to forecast?" |
| `list_analyses` | `GET /analysis` | "What analysis configurations are available to query?" |

> **Highest read-only value:** All insights endpoints are non-mutating. They are the safest MCP tools to expose and answer the most common analytical questions an agent will face.
