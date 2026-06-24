import 'dotenv/config';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import { Indexer, KvClient, Batcher, FixedPriceFlow__factory } from '@0gfoundation/0g-storage-ts-sdk';
import type { StoredEntry } from './types.js';

const KV_NODE_URL = 'http://3.101.147.150:6789';
const RPC_URL = 'https://evmrpc-testnet.0g.ai';
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai';
const FLOW_CONTRACT = '0x22E03a6A89B950F1c82ec5e74F8eCa321a105296';
const STREAM_ID = '0x000000000000000000000000000000000000000000000000000000000000f2f2';

function agentIdToKeyBytes(agentId: string): Uint8Array {
  return new TextEncoder().encode(agentId);
}

export async function getAgentIndex(agentId: string): Promise<StoredEntry[]> {
  try {
    const kvClient = new KvClient(KV_NODE_URL);
    const keyBytes = agentIdToKeyBytes(agentId);
    const value = await kvClient.getValue(STREAM_ID, keyBytes);

    if (!value || !value.data) return [];

    // value.data is Base64-encoded by the SDK — decode to UTF-8 JSON
    const json = Buffer.from(value.data, 'base64').toString('utf-8');
    if (!json) return [];

    return JSON.parse(json) as StoredEntry[];
  } catch {
    return [];
  }
}

export async function updateAgentIndex(
  agentId: string,
  newEntry: StoredEntry,
  privateKey: string
): Promise<void> {
  const current = await getAgentIndex(agentId);
  const updated = [...current, newEntry];

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  // Cast: SDK ships its own CJS ethers build; our ESM Wallet is structurally identical but TS sees them as distinct
  const signer = new ethers.Wallet(privateKey, provider) as any;

  const indexer = new Indexer(INDEXER_RPC);
  const [nodes, nodesErr] = await indexer.selectNodes(1);
  if (nodesErr || !nodes || nodes.length === 0) {
    throw new Error(`Failed to select storage nodes: ${nodesErr?.message ?? 'no nodes returned'}`);
  }

  const flow = FixedPriceFlow__factory.connect(FLOW_CONTRACT, signer);
  const batcher = new Batcher(1, nodes, flow, RPC_URL);

  const keyBytes = agentIdToKeyBytes(agentId);
  const valueBytes = new TextEncoder().encode(JSON.stringify(updated));

  batcher.streamDataBuilder.set(STREAM_ID, keyBytes, valueBytes);

  const [, execErr] = await batcher.exec();
  if (execErr) {
    throw new Error(`KV write failed for agent "${agentId}": ${execErr.message}`);
  }
}

// TODO: implement full enumeration via KvClient iterator once stream-wide key scanning is available
export async function getAllAgentIds(): Promise<string[]> {
  return [];
}

// Self-test — run directly: npx tsx src/kv.ts
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error('PRIVATE_KEY not set in .env');

  const testEntry: StoredEntry = {
    root_hash: '0xtest123',
    tx_hash: '0xtx123',
    timestamp: new Date().toISOString(),
    decision_id: 'test-decision-1',
    agent_id: 'test-agent',
    action: 'BUY',
    chain_length: 1,
  };

  console.log('Writing test entry to 0G KV...');
  await updateAgentIndex('test-agent', testEntry, privateKey);
  console.log('Write complete.');

  console.log('Reading back from 0G KV...');
  const index = await getAgentIndex('test-agent');
  console.log('Retrieved index:', JSON.stringify(index, null, 2));
  console.log(`Confirmed: ${index.length} entry/entries stored for test-agent`);
}
