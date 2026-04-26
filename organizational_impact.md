# Agentic AI — Organizational Impact on the Technical Department

What the shift to agentic AI means concretely for each team — new skills, new responsibilities, new collaboration patterns, and what needs to change first.

---

## 1. The Core Shift

The move to agentic AI is not a technology project layered on top of existing teams. It changes the interface between every team in the technical department and the products they build. The clearest framing: agents are a new consumer of every existing technical capability — they consume ML model outputs as callable tools, ERP data as runtime context, platform infrastructure as execution environment. Every team must adapt how they design and expose their capabilities to serve this new consumer.

The impact is not uniform. It falls heaviest on the **platform team** (new infrastructure category to own), the **ML engineering teams** (new interface contract for their models), and the **stream-aligned product teams** (new development discipline). The data engineering team has the most nuanced shift — their role evolves from pipeline builders to data product owners.

Nothing about the current Team Topologies structure (stream-aligned + complicated subsystem + platform) needs to be dismantled. It maps cleanly onto the agentic architecture. What changes is what each team *does within* that structure.

---

## 2. Stream-Aligned Teams (SCX and SMP)

The SCX and SMP product teams are where agents are built, owned, and operated. The impact on individual engineers and on team workflow is the most immediate.

### New skills required

**LLM API integration** is the entry point. Calling the Anthropic or OpenAI SDK from TypeScript/Node.js is syntactically familiar, but the non-trivial parts — managing token limits as an invisible resource constraint, handling streaming responses correctly via `ReadableStream` / SSE, understanding how `temperature` and `max_tokens` interact — require deliberate learning. The **Vercel AI SDK** (`ai` npm package) is the most pragmatic starting point for a TypeScript team: it handles streaming, tool calling, and structured output in patterns compatible with NestJS service patterns.

**Tool/function calling** is the most critical architectural skill. The mechanical part (defining a JSON Schema for a tool, parsing the `tool_call` response, executing the function, returning results) is learnable in days. The design skill — what makes a good tool boundary, why narrow and idempotent tools outperform broad ones — takes longer and must be developed through practice. Engineers coming from a REST API mindset tend to build tools that are too general.

**Structured output and validation.** Every LLM call that produces data (not prose) must use the model's structured output mode or `tool_choice` to force a specific schema, and the result must be validated with **Zod** before it is used downstream. This is not a recommendation — it is a hard architectural rule. LLMs can hallucinate parameter values, field names, and types. The TypeScript type system cannot protect against this; Zod validation at the output boundary does.

**Prompt engineering.** The prompt is the source code for the LLM component of an agent. Engineers need to learn: writing system prompts that constrain behavior (not just describe it), structuring context injection (what belongs in the system prompt vs. the user message), and understanding how prompt length trades off against quality and cost. For the Replenishment Agent, this means injecting ERP inventory data, forecast outputs, and reorder rules into context without exceeding token budgets while keeping the model grounded.

**Agent orchestration frameworks.** For the multi-agent patterns in Phase 3+ (Supply Chain Orchestrator, Sustainability Reporting Orchestrator), the realistic TypeScript choices in 2025-2026 are:
- **LangGraph.js** — TypeScript port of LangGraph; handles state machines, checkpointing, and multi-agent graphs with production-grade persistence and interruption/resume semantics. The right choice for stateful, multi-step workflows.
- **Vercel AI SDK** — best for single-agent + tool calling; lightweight and well-maintained.
- **Mastra** — TypeScript-native, purpose-built for agents with workflow state management; emerging in 2025.

The LangGraph.js graph/node/edge mental model is different from service class patterns and requires 3-4 weeks to internalize for complex workflows.

**Context window management and RAG.** A 200K token context window is not an invitation to load all data. Quality degrades at volume. For agents reading ERP data, forecast outputs, and external feeds, engineers need to learn **context engineering** — deciding what to include, summarize, or retrieve on-demand. RAG via **pgvector** (already in the PostgreSQL stack) is the practical answer for TypeScript teams: store structured domain data as embeddings, retrieve the relevant subset at query time, inject only what's needed.

**Streaming output handling.** The approval UX — where a planner sees the agent's reasoning as it generates — requires NestJS endpoints that return `AsyncIterable` or `Observable` piped chunk-by-chunk as SSE. The Angular frontend reads this via `EventSource` or `fetch` with stream reading. Engineers need 1-2 weeks to go from "works in a toy example" to production-safe, with correct disconnect/reconnect handling.

### How the development workflow changes

**Sprint velocity drops initially, then stabilizes differently.** Teams shipping their first agent feature typically see a 30-40% velocity reduction for the first 2-3 sprints. The cause: unfamiliar debugging loops, the difficulty of answering "is this done?" for non-deterministic outputs, and prompt iteration not fitting cleanly into story points. After 2-3 agent features, velocity stabilizes — lower than traditional feature work on a per-feature basis, but with significantly higher per-feature impact.

**What "done" means changes.** For traditional web features, done means: tests pass, code review complete, deployed to staging, QA sign-off. For an agent feature, done additionally includes:
- Eval suite passes on the golden dataset (≥95% task completion, hallucination rate below threshold)
- Failure modes handled (ERP timeout, missing data, ambiguous input)
- Shadow deployment validated
- Observability in place: Langfuse traces tagged with `tenant_id`, human override rate baselining, cost-per-run bounded

**Testing is the biggest single change.** Exact output matching (`expect(output).toBe(...)`) does not work for non-deterministic agents. The testing strategy shifts to:
- *Unit tests*: still work for tools in isolation (mock the LLM), for Zod validators, and for prompt construction functions.
- *Integration tests*: assert against criteria, not exact values. `expect(output.quantity).toBeGreaterThan(80)`, `expect(output.supplierId).toMatchMasterData()`. Trajectory-based assertions replace exact matching.
- *Eval suites*: 50-100 golden dataset examples, labeled by supply chain planners or sustainability analysts, run as CI gates. This is what "QA sign-off" becomes for agents. LLM calls in tests cost money — use recorded fixtures for unit tests; reserve live calls for eval suites run on PRs.

**Debugging shifts to trace inspection.** Non-deterministic failures cannot be reliably reproduced. Debugging an agent failure starts in Langfuse: find the trace, examine the span tree, identify which LLM call produced what output, inspect the exact prompt that was sent. `console.log` debugging is insufficient for production agent issues.

**Code review acquires new checklist items:**
- Does the system prompt have clear scope constraints (what the agent should and must not do)?
- Are tool calls idempotent, or appropriately guarded?
- Is there a maximum iteration cap to prevent infinite loops?
- Is structured output validated with Zod after every LLM call?
- Is `tenant_id` extracted from the auth token — not passed by the agent?
- Is cost-per-run bounded (token limits set on each LLM call)?
- Is there a fallback when the LLM fails?

**Feature flagging becomes more granular.** The existing Flagsmith setup supports the required flag structure, but the flags themselves are more complex: enable agent for this tenant (yes/no), autonomy level (read-only / draft / write), approval threshold per action type per tenant. Shadow mode is a flag: the agent runs, outputs are logged, but nothing is committed. This is how the rollout strategy works in practice.

### New responsibilities

**Tool/MCP endpoint design** is genuinely new work. Stream-aligned engineers now design APIs consumed by LLMs, not by humans or other services. The design criteria differ: tool descriptions must be unambiguous natural language that a model parses, parameter names must be unambiguous, and adjacent tools must be distinct enough that the model reliably selects the right one. This is product design work done by engineers and is easy to underestimate.

**Human-in-the-loop UX.** Angular engineers now design approval workflows, not just data display. The Replenishment Agent produces a draft order that must be reviewable, editable, and approvable by a supply chain planner. Design questions: what information does the planner need to meaningfully approve vs. rubber-stamp? How is the agent's reasoning surfaced (not just the output)? What does edit-and-resubmit look like? These are full product engineering problems owned by the stream-aligned teams.

**Eval ownership.** The team building an agent owns its eval suite — the golden dataset, the quality metrics, the CI gates. Supply chain planners and sustainability analysts become partners in building and reviewing golden datasets. This is a new collaboration pattern: engineers regularly reviewing agent outputs with domain experts, not just gathering requirements.

**Cost ownership per feature.** LLM spending is now a direct product of how engineers write prompts and structure tool calls. Per-tenant cost tracking (via the LLM API gateway) will show each team the cost of their agent features broken down by customer. Product owners will start asking "what's the LLM cost per replenishment decision?" alongside latency.

### Team size and composition

No immediate headcount expansion is required for Phase 1-2. The Replenishment Agent is achievable with the current SCX team — the underlying ERP integrations and forecast API connections already exist, and TypeScript LLM tooling is mature enough. However, the team will feel capacity-constrained during the learning curve.

**The practical approach:** dedicate one engineer per team for 4-6 weeks to go deep on the agent stack (Vercel AI SDK, LangGraph.js, Langfuse, structured output, eval patterns). This engineer becomes the team's internal expert and pair-programs the first agent feature with the rest of the team.

**Two existing roles expand meaningfully:**
- **Product owners** must develop fluency with probabilistic systems: human-in-the-loop checkpoint design, eval criteria definition, autonomy threshold configuration, customer rollout strategy. POs who have only run UI-based product development will need deliberate investment here.
- **UI/UX designers** must design for human-agent collaboration: approval workflows, confidence visualization, exception-only queue patterns. The "show data, let the user act" mental model is insufficient.

---

## 3. ML Engineering Teams (Complicated Subsystems)

The ML teams face a structural role change: they remain owners of their models and the analytical capabilities underneath, but they now also serve a new consumer — the agent layer — with different interface requirements than the existing product APIs.

### The core shift: from model owners to tool providers

Today, both ML teams own a full vertical: data in, model inference out, results consumed via REST API. The stream-aligned teams display the output; the ML teams own the computation. This ownership model stays — but agents add a second consumer above the existing one. Two consumers with different interface requirements.

When the Replenishment Agent invokes the demand forecasting service, it does not want a JSON payload with a 13-week forecast array. It needs:
- A **callable tool with a JSON Schema** defining inputs and outputs precisely enough for an LLM orchestrator to form correct arguments without ambiguity
- **Structured outputs with metadata** the agent uses for decision branching: confidence intervals, data freshness, anomaly flags, and an explicit field signaling when human escalation is warranted
- **Sub-second synchronous response** — batch forecast pipelines cannot serve agent tool calls within a 30-second reasoning window
- **Versioned, stable tool schemas** — a breaking schema change without a migration window breaks every agent that calls it, silently and incorrectly

### New interfaces ML teams need to build

For every callable service:
1. **Tool schema definition** — a precise JSON Schema with description text written for an LLM reader. Parameter names must be unambiguous (`forecast_start_date`, not `date`). Enumerations must be explicit. The description must make it clear when to call this tool vs. an adjacent one.
2. **Structured output contracts** — Pydantic models defining the exact response shape. For demand forecasting: `{forecast_value, lower_bound, upper_bound, confidence_score, data_staleness_days, anomaly_detected, escalation_required}`. No optional fields that may or may not be present.
3. **MCP server wrapper** (for Track A external exposure) — an adapter layer mapping existing REST API semantics into MCP's tool registration format. The underlying model inference is unchanged; the adapter is the new work.
4. **Versioned tool manifests** — tool schemas versioned independently from the underlying model. A model retrain that improves forecast accuracy should not require a tool schema update. Breaking schema changes require a new version and a deprecation window — the same discipline applied to public REST APIs.

### Service-specific changes

**Demand forecasting (SCX ML team):**
- *Latency mismatch*: Batch forecasting runs cannot serve synchronous agent calls. The team needs to expose a **pre-computed forecast read path** (query the latest stored forecast) as the primary tool endpoint, decoupled from the batch retrain process.
- *Freshness signaling*: The tool must return `forecast_computed_at` and `input_data_through` timestamps. A 3-day-old forecast during a demand spike event is misleading; the agent must be able to detect and respond to this.
- *Exception surface*: When the model detects low-confidence scenarios (new product, long stockout gap, recent promotion distortion), the tool must surface this explicitly — not return a normal-looking forecast. The Demand Signal Sentinel depends on this signal.
- **Timeline: critical path for Phase 2.** The SCX forecasting team's tool schema and latency requirements must be resolved in the first 3 months.

**Emission factor matching (SMP ML team):**
- *Deterministic bounded outputs*: Return an explicit `auto_applicable: bool` based on a calibrated confidence threshold. The agent must not be left to determine whether the top match is good enough.
- *Disambiguation*: When confidence is below threshold, return enough information for the agent to branch: is this "not found" (triggers a data request to the site owner) or "ambiguous" (triggers human disambiguation)?
- *Idempotency*: The same input must produce deterministic output. If the service has LLM-based matching with randomness, enforce deterministic mode for agent calls or cache results.
- *Audit provenance*: Every emission factor assignment must carry: source database, database version, matching model version, confidence score at time of assignment. TÜV certification dependency makes this non-optional — an auditor will ask which version of ecoInvent was active when the assignment was made.

**Document data extraction (SMP ML team):**
- *Field-level confidence scores*: Return `{field: "energy_consumption_kwh", value: 145000, confidence: 0.92, extraction_method: "direct_octet", page_ref: 3}`. The Carbon Data Collection Agent needs confidence to decide whether to proceed or request human review.
- *Distinguish "not found" from "ambiguous"*: Two different agent responses required; the service must signal which case applies.
- *Multi-document synthesis support*: Return extraction IDs and document provenance so the agent can aggregate across multiple source documents while maintaining traceability per field.
- *Hybrid LLM + deterministic validation*: Use the LLM for unstructured document parsing; apply deterministic validators (physical plausibility checks on numeric values) before returning. The LLM handles parsing; the deterministic layer catches hallucinations.

### New skills required

| Skill | Gap | Priority |
|---|---|---|
| Structured output schema design | Medium — ML APIs return whatever the model returns | High |
| Uncertainty quantification as a first-class deliverable | Medium-High — calibrated confidence scores, OOD detection | High |
| Tool ergonomics and LLM-aware API design | Medium — new discipline; requires testing with actual LLM orchestrators | High |
| Evaluation design for tools-in-pipelines | Medium — extends existing model eval skills | Medium |
| LLM basics (tool calling, structured output modes) | Medium — not deep LLMOps, but functional literacy | Medium |
| Idempotency and fault tolerance | Low-Medium | Low |

ML engineers do **not** need to become agent architects or prompt engineers. The agent orchestration is owned by the stream-aligned teams. The ML team's surface area is the tool: schema, implementation, validation, versioning, and calibration.

**Calibration advantage:** Pacemaker's 97-99% accurate forecast models provide exceptional ground truth for golden evaluation datasets. Most companies building agent evals have no authoritative ground truth — they fall back entirely on LLM-as-judge. Use this to build significantly more reliable evals than the industry baseline.

---

## 4. Data Engineering Team

The data engineering team's shift is structural, not incremental. The team moves from building pipelines that serve whoever queries them to owning **data products** with defined consumers, defined contracts, and defined quality SLAs — with agents as a first-class consumer alongside the existing product dashboards.

### Data as agent context

Agents call tools at runtime, combining data from multiple sources within a single reasoning chain. They cannot run complex joins inline; the join logic must be pre-built into the data product layer. They need semantic metadata alongside values — an agent receiving `qty_avail` must understand what that means without inference. This requires machine-readable field descriptions, units, and valid ranges embedded in every data product the agent layer touches.

Concretely: the team must build **agent-readable data products** as a distinct output category. For the Replenishment Agent, this means an inventory position API that returns current stock, reorder point, safety stock level, and unit in one structured response — not three separate tables that the agent joins. Rolling window aggregates (daily/weekly/monthly) for the Demand Signal Sentinel must be pre-computed and available via parameterized API, not assembled on-demand.

### RAG and vector search infrastructure

When agents retrieve domain context (emission factors, historical procurement records, ESRS clause mappings, regulatory rules), a retrieval layer is needed. The data engineering team owns the **embedding pipeline infrastructure**; the ML team owns chunking strategy and embedding model selection.

Concretely, the data engineering team must build and maintain:
- Document ingestion, chunking execution (applying ML team-specified chunking rules), embedding API calls, and vector store upserts
- Incremental update pipelines that detect version changes in source datasets (new EcoInvent release, ESRS update) and trigger re-indexing
- **Azure AI Search** is the pragmatic choice on Azure: handles multi-tenancy via index-per-tenant or filter-based isolation, integrates with the existing Azure/Keycloak auth chain, and supports hybrid dense+sparse retrieval (essential for matching product codes and supplier identifiers alongside semantic descriptions)

The handoff artifact with the ML team is a **chunking specification document** per document collection: document type, chunking boundary rules, metadata fields to preserve, embedding model endpoint, index update trigger conditions. This process must be formalized — it does not work as ad hoc requests.

### Data quality changes

The existing quality standard is calibrated for human consumption — a human notices a stale value or a missing emission factor. Agents do not self-correct; they reason with whatever they receive and propagate the result downstream. The specific failure mode is **silent propagation**: structurally valid output, within historical bounds, passes all validators — but based on 48-hour-stale inventory data that produced a wrong order quantity.

New requirements:
- **Freshness SLAs become agent-specific, not pipeline-specific**: every agent tool API response must include `data_as_of` timestamps. Per-dataset freshness thresholds must be negotiated with agent teams and formalized as SLA contracts.
- **Schema drift becomes a production incident**: when SAP changes a field name, today's impact is a broken dashboard; with agents, it is a broken tool call mid-workflow. Implement schema contracts on every agent-facing API with breaking-change detection and alerts before changes reach production.
- **Field-level completeness monitoring**: for fields required as inputs to agent tools (e.g., material classification for emission factor lookup), completeness must be monitored with distinct alerting — not rolled into general pipeline health scores.
- **Row-level lineage via OpenLineage**: for sustainability data, every agent-generated CSRD output must be traceable back through tool call → data product → pipeline transformation → source system record. CSRD assurance requires this; it must be built in from the start, not retrofitted.

### ERP write-back architecture

Read-side ERP integration (extracting sales history, inventory, BOMs from SAP) is existing work. Agents change this by requiring **write-back**: the Replenishment Agent creates purchase order drafts; the Product Carbon Intelligence Agent attaches PCF certificates.

Write-back must be architecturally separate from read connectors. Read connectors are optimized for bulk extraction — scheduled, fault-tolerant, batch-oriented. Write-back requires:
- **Synchronous confirmation**: the agent needs to know the write succeeded before proceeding
- **Idempotency keys**: tied to the workflow run ID and step. If the agent retries after a network timeout, no duplicate order is created
- **Approval token gating**: the write-back connector checks for a valid, signed approval token before executing the SAP write. The agent submits to a staging record; the connector enforces the boundary. The agent never holds the approval token and cannot bypass this gate.

The data engineering team owns the connector infrastructure (SAP BAPI/oData plumbing, authentication, retry logic, idempotency); the product team owns the business logic of what gets written and when.

### Tenant isolation

The existing tenant isolation model (pipeline-level separation: Client A flows through one pipeline, Client B through another) is insufficient when agents access data dynamically at runtime. Dynamic runtime access requires enforcement at the query layer, not just the pipeline layer.

Every agent tool API must enforce tenant isolation by:
- Extracting `tenant_id` from the authenticated JWT token — not accepting it as a parameter the agent provides
- Applying it as a mandatory filter before any query executes, enforced via **PostgreSQL row-level security (RLS)** policies tied to `app.tenant_id` set from the token
- Designing APIs as stateless, with explicit cache keys (`{tenant_id}:{query_hash}` — never `{query_hash}` alone)

The Asana AI incident (May 2025) — cross-organization data contamination affecting ~1,000 organizations — was caused by a flaw in the data access layer an AI agent called, not in the model itself. The data engineering team's APIs become part of the security boundary.

---

## 5. Platform Team

The platform team's scope expands into a new infrastructure category: **AI platform**. The underlying technology (Azure/Kubernetes/Helm) does not change, but a new set of services must be deployed, operated, and exposed as self-service platform products to the product teams.

### New infrastructure required

**LLM API Gateway (LiteLLM Proxy)** — the single most important new deployment. Without it, each product team goes directly to providers with their own API keys, and the platform team has no visibility into cost, rate limits, or failures. Deploy as a shared service (ClusterIP, not publicly exposed). Provides: unified endpoint routing to Azure OpenAI/Anthropic/etc., per-team virtual API key management, built-in rate limiting per key, cost tracking, and fallback routing. Azure Key Vault injection for provider keys — never ConfigMaps. LiteLLM's own security posture (LiteLLM middleware breach, early 2026) means the gateway requires the same hardening as the API gateway.

**Vector Database** — for RAG pipelines, agent memory, semantic search. Two options:
- **Azure AI Search** (recommended for Pacemaker): managed, integrates with existing Azure identity model, supports hybrid dense+sparse retrieval, multi-tenancy via index-level isolation
- **pgvector** (lowest-ops alternative): PostgreSQL extension; appropriate if the embedding use case is purely within existing PG instances

**Agent state storage** — LangGraph.js checkpointing (state persistence between steps) writes to PostgreSQL. The platform team must expose a shared PostgreSQL schema for agent checkpointing with per-tenant schema isolation and define retention policies (EU AI Act Article 12: system lifetime + 6 months). Redis (already deployed) handles ephemeral session state; ensure `maxmemory-policy` does not silently evict in-flight agent sessions.

**Token quota and cost governance** — does not exist today; must be built. Required: per-team token budgets (daily/monthly), per-tenant cost attribution (each enterprise client's agent usage tracked separately), hard spend caps with circuit breaking (budget exhausted → controlled error, not provider error), daily cost reports by team/tenant/model. LiteLLM handles enforcement; Helicone adds per-tenant budget dashboards and semantic caching.

### Observability changes

OTel v1.33+ published stable `gen_ai` semantic conventions. The existing OTel Collector pipeline receives these attributes automatically with instrumented SDKs — no Collector config change needed, but **new Grafana dashboards** are required:

1. **LLM Cost Dashboard** — token spend per day, by team / tenant / model. Alert at 80% of daily budget.
2. **Agent Health Dashboard** — per agent type: task completion rate, median step count, p95 end-to-end latency, error rate by failure category.
3. **Token Efficiency Dashboard** — input vs. output token ratio per agent run. Rising input token counts = context bloat = cost and quality problem.
4. **LLM Provider Availability Dashboard** — Azure OpenAI latency, error rate, rate limit events.
5. **Human Override Rate Dashboard** — % of agent outputs rejected by planners/sustainability managers. Rising override rate is the leading indicator of quality degradation.

**Langfuse (self-hosted)** is the LLM observability layer: deploy via Helm chart (PostgreSQL + Redis + Azure Blob Storage — all already available). Teams get project-level API keys; platform team owns the deployment. Langfuse natively exports OTel spans into the existing Collector. **Arize Phoenix** adds deeper multi-step agent trace capture for complex orchestrator patterns.

### Identity and auth — Keycloak extensions

Each agent type gets a dedicated Keycloak client (e.g., `replenishment-agent`, `csrd-data-agent`) with **client credentials flow**, short-lived tokens (5-15 min, enforced at realm policy level for agent clients), and **DPoP (Demonstrating Proof-of-Possession)** enabled (supported in Keycloak ≥ v24.0).

**Per-tenant token scoping** at 60 tenants: the practical approach is single-realm with mandatory `tenant_id` claims in every agent token, validated by resource servers at the row-level. Per-tenant Keycloak realms (60 realms) has too high an operational cost.

**Per-agent scope mapping**: Keycloak client scopes map to explicit permissions (`replenishment:read`, `replenishment:draft`, `erp:write:orders`). Agents only receive scopes needed for their defined workflow. Assignment of `erp:write:orders` to `csrd-data-agent` must be impossible at the Keycloak configuration level.

**Approval channel isolation**: the approval UI/API must use a separate Keycloak client that agent service accounts cannot authenticate against. This is enforced at the client access policy level.

**SPIFFE/SPIRE for workload identity** (medium-term): for pod-to-pod communication within the cluster (agent orchestrator calling sub-agents, agent calling MCP tools), cryptographic workload identity without Keycloak in the request path. Not a day-one requirement.

### New platform products (self-service)

The platform team must offer these as self-service products — not bespoke per-request work — or it becomes a bottleneck for every team's agentic AI work:

1. **LLM API Gateway as a Service** — request a virtual API key, get rate limits and budget caps provisioned. No manual involvement per team onboarding.
2. **Agent Observability Stack** — Langfuse project provisioning (new project = new API key pair, new dashboard set).
3. **Agent Identity Provisioning** — IaC template or Keycloak admin workflow for creating a new agent service principal with appropriate scope mapping.
4. **MCP Server Helm Chart Template** — golden-path Helm chart product teams clone to deploy MCP servers. Pre-wired auth validation, logging, and rate limiting.
5. **Vector Database Namespacing** — product teams request a namespace; platform team owns the underlying cluster.
6. **Cost and Token Usage Reports** — monthly per-team and per-tenant cost reports, automated from LiteLLM/Helicone.

### SLA and on-call changes

Agent workloads have fundamentally different reliability profiles. Traditional SLOs (HTTP 200 on a health endpoint) confirm the service is running — not that agent workflows are completing. New SLIs required:
- `agent_task_completion_rate` — fraction of started workflows that produce a valid output within timeout
- `agent_quality_score_p50` — median quality score from the LLM-as-judge evaluator
- `agent_e2e_latency_p95` — 95th percentile end-to-end workflow time

New on-call scenarios requiring runbooks before the first production agent ships:

| Scenario | Detection | Response |
|---|---|---|
| Runaway agent (not terminating) | `step_count > 2x median` alert | Kill session via LangGraph admin API, not pod restart |
| LLM provider degradation | Azure OpenAI latency > threshold | Trigger LiteLLM fallback to secondary provider via config change, no redeployment |
| Silent quality degradation | Rising human override rate (no 5xx errors) | Rollback agent version or increase approval thresholds |
| Tenant isolation breach | Langfuse `tenant_id` mismatch in traces | Immediate session termination, Keycloak token revocation, security team notification |
| Cost runaway (loop bug) | LiteLLM per-key daily spend alert | Revoke virtual API key immediately via LiteLLM admin API |

### Capacity implications

The initial setup is a 3-6 month investment comparable in scope to the original Keycloak or monitoring stack deployment. Ongoing operational overhead is estimated at 15-25% additional capacity per platform engineer: LiteLLM/Langfuse upgrades, token budget management, new agent identity provisioning, alert tuning, runbook maintenance, cost report generation.

**The team likely needs one additional hire** — an engineer with a profile that includes some LLMOps/observability background — or must explicitly deprioritize current work to absorb the new scope.

---

## 6. Organizational Topology and New Roles

### Team Topologies: what stays, what changes

The stream-aligned + complicated subsystem + platform structure **does not need to change**. It maps cleanly:
- Stream-aligned teams own agent logic, tool surfaces, eval suites, and human-in-the-loop UX
- ML complicated subsystem teams continue to own underlying models, now also exposed as MCP tools
- Platform team extends its remit to include LLM observability, LLM API proxy, and the shared MCP tool catalog

What changes is a **new seam**: an AI platform capability must be created. This does not require a standalone team — at Pacemaker's scale, it is best delivered by extending the existing platform team's scope. The mechanism: one dedicated AI Engineer hire embedded in the platform team.

### Roles: what to hire vs. what to upskill

**Hire externally:**

*AI Engineer* — the one hire that genuinely changes the company's capability. In practice (2025-2026 B2B SaaS hiring): someone who can design agent systems end-to-end (prompt engineering, tool/MCP surface design, LLM evaluation, orchestration frameworks), owns the AI platform layer (MCP tool registry, evaluation infrastructure, shared observability, agent identity management), and runs the CoE function operationally. This is a software systems role, not an ML research role — the model is a black box to integrate. EU/DACH market salary band: €90-120k for experienced hires.

**Upskill internally:**

*All TypeScript engineers* on stream-aligned teams: tool surface design, Zod output validation, Langfuse trace debugging, eval-driven development with a golden dataset. 3-4 weeks of structured upskilling, not a new hire.

*All ML engineers*: tool schema design, uncertainty quantification as first-class output, tool ergonomics (designing for LLM callers), participation in cross-team tool contract reviews. 6-month structured path detailed in the ML section above.

*All data engineers*: agent data access patterns, vector database operations, data contract design for agent tool APIs, embedding pipeline operations.

**Not needed as a dedicated hire:**
- *Prompt Engineer* as a standalone role — absorbed into AI Engineer and domain engineer skills
- *LLM Training Engineer* — only relevant for companies training their own models; model-agnostic architecture makes this unnecessary
- *AI Safety Engineer* — AI safety and governance work is owned by the AI Engineer + security-extended engineers, not a dedicated role at this scale

### The AI Center of Excellence

A **lightweight CoE** is the right model — one that sets standards and accelerates, but does not own. Central ownership creates bottlenecks and loses domain context; pure embedding produces duplicate work and inconsistent standards.

**The CoE owns:**
- Standards: the OWASP Agentic Top 10 risk mapping, the five-layer defense architecture, the golden dataset format, the output quality metrics (CLEAR framework), the four-layer validation architecture
- The shared platform: tool/MCP registry, evaluation infrastructure, Langfuse, agent identity management
- EU AI Act risk classification gate: each new agent is classified against Annex III and the internal risk tier model before development begins
- Knowledge transfer: a bi-weekly guild (CoE + one representative from each team's agent work). Agenda: prompt techniques, evaluation patterns, production failure modes, upcoming source system changes that affect agent tool APIs

**Stream-aligned teams own everything else:** agent design, tool surface design, prompt development, domain golden datasets, approval UX, and operational responsibility post-deployment.

The AI Engineer (platform team) runs the CoE operationally and serves as the coordinating arbiter for cross-pillar tool contracts between SCX and SMP teams.

### Evals ownership — the explicit model

| Role | What they own |
|---|---|
| Stream-aligned engineers | Define what "correct" means for their agent's outputs; write integration test criteria; set business-rule thresholds |
| Domain experts (planners, sustainability analysts) | Label golden dataset examples; adjudicate edge cases; sign off on correctness targets |
| ML engineers | Own model output ground truth (demand forecast correctness, emission factor match correctness); provide labeled golden entries for tool-level evals |
| AI Engineer (platform team) | Owns evaluation infrastructure — Braintrust/Langfuse workspace, CI/CD eval gates, LLM-as-judge setup, shadow deployment pipeline |
| Product owners | Set minimum quality thresholds for production promotion; own the go/no-go decision |

Companies that leave evals entirely to ML teams measure model quality, not agent system quality. Companies that leave evals entirely to engineering teams measure structural correctness but miss semantic correctness. The domain expert in the loop is the missing ingredient in both failure patterns.

### Cross-team coordination: two new gates

Add two new gates to the standard development process:

**1. Tool definition review** — when a stream-aligned team designs a tool surface calling an ML or data engineering service, the owning team reviews and approves the tool schema. Specifically: valid parameters, latency SLA under agent load, error conditions the agent must handle, and explicit documentation of failure modes (under what input conditions does the tool return low-confidence outputs, and what should the agent do?). Lightweight: async review on a design doc, not a committee. Without this, engineers build agents that assume ML tools are more reliable than they are.

**2. Agent data access pattern review** — before any agent goes to staging, data engineering reviews its data access patterns against connection pool limits and read replica capacity. Agents make rapid, repeated, small reads — fundamentally different from batch queries. Without this review, agents that pass staging silently degrade production database performance at scale.

### The cross-pillar interface: decide now

The Emissions-Aware Supply Chain Agent (Phase 4) requires the SCX and SMP teams to agree on a shared tool contract and data model for passing supply chain decisions to carbon impact calculations. This is the hardest coordination challenge in the roadmap. Without explicit ownership, it will be blocked by inter-team prioritization conflicts at Phase 4 kickoff.

**Action:** The AI Engineer (platform team) owns the cross-pillar tool registry. SCX and SMP technical leads jointly own the cross-pillar API contract. This decision should be made during Phase 1 foundation work — not deferred to Phase 4.

---

## 7. Individual Engineer Career Trajectories

**TypeScript engineers on stream-aligned teams:**
The 2-year trajectory: Year 1 — extend existing capabilities to expose MCP tool surfaces; learn deterministic output validation; participate in golden dataset construction; debug agent traces in Langfuse. Year 2 — own an agent capability end-to-end: tool surface design through evaluation through production monitoring. The role shifts from "implement features" toward "own a capability" that includes its eval harness and operational behavior.

Engineers whose value is primarily "I write correct TypeScript quickly" will find that capability increasingly commoditized. Engineers whose value is "I understand the supply chain domain, know what a correct replenishment decision looks like, and can design systems that reliably produce them" become harder to replace.

**ML engineers:**
The day-to-day work becomes more like production API engineering — monitoring, versioning, SLAs — alongside model development. ML engineers who develop strong opinions about agent tool surface design and participate in cross-team tool contract reviews grow toward principal/staff ML engineer roles with influence beyond their immediate team.

**Data engineers:**
The primary shift: agents become a first-class customer alongside product teams, with different access patterns and new interface requirements. Data engineers who develop intuitions for optimizing agent workloads (semantic caching, connection pooling, agent tool API design) will be in demand. OpenLineage and data lineage expertise becomes particularly valuable given CSRD audit trail requirements.

**Platform engineers:**
The AI platform engineer role (the new hire) is a genuine frontier. The people building LLM observability, shadow deployment systems, and LLM-as-judge evaluation infrastructure are building their career track as they go. Retaining this person requires platform-level technical leadership and visibility across both product pillars.

---

## 8. Prioritized Roadmap

### Immediate (next 1-3 months)

1. **Hire one AI Engineer** and embed them in the platform team with AI platform as their primary charter.
2. **Structured upskilling for stream-aligned engineers** — 3-4 weeks, hands-on: tool surface design, Zod validation, Langfuse trace reading, eval-driven development. Run before Phase 1 is complete.
3. **Deploy LiteLLM Proxy** to the Kubernetes cluster — prerequisite for all other AI platform work. No visibility into LLM usage without it.
4. **Keycloak agent identity extensions** — DPoP, agent client scope templates, per-tenant token scoping. Needed before any agent reaches production.
5. **Define cross-pillar tool registry ownership** — AI Engineer owns the registry; SCX and SMP technical leads jointly own the cross-pillar API contract. Decide now, don't defer to Phase 4.
6. **Formalize the tool definition review process** — lightweight design doc + async sign-off between ML teams and agent-building teams. Required before the Replenishment Agent starts tool integration work.

### Near-term (3-6 months)

7. **Deploy Langfuse (self-hosted)** + OTel GenAI conventions in agent code — without observability, production agents are flying blind. New Grafana dashboards for cost, agent health, token efficiency, provider availability, human override rate.
8. **Establish evals ownership model explicitly** for the Replenishment Agent pilot: name the ML engineer (demand forecast ground truth), supply chain domain expert (golden dataset labeler), and AI Engineer (eval infrastructure owner).
9. **SCX ML team: demand forecast tool schema and latency** — first tool on the critical path. Pre-computed forecast read path, structured outputs with confidence/freshness, versioned schema. 3-month deadline.
10. **Data engineering: first agent tool APIs** — inventory position API with embedded semantic metadata and freshness timestamps; agent access pattern review process formalized.
11. **Write-back connector architecture for SAP** — idempotency keys, approval token gating, write-back API separate from read-side connectors. Required for any agent that moves beyond read-only.
12. **New on-call runbooks** — for all five agent-specific failure scenarios. Written before the first production agent ships.

### Medium-term (6-12 months)

13. **SMP ML team: emission factor matching + document extraction tool upgrades** — calibrated confidence scores, disambiguation signals, field-level provenance. Critical path for Phase 3 agent work.
14. **RAG and vector search infrastructure** — Azure AI Search deployment, embedding pipelines for emission factor databases (EcoInvent/EXIOBASE) and regulatory documents (ESRS standards). Data engineering owns the pipeline; ML team owns chunking strategy.
15. **AI Platform self-service products** — IaC templates for agent identity provisioning, MCP Server Helm Chart Template, automated cost reporting. Platform team must not become a manual provisioning bottleneck.
16. **SPIFFE/SPIRE workload identity** — cryptographic pod-to-pod identity for agent-to-agent communication within the cluster.
17. **PO and UX designer capability building** — deliberate investment in probabilistic system design, approval UX patterns, human-agent collaboration design. These roles have the most unaddressed skills gap relative to the impact they will have on agent quality.
18. **Review team capacity at Phase 3 entry point** — multi-agent orchestration (Supply Chain Orchestrator, Sustainability Reporting Orchestrator) increases cross-team coordination complexity. Evaluate whether the AI Engineer hire is sufficient or whether an additional AI Ops / evaluation specialist is warranted.

---

## Key References

- Team Topologies (Matthew Skelton, Manuel Pais) — organizational model referenced throughout
- OWASP Top 10 for Agentic Applications (2026): https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- OpenTelemetry GenAI Semantic Conventions (v1.33+): https://opentelemetry.io/docs/specs/semconv/gen-ai/
- LangGraph.js documentation: https://langchain-ai.github.io/langgraphjs/
- Vercel AI SDK: https://sdk.vercel.ai/docs
- Langfuse self-hosted deployment: https://langfuse.com/docs/deployment/self-host
- LiteLLM Proxy: https://docs.litellm.ai/docs/proxy/quick_start
- Azure AI Search (vector search): https://learn.microsoft.com/en-us/azure/search/vector-search-overview
- OpenLineage (data lineage standard): https://openlineage.io/
