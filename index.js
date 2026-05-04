import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { google } from "googleapis";
import { z } from "zod";

const {
  GA_OAUTH_CLIENT_ID,
  GA_OAUTH_CLIENT_SECRET,
  GA_REFRESH_TOKEN,
  GA_PROPERTY_ID
} = process.env;

if (!GA_OAUTH_CLIENT_ID || !GA_OAUTH_CLIENT_SECRET || !GA_REFRESH_TOKEN || !GA_PROPERTY_ID) {
  console.error("Faltan variables: GA_OAUTH_CLIENT_ID, GA_OAUTH_CLIENT_SECRET, GA_REFRESH_TOKEN, GA_PROPERTY_ID");
  process.exit(1);
}

const auth = new google.auth.OAuth2(
  GA_OAUTH_CLIENT_ID,
  GA_OAUTH_CLIENT_SECRET,
  "http://127.0.0.1:3000/"
);

auth.setCredentials({
  refresh_token: GA_REFRESH_TOKEN
});

const analyticsData = google.analyticsdata({
  version: "v1beta",
  auth
});

async function runGA4Report({ startDate, endDate, dimensions = [], metrics = [] }) {
  const res = await analyticsData.properties.runReport({
    property: `properties/${GA_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: dimensions.map(name => ({ name })),
      metrics: metrics.map(name => ({ name }))
    }
  });

  return JSON.stringify(res.data, null, 2);
}

const server = new McpServer({
  name: "ga4-oauth-mcp",
  version: "1.0.0"
});

server.tool(
  "ga4_snapshot",
  "Resumen de GA4: usuarios, sesiones, vistas, engagement y eventos.",
  {
    startDate: z.string().default("28daysAgo"),
    endDate: z.string().default("today")
  },
  async ({ startDate, endDate }) => {
    const data = await runGA4Report({
      startDate,
      endDate,
      metrics: [
        "activeUsers",
        "sessions",
        "screenPageViews",
        "engagedSessions",
        "eventCount"
      ]
    });

    return {
      content: [{ type: "text", text: data }]
    };
  }
);

server.tool(
  "ga4_top_pages",
  "Páginas con más tráfico en GA4.",
  {
    startDate: z.string().default("28daysAgo"),
    endDate: z.string().default("today"),
    limit: z.number().default(20)
  },
  async ({ startDate, endDate, limit }) => {
    const res = await analyticsData.properties.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "activeUsers" },
          { name: "sessions" }
        ],
        limit
      }
    });

    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }]
    };
  }
);

server.tool(
  "ga4_traffic_sources",
  "Fuentes y medios de tráfico en GA4.",
  {
    startDate: z.string().default("28daysAgo"),
    endDate: z.string().default("today"),
    limit: z.number().default(20)
  },
  async ({ startDate, endDate, limit }) => {
    const res = await analyticsData.properties.runReport({
      property: `properties/${GA_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: "sessionSource" },
          { name: "sessionMedium" }
        ],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "engagedSessions" }
        ],
        limit
      }
    });

    return {
      content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);