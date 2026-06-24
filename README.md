# AgentLedger

> Your agent thinks. We store the proof.

AgentLedger is an MCP server that captures AI agent reasoning traces and stores them permanently on **0G Storage** — decentralized, immutable, and verifiable. Every decision an agent makes gets a cryptographic root hash receipt. Decisions are chained — each one references the previous root hash — so history cannot be rewritten without detection.

The entire system runs on 0G. Reasoning traces go to **0G Storage**. The agent decision index lives in **0G KV Store**. Zero local state. Nothing on your server.

**Built for the 0G Zero Cup Hackathon.**
>
> ---
>
> ## TL;DR for Judges
>
> | What | Detail |
> |------|--------|
> | **What it is** | MCP server — plug into any AI agent in one config block |
> | **What it does** | Captures every reasoning step an agent takes, stores it permanently on 0G Storage |
> | **0G usage** | 0G Storage (traces) + 0G KV Store (index) — zero local state |
> | **Chain integrity** | Each decision chains to the previous root hash — tampering is mathematically detectable |
> | **Install** | `npm install -g @0xbeni/agentledger-mcp` |
> | **No wallet needed** | AgentLedger uses sponsored storage — we absorb all 0G gas costs |
> | **Live proof** | 3 real transactions on 0G Galileo testnet — see below |
> | **npm** | [@0xbeni/agentledger-mcp](https://www.npmjs.com/package/@0xbeni/agentledger-mcp) |
>
> ---
>
> ## The Problem
>
> AI agents are making increasingly consequential decisions — financial, medical, legal, operational. But their reasoning is invisible and ephemeral. The moment a decision is made, the thinking behind it disappears forever.
>
> When an AI trading agent says "I called BTC going up three weeks ago" — you cannot verify that.
> When an AI medical agent recommends a treatment — there is no audit trail.
> When an AI legal agent drafts a contract clause — nobody can prove what reasoning it used.
>
> There is no accountability layer for AI decision-making. AgentLedger builds it.
>
> ---
>
> ## The Solution
>
> AgentLedger intercepts every agent decision and:
>
> 1. Captures the full reasoning chain — every thought step, every tool called, every conclusion
> 2. Encodes it as structured JSON and uploads to **0G Storage** via MemData — returns a root hash as cryptographic proof
> 3. Chains each decision to the previous one via `prev_decision_hash` — tampering with any entry breaks the chain
> 4. Updates the agent's decision index in **0G KV Store** — the complete ledger lives on-chain, nothing local
>
> Any agent or human can then:
> - Retrieve any specific decision by root hash
> - Verify a decision hasn't been tampered with
> - Audit an agent's full decision history
> - Run chain integrity check — returns `INTACT` or `BROKEN`
>
> ---
>
> ## Who Can Use AgentLedger
>
> AgentLedger is infrastructure. Any AI agent that makes decisions benefits from an immutable, verifiable audit trail.
>
> ### 🤖 AI Trading Agents
> Trading agents claim alpha. AgentLedger makes those claims verifiable. Every signal an agent generates — the market data it analyzed, the reasoning it used, the confidence level, the final call — gets stored on 0G with a timestamp and root hash. You can prove the agent made that call before the market moved. No cherry-picking, no revisionism.
>
> **Example:** A trading agent logs every BUY, SELL, and HOLD decision to AgentLedger. A month later, the full reasoning chain for every decision is retrievable — timestamped and tamper-proof on 0G.
>
> ### ⚖️ Trading Signal Judges & Evaluators
> Signal providers in crypto claim incredible track records. With AgentLedger, evaluators can audit any agent's full decision history on-chain. Every call is timestamped, every reasoning trace is verifiable. Run `audit_agent` and get cryptographic proof of whether the chain is INTACT or BROKEN.
>
> **Example:** A fund evaluating an AI signal provider runs `audit_agent` on their AgentLedger history. The chain comes back INTACT — 847 decisions, unbroken, fully auditable back to day one.
>
> ### 🏥 Medical AI Agents
> Medical AI agents are making treatment recommendations, flagging drug interactions, and prioritizing diagnoses. Regulators and hospitals need to audit these decisions. AgentLedger gives every medical agent decision a permanent, immutable reasoning trace — what data it analyzed, what it considered, what it recommended, and why.
>
> **Example:** An AI triage agent logs every patient prioritization decision to AgentLedger. When a decision is questioned, the full reasoning trace is retrieved by root hash — immutable, timestamped, exactly as it was at the moment of decision.
>
> ### 📜 Legal AI Agents
> Legal AI agents draft contracts, interpret clauses, and provide legal analysis. When a contract dispute arises, the question "what was the AI thinking when it drafted this?" needs an answer. AgentLedger stores every legal agent decision permanently so the reasoning is always retrievable.
>
> **Example:** An AI contract drafting agent logs its clause selection reasoning to AgentLedger. In a dispute, the law firm retrieves the exact reasoning trace — which precedents it considered, what risk factors it weighed, why it chose specific language.
>
> ### ⚙️ Autonomous Operations Agents
> Agents running infrastructure, managing deployments, or making operational decisions at scale need accountability. When something goes wrong, you need to know exactly what the agent decided and why. AgentLedger gives every autonomous operations agent a tamper-proof decision log that cannot be altered after the fact.
>
> **Example:** An AI DevOps agent logs every deployment decision to AgentLedger. When a deployment causes an outage, the full chain of decisions leading up to it is retrievable — exactly what the agent was thinking at each step, in order, verified intact.
>
> ---
>
> ## Live Proof — Real 0G Transactions
>
> These transactions are live on the 0G Galileo testnet right now. Click to verify on StorageScan.
>
> | Decision | Action | Root Hash | Chain Position | StorageScan |
> |----------|--------|-----------|----------------|-------------|
> | 1 | BUY | `0x98e57f97e94af6dd3fcb543b373cf464e5343c0bab916020a5ab54df4e50f8cf` | #1 (prev: null) | [View ↗](https://storagescan-galileo.0g.ai/tx/0xbce441979b76dbc577ef0fb9aa187b7e833880b8a56343cb32399d2bbbe3a1d2) |
> | 2 | HEDGE | `0xdfdf71328b2b52166494653a67e8bf68119b24642bb39204fd826cf9de02d20b` | #2 (prev: 0x98e5...) | [View ↗](https://storagescan-galileo.0g.ai/tx/0x5ff29fc62c6e66db93277f9918b460a2b18949be8c4429eaf477f5d9c315dec3) |
> | 3 | HOLD | `0xdc4ad86fd6055e953a7782b7014f2d83a9b66ccaa4bb0cea3342d6deee5a6d0b` | #3 (prev: 0xdfdf...) | [View ↗](https://storagescan-galileo.0g.ai/tx/0x00e147ce666f66867826c03d02aa7de70c0330a98da6a88fc07178e107b84cec) |
>
> **Chain integrity: ✓ INTACT**
>
> ---
>
> ## How 0G Is Used
>
> | Component | How AgentLedger Uses It |
> |-----------|------------------------|
> | **0G Storage** | Every reasoning trace uploaded as JSON via `MemData`. Returns root hash — permanent, content-addressed proof on the decentralized network |
> | **0G KV Store** | Agent decision index stored on-chain. Key = `agent_id`, Value = array of `StoredEntry` objects with root hashes. Updated on every new decision |
> | **0G Galileo Testnet** | Chain ID 16602. All transactions verifiable on StorageScan |
> | **Sponsored storage** | AgentLedger holds the sponsored wallet — users pay zero gas, need zero wallet setup |
> | **Local state** | None. Zero. Everything is on 0G |
>
> ---
>
> ## Chain Integrity — How Tamper Detection Works
>
> Every reasoning trace includes a `proof` block:
>
> ```json
> {
>   "proof": {
>     "prev_decision_hash": "0x98e57f97e94af6dd3fcb543b373cf464e5343c0bab916020a5ab54df4e50f8cf",
>     "chain_length": 2
>   }
> }
> ```
>
> Each decision points to the previous one's root hash. This creates a chain:
>
> ```
> Decision 1: root=0xAAA  prev=null
> Decision 2: root=0xBBB  prev=0xAAA  ✓
> Decision 3: root=0xCCC  prev=0xBBB  ✓
> ```
>
> If anyone attempts to delete or modify Decision 2:
>
> ```
> Decision 1: root=0xAAA  prev=null
> Decision 3: root=0xCCC  prev=0xBBB  ✗ — 0xBBB no longer exists
> ```
>
> `audit_agent` detects this instantly and returns `BROKEN at position 2`.
>
> ---
>
> ## MCP Tools
>
> | Tool | Description | Returns |
> |------|-------------|---------|
> | `log_reasoning` | Store a full agent reasoning trace on 0G Storage | `root_hash`, `tx_hash`, `storagescan_url`, `chain_position` |
> | `get_reasoning` | Retrieve any reasoning trace by root hash | Full `ReasoningTrace` object |
> | `verify_reasoning` | Cryptographically verify a trace is unchanged on 0G | `{ verified: boolean, message }` |
> | `get_agent_history` | Full decision history for any agent from 0G KV | All `StoredEntry` objects + chain summary |
> | `audit_agent` | Download and verify the complete decision chain | `INTACT` or `BROKEN` + position of break |
>
> ---
>
> ## Installation
>
> No wallet needed. No testnet tokens. Just install and go.
>
> AgentLedger uses **sponsored storage** — all 0G gas costs are covered. You only need an `AGENT_ID` to identify your agent.
>
> ### Option 1 — Global install (recommended)
>
> ```bash
> npm install -g @0xbeni/agentledger-mcp
> ```
>
> **Step 1 — Find your Claude Desktop config file:**
>
> | OS | Config file location |
> |----|---------------------|
> | Mac | `~/Library/Application Support/Claude/claude_desktop_config.json` |
> | Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
>
> **Step 2 — Add the AgentLedger block:**
>
> If the file is empty or new, paste this entire config:
>
> ```json
> {
>   "mcpServers": {
>     "agentledger": {
>       "command": "agentledger-mcp",
>       "env": {
>         "AGENT_ID": "my-agent"
>       }
>     }
>   }
> }
> ```
>
> If the file already has other MCP servers, add only the `"agentledger"` block inside the existing `"mcpServers"` object:
>
> ```json
> {
>   "mcpServers": {
>     "your-existing-server": { ... },
>     "agentledger": {
>       "command": "agentledger-mcp",
>       "env": {
>         "AGENT_ID": "my-agent"
>       }
>     }
>   }
> }
> ```
>
> **Step 3 — Replace AGENT_ID:**
>
> Set `AGENT_ID` to any name for your agent e.g. `"my-trading-agent"`, `"specter-v1"`, `"legal-agent"`
>
> **Step 4 — Restart Claude Desktop**
>
> Fully quit and reopen Claude Desktop. AgentLedger tools are now available.
>
> **Step 5 — Test it**
>
> In Claude Desktop, type:
> ```
> Log my reasoning: I analyzed BTC price trends and the volume confirmed an uptrend. I decided to BUY with 0.78 confidence.
> ```
>
> Claude will call `log_reasoning`, upload your reasoning to 0G Storage, and return a root hash + StorageScan URL as proof.
>
> ---
>
> ### Option 2 — Clone and run locally (for developers)
>
> ```bash
> # 1. Clone the repo
> git clone https://github.com/Benita2001/Agentledger
> cd agentledger
>
> # 2. Install dependencies
> npm install
>
> # 3. Run the demo to verify everything works
> npm run demo
> ```
>
> The demo uploads 3 real decisions to 0G Storage and prints root hashes + StorageScan URLs.
>
> Then add to your Claude Desktop config:
>
> ```json
> {
>   "mcpServers": {
>     "agentledger": {
>       "command": "npx",
>       "args": ["tsx", "/absolute/path/to/agentledger/src/index.ts"],
>       "env": {
>         "AGENT_ID": "my-agent"
>       }
>     }
>   }
> }
> ```
>
> Replace `/absolute/path/to/agentledger` with the actual path where you cloned the repo.
>
> ---
>
> ## Run the Demo
>
> ```bash
> npm run demo
> ```
>
> This runs 3 chained trading decisions through AgentLedger end to end:
>
> ```
> === Decision 1: BUY ===
> rootHash: 0x98e57f97e94af6dd3f...
> StorageScan: https://storagescan-galileo.0g.ai/tx/0xbce441...
>
> === Decision 2: HEDGE ===
> rootHash: 0xdfdf71328b2b5216...
> StorageScan: https://storagescan-galileo.0g.ai/tx/0x5ff29f...
>
> === Decision 3: HOLD ===
> rootHash: 0xdc4ad86fd6055e95...
> StorageScan: https://storagescan-galileo.0g.ai/tx/0x00e147...
>
> Chain integrity: ✓ INTACT
> ```
>
> Every root hash is verifiable on StorageScan.
>
> ---
>
> ## Project Structure
>
> ```
> agentledger/
> ├── src/
> │   ├── index.ts      # MCP server — 5 tools via FastMCP
> │   ├── storage.ts    # 0G Storage upload/download via MemData
> │   ├── kv.ts         # 0G KV Store — agent index management
> │   ├── chain.ts      # Decision chaining + tamper detection
> │   └── types.ts      # TypeScript interfaces
> ├── demo/
> │   └── agent-demo.ts # End-to-end demo — 3 real 0G transactions
> ├── website/          # Landing page
> ├── mcp-config.json   # Ready-to-use MCP config
> └── .env.example      # Environment template
> ```
>
> ---
>
> ## Architecture
>
> ```
> AI Agent (Claude, GPT, any MCP client)
>        ↓ calls MCP tool
> AgentLedger MCP Server (FastMCP / stdio)
>        ↓ buildTrace() — links to prev_decision_hash
>        ↓ uploadTrace() — 0G Storage via MemData → root hash
>        ↓ updateAgentIndex() — 0G KV Store → agent ledger updated
>        ↓ returns root hash + StorageScan URL
> 0G Decentralized Network
>   ├── 0G Storage — reasoning trace stored across 4+ nodes worldwide
>   └── 0G KV Store — agent index, fully on-chain
> Sponsored Wallet (AgentLedger)
>   └── pays all gas fees — users need zero wallet setup
> ```
>
> ---
>
> ## Roadmap
>
> | Version | Feature | Status |
> |---------|---------|--------|
> | **v1.0.1** | MCP server, 5 tools, 0G Storage + KV, chain integrity, npm package | ✅ Live |
> | **v1.1** | Sponsored storage — no wallet needed, AgentLedger absorbs all gas costs | 🔄 In progress |
> | **v1.2** | Agent reputation leaderboard — public rankings by chain length and integrity score | 🗓 Planned |
> | **v1.3** | Multi-chain support — store on 0G, verify on any EVM chain | 🗓 Planned |
>
> ---
>
> ## Built With
>
> - [0G Storage SDK](https://github.com/0gfoundation/0g-storage-ts-sdk)
> - [FastMCP](https://github.com/punkpeye/fastmcp)
> - TypeScript / Node.js 18+
> - ethers.js
> - zod
>
> ---
>
> ## Network
>
> | Parameter | Value |
> |-----------|-------|
> | Network | 0G Galileo Testnet |
> | Chain ID | 16602 |
> | RPC | https://evmrpc-testnet.0g.ai |
> | Indexer | https://indexer-storage-testnet-turbo.0g.ai |
> | Explorer | https://storagescan-galileo.0g.ai |
> | Faucet | https://faucet.0g.ai |
>
> ---
>
> *Built for the [0G Zero Cup Hackathon](https://0g.ai/arena/zero-cup) · [@0xbeni](https://x.com/0xbeni)*
> ```
