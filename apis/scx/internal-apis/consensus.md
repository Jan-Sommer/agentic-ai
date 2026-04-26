# Internal API: Consensus Planning

> Collaborative forecast adjustment and reconciliation. Prime candidate for **human-in-the-loop** MCP patterns.

## Endpoints

| Method | Path | Auth | Min Role | MCP Group | Use Case |
|--------|------|------|----------|-----------|----------|
| **GET** | **`/consensus/{configId}/dimension-groups`** | **JWT** | **Standard** | **D** | Discover hierarchy (Region > Country > Product) |
| GET | `/consensus/{configId}/available-columns` | JWT | Standard | — | Editable columns (schema introspection) |
| **GET** | **`/consensus/{consensusId}/history-logs`** | **JWT** | **Standard** | **D** | Full audit trail of all overrides |
| GET | `/consensus/templates` | JWT | Standard | — | Consensus templates (admin setup) |
| POST | `/consensus/templates` | JWT | Standard | — | Create template |
| **GET** | **`/consensus/predictions/{predictionId}`** | **JWT** | **Standard** | **D** | Fetch current prediction before proposing override |
| **POST** | **`/consensus/reconciliation/{configurationId}`** | **JWT** | **Standard** | **D** | Commit approved overrides as the final plan |

> **Warning — reconcile:** Commits forecast overrides that change the active plan. Always require explicit human confirmation before executing.

## Human-in-the-Loop Workflow

The recommended agentic pattern using consensus APIs:

1. **Agent** calls `get_prediction_for_consensus` → reads the current statistical forecast
2. **Agent** calls `get_consensus_dimensions` → understands the hierarchy level to apply overrides
3. **Agent** proposes adjustments and presents them to the human (no API call at this step)
4. **Human** reviews and approves (in the SCX UI or in the agent chat)
5. **Agent** calls `reconcile_forecast` with approved overrides + a mandatory comment explaining the reason
6. **Agent** calls `get_consensus_history` to confirm the change was recorded

**Example:** *"Adjust the Q3 forecast for Category Electronics by +15% due to the summer campaign approved by Sales Director. Commit."*

---

## MCP Opportunity

| Tool | Endpoint | Use Case |
|------|----------|----------|
| `get_consensus_dimensions` | `GET /consensus/{configId}/dimension-groups` | "What hierarchy levels can I apply forecast overrides to for config C-3?" |
| `get_consensus_prediction` | `GET /consensus/predictions/{predictionId}` | "What is the current statistical forecast for Electronics Q3 before I propose a change?" |
| `get_consensus_history` | `GET /consensus/{consensusId}/history-logs` | "Show the full audit trail of overrides applied to this consensus plan." |
| `reconcile_forecast` | `POST /consensus/reconciliation/{configurationId}` | "Commit the approved +15% Q3 adjustment for Electronics. Reason: summer campaign." |

> **Human-in-the-loop requirement:** `reconcile_forecast` permanently alters the active plan. The agent must present proposed changes and receive explicit human approval before calling this tool. Reason text is mandatory and becomes part of the audit trail.
