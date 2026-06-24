# AgentLedger

MCP server that stores AI agent reasoning traces permanently on 0G Storage — immutable, verifiable, tamper-proof.

Every decision an AI agent makes gets uploaded to 0G's decentralized storage network and linked into a cryptographic chain. Any attempt to delete or modify past decisions breaks the chain and is immediately detectable.

## Installation

See [INSTALL.md](./INSTALL.md) for full instructions.

**Quickest way — npx, no clone needed:**
```json
{
  "mcpServers": {
    "agentledger": {
      "command": "npx",
      "args": ["agentledger-mcp"],
      "env": {
        "PRIVATE_KEY": "your_wallet_private_key",
        "AGENT_ID": "my-agent"
      }
    }
  }
}
```
Add that to your Claude Desktop MCP config, restart, and you're live.

## MCP Tools

| Tool | Description |
|------|-------------|
| `log_reasoning` | Store a full agent reasoning trace on 0G. Returns root hash + StorageScan URL |
| `get_reasoning` | Retrieve any reasoning trace by root hash |
| `verify_reasoning` | Cryptographically verify a trace is unchanged on 0G |
| `get_agent_history` | Full decision history for any agent |
| `audit_agent` | Verify the complete decision chain is INTACT or BROKEN |

## How it works

1. Agent makes a decision → reasoning steps captured
2. Trace encoded as JSON → uploaded to 0G Storage via `MemData`
3. Root hash returned — this is the permanent, content-addressed proof
4. Each trace's `prev_decision_hash` points to the previous → tamper-proof chain
5. Agent index stored in 0G KV Store — the full ledger lives on-chain

## Network

Built on [0G Galileo Testnet](https://storagescan-galileo.0g.ai).
