# SCX API Reference — MCP Server Planning

> **Purpose:** Machine- and human-readable documentation of all APIs in the `pacemaker-v2` (SCX)
> system, structured to support building an MCP server on top of it.
>
> **Source:** `pacemaker-v2` monorepo — NestJS backend, Angular frontends, Nx workspace.  
> **Last scanned:** 2026-04-24

---

## Folder Structure

```
scx/
├── README.md                    ← this file (meta, how to use)
├── architecture.md              ← system overview, auth, component map
│
├── internal-apis/               ← APIs exposed by forecast-backend
│   ├── forecast.md              ← configurations, data series, results, export
│   ├── insights.md              ← analytics, portfolio, analysis
│   ├── replenishment.md         ← replenishment planning, critical stock
│   ├── consensus.md             ← consensus planning, reconciliation
│   ├── events.md                ← events, event-variables, event extraction (NLP)
│   ├── commodity-price.md       ← commodity price forecasting & hedging
│   └── admin.md                 ← users, companies, settings, notifications, health
│
├── external-apis/               ← APIs consumed by forecast-backend
│   ├── ml-pipeline.md           ← Python ML forecasting service (has full OpenAPI spec)
│   └── integrations.md          ← Keycloak, Snowflake, Flagsmith, Azure, Redis, etc.
│
├── specs/
│   └── existing-specs.md        ← inventory of existing OpenAPI specs and their coverage
│
└── mcp/                         ← MCP server design & implementation
    ├── overview.md              ← what MCP is, design decisions, placement strategy
    ├── tool-groups.md           ← all tool definitions (Groups A–F)
    ├── server-example.ts        ← full TypeScript MCP server implementation
    ├── package.json             ← npm setup for the MCP server
    └── claude-desktop-config.json  ← how to wire it into Claude Desktop
```

---

## Quick Reference

| File | What to use it for |
|------|-------------------|
| `architecture.md` | Understand the system before designing MCP tools |
| `internal-apis/*.md` | Find endpoints by domain; each includes MCP relevance tags |
| `external-apis/*.md` | Understand what the backend depends on; avoid duplicating calls |
| `specs/existing-specs.md` | Check whether a spec already exists before hand-writing a tool |
| `mcp/tool-groups.md` | The proposed MCP tool inventory — start here for implementation |
| `mcp/server-example.ts` | Working TypeScript MCP server with 6 example tools |
| `mcp/claude-desktop-config.json` | Drop-in config for local development |

---

## MCP Placement Summary

The MCP server sits **in front of** the `forecast-backend` REST API. It:
- Holds credentials (API key or JWT) — agents never see them
- Injects tenant context per session
- Translates natural-language intent into typed HTTP calls
- Handles async job polling (SSE → synchronous tool response)

**Recommended start:** Groups A + B (read-only, zero risk of data mutation).  
**AI-native surface:** Group E (event extraction — designed for external systems).  
**Full spec available for:** ML Pipeline (Group C tools can be code-generated).

See [`mcp/overview.md`](mcp/overview.md) and [`mcp/tool-groups.yaml`](mcp/tool-groups.yaml) for details.
