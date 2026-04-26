# MCP Server — Design Overview for SCX

## What is MCP?

**Model Context Protocol (MCP)** is an open standard by Anthropic that defines how AI models connect to external tools and data sources. It's transport-agnostic and replaces ad-hoc function-calling integrations with a standardized server/client protocol.

An MCP server exposes **tools** (callable functions), **resources** (readable data), and **prompts** (templates). The AI agent calls tools by name with typed arguments; the server executes them and returns structured results.

---

## Why Put an MCP Server in Front of SCX?

| Without MCP | With MCP |
|-------------|----------|
| Agent needs API key / JWT | MCP server holds credentials; agents are credential-free |
| Agent must know REST paths | Agent calls named tools with typed inputs |
| Auth errors surface raw to agent | Server handles retry / token refresh |
| Async job polling logic in every agent | Server abstracts SSE polling into sync responses |
| Multi-tenancy must be handled by caller | Server injects tenant context from session |
| No guardrails on destructive calls | Read-only vs. write tool separation enforced at server |

---

## Core MCP Concepts

### Tools
Functions the model can call. Each tool has:
- `name` — unique identifier (snake_case)
- `title` — human-readable display name
- `description` — **critical**: the LLM reads this to decide when to call the tool
- `inputSchema` — Zod schema (auto-converts to JSON Schema)
- `outputSchema` — optional structured return type

### Resources
Read-only data the model can inspect. Used for:
- Exposing API documentation as context
- Providing lookup tables (e.g. available configurations)
- Sharing tenant metadata

### Prompts
Reusable instruction templates with named arguments. Useful for:
- Standardized "review forecast accuracy" workflows
- Guided replenishment alert summaries

---

## Transport Options

| Transport | When to use | Config |
|-----------|-------------|--------|
| **stdio** | Local: Claude Desktop, Claude Code | `command` + `args` in claude_desktop_config.json |
| **Streamable HTTP** | Production: remote agents, multi-tenant | Single `POST /mcp` endpoint |

**Recommended:**
- Start with `stdio` for development and Claude Desktop testing
- Deploy as `Streamable HTTP` for production (stateless mode = no session state, horizontally scalable)

---

## Authentication Strategy

The MCP server holds all credentials. Agents never see them.

```
[Agent] → tool call with (name, args) → [MCP Server]
                                              │
                             ┌────────────────┴──────────────────┐
                             │  Inject from env:                  │
                             │  SCX_API_KEY → x-api-key header   │
                             │  SCX_TENANT_ID → tenant context   │
                             │  SCX_JWT_TOKEN → Bearer (if JWT)  │
                             └────────────────┬──────────────────┘
                                              │
                                    [forecast-backend /api/v1/]
```

**For read-only tools (Groups A, B, F):** Use API Key where endpoints support it, else obtain a JWT via Keycloak Client Credentials flow.

**For write tools (Groups C, D, E):** Use JWT (service account) with minimum required role (Standard or Admin as needed).

**Keycloak Client Credentials Flow:**
```
POST {KEYCLOAK_URL}/realms/{TENANT_REALM}/protocol/openid-connect/token
Body: grant_type=client_credentials
      &client_id={MCP_CLIENT_ID}
      &client_secret={MCP_CLIENT_SECRET}
→ { access_token, expires_in }
```

Cache the token and refresh before expiry.

---

## Multi-Tenancy

SCX is multi-tenant — every request is scoped to a company. The MCP server must:
1. Map each agent session to a `tenantId` / `realm`
2. Use the correct credentials (API key or JWT) for that tenant
3. Pass tenant context in requests (the backend reads it from the JWT or API key)

**Simple approach for single-tenant deployment:** hardcode `SCX_TENANT_ID` in env.  
**Multi-tenant MCP:** each tenant gets their own MCP server instance, or the server reads tenant from session headers.

---

## Tool Groups & Rollout Strategy

| Group | Name | Read/Write | Risk | Recommended Phase |
|-------|------|-----------|------|-------------------|
| A | Forecast Intelligence | Read | None | Phase 1 — start here |
| B | Replenishment Risk | Read | None | Phase 1 |
| F | Commodity Pricing | Read | None | Phase 1 |
| C | Forecast Execution | Write | Low (triggers jobs) | Phase 2 |
| E | Event Injection | Write | Medium (changes model inputs) | Phase 2 with confirmation |
| D | Consensus Workflow | Write | Medium (commits plan overrides) | Phase 3 (human-in-the-loop) |

---

## Async Pattern: Forecast Job Execution

Some SCX operations are long-running (forecast runs take minutes). The MCP server must bridge the async gap:

```
Agent calls execute_forecast
    │
    ▼
MCP Server → POST /api/v1/configurations/{id}/execute
    │           → returns { jobId }
    │
    ▼
MCP Server subscribes to GET /api/v1/sse/{tenantId}
    │           → streams progress events
    │
    ▼ (job complete)
MCP Server → GET /api/v1/configurations/{id}/latest-predictions
    │
    ▼
Return result to agent as tool response
```

Set a timeout (e.g. 10 minutes) and return a partial result with a polling hint if exceeded.

---

## SDK & Setup

```bash
npm install @modelcontextprotocol/sdk zod
```

**Minimum Node.js:** 18+  
**Package type:** `"type": "module"` (ESM)  
**Current SDK version:** 1.26.0

See `server-example.ts` for a working implementation with 6 example tools.  
See `package.json` for the full project setup.  
See `claude-desktop-config.json` to wire it into Claude Desktop.

---

## Folder Contents

| File | Purpose |
|------|---------|
| `overview.md` | This file — design decisions and MCP concepts |
| `tool-groups.yaml` | Complete tool definitions for all 6 groups (A–F) |
| `server-example.ts` | Full TypeScript MCP server with 6 implemented tools |
| `package.json` | npm project setup for the MCP server |
| `claude-desktop-config.json` | Claude Desktop local development config |
