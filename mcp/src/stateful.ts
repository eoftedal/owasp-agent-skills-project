import express from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"

import server from "./mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
app.use(express.json());

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
const sse = {} as Record<string, SSEServerTransport>

app.post('/mcp', async (req, res) => {

  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        transports[sessionId] = transport;
      },

    });

    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };
    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }
  await transport.handleRequest(req, res, req.body);
});

const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  
  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

app.get('/mcp', handleSessionRequest);

app.delete('/mcp', handleSessionRequest);


// Legacy SSE
app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);
  sse[transport.sessionId] = transport;
  
  res.on("close", () => {
    delete sse[transport.sessionId];
  });
  
  await server.connect(transport);
});

// Legacy SSE
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = sse[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});




app.listen(port, () => {
// eslint-disable-next-line no-console
console.error(`security-guidance MCP server (HTTP/Express) listening on http://localhost:${port}/mcp (legacy: http://localhost:${port}/sse)`);
});