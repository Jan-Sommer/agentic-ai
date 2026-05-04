# Agentic AI — High-Level Approach

## Core Strategic Framing

The goals split naturally into two parallel tracks that reinforce each other:

- **Track A — Pacemaker as an agentic platform**: Make Pacemaker's intelligence consumable by external agents (clients' own AI, third-party orchestrators). Pacemaker becomes a first-class citizen in any enterprise AI stack.
- **Track B — Pacemaker's own agents**: Build and operate Pacemaker-native agents that act on behalf of clients within the existing product surfaces.

Track A is the prerequisite for Track B. Both tracks share the same foundational layer — the tool/MCP surface, the security model, the human checkpoint framework — so every investment in the foundation pays forward into both paths. Track A also carries lower risk (exposing existing capabilities) while Track B carries higher value (owning the agent relationship). The phasing below reflects this.

Existing UIs and APIs remain fully operational throughout. The agentic layer is additive, not a replacement.

---

## Design Principles

**Unified architecture across both pillars.** The tool layer, the human checkpoint framework, and the agent orchestration patterns must be designed once, spanning both Supply Chain and Sustainability from day one. Building per-pillar silos would undermine the one-stop-solution goal and prevent cross-pillar agents (e.g., emissions-aware replenishment) from working.

**Progressive autonomy.** Enterprise clients will not accept full autonomy on day one — nor should they. Every agent starts supervised: read-only actions run autonomously, drafts require review, writes to source systems require explicit approval. Trust is earned incrementally; approval thresholds relax over time as confidence builds. This is a product feature, not a launch constraint.

**Model independence.** Pacemaker's intelligence is exposed as structured tools (via MCP or equivalent), not coupled to a specific LLM. Agents are model-agnostic. This ensures the architecture survives model shifts and lets clients bring their own AI stack.

**Agents layer on top of, not replace, existing capabilities.** The underlying APIs, calculation engines, and ML models remain the source of truth. Agents orchestrate and act on them. This preserves backwards compatibility and reduces risk. Architecturally, this is the shift from **system of record** (Pacemaker today: stores and surfaces intelligence) to **system of action** (Pacemaker with the agentic layer: acts on it). The records remain; the actors change.

---

## Four Phases

### Phase 1 — Foundation: Platform and organizational readiness

**Platform:** Expose Pacemaker's existing intelligence as structured, callable tools. Wrap ML model APIs, calculation engines, and ERP connectors in a unified tool/MCP layer that any agent (Pacemaker's or a client's) can invoke. Design this layer cross-pillar from the start — shared auth/tenancy model, shared tool registration, shared observability.

**Organization:** This is not just a product change. Make the whole organization agentic-AI-ready:
- *Product teams*: hands-on upskilling — what agents are, how to design tool surfaces, how to think about human-in-the-loop workflows
- *Sales and customer success*: ability to articulate the agentic value proposition and support clients adopting agent workflows
- *Leadership*: active engagement with AI tools (the transformation is cultural, not just technical)
- *Cross-cutting*: establish security standards (data access controls, audit trails, approval gates), quality guardrails (output validation, confidence thresholds), and a knowledge-sharing practice (guild, internal pilots, shared learnings)

### Phase 2 — Wedge: First agent, proving the pattern

The **Replenishment Agent** is the entry point. It scores well on all three use case evaluation axes: **impact** (eliminates manual order-drafting, measurable working capital improvement), **feasibility** (builds entirely on already-deployed integrations — demand forecast + ERP connectors), and **data availability** (forecast outputs and inventory positions already flow through Pacemaker). It also validates the human-in-the-loop approval workflow that all subsequent agents will reuse.

In parallel: formalize the **human checkpoint framework** — the reversibility/consequence matrix from the scenario description — as a shared standard that applies to every agent, not built ad hoc per agent.

This phase proves the architecture end-to-end and earns client trust. The deliverable is not just a working agent, but a validated pattern for building the next ones.

### Phase 3 — Domain expansion: Sentinels, orchestrators, and the client-facing platform

**Supply Chain:** Add the Demand Signal Sentinel and Procurement Intelligence Agent, then compose them with the Replenishment Agent via the Supply Chain Orchestrator for coordinated disruption response.

**Sustainability:** Ship the Carbon Data Collection Agent and CSRD Data Sentinel to reduce data-gathering burden and ensure year-round compliance readiness. Layer on the Product Carbon Intelligence Agent and the Sustainability Reporting Orchestrator.

**Client-facing platform:** Publish Pacemaker's tool catalog externally so clients can point their own AI agents at Pacemaker's capabilities. By this point the tool surface and security model already exist from Phase 1 — this is primarily an enablement, documentation, and go-to-market effort.

### Phase 4 — Cross-pillar unification: The one-stop differentiator

Ship the **Emissions-Aware Supply Chain Agent** — the cross-pillar orchestrator that connects supply chain decisions with carbon impact calculations. This is the capability that turns two separate product lines into a unified platform and makes Pacemaker genuinely a one-stop solution for supply chain and sustainability management.

This phase is separated not because it's optional, but because it depends on both domain pillars having mature agent coverage to compose across.

---

## Open Questions

Areas that need more scoping before moving into implementation:

1. **Tool catalog design** — which APIs get wrapped first, what is the auth/tenancy model, and how is the catalog structured so it works cross-pillar?
2. **Human approval UX** — does the approval workflow live inside existing Pacemaker UIs, in a new agent console, or both? The distinction to resolve: current UIs are operational cockpits (humans perform each action); the agentic approval UX is a supervision dashboard (humans handle exceptions, review drafts, approve consequential writes). These are different design paradigms, and the product needs a deliberate answer on which surface hosts which.
3. **ERP write-back security** — what is the audit and authorization model for agentic writes back to client source systems?
4. **Organizational enablement format** — how are the internal goals (team readiness, knowledge sharing, security/quality guardrails) structured? Guild, community of practice, internal pilot program?
5. **Pricing model** — the shift from seat-based to outcome/usage-based pricing that agentic delivery implies needs commercial framing alongside the technical architecture
