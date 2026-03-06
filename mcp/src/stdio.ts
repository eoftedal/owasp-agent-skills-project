import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import server from "./mcp.js";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server is running...");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});