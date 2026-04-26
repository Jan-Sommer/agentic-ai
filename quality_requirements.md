# Agentic AI — Quality Requirements

What Pacemaker needs to tackle in the coming months to ensure agents produce accurate, reliable, and trustworthy outputs — at the standard required for regulated supply chain and sustainability decisions.

---

## 1. Quality Standards and Governance Frameworks

### Relevant Standards

**ISO/IEC 25059:2023 (Quality Model for AI Systems)** extends the established SQuaRE product quality series with AI-specific dimensions: accuracy, robustness, fairness, interpretability, learning/adaptation, and privacy. A revised edition (ISO/IEC DIS 25059) is under ballot as of 2025, adding guidance for continuous learning systems and human-AI collaboration. This is the most directly relevant standard for defining what "quality" means for Pacemaker's agents — it provides a measurement vocabulary that maps onto the existing quality assurance approach.

**ISO/IEC 42001:2023 (AI Management System)** is the PDCA-based management system standard for AI — analogous to ISO 27001 for security. It requires an AI policy, risk assessment process, impact assessment, lifecycle management, and third-party supplier oversight. Certification is rapidly becoming a vendor-selection criterion (SAP and Cornerstone certified in 2025). For a company already holding ISO 27001 and SOC 2, ISO 42001 is the natural next step and is described as the 2026 gold standard for AI governance and trust.

**EU AI Act, Article 17 + prEN 18286** mandate a quality management system for high-risk AI providers. prEN 18286 is the first harmonized standard translating Article 17 into concrete lifecycle controls. Full compliance for high-risk systems is required by **August 2, 2026**.

**NIST AI RMF 1.0 + AI 600-1 (GenAI Profile)** defines seven trustworthiness characteristics: validity/reliability, safety, security/resilience, accountability/transparency, explainability/interpretability, privacy, and fairness. Structured around four functions: GOVERN, MAP, MEASURE, MANAGE. AI 600-1 adds twelve GenAI-specific risks including confabulation (hallucination) — directly applicable to agentic systems.

**Action:** Start an ISO 42001 gap analysis alongside the ISO 27001 extension. The converged target posture is ISO 27001 + ISO 42001 + SOC 2 (~65-75% control overlap).

### Organizational Governance

Leading enterprise AI governance models use a five-layer structure:

1. **AI Policy** — defines principles, risk tolerance, and boundaries for acceptable agent behavior
2. **AI Inventory** — a registry of all agents in development and production, with risk classifications
3. **Risk Tiering** — classifies each agent use case (minimal/limited/high risk) with controls proportional to tier
4. **Deployment Controls** — mandatory quality gates before each environment promotion
5. **Monitoring Evidence** — continuous evidence collection that feeds compliance reporting

Structural components:
- **AI Center of Excellence (CoE):** Classifies risk, checks strategic alignment, routes approvals. Low-risk use cases approved within 5 business days; high-risk escalated to a cross-functional review board.
- **Engineering Quality Gates:** Four mandatory review gates — at data design, before model training, before staging, and before production. Each gate has defined acceptance criteria and sign-off requirements.

---

## 2. Evaluation Framework

### Key Metrics

Non-determinism is the core challenge: the same prompt can produce different execution paths, tool selections, and outputs across runs. Evaluation must account for acceptable variance vs. unacceptable drift.

The **CLEAR framework** covers the five dimensions enterprises need beyond task completion:

| Dimension | What It Measures | Pacemaker Target |
|---|---|---|
| **Cost** | Per-task spend ceiling | Define per agent type |
| **Latency** | Workflow completion time | Replenishment decisions within 30s |
| **Efficacy** | Task completion rate, output correctness | >95% completion; domain-specific correctness targets |
| **Assurance** | Safety, compliance, prompt injection resistance | 0% policy violations for compliance outputs |
| **Reliability** | Consistency across runs, regression absence | Defined per agent tier (see SLA section) |

Additional domain-specific metrics:
- **Hallucination rate** — enterprise target <5%; for regulated outputs (PCF certificates, CSRD sections) target 0%
- **Tool call accuracy** — correct tool selection and parameter formation, target >90%
- **Reasoning trace quality** — is the chain-of-thought auditable and logically sound?
- **Human override rate** — percentage of agent outputs rejected or corrected by planners/sustainability managers; a rising override rate is an early quality signal

### LLM-as-Judge Evaluation

Use a separate LLM to evaluate reasoning quality, faithfulness to source data, and output completeness alongside deterministic checks. Research shows sophisticated judge models align with human judgment up to 85% (higher than human-to-human agreement at 81%). The approach:

- **Deterministic checks** for structural requirements (schema compliance, value ranges, field presence)
- **LLM judges** for semantic quality (reasoning coherence, completeness, faithfulness to source data)
- **Domain expert spot-checks** on a sampled basis for regulated outputs

**Tools:** DeepEval / Confident AI (50+ research-backed metrics, eval-driven alerting), Arize AI (drift detection for LLM outputs), Galileo (Luna-2 evaluator models at ~$0.02/million tokens for live quality evaluation).

### Golden Datasets

A golden dataset is a curated set of inputs paired with known-correct outputs — functioning like unit tests for agent behavior. How to build for Pacemaker's domains:

1. **Scope per capability.** Separate datasets per agent: demand anomaly detection accuracy, replenishment order correctness, carbon footprint calculation accuracy, CSRD section completeness. Do not mix.
2. **Source from domain experts.** Supply chain planners label correct replenishment decisions; sustainability analysts verify carbon calculations against values from audit records and known-correct TÜV-certified outputs.
3. **Start small.** 50-100 high-quality examples per capability is a solid starting point. Expand based on discovered edge cases.
4. **Version and evolve.** Treat as living documents — continuously add new failure modes, updated compliance requirements (e.g., new ESRS standards), and fresh data patterns.
5. **Decontaminate.** Ensure golden examples are not in LLM training data.

**Key advantage:** Pacemaker's existing high-accuracy forecasting models (97-99%) and TÜV-certified GHG calculations provide deterministic ground truth that golden datasets can be anchored to — this is a significant advantage over most companies building evaluation datasets from scratch.

---

## 3. Output Validation — Four Layers

Every agent output must pass four layers of validation before reaching a downstream system. Each layer operates independently.

### Layer 1 — Structural Validation
Enforce JSON Schema / Pydantic models on every agent output. Both OpenAI and Anthropic support structured outputs natively. For a replenishment order: required fields (SKU, quantity, supplier, delivery date), correct types, value ranges. Schema drift is cited as the top cause of broken automations.

**Tools:** Guardrails AI, Pydantic AI, Instructor.

### Layer 2 — Deterministic Cross-Checks
Code-based validators that an LLM cannot reliably perform — faster, cheaper, and more reliable than LLM-based checks for domain-specific constraints:
- Order quantities within historical bounds and MOQ constraints
- Carbon footprint values within physically plausible ranges for the product category
- Supplier codes validated against master data
- CSRD report sections mapped to required ESRS disclosure topics
- PCF calculation components (transport + components + Scope 1/2) summing correctly
- Emission factor assignments within expected range for the material category

### Layer 3 — Semantic Validation (LLM-as-Judge)
A separate evaluator LLM checks reasoning quality, faithfulness to source data, and completeness. This layer catches failures that pass structural validation but are semantically wrong (e.g., a technically valid order with a plausible but incorrect quantity).

### Layer 4 — Business Rule Post-Validation + Logging
Final domain-specific checks (e.g., total order value against approval thresholds) followed by logging of the full output with its reasoning trace, validation results, and confidence score. Nothing proceeds to a downstream system without this log entry.

---

## 4. Testing Strategy

### Multi-Layer Test Architecture

Agent testing requires layers because non-determinism makes traditional test approaches insufficient.

**Unit tests** — individual tools tested in isolation with mocked dependencies. Every ERP connector, ML model API call, and calculation engine invocation has its own test suite.

**Integration tests** — agent-tool chains end-to-end. Does the agent correctly sequence an ERP inventory read → forecasting model call → replenishment order draft? Use trajectory-based metrics: `trajectory_exact_match`, `trajectory_precision`, `trajectory_recall`.

**Scenario / E2E tests** — hundreds of realistic scenarios with diverse data conditions (seasonal peaks, supplier disruptions, data gaps, anomalous demand). Benchmarks like GAIA (complex real-world multi-step tasks) provide standardized baselines.

**Adversarial / red-team tests** — prompt injection via supplier-submitted data, hallucination under ambiguous inputs, boundary condition behavior. Run before every production release.

**LLM-as-judge evaluation** — subjective quality assessment (reasoning coherence, output relevance, faithfulness to source) alongside programmatic checks.

### Simulation and Sandbox Environments

A **digital twin** of the ERP/WMS/sustainability data environment is the primary approach. The sandbox:
- Mirrors production schemas and representative data (anonymized)
- Stays synchronized with production data distributions
- Supports replay of real production scenarios against new agent versions
- Enables rare failure mode simulation (extreme demand spikes, missing meter readings, BOM data gaps) using synthetic data generation

### CI/CD Quality Gates

**Pre-merge:**
- Automated eval suite on every PR (trajectory metrics, output correctness, latency)
- LLM-as-judge scoring on golden dataset — minimum threshold required to pass
- Regression detection: new version scores compared against baseline

**Pre-deployment:**
- Shadow deployment pass — new agent processes production traffic in parallel, outputs compared but not served
- Safety/guardrail evaluation pass (adversarial test suite)
- Cost/latency budget check

**Post-deployment:**
- Canary metrics monitoring (error rate, quality scores, human override rate)
- Automated rollback trigger if metrics breach thresholds

### Controlled Rollout — Shadow → Canary → A/B

The recommended sequence for every agent version release:

1. **Shadow deployment** — new version runs alongside production, receives identical inputs, never serves outputs. Validates correctness and stability under real conditions with zero user impact.
2. **Canary deployment** — route 1% of traffic → gate check → 5% → 20% → 100%. Each step requires gating criteria to pass.
3. **A/B testing** — measure business-impact metrics (replenishment order accuracy, alert relevance, PCF certificate correctness) to prove the new version is quantifiably better.

### Testing Tool Landscape

| Tool | Strength | Fit |
|---|---|---|
| **LangSmith** | LangChain-native tracing, eval datasets, annotation queues | Teams using LangChain; low overhead |
| **Braintrust** | Eval-focused, SOC 2/GDPR/HIPAA compliant, nested span architecture | Best fit for regulated B2B SaaS |
| **Langfuse** | Open-source tracing and experimentation, self-hosted | Data sovereignty, vendor-neutral |
| **Patronus AI** | Safety-first red-teaming, compliance testing | Adversarial and compliance test suites |
| **Maxim AI** | Full simulation engine, persona-based E2E testing | Pre-deployment scenario testing at scale |
| **Galileo** | Evaluation with real-time guardrails | Live quality monitoring with active intervention |

**Recommendation:** Braintrust for test management (compliance certifications align with enterprise requirements) + Patronus AI for adversarial testing + digital twin sandbox for integration validation.

---

## 5. Observability and Monitoring

### What to Instrument

**OpenTelemetry is the standard.** The OTel GenAI semantic conventions (published 2025, including agent-specific span conventions) define the instrumentation model. Every agent run produces:

- **Root trace** per agent invocation — unique `trace_id` propagated across all child spans; `customer_id` (tenant) as first-class attribute on every span
- **Spans per reasoning step** — each LLM call, each tool invocation, each human checkpoint, each sub-agent delegation
- **LLM-specific attributes** — model name, prompt/completion token counts, temperature, latency, finish reason, estimated cost
- **Tool call spans** — tool name, sanitized input parameters, output summary, latency, retry count, success/failure
- **Decision metadata** — which branch was taken, confidence scores, whether human override was triggered
- **Session aggregates** — total steps, tokens, cost, wall-clock time, final outcome

An orchestrator agent (e.g., Supply Chain Orchestrator calling Demand Signal Sentinel → Replenishment Agent → Procurement Intelligence Agent) will produce deep span trees. The tracing infrastructure must handle this correctly.

### Key Monitoring Metrics

| Metric | What It Catches | Alert Pattern |
|---|---|---|
| Task completion rate (per agent, per tenant) | Agents failing to finish workflows | Drop >10% vs. rolling baseline |
| Quality score distribution | Silent quality degradation — the #1 production failure mode | p50 drops below threshold; p5 tail widens |
| Step count per session | Agents looping or taking inefficient paths | Exceeds 2x median for that agent type |
| Tool call error rate | ERP connectivity, API failures | >5% over 15-min window |
| Human override rate | Decisions rejected by planners / sustainability managers | Increase >20% week-over-week |
| End-to-end and per-step latency | SLA violations, model provider slowdowns | p95 exceeds SLA |
| Token usage per run | Prompt bloat, context window issues | >2x baseline for that agent type |
| Cost per run (and per tenant) | Budget overruns, runaway agents | Daily spend exceeds cap |
| Escalation rate | Over/under-confidence calibration | Deviation from expected range |

**Critical:** Silent quality degradation is the most dangerous failure mode for Pacemaker. An agent can complete workflows and appear healthy while systematically producing degraded outputs (e.g., Replenishment Agent over-ordering due to prompt drift). Monitoring must include output quality evaluation — not just infrastructure metrics.

### Observability Tool Landscape

| Platform | Type | Best For |
|---|---|---|
| **Langfuse** | Open source, self-hosted | Data sovereignty, full OTel support, broadest integrations; recommended primary LLM observability layer |
| **Arize Phoenix** | Open source | Strongest agent evaluation; deep multi-step trace capture; built on OTel natively |
| **Datadog LLM Observability** | Commercial add-on | Infrastructure correlation — correlates agent traces with ERP connector latency, ML serving performance |
| **Helicone** | Open source | Per-tenant cost tracking and budget enforcement; zero-code proxy; semantic caching for cost reduction |
| **AgentOps** | Commercial | Agent-first monitoring: session replay, multi-agent hierarchy, PII redaction, 400+ framework integrations |
| **Galileo** | Commercial | Automated quality evaluation on live traffic at near-zero cost (Luna-2 evaluators) |

**Recommended architecture for Pacemaker:** Dual-layer pattern — **Langfuse** (self-hosted) as the primary LLM/agent observability platform (data sovereignty for enterprise clients) + **Datadog** for infrastructure correlation + **Helicone** as LLM API proxy for per-tenant cost tracking and budget enforcement.

### Cost Monitoring

Enterprise LLM spending doubled from $3.5B to $8.4B between late 2024 and mid-2025. For 60+ tenants running multiple agents, this is a first-class concern — and directly relevant to the pricing model question in the high-level approach.

Track:
- Cost per agent run, broken down by LLM calls vs. tool calls vs. compute
- Cost per tenant per month
- Cost per output unit (per replenishment order, per PCF certificate, per CSRD report section)
- Token efficiency: input vs. output token ratio

Optimization levers:
- **Semantic caching** — highly relevant for sentinel agents that repeatedly assess similar data patterns
- **Model tiering** — smaller/cheaper models for routing and classification; expensive models for complex reasoning
- **Prompt optimization** — monitor token counts over time; growth indicates context bloat

---

## 6. Reliability and Fault Tolerance

### Agent-Specific Failure Modes

Six failure modes unique to agentic AI (no direct equivalent in traditional distributed systems):

1. **Tool misuse / schema hallucination** — models invent column names, fabricate API parameters, or conflate unrelated schemas. A wrong argument at step 2 silently corrupts every subsequent step. The most common and most insidious production failure.
2. **Silent quality degradation** — unlike traditional software where errors throw exceptions, LLM tool chains often fail silently. The agent treats bad output as valid input and continues.
3. **Context window overflow** — context retention accuracy drops 15-30% in sessions exceeding 10 turns. For long workflows (CSRD report assembly, multi-step sustainability orchestration), this is structural risk.
4. **Goal drift** — the agent gradually shifts away from its original objective across many steps, especially in multi-agent handoffs.
5. **Retry loops** — an agent stuck on a bad response retries identical prompts indefinitely, burning API costs in minutes.
6. **Cascading error amplification** — even with a 98% per-agent success rate, a three-agent pipeline degrades to ~94% overall success. Each hop multiplies failure probability.

### Retry and Recovery Patterns

**Checkpointing** is a first-class primitive. Production frameworks (LangGraph, Temporal, Dagster) save execution state at each step. On failure, successful steps are not re-executed. Storage: PostgreSQL or DynamoDB — not in-memory.

**Idempotent tool calls** are a prerequisite for safe checkpointing. Every write operation (ERP order creation, report submission) must carry an idempotency key tied to the workflow run and step. Read-only operations are safe to replay freely.

**Layered retry strategy:**
1. Exponential backoff for transient errors (rate limits, timeouts)
2. Circuit breaker for persistent failures
3. Fallback model switching for LLM provider outages
4. Human escalation for unrecoverable errors

**Relevant for the Replenishment Agent specifically:** ERP order creation calls must be idempotent to prevent duplicate orders on retry. This is a design requirement, not a nice-to-have.

### Circuit Breaker and Escalation

Define an escalation ladder with clear tier boundaries:

| Tier | Trigger | Response |
|---|---|---|
| 1 — Transient | Tool failure, API timeout | Auto-retry with backoff |
| 2 — Degraded | Repeated failure, low confidence, quality threshold breach | Pause workflow, notify operator |
| 3 — Critical | Safety-relevant action, compliance output anomaly, budget exceeded | Halt immediately, require explicit human approval before any further action |

Hard stops to implement:
- **Iteration cap** — absolute maximum steps per workflow (e.g., 20 LLM calls). Non-negotiable ceiling.
- **Cost budget per session** — enforce spend limits per agent run
- **Velocity spike detection** — if an agent fires 10x more calls per minute than baseline, it is stuck
- **Semantic loop detection** — convert recent messages to embeddings, calculate cosine similarity; high similarity across consecutive turns indicates a loop

### Cascading Failure Prevention (OWASP ASI08)

The multi-agent orchestrator pattern (Supply Chain Orchestrator, Sustainability Reporting Orchestrator) requires:

- **Architectural isolation** between sub-agents — a hallucination in data collection must not propagate unchecked into carbon calculations
- **Inter-agent output validation** — every agent-to-agent handoff validates output against expected schema and value ranges before passing downstream
- **Independent verification** — for critical outputs, a second agent or deterministic validator independently verifies results against source data
- **Blast radius containment** — each sub-agent holds minimum permissions. An agent that can only read demand forecasts cannot accidentally write incorrect orders even if its output is corrupted

### SLA Design

Define SLAs per workflow tier, not a single system-wide SLA:

| Workflow tier | Example | Availability target | Correctness target | Approval gate |
|---|---|---|---|---|
| Read-only / monitoring | Demand Signal Sentinel flagging an anomaly | 99% | 95% | None — notify only |
| Draft generation | Replenishment order draft, PCF certificate draft | 99% | 97% | Human review before submission |
| Write to source systems | ERP order submission, CSRD export | 99.9% | 99% (post-approval) | Mandatory human approval |
| Regulatory output | CSRD report finalization | 99.9% | 99% (post-review) | Mandatory sign-off, audit package |

Measure correctness as agreement with human expert judgment on a sampled basis (minimum 5% sample rate for high-stakes outputs).

---

## 7. Explainability and Interpretability

For agents making supply chain and sustainability decisions, explainability is both a quality requirement and a regulatory one (EU AI Act Article 13).

**Chain-of-thought logging** — full reasoning trace persisted as part of every agent output record. The agent must be able to explain its decision-making process for every chosen action. This is required for auditability of TÜV-certified calculation steps.

**Decision escalation packages** — for low-confidence or high-impact situations, agents produce a structured package: what happened, what data was used, what options were considered, what was recommended, and why. Enables meaningful human review rather than rubber-stamping.

**Decision attribution** — linking each output to specific data inputs, model components, and reasoning chains. Critical for GHG calculation where auditability is non-negotiable (audit trail from raw activity data → emission factor → calculated footprint).

**Hybrid deterministic + LLM approach** — combining LLM reasoning with Pacemaker's existing deterministic models adds a transparent, auditable baseline. The LLM augments; the deterministic model provides the explainable foundation. This is especially important for the PCF calculation pipeline, where the existing LLM-based BOM interpretation is already in use.

---

## 8. Human Feedback Loops and Continuous Improvement

### Structured Correction Capture

When a human planner or sustainability manager overrides an agent output, capture the correction in structured form:
- What field/section was wrong
- What the correct value is
- Why it was wrong (optional but valuable)

Do not just log accept/reject. Unstructured corrections are noise; structured corrections are training signal.

### Feedback-to-Evaluation Pipeline

Every correction is a candidate golden dataset entry. Periodic review (monthly) of corrections identifies systematic failure patterns — these become priority targets for prompt tuning, guardrail adjustments, or model retraining.

### Confidence Calibration

Use accumulated human decisions to recalibrate confidence thresholds. If planners override 30% of "high confidence" replenishment orders, the confidence model is poorly calibrated. Calibration is an ongoing process, not a one-time setup.

### Review Cadences

- **High-risk agents** (write to source systems, regulatory outputs): continuous monitoring, daily review of override rates and quality scores
- **Medium-risk agents** (draft generation, alert generation): weekly quality review
- **Low-risk agents** (read-only monitoring): monthly review, automated alerting sufficient

---

## 9. Enterprise Customer Expectations (Responsible AI)

What enterprise buyers will ask about in 2026:

- **Model cards / system cards** — documentation of architecture, intended use, limitations, training data provenance, and known failure modes. Vendor questionnaires are no longer sufficient.
- **Audit rights** — contracts must include audit rights and transparency clauses. Clients will expect to be able to verify that agent outputs feeding their CSRD disclosures are traceable and auditable.
- **Data lineage** — full traceability from agent-generated sustainability data back to source inputs, calculation steps, and emission factor selections. Required for CSRD assurance.
- **Bias testing** — subgroup performance testing for agents that assess suppliers or generate workforce-related ESG metrics.
- **Incident transparency** — defined SLAs for incident notification and correction when agent quality issues are discovered.

---

## 10. Prioritized Roadmap

### Immediate (next 1-3 months)

1. **ISO 42001 gap analysis** — assess what's needed beyond current ISO 27001 / SOC 2 posture
2. **Golden dataset construction** — start with the Replenishment Agent use case: 50-100 labeled examples from supply chain planners, anchored to existing forecast model outputs as ground truth
3. **Output validation layer design** — define the four-layer validation architecture (structural → deterministic → semantic → business rules) before the first agent ships
4. **Evaluation metrics definition** — define concrete quality metrics and thresholds per agent type, per output type. No agent goes to production without defined acceptance criteria

### Near-term (3-6 months)

5. **Observability infrastructure** — deploy Langfuse (self-hosted) as primary agent tracing layer; integrate OpenTelemetry GenAI conventions; add per-tenant cost tracking via Helicone
6. **CI/CD quality gates** — implement golden dataset evaluation and shadow deployment as mandatory gates in the agent release pipeline
7. **Digital twin sandbox** — build a representative sandbox environment for ERP/WMS/sustainability data to support integration testing and scenario simulation
8. **Circuit breakers and escalation ladder** — implement iteration caps, cost budget enforcement, semantic loop detection, and the three-tier escalation model
9. **Idempotent ERP write-back** — ensure all ERP order creation and sustainability data submission calls are idempotent before the Replenishment Agent or Carbon Data Collection Agent ships

### Medium-term (6-12 months)

10. **ISO 42001 certification** — pursue formal certification as a market differentiator
11. **Regression testing cadence** — run golden dataset evaluations on every model/prompt change and on a weekly schedule; alert on metric degradation
12. **LLM-as-judge evaluation** — implement automated semantic quality evaluation on sampled production outputs
13. **Model card / system card program** — produce documentation per agent type for enterprise clients; required for EU AI Act Article 13 transparency
14. **Confidence calibration program** — use accumulated human override data to recalibrate agent confidence thresholds; measure and report calibration quality

---

## Key References

**Standards:**
- ISO/IEC 25059:2023 — Quality model for AI systems: https://www.iso.org/standard/80655.html
- ISO/IEC 42001:2023 — AI management systems: https://www.iso.org/standard/42001
- NIST AI RMF 1.0 and AI 600-1 GenAI Profile: https://www.nist.gov/itl/ai-risk-management-framework
- EU AI Act Article 17 — Quality management system: https://artificialintelligenceact.eu/article/17/
- OWASP Top 10 for Agentic Applications (ASI08 — Cascading Failures): https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

**Evaluation and testing:**
- DeepEval / Confident AI: https://www.confident-ai.com
- Braintrust: https://www.braintrust.dev/articles/best-llm-tracing-tools-2026
- Patronus AI: https://www.patronus.ai
- Maxim AI (top 5 agent evaluation platforms): https://www.getmaxim.ai/articles/top-5-ai-agent-evaluation-platforms-in-2026/

**Observability:**
- OpenTelemetry GenAI semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/
- Langfuse: https://langfuse.com
- Arize Phoenix: https://arize.com/blog/best-ai-observability-tools-for-autonomous-agents-in-2026/
- Helicone: https://www.helicone.ai

**Reliability:**
- LangGraph persistence / checkpointing: https://docs.langchain.com/oss/python/langgraph/persistence
- OWASP ASI08 Cascading Failures: https://adversa.ai/blog/cascading-failures-in-agentic-ai-complete-owasp-asi08-security-guide-2026/
- AgentSLA framework: https://arxiv.org/html/2511.02885v1
- MLCommons ARES (Agentic Reliability Evaluation Standard): https://mlcommons.org/2025/06/ares-announce/
