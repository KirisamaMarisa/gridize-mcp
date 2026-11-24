#!/usr/bin/env node
/**
 * Local stdio bridge to the hosted Gridize MCP server, for clients that only
 * run local (stdio) servers or cannot send headers. Every request is
 * forwarded as is; the tools run on gridize.dev.
 */
import { createRequire } from 'node:module';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const { version } = createRequire(import.meta.url)('../package.json');

const ENDPOINT = process.env.GRIDIZE_MCP_URL || 'https://gridize.dev/api/mcp';
const API_KEY = process.env.GRIDIZE_API_KEY?.trim();
/** Generation and animation calls can take a few minutes. */
const CALL_TIMEOUT_MS = 5 * 60 * 1000;

async function connectRemote() {
  const client = new Client({ name: 'gridize-mcp', version });
  const transport = new StreamableHTTPClientTransport(new URL(ENDPOINT), {
    requestInit: {
      headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {},
    },
  });
  await client.connect(transport);
  return client;
}

async function main() {
  let remote;
  try {
    remote = await connectRemote();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `gridize-mcp: could not connect to ${ENDPOINT}: ${message}` +
        (API_KEY
          ? '\nCheck GRIDIZE_API_KEY; create a key at https://gridize.dev/settings/apikeys'
          : '')
    );
    process.exitCode = 1;
    return;
  }

  const server = new Server(
    { name: 'gridize', version },
    {
      capabilities: { tools: {} },
      instructions: remote.getInstructions(),
    }
  );
  server.setRequestHandler(ListToolsRequestSchema, (request) =>
    remote.listTools(request.params)
  );
  server.setRequestHandler(CallToolRequestSchema, (request) =>
    remote.callTool(request.params, undefined, {
      timeout: CALL_TIMEOUT_MS,
    })
  );

  const close = async () => {
    await Promise.allSettled([server.close(), remote.close()]);
    process.exit(0);
  };
  process.stdin.on('close', close);
  process.on('SIGINT', close);
  process.on('SIGTERM', close);

  await server.connect(new StdioServerTransport());
}

await main();
