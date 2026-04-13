#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";

const API_URL = process.env.INFERENCE_API_URL || "https://api.inference.sh";
const API_KEY = process.env.INFERENCE_API_KEY || "";

if (!API_KEY) {
  process.stderr.write(
    "Error: INFERENCE_API_KEY environment variable is required.\n" +
      "Get your API key at https://inference.sh/settings/keys\n"
  );
  process.exit(1);
}

async function main() {
  const url = new URL("/mcp/", API_URL);

  // Remote: connect to inference.sh via Streamable HTTP with Bearer auth
  const remoteTransport = new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    },
  });

  // Local: stdio transport for the MCP client (Claude Code, Cursor, etc.)
  const localTransport = new StdioServerTransport();

  // Pipe messages between local stdio and remote HTTP
  localTransport.onmessage = async (message: JSONRPCMessage) => {
    await remoteTransport.send(message);
  };

  remoteTransport.onmessage = async (message: JSONRPCMessage) => {
    await localTransport.send(message);
  };

  localTransport.onclose = () => {
    remoteTransport.close();
    process.exit(0);
  };

  remoteTransport.onclose = () => {
    localTransport.close();
    process.exit(0);
  };

  localTransport.onerror = (err) => {
    process.stderr.write(`Local transport error: ${err}\n`);
  };

  remoteTransport.onerror = (err) => {
    process.stderr.write(`Remote transport error: ${err}\n`);
  };

  await localTransport.start();
  await remoteTransport.start();

  process.stderr.write(`Connected to ${url.toString()}\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err}\n`);
  process.exit(1);
});
