# Installing AgentLedger

## Prerequisites
- Node.js 18+
- An EVM wallet private key
- Free testnet tokens from https://faucet.0g.ai (connect your wallet, get 0.1 0G)

## Option 1 — npx (recommended, no clone needed)

### Step 1 — Add to your MCP config

For Claude Desktop, open:
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add this block:
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

### Step 2 — Restart Claude Desktop

AgentLedger is now available. Try asking Claude:
> "Log my reasoning: I analyzed BTC volume and decided to BUY — strong uptrend confirmed"

Claude will call `log_reasoning`, upload your reasoning to 0G Storage, and return a root hash and StorageScan link as proof.

---

## Option 2 — Clone and run locally

```bash
git clone https://github.com/Benita2001/agentledger
cd agentledger
npm install
cp .env.example .env
# Edit .env — add your PRIVATE_KEY
npm run demo    # confirm it works end to end
```

Then use the local dev MCP config from `mcp-config.json`.

---

## Verify it works

Every `log_reasoning` call returns a StorageScan URL:
```
https://storagescan-galileo.0g.ai/tx/YOUR_TX_HASH
```
Click it — your reasoning trace is living on the 0G blockchain permanently.

---

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `log_reasoning` | Store a full agent reasoning trace on 0G. Returns root hash + StorageScan URL |
| `get_reasoning` | Retrieve any reasoning trace by root hash |
| `verify_reasoning` | Cryptographically verify a trace is unchanged on 0G |
| `get_agent_history` | Full decision history for any agent |
| `audit_agent` | Verify the complete decision chain is INTACT or BROKEN |
