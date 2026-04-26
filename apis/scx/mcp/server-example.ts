/**
 * SCX MCP Server — Example Implementation
 *
 * Demonstrates 6 tools (one per group A–F) with real SCX API calls.
 * Extend by adding more tools from tool-groups.yaml.
 *
 * Run locally:  npx tsx src/server.ts
 * Build:        tsc && node dist/server.js
 */

import { McpServer } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server";
import { z } from "zod";

// ─── Configuration (all from environment variables) ────────────────────────

const config = {
  apiUrl: process.env.SCX_API_URL ?? "http://localhost:3000",
  apiKey: process.env.SCX_API_KEY ?? "",
  tenantId: process.env.SCX_TENANT_ID ?? "",

  // For JWT-protected endpoints: obtain via Keycloak Client Credentials flow
  // or set a long-lived service account token for development
  jwtToken: process.env.SCX_JWT_TOKEN ?? "",

  // Keycloak config for automatic token refresh (optional)
  keycloakUrl: process.env.KEYCLOAK_URL ?? "",
  keycloakRealm: process.env.SCX_KEYCLOAK_REALM ?? "",
  mcpClientId: process.env.MCP_CLIENT_ID ?? "",
  mcpClientSecret: process.env.MCP_CLIENT_SECRET ?? "",
};

// ─── HTTP Helpers ──────────────────────────────────────────────────────────

async function scxGet(path: string, useApiKey = false): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (useApiKey) {
    headers["x-api-key"] = config.apiKey;
  } else {
    headers["Authorization"] = `Bearer ${config.jwtToken}`;
  }

  const res = await fetch(`${config.apiUrl}${path}`, { headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SCX API error ${res.status} for ${path}: ${body}`);
  }

  return res.json();
}

async function scxPost(
  path: string,
  body: unknown,
  useApiKey = false
): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (useApiKey) {
    headers["x-api-key"] = config.apiKey;
  } else {
    headers["Authorization"] = `Bearer ${config.jwtToken}`;
  }

  const res = await fetch(`${config.apiUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SCX API error ${res.status} for POST ${path}: ${text}`);
  }

  return res.json();
}

/** Poll the SSE stream until a forecast job completes or times out. */
async function waitForForecastJob(
  tenantId: string,
  jobId: string,
  timeoutMs = 600_000
): Promise<void> {
  const url = `${config.apiUrl}/api/v1/sse/${tenantId}`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 5_000));

    // In a real implementation: parse SSE events for jobId completion signal.
    // Here we do a simple status poll as a fallback.
    const status = await scxGet(
      `/api/v1/configurations/${jobId}/latest-predictions`
    ).catch(() => null);

    if (status) return; // predictions available = job done
  }

  throw new Error(`Forecast job ${jobId} timed out after ${timeoutMs / 1000}s`);
}

// ─── MCP Server Setup ──────────────────────────────────────────────────────

const server = new McpServer(
  { name: "scx-mcp-server", version: "1.0.0" },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// GROUP A — Forecast Intelligence (Read-Only)
// ═══════════════════════════════════════════════════════════════════════════

server.registerTool(
  "list_configurations",
  {
    title: "List Forecast Configurations",
    description:
      "List all forecast configurations visible to the current user. " +
      "Use this as the entry point to discover what can be forecast. " +
      "Returns configuration IDs, names, and statuses.",
    inputSchema: z.object({}),
  },
  async () => {
    const data = await scxGet("/api/v1/configurations/visible");
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.registerTool(
  "get_accuracy_measures",
  {
    title: "Get Forecast Accuracy Measures",
    description:
      "Calculate forecast accuracy metrics (MAPE, RMSE, bias) for a result set. " +
      "Use to answer 'how accurate is our forecast?' or " +
      "'which categories have accuracy below 70%?'.",
    inputSchema: z.object({
      resultId: z.string().describe("Forecast result set ID"),
      groupBy: z
        .array(z.string())
        .optional()
        .describe("Dimensions to group accuracy by (e.g. ['product_category'])"),
    }),
  },
  async ({ resultId, groupBy }) => {
    const data = await scxPost(`/api/v1/results/${resultId}/measures`, {
      groupBy,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.registerTool(
  "get_abc_xyz_analysis",
  {
    title: "Get ABC-XYZ Classification",
    description:
      "Get ABC-XYZ segmentation: A/B/C = revenue contribution, X/Y/Z = demand variability. " +
      "AX = high-value stable items, CZ = low-value erratic items. " +
      "Use to prioritize safety stock or forecast investment.",
    inputSchema: z.object({
      analysisId: z.string().describe("Analysis configuration ID"),
      filter: z
        .string()
        .optional()
        .describe("Optional ABC-XYZ class filter (e.g. 'AX', 'CZ')"),
    }),
  },
  async ({ analysisId, filter }) => {
    const path = filter
      ? `/api/v1/insights/analysis-results/${analysisId}/abc-xyz?filter=${filter}`
      : `/api/v1/insights/analysis-results/${analysisId}/abc-xyz`;
    const data = await scxGet(path);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// GROUP B — Replenishment Risk (Read-Only)
// ═══════════════════════════════════════════════════════════════════════════

server.registerTool(
  "get_critical_stock",
  {
    title: "Get Critical Stock Items",
    description:
      "List all materials with critical or at-risk stock levels. " +
      "Returns materials that may face stockout within the planning horizon. " +
      "Use to answer 'what supply risks do we have right now?' or set up alerts.",
    inputSchema: z.object({
      filters: z
        .record(z.string())
        .optional()
        .describe(
          "Optional filter by material group, location, plant, etc. " +
            "Example: { 'plant': 'DE01', 'material_group': 'RAW' }"
        ),
    }),
  },
  async ({ filters }) => {
    const query = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : "";
    const data = await scxGet(`/api/v1/replenishment/critical-stock${query}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.registerTool(
  "get_stock_alert_summary",
  {
    title: "Get Stock Alert Summary",
    description:
      "Get an aggregated count of stock alerts by severity: " +
      "critical (red), at-risk (yellow), and healthy (green). " +
      "Use for high-level risk summaries and escalation decisions.",
    inputSchema: z.object({
      filters: z
        .record(z.string())
        .optional()
        .describe("Planning filter criteria"),
    }),
  },
  async ({ filters }) => {
    const data = await scxPost(
      "/api/v1/replenishment/critical-stock/count/stock-alert-summary",
      { filters: filters ?? {} }
    );
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// GROUP C — Forecast Execution (Write, Async)
// ═══════════════════════════════════════════════════════════════════════════

server.registerTool(
  "execute_forecast",
  {
    title: "Execute Forecast Run",
    description:
      "Trigger a new forecast run for a configuration and wait for completion. " +
      "This is an async operation that may take several minutes. " +
      "Returns the result ID when the forecast is ready. Requires Admin role.",
    inputSchema: z.object({
      configurationId: z
        .string()
        .describe("ID of the forecast configuration to run"),
    }),
  },
  async ({ configurationId }) => {
    // Trigger the forecast job
    const job = (await scxPost(
      `/api/v1/configurations/${configurationId}/execute`,
      {}
    )) as { jobId?: string };

    const jobId = job.jobId ?? configurationId;

    // Poll for completion via SSE (simplified: poll latest-predictions)
    try {
      await waitForForecastJob(config.tenantId, jobId);
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Forecast job started (jobId: ${jobId}) but timed out waiting for completion. Check the SCX UI for status.`,
          },
        ],
        isError: false, // not an error — job is running, just slow
      };
    }

    const predictions = await scxGet(
      `/api/v1/configurations/${configurationId}/latest-predictions`
    );

    return {
      content: [
        {
          type: "text",
          text: `Forecast completed for configuration ${configurationId}.\n\n${JSON.stringify(predictions, null, 2)}`,
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// GROUP E — Event Injection (AI-Native, API Key auth)
// ═══════════════════════════════════════════════════════════════════════════

server.registerTool(
  "import_extracted_events",
  {
    title: "Import Extracted Events",
    description:
      "Import structured events extracted from external news or articles into SCX. " +
      "Use after an LLM has parsed news and structured the relevant supply chain events. " +
      "Events will affect future forecast runs. " +
      "ALWAYS show proposed events to the user before calling this tool.",
    inputSchema: z.object({
      extractedEvents: z
        .array(
          z.object({
            type: z
              .string()
              .describe(
                "Event type (from get_extraction_topics, e.g. 'supply_disruption')"
              ),
            name: z.string().describe("Human-readable event name"),
            startDate: z.string().describe("ISO date string (YYYY-MM-DD)"),
            endDate: z.string().describe("ISO date string (YYYY-MM-DD)"),
            affectedDimensions: z
              .record(z.string())
              .optional()
              .describe(
                "Which dimensions this event affects, e.g. { 'region': 'EMEA' }"
              ),
            description: z.string().optional(),
          })
        )
        .describe("Structured events to import"),
      source: z
        .string()
        .optional()
        .describe("Name of the news source or feed"),
      articles: z
        .array(
          z.object({
            url: z.string(),
            title: z.string(),
            publishedAt: z.string(),
          })
        )
        .optional()
        .describe("Source articles for audit trail"),
    }),
  },
  async ({ extractedEvents, source, articles }) => {
    const data = await scxPost(
      "/api/v1/event-extraction/import",
      {
        extractedEvents,
        source: source ?? "mcp-agent",
        articles: articles ?? [],
        importedAt: new Date().toISOString(),
      },
      true // use API Key
    );

    return {
      content: [
        {
          type: "text",
          text:
            `Successfully imported ${extractedEvents.length} event(s) into SCX.\n\n` +
            JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// GROUP F — Commodity Pricing (Read-Only)
// ═══════════════════════════════════════════════════════════════════════════

server.registerTool(
  "get_hedging_recommendation",
  {
    title: "Get Hedging Recommendation",
    description:
      "Calculate a hedging recommendation for a commodity purchase. " +
      "Returns whether to hedge, suggested price, and recommended volume " +
      "based on the price forecast and planned consumption. " +
      "Use to answer 'should we hedge our Q4 copper purchases?'.",
    inputSchema: z.object({
      materialId: z.string().describe("Commodity material ID"),
      horizon: z
        .string()
        .describe("Planning horizon (e.g. 'Q4-2026' or '6M')"),
      volume: z
        .number()
        .optional()
        .describe("Forecasted consumption volume in base UOM"),
      strategy: z
        .enum(["conservative", "balanced", "aggressive"])
        .default("balanced")
        .describe("Hedging risk appetite"),
    }),
  },
  async ({ materialId, horizon, volume, strategy }) => {
    const data = await scxPost("/api/v1/commodity-price/hedging", {
      materialId,
      horizon,
      volume,
      strategy,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// ─── Start Server ──────────────────────────────────────────────────────────

async function main() {
  // Validate required environment variables
  const missing = (["SCX_API_URL", "SCX_TENANT_ID"] as const).filter(
    (key) => !process.env[key]
  );
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SCX MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
