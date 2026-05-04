# Agentic AI Platform — Project Plan

> **Pacemaker · Version 1.0 · May 2026**
>
> This document is the master project plan for Pacemaker's agentic AI initiative. It synthesizes the strategic approach, per-product roadmaps, organizational impact, security posture, and quality standards into a single reference for the technical and leadership teams.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Strategic Context](#2-strategic-context)
3. [Goals & Success Criteria](#3-goals--success-criteria)
4. [Architecture & Design Principles](#4-architecture--design-principles)
5. [Human-in-the-Loop Design](#5-human-in-the-loop-design)
6. [Phased Roadmap Overview](#6-phased-roadmap-overview)
7. [SCX — Supply Chain Track](#7-scx--supply-chain-track)
8. [SMP — Sustainability Track](#8-smp--sustainability-track)
9. [Cross-Pillar Integration](#9-cross-pillar-integration)
10. [Organization & Team Readiness](#10-organization--team-readiness)
11. [Platform & Infrastructure](#11-platform--infrastructure)
12. [Security & Compliance](#12-security--compliance)
13. [Quality Standards & Evaluation](#13-quality-standards--evaluation)
14. [Model & Data Sovereignty](#14-model--data-sovereignty)
15. [Risks, Dependencies & Open Questions](#15-risks-dependencies--open-questions)

---

## 1. Executive Summary

Pacemaker is building an agentic AI layer on top of its two existing product pillars — Supply Chain Efficiency (SCX) and Sustainability Management Platform (SMP). Today, both products are decision-support systems: they compute accurate predictions and surface insights, but a human planner or sustainability manager must interpret the output and act downstream. The agentic layer closes this loop.

**The goal is twofold.** First, make Pacemaker's intelligence consumable by the AI agents our clients are already deploying in their enterprises. Second, build and operate Pacemaker-native agents that act on behalf of clients within our product surfaces — automating the operational work between decision and execution.

**Why now?** The market transition from passive SaaS to active agentic platforms is underway. Goldman Sachs estimates the total software market reaches $780B by 2030, with the majority of incremental growth coming from agentic layers. Salesforce has already reached $540M ARR from AgentForce. Every established B2B SaaS company is at a fork: build the agentic layer yourself, or become invisible plumbing behind third-party AI overlays.

**Pacemaker's position is strong.** We already hold the five hard-to-replicate advantages that make an agentic layer viable: proprietary data (DataHub with 1,000+ external factors), deep customer context (planning configurations, reorder policies, regulatory mappings), domain expertise (TÜV-certified GHG methodology, vertically-tuned forecasting), installed enterprise distribution (60+ customers at ERP-integration depth), and proven compliance credentials (ISO 27001, SOC 2, GDPR, TÜV). Agents activate this existing investment — they don't replace it.

**The transformation is not just technical.** The org-level posture shift — product teams learning agent patterns, ML teams redesigning tool interfaces, the platform team building AI infrastructure, leadership embedding AI into daily work — is the harder challenge and must proceed in parallel.

---

## 2. Strategic Context

### 2.1 The Market Shift

Traditional SaaS is being restructured around a three-layer model:

| Layer | What it is | Pacemaker today |
|---|---|---|
| **System of Record** | Structured data, permissions, business rules | ✅ ERP integrations, DataHub, proprietary models |
| **Context Layer** | Domain expertise, configurations, regulatory rules | ✅ Planning policies, TÜV methodology, ESRS mappings |
| **Agentic Layer** | Autonomous agents that act on the intelligence above | 🔲 To be built |

Agents need the bottom two layers to be useful. Generic AI models cannot replicate what Pacemaker has built. The strategic question is whether we build the agentic layer ourselves or let third-party agents sit on top of our data and capture the value.

### 2.2 Two Parallel Strategic Tracks

The initiative splits into two tracks that reinforce each other:

**Track A — Pacemaker as an agentic platform**
Expose Pacemaker's intelligence as callable tools (via MCP or equivalent) that any agent — the client's own AI, a third-party orchestrator, or Claude — can invoke. Pacemaker becomes a first-class participant in any enterprise AI stack. This is lower risk (exposing existing capabilities) and is the prerequisite for Track B.

**Track B — Pacemaker's own agents**
Build and operate Pacemaker-native agents that act autonomously on behalf of clients within our product surfaces. This is higher value — it owns the agent relationship — and is enabled by the tooling built in Track A.

Both tracks share the same foundation: the tool/MCP surface, the security model, and the human checkpoint framework. Every investment in that foundation pays forward into both tracks simultaneously.

### 2.3 The European Advantage

The EU regulatory environment creates a short-term friction but a long-term moat. European SaaS companies that move with urgency gain first-mover advantage: they build within strict compliance frameworks (EU AI Act, GDPR, CSRD) and produce battle-tested capabilities that matter globally. Companies that delay face two problems simultaneously — technical catch-up and compliance catch-up.

---

## 3. Goals & Success Criteria

### 3.1 Product Goals

| Goal | Definition of Success |
|---|---|
| Make Pacemaker intelligence callable by external agents | Pacemaker's core APIs are exposed as MCP tools; documented and accessible with proper auth |
| Enable clients to use our products via their own agents | At least one enterprise client has connected their AI agent to Pacemaker's tool surface |
| Provide Pacemaker-native agents for key workflows | First production agent (Replenishment) deployed and used actively by at least one client |
| Remain a full-capability platform | Existing UIs and APIs continue to work without modification throughout |
| Become the one-stop platform for supply chain + sustainability | Cross-pillar agent connects supply chain decisions with carbon impact |

### 3.2 Internal / Organizational Goals

| Goal | Definition of Success |
|---|---|
| Product teams are agentic-AI-ready | All stream-aligned engineers have completed structured upskilling; first agent built per team |
| Security standards established | OWASP Agentic Top 10 assessed; agent identity architecture defined; five-layer defense in place |
| Quality standards established | Evaluation framework and golden datasets defined for each agent type |
| Knowledge sharing practice running | Bi-weekly guild active with representation from all teams |
| ISO 42001 gap analysis complete | Gap analysis done; certification roadmap defined |

### 3.3 Key Metrics to Track

- Human override rate (% of agent outputs rejected or corrected) — the leading quality indicator
- Task completion rate per agent type
- Cost per agent run, per tenant, per output unit
- Time saved per workflow (replenishment order, PCF calculation, CSRD data collection)
- Agent adoption rate across the client base

---

## 4. Architecture & Design Principles

### 4.1 Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 3 — Agentic Layer (new)                                       │
│  Autonomous agents that orchestrate multi-step workflows, surface     │
│  exceptions to humans, and act on approved decisions.                │
│                                                                       │
│  SCX Agents: Replenishment, Demand Signal Sentinel,                  │
│              Procurement Intelligence, Supply Chain Orchestrator      │
│  SMP Agents: Carbon Data Collection, PCF Agent, CSRD Sentinel,       │
│              Sustainability Reporting Orchestrator                    │
│  Cross-pillar: Emissions-Aware Supply Chain Agent                    │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 2 — Context Layer (Pacemaker's existing intelligence)          │
│  • Demand forecasting ML models (97–99% accuracy)                    │
│  • TÜV-certified GHG calculation methodology                         │
│  • Customer-specific configurations: planning horizons, reorder       │
│    policies, materiality thresholds, ESRS mappings                   │
│  • DataHub pipelines and enrichment logic                            │
│  • LLM-based BOM interpretation (PCI)                                │
│  • Regulatory rule sets: ESRS, GHG Protocol, GLEC v3, EU Taxonomy   │
├─────────────────────────────────────────────────────────────────────┤
│  LAYER 1 — Systems of Record (existing enterprise data)              │
│  • ERP systems (SAP, etc.) — inventory, orders, BOMs                 │
│  • WMS / procurement systems — replenishment orders, supplier data   │
│  • Transport management systems — shipments, routes                  │
│  • Sustainability data sources — energy, scope 1–2 meter readings    │
│  • DataHub — 1,000+ market, weather, macroeconomic factors          │
│  • External databases — EcoInvent, EXIOBASE, commodity price feeds   │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Design Principles

**Unified architecture across both pillars.** The tool layer, human checkpoint framework, and agent orchestration patterns are designed once, spanning both SCX and SMP from day one. Per-pillar silos would undermine the one-stop-solution goal and prevent cross-pillar agents from working.

**Progressive autonomy.** Every agent starts supervised. Read-only actions run autonomously; drafts require human review; writes to source systems require explicit approval. Trust is earned incrementally — approval thresholds relax over time as confidence builds. This is a product feature, not a launch constraint.

**Model independence.** Pacemaker's intelligence is exposed as structured tools (via MCP), not coupled to any specific LLM. Agents are model-agnostic. The architecture survives model shifts and lets clients bring their own AI stack.

**Additive, not replacing.** The underlying APIs, calculation engines, and ML models remain the source of truth. Agents orchestrate and act on them. Existing UIs and APIs remain fully operational throughout.

**Simplicity first.** Not every workflow needs multi-agent orchestration. The default is the simplest architecture that reliably solves the problem — a single agent with tools. Complexity is added only when cross-domain specialization, parallelism, or security boundaries genuinely require it.

### 4.3 MCP as the Integration Interface

The **Model Context Protocol (MCP)** is the standard interface between Pacemaker's intelligence and the agentic layer. An MCP server sits in front of each product's REST/GraphQL API. It:

- Holds credentials — agents never see API keys or JWTs
- Injects tenant context per session
- Translates tool calls into typed HTTP requests
- Abstracts async job polling into synchronous tool responses
- Enforces read-only vs. write tool separation

This design means the underlying product APIs do not need to change. The MCP server is an adapter, not a rewrite.

---

## 5. Human-in-the-Loop Design

Enterprise customers will not accept full autonomy on day one — and they shouldn't. The architecture applies human checkpoints proportional to the reversibility and financial/regulatory consequence of each action:

| Action Type | Agent Behavior | Examples |
|---|---|---|
| Read-only analysis, monitoring, flagging | Fully autonomous — no approval needed | Demand anomaly detection, CSRD data gap monitoring |
| Draft creation | Agent creates draft; human reviews before submission | Replenishment order drafts, PCF certificate drafts, CSRD report sections |
| Write to ERP / source systems | Requires explicit human approval per batch or per item above threshold | ERP order submission, PCF certificate publication |
| Regulatory submissions | Always requires human sign-off; agent produces audit-ready package | CSRD report finalization, EU Taxonomy export |

Over time, approval thresholds can be relaxed as clients build trust: orders below a quantity or value threshold can be auto-approved; PCF certificates within an accuracy band can be auto-published. **This is a configuration per client, not a system-wide setting.**

### Approval Security Requirements

- Approval channels must be **inaccessible to the agent itself** — the agent cannot forge, replay, or influence approvals
- Approvals are cryptographically signed with the approver's identity, timestamped, and bound to specific action parameters
- The approval UI/API uses a separate Keycloak client that agent service accounts cannot authenticate against

---

## 6. Phased Roadmap Overview

The initiative follows four phases. Each phase builds on the previous one; no phase is optional.

```
PHASE 1 ──────── PHASE 2 ──────── PHASE 3 ──────── PHASE 4
Foundation       Wedge            Domain Expansion  Unification
Months 1–3       Months 3–6       Months 6–12       Month 12+

Platform &       Replenishment    SCX & SMP         Emissions-Aware
org readiness    Agent            agent suites       Supply Chain
                 Human-in-loop    Client platform    Agent
                 framework        (Track A)
```

### Phase 1 — Foundation: Platform and Organizational Readiness (Months 1–3)

**Platform work:**
- Deploy the LLM API Gateway (LiteLLM Proxy) — prerequisite for all other AI platform work
- Design and implement the agent identity architecture (OAuth 2.1, DPoP, Keycloak extensions)
- Define the cross-pillar tool registry and ownership model
- Conduct EU AI Act risk classification for each planned agent
- Complete OWASP Agentic Top 10 risk assessment
- Hire one AI Engineer (platform team)

**Organizational work:**
- Structured upskilling for all stream-aligned engineers (3–4 weeks, hands-on)
- ISO 42001 gap analysis alongside existing ISO 27001 / SOC 2 posture
- Define the golden dataset format and the CLEAR framework metrics per agent type
- Formalize the tool definition review process between ML teams and product teams

### Phase 2 — Wedge: First Agent, Proving the Pattern (Months 3–6)

The Replenishment Agent is the entry point. It builds on already-deployed ERP integrations and demand forecasting, solves a concrete operational pain, and validates the human-in-the-loop approval workflow that all subsequent agents will reuse.

Parallel work:
- Formalize the human checkpoint framework as a shared standard
- Deploy Langfuse (self-hosted) and integrate OpenTelemetry GenAI conventions
- Build and validate the digital twin sandbox environment for testing
- Define CI/CD quality gates: shadow deployment, golden dataset evaluation
- Resolve the SCX ML team's demand forecast tool schema and latency requirements (critical path)

The deliverable is not just a working agent — it's a **validated pattern** for building the next ones.

### Phase 3 — Domain Expansion: Agents and Client Platform (Months 6–12)

**SCX agents:** Demand Signal Sentinel → Procurement Intelligence Agent → Supply Chain Orchestrator

**SMP agents:** Carbon Data Collection Agent → Product Carbon Intelligence Agent → CSRD Data Sentinel → Sustainability Reporting Orchestrator

**Client-facing platform (Track A):** Publish Pacemaker's tool catalog externally so clients can point their own AI agents at Pacemaker capabilities. By this point the tool surface and security model already exist — this is primarily an enablement, documentation, and go-to-market effort.

### Phase 4 — Cross-Pillar Unification: The One-Stop Differentiator (Month 12+)

The **Emissions-Aware Supply Chain Agent** — connecting supply chain decisions with carbon impact calculations — turns two product lines into a unified platform. This phase depends on both domain pillars having mature agent coverage. The cross-pillar API contract must be agreed upon during Phase 1, not deferred to Phase 4.

---

## 7. SCX — Supply Chain Track

### 7.1 System Overview

SCX (Supply Chain Efficiency) is built on a **NestJS / TypeScript** monorepo (Nx), backed by per-tenant PostgreSQL databases and Snowflake for replenishment data. The frontend is Angular 20. The ML forecasting service is a separate Python service with a full OpenAPI spec.

**Key SCX capabilities available to agents:**
- Demand forecasting (97–99% accuracy, 13-week horizon, ARIMA/Prophet/XGBoost ensemble)
- Replenishment planning (critical stock alerts, forward plans, safety stock calculations)
- Consensus planning (forecast overrides, reconciliation)
- Commodity price forecasting and hedging recommendations
- Event modeling (external factors affecting demand, including LLM-based event extraction)

**Multi-tenancy model:** Each tenant has a separate PostgreSQL database and Keycloak realm, enforced via CLS (Continuation Local Storage) in NestJS.

### 7.2 MCP Tool Surface

The SCX MCP server sits in front of `forecast-backend` and exposes tools in six groups:

| Group | Name | Read/Write | Phase | Start |
|---|---|---|---|---|
| A | Forecast Intelligence | Read | 1 | First to implement |
| B | Replenishment Risk | Read | 1 | First to implement |
| F | Commodity Pricing | Read | 1 | First to implement |
| C | Forecast Execution | Write (triggers jobs) | 2 | With confirmation |
| E | Event Injection | Write (affects forecast inputs) | 2 | With human review |
| D | Consensus Workflow | Write (commits plan overrides) | 3 | Full HITL required |

**Critical technical consideration:** Some SCX forecast jobs are long-running. The MCP server must bridge the async gap by subscribing to the SSE stream (`GET /api/v1/sse/{tenantId}`) and waiting for job completion before returning a tool response (10-minute timeout).

**Spec gap to address:** The main `forecast-backend` REST API has no formal OpenAPI spec (only the ML pipeline service has one). Add `@ApiProperty` decorators to the top 20 most MCP-relevant NestJS DTOs and generate the spec before Phase 2 tool development.

### 7.3 SCX Agents

#### Agent 1: Replenishment Agent *(Wedge Agent — Phase 2)*

**What it does:** Owns the replenishment order cycle end-to-end. Consumes demand forecast output and current inventory positions, calculates optimal order quantities against reorder policies, drafts orders into the ERP, and surfaces only exceptions for human review.

**Value delivered:** Eliminates manual order-drafting; supply chain planners focus on exceptions rather than routine orders.

**Human checkpoints:**
- Drafts all orders → human reviews before ERP submission
- Orders outside policy thresholds, supplier lead-time conflicts, and stockout-risk items are surfaced individually
- ERP write-back requires signed approval token

**Critical path dependencies:**
- SCX ML team: pre-computed forecast read path (not batch pipeline), structured output with confidence/freshness metadata — must be resolved in first 3 months
- Data engineering: inventory position API with embedded semantic metadata and freshness timestamps
- ERP write-back architecture: idempotency keys, approval token gating (essential before Phase 2)

**Tooling required:** Group A (Forecast Intelligence) + Group B (Replenishment Risk) + ERP write connector

---

#### Agent 2: Demand Signal Sentinel *(Sentinel Agent — Phase 3)*

**What it does:** Continuously monitors incoming sales data, DataHub external factor feeds, and forecast model signals. Detects demand anomalies — sudden spikes, trend breaks, campaign attribution gaps — and flags them before they degrade forecast accuracy. Notifies the demand planner with an explanation and a pre-populated action.

**Value delivered:** Faster reaction to market changes; forecast degradation is caught proactively rather than discovered after the fact.

**Human checkpoints:** Read-only monitoring is fully autonomous. Notifications are surfaced in the existing Pacemaker dashboard and optionally in Slack/Teams.

**Dependencies:** Requires the demand forecasting tool to surface low-confidence signals and anomaly flags explicitly (not just a normal-looking forecast).

---

#### Agent 3: Procurement Intelligence Agent *(Copilot Agent — Phase 3)*

**What it does:** Surfaces commodity price forecast signals inside the buyer's procurement workflow. When a price inflection point is approaching, proposes a procurement strategy — accelerate purchase, hedge quantity, or defer — with reasoning grounded in the price model.

**Value delivered:** Procurement decisions are better-timed without requiring analysts to monitor commodity dashboards.

**Human checkpoints:** Proposals are suggestions surfaced in the procurement UI; the buyer decides and acts.

**Tooling required:** Group F (Commodity Pricing)

---

#### Agent 4: Supply Chain Orchestrator *(Orchestrator — Phase 3)*

**What it does:** Triggered by a significant demand or supply disruption signal. Coordinates across the Replenishment Agent, Demand Signal Sentinel, and Procurement Intelligence Agent to produce a reconciled action plan: adjusted forecast → revised replenishment orders → updated commodity buy recommendation. Presents a structured summary for planner sign-off before writing to source systems.

**Value delivered:** End-to-end supply chain response to disruptions without manual cross-system coordination.

**Human checkpoints:** The full action plan requires explicit planner sign-off before any writes to source systems.

**Architecture:** Uses LangGraph.js for state machine orchestration with checkpointing. Sequential pattern for early stages (forecast adjustment → replenishment recalculation); concurrent for parallel commodity and inventory analysis.

**Dependencies:** All three SCX agents must be individually stable before orchestrator work begins.

---

### 7.4 SCX Team Readiness

**Stream-aligned team (3–5 TypeScript engineers):**
- Upskilling needed: LLM API integration (Vercel AI SDK), tool/function calling design, Zod output validation, LangGraph.js state machines, Langfuse trace debugging, eval-driven development
- Timeline: 3–4 weeks structured upskilling; one engineer goes deep first as internal expert
- Velocity impact: 30–40% reduction for first 2–3 sprints; stabilizes after 2–3 agent features

**SCX ML team (demand forecasting):**
- Must add: pre-computed forecast read path (synchronous, <1s), structured output contract with confidence/freshness/anomaly fields, versioned tool schemas
- Critical path: these changes must be complete within the first 3 months
- Skills gap (medium): structured output schema design, uncertainty quantification as first-class output

---

## 8. SMP — Sustainability Track

### 8.1 System Overview

SMP (Sustainability Management Platform) is a **multi-product ecosystem** of independently deployable modules built on different stacks:

| Product | Stack | Purpose |
|---|---|---|
| **PCI** | NestJS + GraphQL Federation | Product Carbon Intelligence — PCF calculation per SKU |
| **SMP** | Symfony / PHP + API Platform | Sustainable Mobility Platform — fleet logistics & emissions |
| **CSRD** | Symfony / PHP + API Platform | CSRD compliance reporting |
| **EU Taxonomy** | Symfony / PHP + API Platform | EU Taxonomy activity assessments |
| **CFC** | Symfony / PHP + API Platform | Corporate Carbon Footprint Calculator |
| **Tendering** | PHP + AWS Lambda (Python) | Transport tendering with carbon tracking |
| **CFT** | AWS Lambda + Azure Functions (Python) | Emission computation engine |

**Authentication varies by product:** JWT (Keycloak/Lexik), API Key, and combinations thereof. Agent tool design must accommodate this variety.

**Key SMP capabilities available to agents:**
- TÜV-certified GHG calculation methodology (Scope 1, 2, 3)
- LLM-based BOM interpretation for emission factor assignment
- CSRD/ESRS compliance monitoring and reporting
- EU Taxonomy activity classification
- Transport emission calculation (EcoTransit integration)
- Emission factor matching (EcoInvent, EXIOBASE)
- Document data extraction for sustainability data collection

### 8.2 MCP Tool Surface

SMP's multi-product architecture means multiple MCP servers (one per product or logical group). Priority for initial exposure:

| Priority | Product | Tool surface | Why |
|---|---|---|---|
| 1 | **CFT** (`POST /cft`) | Emission calculation | Pure calculation, no state, highest signal value — simplest first tool |
| 2 | **EU Taxonomy** (TAXONOFY API) | Activity compliance queries | Clean spec, API key auth, plain JSON |
| 3 | **SMP** (fleet/shipment data) | Shipment status, emissions per tour | Most complete spec (18,734 lines) |
| 4 | **Tendering** | Order status, alternative routes | Covers Lambda surface with 3 clear endpoints |
| 5 | **CFC / CSRD / Tendering PHP** | Carbon entries, CSRD indicators | Export static spec first; then codegen |
| 6 | **PCI** (GraphQL) | Product PCF queries | Requires graphql-mcp-server approach |

**Spec readiness:** `waves-smp-backend` has the most complete spec in the ecosystem (18,734 lines, all 179+ endpoints documented). The PHP backends (CFC, CSRD, Tendering) generate specs at runtime via API Platform — export static specs before building MCP tools.

### 8.3 SMP Agents

#### Agent 5: Carbon Data Collection Agent *(Copilot Agent — Phase 3)*

**What it does:** Proactively pulls Scope 1–2 activity data (energy, fuel) from facility systems on a defined schedule. Identifies gaps — missing meter readings, unclassified energy sources — and initiates data requests to site owners. Pre-fills the CFC platform with collected data, flagging items that need human confirmation.

**Value delivered:** Reduces the manual data-gathering burden that currently dominates sustainability reporting cycles.

**Human checkpoints:** Pre-filled data is flagged for review; site owners confirm or correct before it enters calculations.

**Dependencies:**
- Document data extraction service must return field-level confidence scores and distinguish "not found" from "ambiguous" — these two cases require different agent responses
- Multi-document synthesis: extraction IDs and document provenance to aggregate across source documents while maintaining per-field traceability

---

#### Agent 6: Product Carbon Intelligence Agent *(Wedge Agent — Phase 3)*

**What it does:** Triggered when a new product BOM is added or modified in the ERP. Uses the existing LLM-based BOM interpretation to assign emission factors automatically. Calculates the full PCF end-to-end (components + transport via EcoTransit + Scope 1–2 contributions). Generates a draft PCF certificate and posts it to the product record; flags outlier results for sustainability team review.

**Value delivered:** PCF calculation becomes a continuous, automated process rather than a periodic project.

**Human checkpoints:** Draft PCF certificates require sustainability team review before publication. Outlier results (above a deviation threshold from category averages) are always flagged individually.

**Dependencies:**
- Emission factor matching service must return `auto_applicable: bool` based on a calibrated confidence threshold — agents must not be left to determine whether a match is good enough
- Idempotency: same BOM input must produce deterministic output
- Audit provenance: every emission factor assignment must carry source database, database version, model version, and confidence score at time of assignment (TÜV certification requirement)

---

#### Agent 7: CSRD Data Sentinel *(Sentinel Agent — Phase 3)*

**What it does:** Continuously monitors data completeness and quality against the ESRS KPI requirements defined in the CSRD module. Detects gaps — missing data points, expired supplier declarations, stale materiality assessments — well before reporting deadlines. Issues prioritized tasks to responsible data owners with regulatory context.

**Value delivered:** CSRD readiness becomes a year-round state rather than a deadline crunch.

**Human checkpoints:** Monitoring and alerting are fully autonomous. Remediation tasks are assigned to data owners who act in the existing CSRD platform UI.

**Compliance note:** Because CSRD data feeds into audited disclosures, every agent action on CSRD data requires full traceability from agent output back to source inputs (required for CSRD assurance and EU AI Act Article 12 logging).

---

#### Agent 8: Sustainability Reporting Orchestrator *(Orchestrator — Phase 3)*

**What it does:** Triggered at the start of a reporting period. Coordinates all sustainability sub-agents: collects Scope 1–3 data, runs EU Taxonomy activity assessments, consolidates ESRS KPIs, and compiles the CSRD report draft. Manages sequencing: carbon footprint data must be finalized before CSRD KPIs are calculated; EU Taxonomy assessment must be complete before the report can be locked.

**Value delivered:** End-to-end sustainability reporting orchestrated autonomously; the sustainability manager's role shifts from data collection to validation and narrative.

**Human checkpoints:** The structured review package — with all supporting data, calculation traces, and flag summaries — requires sustainability manager sign-off before finalization and export.

**Architecture:** Sequential orchestration with dependency enforcement (LangGraph.js with checkpoint persistence). The sequencing constraints (CFC before CSRD; EU Taxonomy before report lock) must be encoded as explicit workflow dependencies, not soft instructions.

**Regulatory note:** This agent produces output that feeds audited CSRD disclosures. The highest validation standards apply (see Section 13). EU AI Act Article 14 stop mechanism must be implemented before this agent ships.

**Dependencies:** All SMP domain agents must be individually stable. The reporting orchestrator is a Phase 3 milestone, not an early Phase 3 item.

---

### 8.4 SMP Team Readiness

**Stream-aligned team (3–5 TypeScript engineers, primarily working on PCI/NestJS):**
- Same upskilling needs as SCX team; coordinate so the deep-dive engineer pairs across SCX/SMP
- PCI's GraphQL surface requires familiarity with the graphql-mcp-server pattern (different from REST MCP tool definition)
- The PHP backends (Symfony) are not a new skill requirement — PHP engineers build the PHP backends; the TypeScript team builds the MCP adapters in front of them

**SMP ML team (emission factor matching + document extraction):**
- Emission factor matching: add `auto_applicable: bool`, disambiguation signal, idempotent outputs, audit provenance per assignment
- Document extraction: add field-level confidence scores, "not found" vs. "ambiguous" distinction, multi-document provenance
- Timeline: medium-term (Months 6–12), critical path for Phase 3 agent work
- Skills gap (medium-high): calibrated confidence scores, uncertainty quantification as first-class output

---

## 9. Cross-Pillar Integration

### The Emissions-Aware Supply Chain Agent *(Phase 4)*

**What it does:** When the Replenishment Agent proposes an order, this cross-pillar orchestrator runs a parallel carbon impact calculation (transport route + supplier emissions) via the SMP transport emissions and CFC modules. If a lower-emission sourcing or routing alternative exists within cost tolerance, it surfaces the trade-off to the supply chain planner.

**Value delivered:** Supply chain decisions incorporate carbon impact without requiring the planner to switch tools or contexts. This turns two separate product lines into a single, integrated platform.

**Why this is separated into Phase 4:** This agent requires both domain pillars to have mature, stable agent coverage to compose across. It is not optional — it is the goal — but it depends on Phases 2 and 3 being complete.

### The Cross-Pillar API Contract

The most important coordination decision in the entire roadmap: the **SCX and SMP teams must agree on a shared tool contract and data model** for passing supply chain decisions to carbon impact calculations.

> **Decision needed in Phase 1:** The AI Engineer (platform team) owns the cross-pillar tool registry. The SCX and SMP technical leads jointly own the cross-pillar API contract. This decision must be made during Phase 1 foundation work — deferring it to Phase 4 guarantees a prioritization conflict that blocks delivery.

---

## 10. Organization & Team Readiness

### 10.1 Team Structure (Team Topologies)

The existing structure maps cleanly onto the agentic architecture. Nothing needs to be dismantled.

| Team Type | Team | New Role in Agentic Architecture |
|---|---|---|
| Stream-aligned | SCX | Builds and operates SCX agents, tool surfaces, eval suites, HITL UX |
| Stream-aligned | SMP | Builds and operates SMP agents, tool surfaces, eval suites, HITL UX |
| Complicated subsystem | SCX ML (demand forecasting) | Exposes demand forecast as callable MCP tools with agent-compatible outputs |
| Complicated subsystem | SMP ML (emission factor matching, doc extraction) | Exposes ML services as MCP tools with calibrated confidence and audit provenance |
| Complicated subsystem | Data Engineering | Builds agent-readable data products, RAG infrastructure, ERP write-back connectors |
| Platform | Platform Team | Extends scope to AI platform: LLM gateway, observability, agent identity, vector DB |

### 10.2 New Hire: AI Engineer

**The one hire that genuinely changes Pacemaker's capability.** This person:
- Designs agent systems end-to-end (prompt engineering, tool/MCP surface design, LLM evaluation, orchestration frameworks)
- Owns the AI platform layer (MCP tool registry, evaluation infrastructure, shared observability, agent identity)
- Runs the AI Center of Excellence operationally
- Serves as the coordinating arbiter for cross-pillar tool contracts

**Profile:** Software systems role, not an ML research role. The model is a black box to integrate. Experience with agent frameworks (LangGraph, Vercel AI SDK), LLM observability (Langfuse), and evaluation infrastructure.

**Placement:** Embedded in the platform team with AI platform as primary charter.

**Timing:** Hire immediately — this person is a prerequisite for Phase 1, not a Phase 2 addition.

### 10.3 Skills Roadmap by Team

**All TypeScript engineers (stream-aligned teams):**
| Skill | Learning Approach | Timeline |
|---|---|---|
| LLM API integration (Vercel AI SDK) | Hands-on workshop | Weeks 1–2 |
| Tool/function calling design | Pair programming on first tool | Weeks 2–3 |
| Zod output validation | Required pattern review | Week 2 |
| Langfuse trace debugging | Guided trace inspection | Week 3 |
| Eval-driven development with golden datasets | Workshop with domain experts | Weeks 3–4 |
| LangGraph.js state machines | Project-based learning (Phase 3 prep) | Months 2–3 |

**All ML engineers:**
| Skill | Gap Level | Priority |
|---|---|---|
| Structured output schema design | Medium | High |
| Uncertainty quantification as first-class output | Medium-High | High |
| Tool ergonomics and LLM-aware API design | Medium (new discipline) | High |
| Evaluation design for tools-in-pipelines | Medium | Medium |
| LLM basics (tool calling, structured output modes) | Medium | Medium |

**All data engineers:**
- Agent data access patterns (rapid, small reads vs. batch queries)
- Vector database operations (Azure AI Search)
- Data contract design for agent tool APIs
- Embedding pipeline operations
- OpenLineage for CSRD audit trail requirements

### 10.4 AI Center of Excellence

A lightweight CoE — one that sets standards and accelerates, but doesn't own delivery.

**The CoE owns:**
- Standards: OWASP Agentic Top 10 risk mapping, the five-layer defense architecture, golden dataset format, the CLEAR framework metrics, the four-layer validation architecture
- The shared platform: tool/MCP registry, evaluation infrastructure, Langfuse, agent identity management
- EU AI Act risk classification gate: each new agent classified against Annex III before development begins
- Knowledge transfer: bi-weekly guild (CoE + one representative per team). Agenda: prompt techniques, evaluation patterns, production failures, upcoming source system changes affecting tool APIs

**Stream-aligned teams own everything else:** agent design, tool surface design, prompt development, domain golden datasets, approval UX, and operational responsibility post-deployment.

### 10.5 How "Done" Changes for Agents

| Traditional Feature | Agent Feature |
|---|---|
| Tests pass | Tests pass + eval suite passes on golden dataset (≥95% task completion) |
| Code review complete | Code review complete + agent-specific checklist (scope constraints, idempotency, iteration cap, Zod validation, cost bound, tenant_id handling) |
| QA sign-off | Shadow deployment validated, failure modes handled, observability confirmed |
| Deployed to staging | Langfuse traces tagged with tenant_id, human override rate baselined, cost-per-run bounded |

### 10.6 Eval Ownership Model

| Role | Responsibility |
|---|---|
| Stream-aligned engineers | Define correctness criteria; write integration test assertions; set business-rule thresholds |
| Domain experts (planners, sustainability analysts) | Label golden dataset examples; adjudicate edge cases; sign off on correctness targets |
| ML engineers | Own model output ground truth; provide labeled golden entries for tool-level evals |
| AI Engineer (platform team) | Owns evaluation infrastructure: Braintrust/Langfuse, CI/CD eval gates, LLM-as-judge, shadow deployment pipeline |
| Product owners | Set minimum quality thresholds for production promotion; own the go/no-go decision |

---

## 11. Platform & Infrastructure

### 11.1 New Infrastructure Required

**LLM API Gateway — LiteLLM Proxy (Priority: Immediate)**
The single most important new deployment. Without it, product teams go directly to providers with their own API keys and the platform team has no visibility into cost, rate limits, or failures. Provides:
- Unified endpoint routing to Azure OpenAI / Anthropic / etc.
- Per-team virtual API key management with rate limiting
- Cost tracking and fallback routing
- Azure Key Vault injection for provider keys — never ConfigMaps

*Note: LiteLLM had a middleware breach in early 2026. The gateway requires the same hardening as the main API gateway.*

**Vector Database — Azure AI Search (Priority: Phase 3)**
Recommended over pgvector for Pacemaker's scale:
- Managed, integrates with existing Azure identity model
- Supports hybrid dense+sparse retrieval (essential for matching product codes alongside semantic descriptions)
- Multi-tenancy via index-level isolation
- Handles RAG for emission factor databases (EcoInvent/EXIOBASE) and regulatory documents (ESRS standards)

**Agent State Storage — PostgreSQL (Priority: Phase 2)**
LangGraph.js checkpointing writes to PostgreSQL. The platform team must expose a shared schema with per-tenant schema isolation and define retention policies (EU AI Act Article 12: system lifetime + 6 months). Redis (already deployed) handles ephemeral session state — verify `maxmemory-policy` does not evict in-flight agent sessions.

**Langfuse (self-hosted) — LLM Observability (Priority: Phase 2)**
Deploy via Helm chart (PostgreSQL + Redis + Azure Blob Storage — all already available). Teams get project-level API keys; platform team owns the deployment. Natively exports OTel spans into the existing Collector.

### 11.2 New Grafana Dashboards Required

| Dashboard | What to watch |
|---|---|
| LLM Cost | Token spend per day, by team / tenant / model. Alert at 80% of daily budget |
| Agent Health | Task completion rate, median step count, p95 end-to-end latency, error rate by failure category |
| Token Efficiency | Input vs. output token ratio per agent run. Rising input tokens = context bloat |
| LLM Provider Availability | Azure OpenAI latency, error rate, rate limit events |
| Human Override Rate | % of agent outputs rejected by planners/sustainability managers — the leading quality indicator |

### 11.3 Keycloak Extensions for Agent Identity

- Each agent type gets a dedicated Keycloak client (`replenishment-agent`, `csrd-data-agent`, etc.)
- Client credentials flow, short-lived tokens (5–15 min)
- DPoP (Demonstrating Proof-of-Possession) enabled — supported in Keycloak ≥ v24.0
- Per-agent scope mapping: `replenishment:read`, `replenishment:draft`, `erp:write:orders` — scope assignment at the Keycloak configuration level prevents agents receiving permissions outside their workflow
- Single realm with mandatory `tenant_id` claims (not per-tenant realms — 60 realms has too high an operational cost)

### 11.4 Self-Service Platform Products

The platform team must offer these as self-service — not bespoke per-request work — or it becomes a bottleneck:

1. **LLM API Gateway as a Service** — request a virtual API key; get rate limits and budget caps provisioned automatically
2. **Agent Observability Stack** — Langfuse project provisioning (new project = new API key pair, new dashboard set)
3. **Agent Identity Provisioning** — IaC template or Keycloak admin workflow for creating a new agent service principal
4. **MCP Server Helm Chart Template** — golden-path chart for deploying MCP servers; pre-wired auth validation, logging, rate limiting
5. **Vector Database Namespacing** — product teams request a namespace; platform team owns the cluster
6. **Cost and Token Usage Reports** — monthly per-team and per-tenant cost reports, automated from LiteLLM/Helicone

### 11.5 Platform Team Capacity

The initial AI platform setup is a 3–6 month investment comparable in scope to the original Keycloak or monitoring stack deployment. Ongoing overhead: 15–25% additional capacity per platform engineer. **The team likely needs one additional hire** with LLMOps/observability background, or must explicitly deprioritize current work to absorb the new scope.

---

## 12. Security & Compliance

### 12.1 Regulatory Timeline

| Deadline | Requirement | Action |
|---|---|---|
| **August 2, 2026** | EU AI Act transparency obligations (Article 50) | Client documentation for all deployed agents |
| **August 2, 2026** | High-risk provisions for Annex III systems | Complete risk classification; implement Article 12–14 |
| **August 2, 2027** | Full Annex III obligations | High-risk system compliance complete |
| **Ongoing** | GDPR DPIA for agents processing personal data | Complete DPIA before any such agent deploys |
| **Now** | CSRD audit trail requirements | Build OpenLineage traceability from day one |

### 12.2 EU AI Act Classification

**Supply chain agents** (e.g., Replenishment Agent): Likely **limited risk** unless they affect worker-related decisions (Annex III, Area 4). The classification must be formally documented — auditors will ask for it.

**Sustainability reporting agents** (CSRD/ESRS): Not explicitly listed in Annex III. Could be pulled into high-risk if they process employee data for workforce ESG metrics. Requires formal classification.

**Action:** Complete formal risk classification for each planned agent against Annex III before development begins. This is a gate in the CoE process.

### 12.3 Key EU AI Act Requirements

| Requirement | What it means for Pacemaker |
|---|---|
| **Article 12 — Automatic logging** | Every agent action, tool call, reasoning step, and data access logged with timestamps. Retention: system lifetime + 6 months minimum |
| **Article 13 — Transparency** | Enterprise clients receive documentation of agent capabilities, limitations, intended purpose, and human oversight instructions |
| **Article 14 — Human oversight** | Agents must allow humans to: understand capabilities/limitations, interpret outputs, override or ignore decisions, and interrupt via a stop mechanism. The stop mechanism is architecturally required before production |
| **Article 9 — Risk management** | Continuous, evidence-based risk management across development and production, specifically addressing risks from autonomous action-taking |

### 12.4 OWASP Agentic Top 10 Threat Assessment

| Risk | Pacemaker Relevance |
|---|---|
| ASI01 — Agent Goal Hijack | Manipulated data in ERP records or supplier documents could redirect agent objectives |
| ASI02 — Tool Misuse & Exploitation | Agents misusing ERP write APIs due to injection or misalignment |
| ASI03 — Identity & Privilege Abuse | Inherited credentials, cached tokens, or agent-to-agent trust exploitation |
| ASI04 — Agentic Supply Chain Vulns | Malicious or tampered MCP server packages or tool descriptors |
| ASI05 — Unexpected Code Execution | Agent generates or runs attacker-controlled code |
| ASI06 — Memory & Context Poisoning | Persistent memory corrupted to influence future agent actions |
| ASI07 — Insecure Inter-Agent Communication | Orchestrator-to-sub-agent messages lack authentication and integrity |
| ASI08 — Cascading Failures | Errors amplify through multi-step pipelines (bad forecast → wrong orders → wrong procurement) |
| ASI09 — Human-Agent Trust Exploitation | Confident but wrong outputs mislead operators into rubber-stamping harmful actions |
| ASI10 — Rogue Agents | Misalignment, concealment, self-directed action outside intended scope |

> **Top threat for Pacemaker:** Indirect prompt injection via supplier-submitted data or BOM documents. The Product Carbon Intelligence Agent, which reads external supplier BOM data and writes PCF certificates, has the highest exposure. Reference incident: Salesforce Agentforce "ForcedLeak" (Sep 2025, CVSS 9.4) — an attacker injected instructions into a form field; the agent exfiltrated CRM data at a cost of $5 to the attacker.

### 12.5 Five-Layer Defense Architecture

Each layer operates independently — no single bypass compromises the system:

| Layer | Purpose | Tools |
|---|---|---|
| 1 — Input Screening | Treat every data input the agent processes as potentially hostile; screen for injection patterns before data reaches the LLM | Lakera Guard, LLM Guard |
| 2 — Dialog & Intent Control | Programmable rails constraining what the agent can discuss, decide, and do | NVIDIA NeMo Guardrails |
| 3 — LLM Generation | The model itself; pin model versions; run regression tests on model updates | (model-agnostic via MCP) |
| 4 — Output Validation | Validate every agent output against schemas and business rules before it reaches downstream systems | Guardrails AI, Pydantic AI, Instructor |
| 5 — Deterministic Policy Enforcement | A policy engine that evaluates every tool call before execution — the LLM cannot be trusted to self-police | Microsoft Agent Governance Toolkit |

### 12.6 Multi-Tenant Data Isolation

With 60+ enterprise clients, tenant isolation is critical:

- `tenant_id` extracted from the authenticated JWT token — **never accepted as a parameter the agent provides**
- PostgreSQL row-level security (RLS) policies enforced at the query layer, not just the pipeline layer
- Context windows flushed between tenant switches
- Per-tenant secrets in isolated Key Vault namespaces
- Cache keys always include tenant_id: `{tenant_id}:{query_hash}` — never `{query_hash}` alone

> Reference: The Asana AI incident (May 2025) — cross-organization data contamination affecting ~1,000 organizations — was caused by a flaw in the data access layer an AI agent called, not in the model itself.

### 12.7 Security Roadmap

**Immediate (months 1–3):**
- EU AI Act risk classification per agent
- OWASP Agentic Top 10 risk assessment
- Agent identity architecture design (OAuth 2.1, DPoP, per-tenant scoping)
- ISO 42001 gap analysis
- DPIA for agents processing personal data

**Near-term (months 3–6):**
- Five-layer defense architecture implementation
- MCP security hardening (tenant isolation, mandatory auth, tool output sanitization, egress filtering)
- Human-in-the-loop framework with out-of-band approval flows and signed tokens
- Immutable audit trail infrastructure

**Medium-term (months 6–12):**
- ISO 42001 certification
- Inter-agent security (authenticated, integrity-checked communication)
- Red teaming program for prompt injection, data exfiltration, privilege escalation
- Progressive autonomy controls (configurable per client, full audit trail of threshold changes)

---

## 13. Quality Standards & Evaluation

### 13.1 Relevant Standards

| Standard | What it covers | Action |
|---|---|---|
| **ISO/IEC 42001:2023** | AI management system (PDCA-based, analogous to ISO 27001 for AI) | Start gap analysis now; pursue certification (2026 gold standard) |
| **ISO/IEC 25059:2023** | Quality model for AI systems (accuracy, robustness, fairness, interpretability) | Use as measurement vocabulary for agent quality definitions |
| **NIST AI RMF 1.0 + AI 600-1** | Seven trustworthiness characteristics; 12 GenAI-specific risks including confabulation | Map against each agent's risk profile |
| **EU AI Act Article 17** | Quality management system for high-risk AI providers — required by August 2026 | Integrate with ISO 42001 compliance work |

### 13.2 The CLEAR Framework — Quality Metrics per Agent

Every agent type must have defined targets for all five dimensions:

| Dimension | What It Measures | Target (Pacemaker) |
|---|---|---|
| **Cost** | Per-task spend ceiling | Define per agent type; track cost per replenishment order, per PCF cert, per CSRD section |
| **Latency** | Workflow completion time | Replenishment decisions within 30s; CSRD report assembly within SLA |
| **Efficacy** | Task completion rate, output correctness | >95% completion; domain-specific correctness targets per agent |
| **Assurance** | Safety, compliance, prompt injection resistance | 0% policy violations for compliance outputs (CSRD, PCF certificates) |
| **Reliability** | Consistency across runs, regression absence | Defined per SLA tier (monitoring / draft generation / write / regulatory) |

Additional critical metrics:
- **Hallucination rate:** enterprise target <5%; for PCF certificates and CSRD sections: 0%
- **Human override rate:** the leading indicator of quality degradation — alert on >20% week-over-week increase
- **Tool call accuracy:** correct tool selection and parameter formation, target >90%

### 13.3 Four-Layer Output Validation

Every agent output passes four independent layers before reaching a downstream system:

**Layer 1 — Structural Validation**
JSON Schema / Zod models on every agent output. Required fields, correct types, value ranges. Both OpenAI and Anthropic support native structured outputs.

**Layer 2 — Deterministic Cross-Checks**
Code-based validators for domain-specific constraints: order quantities within historical bounds and MOQ; carbon footprint values within physically plausible ranges for the product category; supplier codes against master data; CSRD report sections mapped to required ESRS disclosure topics; PCF calculation components summing correctly.

**Layer 3 — Semantic Validation (LLM-as-Judge)**
A separate evaluator LLM checks reasoning quality, faithfulness to source data, and completeness. Catches failures that pass structural validation but are semantically wrong.

**Layer 4 — Business Rule Post-Validation + Logging**
Final domain-specific checks (total order value against approval thresholds) followed by logging of the full output with reasoning trace, validation results, and confidence score. Nothing proceeds to a downstream system without this log entry.

### 13.4 Golden Datasets

**Pacemaker's advantage:** The existing 97–99% accurate forecasting models and TÜV-certified GHG calculations provide deterministic ground truth that golden datasets can be anchored to. Most companies fall back entirely on LLM-as-judge because they have no authoritative ground truth. Pacemaker can build significantly more reliable evals.

**How to build:**
- 50–100 high-quality examples per agent capability to start; expand based on discovered edge cases
- Separate datasets per capability — don't mix demand anomaly detection with replenishment correctness
- Supply chain planners label correct replenishment decisions; sustainability analysts verify carbon calculations against TÜV-certified audit records
- Treat as living documents — continuously add new failure modes, updated compliance requirements, fresh data patterns

### 13.5 Testing Strategy

| Test Type | What it catches | Approach |
|---|---|---|
| Unit tests | Individual tools in isolation | Mock the LLM; test tools, Zod validators, prompt construction functions |
| Integration tests | Agent-tool chains end-to-end | Trajectory-based assertions: `expect(output.quantity).toBeGreaterThan(80)` — not exact value matching |
| Scenario / E2E tests | Realistic data conditions (seasonal peaks, disruptions, data gaps) | Digital twin sandbox with production-representative data |
| Adversarial / red-team tests | Prompt injection, hallucination under ambiguous inputs | Run before every production release; Patronus AI |
| Eval suites | Golden dataset quality gates | Run on every PR; CI gate; LLM-as-judge scoring |

**Digital twin sandbox:** The primary integration test environment. Mirrors production schemas with anonymized representative data, supports replay of production scenarios, enables rare failure mode simulation.

### 13.6 Controlled Rollout Sequence

Every agent version release follows this sequence:

1. **Shadow deployment** — new version runs alongside production, receives identical inputs, never serves outputs. Validates correctness under real conditions with zero user impact
2. **Canary deployment** — 1% → gate check → 5% → 20% → 100%. Each step requires gating criteria to pass
3. **A/B testing** — measure business-impact metrics (order accuracy, alert relevance, PCF certificate correctness) to prove the new version is quantifiably better

### 13.7 Six Agent-Specific Failure Modes to Guard Against

1. **Tool misuse / schema hallucination** — models invent column names or fabricate API parameters. A wrong argument at step 2 silently corrupts every subsequent step. The most common and most insidious production failure.
2. **Silent quality degradation** — unlike traditional software, LLM tool chains fail silently. The agent treats bad output as valid input and continues.
3. **Context window overflow** — context retention accuracy drops 15–30% in sessions exceeding 10 turns. Structural risk for long workflows (CSRD report assembly).
4. **Goal drift** — agent gradually shifts away from its original objective, especially in multi-agent handoffs.
5. **Retry loops** — agent stuck on a bad response retries identical prompts indefinitely, burning API costs.
6. **Cascading error amplification** — with a 98% per-agent success rate, a three-agent pipeline degrades to ~94% overall. Each hop multiplies failure probability.

**Hard stops required:** Iteration cap (absolute maximum steps per workflow), cost budget per session, velocity spike detection, semantic loop detection.

---

## 14. Model & Data Sovereignty

### 14.1 The Constraint

Customer data cannot be processed by public LLM APIs. The LLM that orchestrates MCP tool calls and reads the returned data must run in a controlled environment where customer data never leaves Pacemaker's or the client's infrastructure.

### 14.2 Options by Scenario

| Scenario | Recommendation | Why |
|---|---|---|
| **Primary choice given Azure footprint** | **Azure OpenAI / Microsoft Foundry** | SMP already uses Azure Blob, Azure Functions, Azure Key Vault — same compliance perimeter |
| **Claude quality + data sovereignty** | **AWS Bedrock** (Claude models) | Data stays in your AWS account; contractual no-training guarantee; FedRAMP High certified |
| **EU data residency explicitly required** | **Google Vertex AI** `europe-west1` | Explicit single-region EU data residency for GDPR-sensitive workloads |
| **"No training use" is the constraint, not "data must stay on-prem"** | **Anthropic API + Zero Data Retention** | Simplest path; no infrastructure change; ZDR available on request |
| **True air-gap / on-premises requirement** | **Self-hosted vLLM + Qwen 3 32B** | Full data isolation; accept quality and operational overhead tradeoff |

### 14.3 Self-Hosted Considerations

If strict on-premises isolation is required:
- **Qwen 3 32B (Apache 2.0)** is the current recommended floor for complex multi-tool workflows
- GPU requirement: ~35–42 GB VRAM at INT4 precision (single H100 80GB sufficient)
- Serving framework: **vLLM** (production) or **NVIDIA NIM** for better throughput on NVIDIA hardware
- Quality tradeoff: capable but not equivalent to Claude Sonnet 4.6 for complex multi-step reasoning — expect lower performance on nuanced tool orchestration and edge cases
- Operational overhead is non-trivial for a team without existing MLOps

### 14.4 Recommendation for Pacemaker

Given the existing Azure infrastructure (SMP already on Azure Blob, Functions, Key Vault): **Azure OpenAI / Microsoft Foundry** is the default path. It requires no new cloud accounts, sits within the existing compliance perimeter, and supports Claude models as partner models through Microsoft Foundry. For workloads where full Claude quality is required and the Azure OpenAI offering is insufficient, AWS Bedrock is the fallback — SCX already uses AWS Lambda and Secrets Manager.

---

## 15. Risks, Dependencies & Open Questions

### 15.1 Key Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| SCX ML team latency mismatch: batch forecast pipeline cannot serve synchronous agent calls | High | High | Pre-computed forecast read path as first ML team deliverable; 3-month hard deadline |
| Cross-pillar API contract blocked by inter-team prioritization conflicts | Medium | High | Decide ownership in Phase 1; AI Engineer owns registry; technical leads own contract |
| Silent quality degradation deployed to production before detection | Medium | High | Shadow deployment mandatory; human override rate monitoring in place before Phase 2 |
| Agent enables tenant data isolation breach | Low | Critical | PostgreSQL RLS at query layer; tenant_id always from JWT; pre-production security review |
| Velocity collapse on stream-aligned teams during learning curve | High | Medium | One deep-dive engineer per team first; pair programming for first agent feature; capacity expectations set with leadership |
| ERP write-back creates duplicate orders on retry | Medium | High | Idempotency keys on all write-back operations; hard design requirement before Phase 2 |
| Runaway agent burning API budget | Low | Medium | LiteLLM per-key budget caps; circuit breaker; iteration cap; velocity spike detection |
| ISO 42001 certification required by key client before Phase 3 | Low | High | Start gap analysis in Phase 1; certification feasible within 12 months given existing ISO 27001 foundation |

### 15.2 Critical Dependencies

| Dependency | Owned by | Required for | Deadline |
|---|---|---|---|
| Demand forecast tool schema + pre-computed read path | SCX ML team | Replenishment Agent (Phase 2) | Month 3 |
| Inventory position API with freshness metadata | Data Engineering | Replenishment Agent (Phase 2) | Month 3 |
| ERP write-back architecture with idempotency + approval token gating | Data Engineering | Any write agent (Phase 2+) | Month 3 |
| Agent identity design (Keycloak DPoP extensions) | Platform Team | Any production agent | Month 2 |
| LiteLLM Proxy deployed | Platform Team | All AI platform work | Month 1 |
| AI Engineer hired | HR / Leadership | Phase 1 completion | Month 1 |
| Cross-pillar API contract agreed | SCX + SMP tech leads | Phase 4 scoping | Month 2 |
| Emission factor matching tool: calibrated confidence + provenance | SMP ML team | PCF Agent + Carbon Data Collection (Phase 3) | Month 6 |
| Langfuse deployed + OTel GenAI instrumented | Platform Team | Phase 2 production | Month 4 |
| Golden datasets: Replenishment Agent | SCX team + supply chain planners | Phase 2 CI gate | Month 4 |

### 15.3 Open Questions

The following questions need resolution before moving into implementation of the respective phases:

0. **Evaluating new agent candidates** — as the roadmap beyond Phase 4 comes into view, new use case ideas will emerge from clients, sales, and product teams. Use the three-axis evaluation framework before any new candidate enters the roadmap: **impact** (measurable value for clients or the business), **feasibility** (available technology, skills, and integration depth), and **data availability** (accessible, sufficient-quality data). A use case that fails any one axis is either deferred or made conditional on resolving that gap first. This prevents FOMO-driven roadmap expansion from diluting focus on the defined phases.

1. **Tool catalog design** — which APIs get wrapped first, what is the auth and tenancy model, and how is the catalog structured so it works cross-pillar? This drives Phase 1 platform work.

2. **Human approval UX** — does the approval workflow live inside existing Pacemaker UIs, in a new agent console, or both? This is a product design question that must be resolved before the Replenishment Agent ships.

3. **Pricing model** — the shift from seat-based to outcome/usage-based pricing that agentic delivery implies needs commercial framing alongside the technical architecture. When do clients pay per replenishment order? Per PCF certificate?

4. **Organizational enablement format** — how are the internal goals structured? A guild, community of practice, internal pilot program? What is the cadence and who owns it?

5. **Autonomy threshold configuration** — what are the default approval thresholds per action type, and who owns the configuration per client? Product, Customer Success, or the client themselves?

6. **Client-facing Track A timeline** — when does the external tool catalog publish? This has a go-to-market dependency; Sales and Customer Success need to be involved in the framing.

7. **SMP multi-product MCP architecture** — one MCP server per product (seven servers) or a consolidated SMP MCP gateway? Trade-off: granularity vs. operational overhead.

---

*This document is a living plan. It should be updated at the end of each phase with outcomes, updated dependencies, and revised estimates based on what was learned.*
