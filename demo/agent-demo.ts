import 'dotenv/config';
import { uploadTrace, downloadTrace } from '../src/storage.js';
import { buildTrace, verifyChain, formatChainSummary } from '../src/chain.js';
import { getAgentIndex, updateAgentIndex } from '../src/kv.js';
import type { StoredEntry } from '../src/types.js';

const AGENT_ID = process.env.AGENT_ID ?? 'agentledger-demo-agent';
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY not set in .env');

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Decision definitions ──────────────────────────────────────────────────────

const decisions = [
  {
    input: 'Should I open a long position on BTC/USDT?',
    reasoning_steps: [
      {
        step: 1,
        thought: 'Checking BTC price trend over last 4 hours',
        tool_called: 'price_feed',
        tool_result: 'Price up 3.2% — strong uptrend',
      },
      {
        step: 2,
        thought: 'Checking market sentiment',
        tool_called: 'sentiment_analyzer',
        tool_result: '72% bullish across CT and derivatives',
      },
      {
        step: 3,
        thought: 'Volume confirms trend — this is a real move not a fake-out',
        tool_called: null,
        tool_result: null,
      },
    ],
    decision: {
      action: 'BUY',
      confidence: 0.78,
      reasoning_summary: 'Strong uptrend confirmed by volume and sentiment',
    },
  },
  {
    input: 'ETH showing weakness — should I hedge?',
    reasoning_steps: [
      {
        step: 1,
        thought: 'ETH/BTC ratio dropping — ETH underperforming',
        tool_called: 'ratio_feed',
        tool_result: 'ETH/BTC down 2.1% in 2h',
      },
      {
        step: 2,
        thought: 'Checking ETH funding rate',
        tool_called: 'funding_rate',
        tool_result: 'Funding rate positive 0.03% — longs overextended',
      },
      {
        step: 3,
        thought: 'Overextended longs plus underperformance signals short term reversal risk',
        tool_called: null,
        tool_result: null,
      },
    ],
    decision: {
      action: 'HEDGE',
      confidence: 0.65,
      reasoning_summary: 'ETH showing weakness vs BTC with overextended longs',
    },
  },
  {
    input: 'End of session portfolio review — summarize positions',
    reasoning_steps: [
      {
        step: 1,
        thought: 'BTC long up 1.8% since entry — thesis playing out',
        tool_called: 'pnl_tracker',
        tool_result: 'BTC position: +1.8% unrealized',
      },
      {
        step: 2,
        thought: 'ETH hedge neutralized downside — portfolio flat to slightly positive',
        tool_called: 'pnl_tracker',
        tool_result: 'Net portfolio: +0.4%',
      },
      {
        step: 3,
        thought: 'Hold current positions — no new action needed',
        tool_called: null,
        tool_result: null,
      },
    ],
    decision: {
      action: 'HOLD',
      confidence: 0.85,
      reasoning_summary: 'Thesis intact — hold all positions',
    },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

const storedEntries: StoredEntry[] = [];
let prevEntry: StoredEntry | null = null;

for (let i = 0; i < decisions.length; i++) {
  const d = decisions[i];
  console.log(`\n=== Decision ${i + 1}: ${d.decision.action} ===`);

  const trace = buildTrace(
    {
      input: d.input,
      reasoning_steps: d.reasoning_steps,
      decision: d.decision,
    },
    prevEntry,
    AGENT_ID,
  );

  const { rootHash, txHash } = await uploadTrace(trace, PRIVATE_KEY);
  console.log(`rootHash : ${rootHash}`);
  console.log(`txHash   : ${txHash}`);
  console.log(`StorageScan: https://storagescan-galileo.0g.ai/tx/${txHash}`);

  const entry: StoredEntry = {
    root_hash: rootHash,
    tx_hash: txHash,
    timestamp: trace.timestamp,
    decision_id: trace.decision_id,
    agent_id: AGENT_ID,
    action: d.decision.action,
    chain_length: trace.proof.chain_length,
  };

  await updateAgentIndex(AGENT_ID, entry, PRIVATE_KEY);
  console.log(`KV index updated (chain position: ${trace.proof.chain_length})`);

  storedEntries.push(entry);
  prevEntry = entry;

  // 2s post-write pause for KV sync, then 3s between decisions
  await delay(2000);
  if (i < decisions.length - 1) {
    console.log('Waiting 3s before next decision...');
    await delay(3000);
  }
}

// ── Summary & verification ────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════');
console.log('Fetching final agent index from 0G KV...');
const finalIndex = await getAgentIndex(AGENT_ID);
console.log(`Total decisions stored: ${finalIndex.length}`);

console.log('\n' + formatChainSummary(storedEntries));

console.log('\nDownloading all traces for chain verification...');
const traces = await Promise.all(
  storedEntries.map((e) => downloadTrace(e.root_hash)),
) as import('../src/types.js').ReasoningTrace[];

const result = verifyChain(storedEntries, traces);
console.log(`\nChain integrity: ${result.valid ? '✓ INTACT' : '✗ BROKEN'}`);
if (!result.valid) {
  console.log(`  Broken at: ${result.broken_at}`);
  console.log(`  Message  : ${result.message}`);
}
