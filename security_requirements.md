# Agentic AI — Security Requirements

What Pacemaker needs to tackle in the coming months to go the agentic AI path safely and compliantly.

---

## 1. Regulatory and Compliance Foundations

### EU AI Act Classification

The EU AI Act (Regulation 2024/1689) does not treat "agentic AI" as a separate legal category. Classification depends on what each agent does, not its architecture. The key determination:

- **Supply chain agents** operating on critical infrastructure (water, gas, electricity) are explicitly high-risk under Annex III, Area 2. General supply chain optimization agents (like the Replenishment Agent) likely fall under **limited risk** unless they affect worker-related decisions (Area 4 — employment).
- **Sustainability reporting agents** (CSRD/ESRS) are not explicitly listed in Annex III. They could be pulled into high-risk if they process employee data for workforce ESG metrics or influence supplier decisions.

**Action:** Conduct a formal risk classification for each planned agent use case against Annex III categories. Document the reasoning — auditors will ask for it.

**Timeline:** Transparency obligations (Article 50) apply from **August 2, 2026**. Full high-risk obligations under Annex III apply from **August 2, 2027**. The August 2026 date is the near-term hard deadline.

### EU AI Act Obligations Mapped to the Agent Architecture

| AI Act Requirement | What It Means Concretely |
|---|---|
| **Article 12 — Automatic logging** | Every agent action, tool call, reasoning step, and data access must be logged with timestamps. Retention: system lifetime + 6 months minimum. |
| **Article 13 — Transparency** | Enterprise clients (as deployers) must receive documentation of agent capabilities, limitations, intended purpose, and human oversight instructions. |
| **Article 14 — Human oversight** | Agents must allow humans to: understand capabilities/limitations, detect automation bias, interpret outputs, override or ignore decisions, and **interrupt via a stop mechanism**. This is the most architecturally significant requirement. |
| **Article 9 — Risk management** | Continuous, evidence-based risk management across development and production. Must specifically address risks from autonomous action-taking. |

### ISO 42001 Certification

ISO 27001 and SOC 2 do not cover AI-specific risks — prompt injection, unsafe tool invocation, agent memory poisoning, and model governance are all gaps. **ISO/IEC 42001:2023** is the first certifiable AI management system standard and is designed to complement ISO 27001.

**Action:** Start an ISO 42001 gap analysis. The existing 27001 foundation makes this achievable, and it will become a competitive differentiator with enterprise customers. Companies like Sidetrade and UiPath have already extended their certifications to cover agentic AI systems.

The target posture for 2026-2027 is a **converged framework: ISO 27001 + ISO 42001 + SOC 2**, with approximately 65-75% control overlap.

### GDPR: DPIA Required

When agents process personal data (employee names in sustainability reports, procurement contacts, supplier personnel), a **Data Protection Impact Assessment (DPIA)** is mandatory under GDPR Article 35. AI agents trigger multiple high-risk criteria simultaneously: automated decision-making, innovative technology, and potentially large-scale processing.

From August 2026, if an agent is also classified as high-risk under the AI Act, both a DPIA (GDPR) and a **Fundamental Rights Impact Assessment** (FRIA, AI Act Article 27) are required. Penalty stacking applies: up to EUR 20M under GDPR + up to EUR 15M under AI Act.

**Action:** Complete DPIAs for all agents that will process personal data before deployment.

### CSRD / Audit Trail Implications

AI-generated sustainability data will fall under CSRD assurance requirements (limited assurance now, reasonable assurance expected later). Agent outputs that feed into clients' ESRS disclosures create downstream liability — Pacemaker's AI outputs become part of the client's audited reporting.

**Action:** Ensure full traceability from agent-generated sustainability data back to source inputs, calculation steps, and emission factor selections.

---

## 2. Agent Identity and Authorization

### Agents as First-Class Identities

Agents must NOT be treated as extensions of the invoking user's session. They need their own identity lifecycle: provisioning, credential rotation, permission scoping, session management, and deprovisioning. This is the emerging industry consensus, backed by the NIST NCCoE concept paper (Feb 2026) and implementations by Microsoft, Salesforce, and ServiceNow.

**How leading platforms do it:**

- **Microsoft Entra Agent ID:** Uses a blueprint-to-agent delegation model. An "agent identity blueprint" (parent service principal) holds credentials and acquires tokens on behalf of individual agent identities via impersonation. Each agent gets a single-tenant service principal. Supports both application permissions (autonomous) and delegated permissions (on-behalf-of-user).
- **Salesforce Agentforce:** Three-layer access control — authentication at the platform edge, authorization enforcing org/user permissions, and end-to-end request integrity via Salesforce-minted tokens and strict egress filtering.
- **ServiceNow AI Agent Studio:** Agents can run as a "Dynamic user" (inheriting invoking user permissions) or as a dedicated "AI user" with explicitly scoped access. An AI Gateway governs which connections, auth methods, and data flows are permitted.

**Action:** Design agent identity as a separate identity type in the IAM system from day one. Use OAuth 2.1 with DPoP (Demonstrating Proof-of-Possession) for token binding. Consider SPIFFE/SPIRE for workload-level cryptographic identity attestation.

### Least Privilege — Layered Scoping

Permissions must be scoped at multiple layers simultaneously:

- **Per-tenant:** Short-lived tokens tied to tenant identity. Agents never hold cross-tenant credentials.
- **Per-workflow:** Access only to tools/APIs/data needed for the defined workflow. Just-in-time token requests, revoked immediately after.
- **Per-action type:** Read vs. write separated explicitly. Progressive autonomy (read-only → draft → write with approval) maps to escalating permission tiers granted only when approval gates are passed.
- **Temporal:** Credentials are ephemeral. Dormancy detection auto-revokes access for idle agents.

### Approval Workflow Security

The critical requirement: **approval channels must be inaccessible to the agent itself.** The agent must not be able to forge, replay, or influence approvals.

Patterns:
- **Out-of-band approval:** Human approvals arrive via a separate channel (push notification, dedicated approval UI) that the agent cannot access.
- **Signed approval tokens:** Approvals are cryptographically signed with the approver's identity, timestamped, and bound to the specific action parameters — preventing replay or scope widening.
- **Delegation chains:** The emerging Verifiable Intent specification uses SD-JWT credentials to create tamper-evident chains proving an agent's actions fall within human-delegated scope.

---

## 3. Threat Model: Agentic-Specific Attack Vectors

### OWASP Agentic Top 10 (ASI01-ASI10)

The OWASP Top 10 for Agentic Applications (released December 2025) is the primary risk framework to adopt. The full list:

| ID | Risk | Pacemaker Relevance |
|---|---|---|
| ASI01 | Agent Goal Hijack | Manipulated data in ERP records or supplier documents could redirect agent objectives |
| ASI02 | Tool Misuse & Exploitation | Agents misusing ERP write APIs due to injection or misalignment |
| ASI03 | Identity & Privilege Abuse | Inherited credentials, cached tokens, or agent-to-agent trust exploitation |
| ASI04 | Agentic Supply Chain Vulns | Malicious/tampered tools, model descriptors, or MCP server packages |
| ASI05 | Unexpected Code Execution | Agent generates or runs attacker-controlled code |
| ASI06 | Memory & Context Poisoning | Persistent memory corrupted to influence future agent actions |
| ASI07 | Insecure Inter-Agent Communication | Orchestrator-to-sub-agent messages lack authentication/integrity |
| ASI08 | Cascading Failures | Errors amplify through multi-step pipelines (e.g., bad forecast → wrong orders → wrong procurement) |
| ASI09 | Human-Agent Trust Exploitation | Confident but wrong agent outputs mislead operators into rubber-stamping harmful actions |
| ASI10 | Rogue Agents | Misalignment, concealment, self-directed action outside intended scope |

**Action:** Map the planned agent architecture against all 10 risks. This is the most concrete checklist available today.

### Indirect Prompt Injection — The Top Threat

In agentic systems that read enterprise data and write to enterprise systems, indirect prompt injection is qualitatively different from chatbot injection. Malicious instructions embedded in ERP records, supplier documents, or data feeds can trigger unauthorized writes across connected systems.

**Real incident — Salesforce Agentforce "ForcedLeak" (Sep 2025, CVSS 9.4):** An attacker injected instructions into a Web-to-Lead form's description field. When Agentforce processed the lead, it exfiltrated CRM data to an attacker-controlled domain. Cost of the attack: $5 (purchasing an expired allowlisted domain).

**Pacemaker-specific risk:** Agents that read from supplier-submitted data, BOM documents, or external data feeds and then write to ERPs or generate compliance reports have the same attack surface. A malicious supplier could embed instructions in BOM data that the Product Carbon Intelligence Agent processes.

### Data Exfiltration via Agents

Agents with read access to enterprise data and the ability to call external APIs or generate outputs have built-in exfiltration paths. Mitigations:
- Trusted URL allowlists for all outbound agent communications
- Egress filtering — agents can only write to pre-approved endpoints
- DLP (data-loss prevention) scanning on agent-generated content before it leaves the system
- Anomaly detection on data volumes in agent outputs

### Confused Deputy / Semantic Privilege Escalation

An agent operates within its technical permissions but exceeds the semantic scope of its task. Example: a reconciliation agent tricked into exporting all customer records — technically permitted, semantically unauthorized.

Mitigation: multiple narrow agents (1-2 tasks each) rather than one powerful agent. A "draft order" agent should not also have access to financial reporting.

---

## 4. Defense Architecture — Five Layers

The recommended architecture is a five-layer defense where each layer operates independently, so no single bypass compromises the system:

### Layer 1 — Input Screening
Every data input the agent processes (ERP records, documents, API responses, database fields) is treated as potentially hostile. Screen for injection patterns before the data reaches the LLM.

Tools: Lakera Guard (real-time firewall, proprietary threat intel), LLM Guard (open-source alternative).

### Layer 2 — Dialog and Intent Control
Programmable rails that constrain what the agent can discuss, decide, and do. Define allowed conversation flows and reject attempts to deviate.

Tools: NVIDIA NeMo Guardrails (open-source, Colang-based — handles ~80% of common safety requirements).

### Layer 3 — LLM Generation
The model itself. Model independence (via MCP tool exposure) means this layer can be swapped without redesigning security. Pin model versions; run regression tests on model updates before production deployment.

### Layer 4 — Output Validation
Validate every agent output against schemas and business rules before it reaches downstream systems.

- **Structural validation:** Pydantic models / Guardrails AI validators enforce schema compliance (correct fields, types, ranges)
- **Business-rule gates:** Order quantities within historical bounds, supplier codes against master data, total values against approval thresholds
- **Deterministic checksums:** For write-back operations, compute expected outputs from structured data independently and compare against agent output

### Layer 5 — Deterministic Policy Enforcement
A policy engine that evaluates every tool call before execution. This is the hard boundary — the LLM cannot be trusted to self-police.

Tools: Microsoft Agent Governance Toolkit (open-sourced April 2026, sub-millisecond enforcement, covers all 10 OWASP agentic risks). Also: AEGIS framework (policy firewall between agents and tools, hash-chained audit trails).

---

## 5. MCP Security — Platform-Specific Requirements

Since the high-level approach calls for MCP as the integration interface, these are the specific security requirements:

### What MCP Provides
- OAuth 2.1 authorization with mandatory PKCE (S256)
- Resource Indicators (RFC 8707) — tokens bound to specific MCP servers
- Token passthrough explicitly forbidden — servers must only accept tokens issued for them
- Step-up authorization — agents start with minimal scopes, escalate via standard OAuth flows

### What MCP Does Not Provide (Must Build)
- **Multi-tenancy:** No native tenant isolation. Pacemaker must build: tenant ID in tokens, per-tenant data access enforcement, path-based or instance-based server separation, context window flushing between tenant switches.
- **Fine-grained authorization (RBAC/ABAC):** The protocol provides token validation plumbing; Pacemaker must build the permission model on top.
- **Tool output sanitization:** MCP has no built-in mitigation for prompt injection via tool responses. All tool outputs must be treated as untrusted.

### Known MCP Vulnerabilities to Mitigate
- Auth is optional in the spec — treat it as mandatory
- Tool poisoning (malicious tool descriptions manipulate agent behavior) — verify/sign tool descriptors
- Session hijacking on Streamable HTTP — use cryptographically random session IDs, validate auth on every request
- SSRF via OAuth discovery — block private IP ranges, use egress proxies
- Confused deputy attacks via proxy servers — enforce per-client consent

---

## 6. Audit Trail Requirements

What enterprise compliance teams and auditors will expect:

| Dimension | Autonomous Action | Human-Approved Action |
|---|---|---|
| Agent identity | Which agent, which tenant | + approver identity |
| Decision context | Input data, retrieved context, reasoning trace | + approval request details |
| Action details | Tool calls, API endpoints, parameters, response codes | + draft vs. final submitted version |
| Authorization proof | Token scopes, active permission set | + delegation chain, signed approval token |
| Outcome | Success/failure, downstream state changes | Same |
| Timing | Timestamps for each step | + time of request, approval, execution |

Logs must be **immutable and append-only**. Consider hash-chained audit records (supported by Microsoft Agent Governance Toolkit and AEGIS framework).

---

## 7. Multi-Tenant Data Isolation

Since Pacemaker serves 60+ enterprise clients, tenant isolation is critical at two layers:

**Data layer:**
- Tenant-scoped credentials — agents can only query data for the active tenant
- Row-level security filtering to the active tenant context
- Token isolation from the LLM — a broker injects tenant-scoped tokens at execution time; the model never sees raw credentials

**Execution layer:**
- Each agent session runs in an isolated environment — no observation of concurrent sessions for other tenants
- Context windows flushed between tenant switches — no residual data from Client A when serving Client B
- Per-tenant secrets in isolated vaults (separate Key Vault instances or Vault namespaces)

The Asana AI incident (May 2025) — a tenant isolation flaw caused cross-organization data contamination affecting ~1,000 organizations — is a cautionary reference.

---

## 8. Prioritized Roadmap

### Immediate (next 1-3 months)

1. **EU AI Act risk classification** — formally classify each planned agent against Annex III. Document the reasoning.
2. **OWASP Agentic Top 10 risk assessment** — map the planned architecture against ASI01-ASI10. Identify gaps.
3. **Agent identity architecture design** — define agents as first-class identities (OAuth 2.1, DPoP, per-tenant scoping). Do not bolt this on later.
4. **ISO 42001 gap analysis** — assess what's needed beyond current ISO 27001 / SOC 2 posture.
5. **DPIA for agents processing personal data** — required before any agent handles employee names, contacts, or similar data.

### Near-term (3-6 months)

6. **Five-layer defense architecture** — implement input screening, output validation, and deterministic policy enforcement. Evaluate Microsoft Agent Governance Toolkit, Lakera Guard, NeMo Guardrails.
7. **MCP security hardening** — build tenant isolation, mandatory auth, tool output sanitization, egress filtering on top of the MCP spec.
8. **Human-in-the-loop framework** — out-of-band approval flows with signed approval tokens, stop mechanisms (AI Act Article 14), configurable per customer and action type.
9. **Audit trail infrastructure** — immutable, append-only logging covering all dimensions in the audit table above. Must satisfy both EU AI Act Article 12 and SOC 2 requirements.

### Medium-term (6-12 months)

10. **ISO 42001 certification** — pursue formal certification as a market differentiator.
11. **Inter-agent security** — authenticated, integrity-checked communication for orchestrator-to-sub-agent patterns (ASI07).
12. **Red teaming program** — ongoing adversarial testing for prompt injection, data exfiltration, and privilege escalation against deployed agents.
13. **Client deployer documentation** — transparency materials required by AI Act Article 13 for enterprise customers.
14. **Progressive autonomy controls** — configurable approval thresholds that clients can relax as trust builds, with full audit trail of threshold changes.

---

## Key References

**Frameworks and standards:**
- OWASP Top 10 for Agentic Applications (2026): https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- OWASP Top 10 for LLM Applications (2025): https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/
- OWASP Secure MCP Server Development Guide: https://genai.owasp.org/resource/a-practical-guide-for-secure-mcp-server-development/
- NIST AI RMF 1.0 (AI 100-1) + GenAI Profile (AI 600-1)
- NIST NCCoE — AI Agent Identity and Authorization concept paper (Feb 2026)
- ISO/IEC 42001:2023 — AI Management Systems
- EU AI Act (Regulation 2024/1689) — Articles 6, 9, 12, 13, 14, Annex III

**MCP security:**
- MCP Authorization Specification (draft): https://modelcontextprotocol.io/specification/draft/basic/authorization
- MCP Security Best Practices: https://modelcontextprotocol.io/specification/draft/basic/security_best_practices
- CoSAI/OASIS MCP Security Analysis: https://github.com/cosai-oasis/ws4-secure-design-agentic-systems/blob/main/model-context-protocol-security.md

**Platform references:**
- Microsoft Entra Agent ID: https://learn.microsoft.com/en-us/entra/agent-id/agent-service-principals
- Microsoft Agent Governance Toolkit (open-source): https://opensource.microsoft.com/blog/2026/04/02/introducing-the-agent-governance-toolkit-open-source-runtime-security-for-ai-agents/
- Salesforce Agentforce security architecture: https://engineering.salesforce.com/how-agentforce-runs-secure-ai-agents-at-11-million-calls-per-day/
- ServiceNow AI Agent Studio access controls: https://www.servicenow.com/community/now-assist-articles/latest-access-control-security-enhancements-for-ai-agents-and/ta-p/3374036

**Incident references:**
- Salesforce ForcedLeak (CVSS 9.4): https://noma.security/blog/forcedleak-agent-risks-exposed-in-salesforce-agentforce/
- Asana AI tenant isolation flaw (May 2025)
- LiteLLM middleware breach (early 2026)
