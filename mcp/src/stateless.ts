import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import server from "./mcp.js";


async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.use((req, res, next) => {
    console.log(new Date().toISOString() + " " + req.method + " " + req.url);
    next();
  });

  app.post('/mcp', async (req, res) => {
    // In stateless mode, create a new instance of transport and server for each request
    // to ensure complete isolation. A single instance would cause request ID collisions
    // when multiple clients connect concurrently.
    
    try { 
        const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
        });
        res.on('close', () => {
            transport.close();
        });
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Error handling MCP request:', error);
        if (!res.headersSent) {
        res.status(500).json({
            jsonrpc: '2.0',
            error: {
            code: -32603,
            message: 'Internal server error',
            },
            id: null,
        });
        }
    }
    });

  // SSE notifications not supported in stateless mode
  app.get('/mcp', async (req, res) => {
    console.log('Received GET MCP request');
    res.writeHead(405).end(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    }));
  });

    // Session termination not needed in stateless mode
  app.delete('/mcp', async (req, res) => {
    console.log('Received DELETE MCP request');
    res.writeHead(405).end(JSON.stringify({
        jsonrpc: "2.0",
        error: {
        code: -32000,
        message: "Method not allowed."
        },
        id: null
    }));
  });

  app.listen(port, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.error(`security-guidance MCP server (HTTP/Express) listening on http://localhost:${port}/mcp`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});