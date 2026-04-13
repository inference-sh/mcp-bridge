# @inferencesh/mcp-bridge

Stdio-to-HTTP bridge for [MCP](https://modelcontextprotocol.io/) (Model Context Protocol). Connects any stdio-based MCP client to a remote MCP server over Streamable HTTP transport with Bearer token authentication.

Built on the official [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk).

## Usage with inference.sh

```json
{
  "mcpServers": {
    "inference": {
      "command": "npx",
      "args": ["@inferencesh/mcp-bridge"],
      "env": {
        "INFERENCE_API_KEY": "1nfsh-your-api-key"
      }
    }
  }
}
```

Get your API key at [inference.sh/settings/keys](https://inference.sh/settings/keys).

## Usage with any MCP server

Works with any remote MCP server that supports Streamable HTTP transport:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["@inferencesh/mcp-bridge"],
      "env": {
        "INFERENCE_API_URL": "https://my-mcp-server.com",
        "INFERENCE_API_KEY": "my-api-key"
      }
    }
  }
}
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `INFERENCE_API_KEY` | (required) | Bearer token for authentication |
| `INFERENCE_API_URL` | `https://api.inference.sh` | MCP server base URL |

## How it works

```
┌─────────────┐    stdio     ┌─────────────┐  Streamable HTTP  ┌─────────────┐
│  MCP Client  │ ──────────> │  mcp-bridge  │ ────────────────> │  MCP Server  │
│  (Claude,    │ <────────── │              │ <──────────────── │  (remote)    │
│   Cursor,    │   JSON-RPC  │              │    SSE + JSON     │              │
│   Zed, etc.) │             └─────────────┘                   └─────────────┘
└─────────────┘
```

The bridge reads JSON-RPC messages from stdin, forwards them to the remote server via HTTP POST with your Bearer token, and pipes responses (including SSE streams) back to stdout.

## Compatible MCP clients

Any client that supports stdio transport:

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (CLI)
- [Claude Desktop](https://claude.ai/download)
- [Cursor](https://cursor.com)
- [Zed](https://zed.dev)
- [Windsurf](https://windsurf.com)
- [VS Code + GitHub Copilot](https://code.visualstudio.com)

## License

MIT
