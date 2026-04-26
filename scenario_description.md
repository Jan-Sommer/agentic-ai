# Agentic AI Architecture for Pacemaker — Scenario Description

## Context

Pacemaker operates two product pillars: **Supply Chain Efficiency** (demand forecasting, replenishment decision intelligence, commodity price forecasting) and a **Sustainability Management Platform** (corporate carbon footprint, transport emissions, product carbon intelligence, EU taxonomy, CSRD reporting). Both pillars share a structural pattern: they ingest data from enterprise systems (ERP, WMS, TMS, BOM databases), apply ML models or guided workflows, and produce decisions or reports that humans then act on.

Today, the products are primarily **decision support systems** — they compute accurate predictions and surface insights, but a human planner or sustainability manager must interpret the output and take action downstream. The agentic layer closes this loop: agents act on the predictions, execute workflows, coordinate across systems, and return results — with human approval at meaningful checkpoints.

---

## Architecture: Three Layers

### Layer 1 — Systems of Record
The existing enterprise data sources that Pacemaker already integrates with:
- ERP systems (SAP, etc.) — sales history, inventory levels, purchase orders, BOMs
- Procurement and WMS systems — replenishment orders, supplier data
- Transport management systems — shipment data, carrier routes
- Sustainability data sources — energy consumption, facility data, scope 1–2 meter readings
- External data sources via the Pacemaker DataHub — 1,000+ market, weather, and macroeconomic factors; ecoInvent and EXIOBASE emission factor databases; commodity price feeds

### Layer 2 — Context Layer (Pacemaker's existing intelligence)
The proprietary models, methodologies, and configurations that make Pacemaker's predictions trustworthy and actionable:
- Demand forecasting ML models (97–99% accuracy, 20–30% improvement over legacy)
- TÜV-certified GHG calculation methodology
- Customer-specific configurations: planning horizons, reorder policies, materiality thresholds, ESRS mappings
- DataHub pipelines and enrichment logic
- LLM-based BOM interpretation (Product Carbon Intelligence)
- Regulatory rule sets: ESRS, GHG Protocol, GLEC v3, ISO 14067, EU Taxonomy criteria

### Layer 3 — Agentic Layer (new)
Autonomous agents that act on the intelligence produced by Layer 2, orchestrate multi-step workflows across Layer 1 systems, and surface exceptions to humans for review.

---

## Agent Inventory

### Supply Chain Domain

**1. Replenishment Agent** *(Wedge agent — owns the replenishment cycle end-to-end)*
- Consumes the demand forecast output and current inventory positions
- Calculates optimal order quantities and timing against reorder policies
- Drafts replenishment orders and writes them to the ERP or procurement system
- Surfaces only exceptions — orders outside policy thresholds, supplier lead-time conflicts, or stockout-risk items — for human review before execution
- Outcome: eliminates manual order-drafting; planners focus on exceptions

**2. Demand Signal Sentinel** *(Sentinel agent — continuous monitoring)*
- Monitors incoming sales data, external factor feeds, and DataHub signals in real time
- Detects demand signal anomalies — sudden spikes, trend breaks, campaign attribution gaps — and flags them before they degrade forecast accuracy
- Notifies the demand planner with an explanation and a pre-populated action in the Action Planner
- Outcome: faster reaction to market changes; forecast degradation caught proactively

**3. Procurement Intelligence Agent** *(Copilot agent — assists within procurement workflows)*
- Surfaces commodity price forecast signals inside the buyer's procurement workflow (ERP or procurement portal)
- When a price inflection point is approaching, proposes a procurement strategy: accelerate purchase, hedge quantity, or defer — with reasoning grounded in the price model
- Outcome: procurement decisions are better-timed without requiring analysts to monitor dashboards

**4. Supply Chain Orchestrator** *(Orchestrator agent — multi-step, multi-system)*
- Triggered by a significant demand or supply disruption signal
- Coordinates across Replenishment Agent, Demand Signal Sentinel, and Procurement Intelligence Agent
- Produces a reconciled action plan: adjusted forecast → revised replenishment orders → updated commodity buy recommendation
- Presents a summary with proposed actions for planner sign-off before writing to source systems
- Outcome: end-to-end supply chain response to disruptions without manual cross-system coordination

---

### Sustainability Domain

**5. Carbon Data Collection Agent** *(Copilot agent — assists sustainability managers)*
- Proactively pulls Scope 1–2 activity data (energy, fuel) from facility systems on a defined schedule
- Identifies gaps — missing meter readings, unclassified energy sources — and initiates data requests to site owners
- Pre-fills the Corporate Carbon Footprint platform with collected data, flagging items needing human confirmation
- Outcome: reduces the manual data-gathering burden that currently dominates sustainability reporting cycles

**6. Product Carbon Intelligence Agent** *(Wedge agent — automates PCF calculation per product)*
- Triggered when a new product BOM is added or an existing BOM is modified in the ERP
- Uses the existing LLM-based BOM interpretation to assign emission factors automatically
- Calculates the Product Carbon Footprint (PCF) end-to-end: components + transport (via EcoTransit) + Scope 1–2 contributions
- Generates a draft PCF certificate and posts it to the product record; flags outlier results for sustainability team review
- Outcome: PCF calculation becomes a continuous, automated process rather than a periodic project

**7. CSRD Data Sentinel** *(Sentinel agent — compliance monitoring)*
- Continuously monitors data completeness and quality against the ESRS KPI requirements defined in the CSRD module
- Detects gaps — missing data points, expired supplier declarations, stale materiality assessments — well before reporting deadlines
- Issues prioritized tasks to responsible data owners with context on regulatory urgency
- Outcome: CSRD readiness becomes a year-round state rather than a deadline crunch

**8. Sustainability Reporting Orchestrator** *(Orchestrator agent — full reporting cycle)*
- Triggered at the start of a reporting period
- Coordinates all sustainability sub-agents: collects scope 1–3 data, runs EU Taxonomy activity assessments, consolidates ESRS KPIs, and compiles the CSRD report draft
- Manages sequencing: carbon footprint data must be finalized before CSRD KPIs are calculated; EU Taxonomy assessment must be complete before the report can be locked
- Presents a structured review package to the sustainability manager for sign-off and final export
- Outcome: end-to-end sustainability reporting orchestrated autonomously; human role shifts from data collection to validation and narrative

---

## Cross-Domain Orchestration

**9. Emissions-Aware Supply Chain Agent** *(Orchestrator — cross-pillar)*
- Connects the Supply Chain and Sustainability pillars — currently two separate product lines
- When the Replenishment Agent proposes an order, this agent runs a parallel carbon impact calculation (transport route + supplier emissions) via the Transport Emissions and CCF modules
- If a lower-emission sourcing or routing alternative exists within cost tolerance, it surfaces the trade-off to the planner
- Outcome: supply chain decisions incorporate carbon impact without requiring the planner to switch tools or contexts

---

## Human-in-the-Loop Design

Enterprise customers will not accept fully autonomous execution on day one — nor should they. The architecture applies human checkpoints proportional to action reversibility and financial/regulatory consequence:

| Action type | Agent behavior |
|---|---|
| Read-only analysis, monitoring, flagging | Fully autonomous, no approval needed |
| Draft creation (orders, certificates, reports) | Agent creates draft; human reviews before submission |
| Write to ERP / source systems | Requires explicit human approval per batch or per item above threshold |
| Regulatory submissions (CSRD report export) | Always requires human sign-off; agent produces audit-ready package |

Over time, approval thresholds can be relaxed as customers build trust — orders below a quantity or value threshold can be auto-approved; PCF certificates within an accuracy band can be auto-published.

---

## Interfaces and Integration Points

- **Agent invocation surface**: Agents run on schedule (sentinel, data collection), on event trigger (BOM change, forecast refresh, anomaly detection), or on demand (orchestrator runs)
- **MCP / tool exposure**: Pacemaker's existing ML model APIs and calculation engines are exposed as tools that agents invoke — keeping LLM independence and making agents model-agnostic
- **Notification layer**: Agent outputs surface in the existing Pacemaker dashboards and optionally push to Slack, Teams, or email for human review queues
- **ERP write-back**: Order drafts and confirmed actions are written back via existing ERP integration connectors

---

## Why Pacemaker Is Well-Positioned for This

Pacemaker already holds the five hard-to-replicate advantages that make an agentic layer viable:

1. **Proprietary data** — the DataHub with 1,000+ external factors and years of customer-specific training data
2. **Deep context** — customer planning configurations, reorder policies, materiality mappings, regulatory rule sets
3. **Domain expertise** — TÜV-certified sustainability methodologies, vertically tuned forecasting models
4. **Installed distribution** — 60+ enterprise customers already integrated at the ERP level
5. **Proven compliance** — ISO 27001, SOC 2, GDPR, TÜV certifications that enterprise buyers require before trusting autonomous agents with regulated workflows

The agentic layer does not replace any of this — it activates it. The models and methodologies already exist; agents make them act rather than just inform.

---

## Starting Point: The Trojan Horse Entry

Rather than building all agents simultaneously, the recommended entry is a high-value wedge with minimal additional integration footprint:

**The Replenishment Agent** is the strongest candidate. It sits directly downstream of the already-deployed demand forecasting product, uses data and ERP connections that already exist, and addresses a concrete operational burden (manual order drafting). It delivers measurable working capital improvement and gives the customer a reason to expand agent autonomy over time.

From there, the Supply Chain Orchestrator and the CSRD Data Sentinel are natural second steps — each adds cross-system coordination that is genuinely difficult to do manually, where the agent's value compounds with each additional connection.
