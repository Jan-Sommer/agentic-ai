# Private Model Options — Data Sovereignty Constraint

> **The constraint:** Customer data cannot be processed by public LLM APIs (OpenAI, Anthropic public API, etc.).  
> **The implication:** The AI agent that orchestrates MCP tool calls must run in a controlled environment — the MCP server itself is just a REST bridge, but the LLM that reads the returned data is the component that must be private.

---

## Options at a Glance

| Option | Data stays in | Quality vs Claude | Ops effort | Best fit |
|--------|--------------|-------------------|------------|----------|
| **AWS Bedrock** (Claude) | Your AWS account | Same model | Low | Already on AWS — natural fit |
| **Google Vertex AI** (Claude) | Your GCP project/region | Same model | Low | Already on GCP |
| **Azure OpenAI / Foundry** (Claude) | Your Azure tenant | Same model | Low | Already on Azure |
| **Anthropic API + ZDR** | Anthropic infra | Same model | Minimal | If cloud isolation isn't required |
| **Self-hosted open-source** | Your own infra | Good, not equal | High | Strict on-prem requirement |

---

## Option 1 — Private Managed Cloud (Recommended)

Run the same Claude models inside your own cloud account. Data never leaves your account, no training use, same model weights and quality.

### AWS Bedrock

**Available Claude models:** Opus 4.7, Opus 4.6, Sonnet 4.6, Haiku 4.5 (all current generation)  
**Context window:** 1M tokens on Opus 4.6/4.7 and Sonnet 4.6

**Data guarantees:**
- Inputs and outputs are never used to train foundation models (contractual)
- Prompts and responses are not stored after the response is returned
- Workloads run inside your VPC
- FedRAMP High + DoD SRG IL4/IL5 certified (first cloud provider for Claude)
- Standard DPA and BAA available

**Claude Code on Bedrock** — single env var, works today:
```bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
export ANTHROPIC_DEFAULT_SONNET_MODEL=us.anthropic.claude-sonnet-4-6
```

Uses standard AWS auth (CLI profiles, SSO, access keys). Cross-region inference prefixes (`us.`, `global.`) are supported.

> **Relevance:** SCX and SMP already use AWS Lambda and Secrets Manager. Bedrock is the lowest-friction path — same account, same region, same compliance perimeter.

---

### Google Vertex AI

**Available Claude models:** Same generation as Bedrock (Opus 4.7, Sonnet 4.6, Haiku 4.5)

**Data residency options:**
- `global` — no residency guarantee
- `us` / `eu` — multi-region, data stays in geography (+10% price)
- `us-east1`, `europe-west1` etc. — single region, strict routing (+10%)

**Claude Code on Vertex:**
```bash
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=europe-west1
export ANTHROPIC_VERTEX_PROJECT_ID=your-gcp-project
```

> **Relevance:** SMP uses Azure Functions and Azure Blob — but if GCP is in scope, Vertex gives the same isolation with explicit EU data residency for GDPR-sensitive workloads.

---

### Azure OpenAI / Microsoft Foundry

Claude available via Microsoft Foundry as partner models. GPT-4o and o-series are Azure-native. Data governed by Microsoft's DPA — not used to improve products without consent, GDPR-compliant, EU Standard Contractual Clauses available. Default abuse-monitoring retention (30 days) can be waived for enterprise customers.

> **Relevance:** SMP already uses Azure Blob, Azure Functions, and Azure Key Vault. Azure Foundry adds to an existing Azure footprint without new cloud accounts.

---

## Option 2 — Anthropic API + Zero Data Retention

If strict cloud-account isolation is not required but data storage is the concern:

- **Training:** disabled by default on all commercial API tiers
- **Zero Data Retention (ZDR):** inputs and outputs not stored after the API response — available on request via Anthropic Sales
- **ZDR scope:** Messages API, Token Counting API, Claude Code with org API keys ✅  
  NOT covered: Batch API, Files API, Code Execution tool
- **Compliance:** SOC 2 Type II, ISO 27001, HIPAA BAA, GDPR DPA — 99.99% SLA
- **On-premise Claude:** does not exist — Anthropic does not offer self-hosted model weights

This is the simplest path if the constraint is "no training on our data" rather than "data must not leave our infrastructure."

---

## Option 3 — Self-Hosted Open-Source Models

Full data isolation — model runs on your own hardware or private cloud VMs. No data ever leaves your perimeter.

**Top current models for agentic / tool-calling tasks:**

| Model | Size | License | Notes |
|-------|------|---------|-------|
| Qwen 3 32B | 32B | Apache 2.0 | Best practical self-hosted option for complex MCP workflows; strong tool-calling |
| Qwen 3 235B | 235B | Apache 2.0 | Top reasoning scores (85.7% AIME); needs multi-GPU |
| DeepSeek V4 Pro | ~670B MoE | MIT | Top open-weight benchmark; large hardware requirement |
| Qwen 2.5-Coder-32B | 32B | Apache 2.0 | Recommended for code-heavy tasks |

**GPU requirements for 70B-class models:**

| Precision | VRAM | Example hardware |
|-----------|------|-----------------|
| INT4 (Q4) | ~35–42 GB | Single H100 80GB |
| FP8 | ~70 GB | Single H200 141GB |
| FP16 | ~140 GB | 2× H100 80GB |

**Serving frameworks:**

| Framework | Use case | Notes |
|-----------|----------|-------|
| **Ollama** | Local dev, single user | Zero config; not production-scale |
| **vLLM** | Production API serving | OpenAI-compatible API; PagedAttention; standard enterprise choice |
| **NVIDIA NIM** | Enterprise + NVIDIA hardware | Pre-optimized vLLM containers; ~2× throughput vs vanilla vLLM |

**Quality tradeoff:** Qwen 3 32B is capable but not equivalent to Claude Sonnet 4.6 for complex multi-step reasoning. Expect lower performance on nuanced tool orchestration, edge cases, and long-context tasks.

**Operational overhead:** GPU cluster procurement/maintenance, model updates, serving infra, security patching. Non-trivial for a team without existing MLOps.

---

## MCP-Specific Implications

The MCP server itself is stateless infrastructure — it does not process data through any model. The LLM that matters is the **agent** that calls the MCP tools and reads the results.

**If using Claude Code as the agent interface:** configure it to route through Bedrock or Vertex — same developer experience, data stays in your cloud account.

**If a custom agent pipeline:** use `vLLM` with a Qwen 3 32B model as the orchestrator, expose it via an OpenAI-compatible API, and point any MCP-capable client (Continue.dev, Cline, goose) at it.

**MCP clients with native local model support:**

| Client | MCP support | Local model support |
|--------|-------------|---------------------|
| Continue.dev | Full (Tools, Resources, Prompts) | Ollama, vLLM, any OpenAI-compatible |
| Cline (VS Code) | Tools, Resources | Any provider |
| Cursor | Tools, Prompts, Roots | Configurable providers |
| goose (Block) | Full suite | Extensible providers |
| llama.cpp server | Tools, MCP prompts | GGUF models natively (merged March 2026) |

Minimum model size for reliable MCP tool-calling: **14B+ parameters** with explicit tool-calling training. Qwen 3 32B is the current recommended floor for complex multi-tool workflows.

---

## Recommendation

| Scenario | Recommendation |
|----------|---------------|
| Already on AWS, want Claude quality | **AWS Bedrock** — one env var in Claude Code, same models, strong DPA |
| Need EU data residency explicitly | **Google Vertex AI** `europe-west1` or **Azure Foundry** |
| "No training" is the constraint, not "data must stay on-prem" | **Anthropic API + ZDR** — simplest, no infra change |
| True air-gap / on-prem requirement | **Self-hosted vLLM + Qwen 3 32B** — accept quality and ops tradeoff |

Given the existing AWS footprint (Lambda, Secrets Manager) in the SMP/CFT repos: **AWS Bedrock is the natural first choice** — it requires no new cloud accounts, no new compliance reviews, and delivers identical model quality to the public Claude API.
