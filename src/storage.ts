import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import { Indexer, MemData } from '@0gfoundation/0g-storage-ts-sdk';

const RPC_URL = 'https://evmrpc-testnet.0g.ai';
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai';

function makeIndexer(): Indexer {
  return new Indexer(INDEXER_RPC);
}

function makeSigner(privateKey: string): ethers.Wallet {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Wallet(privateKey, provider);
}

export async function uploadTrace(
  data: object,
  privateKey: string
): Promise<{ rootHash: string; txHash: string }> {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);

  const memData = new MemData(bytes);
  const [tree, treeErr] = await memData.merkleTree();
  if (treeErr || !tree) {
    throw new Error(`Failed to build merkle tree: ${treeErr?.message ?? 'unknown error'}`);
  }

  const indexer = makeIndexer();
  const signer = makeSigner(privateKey);

  // Cast needed: SDK ships its own CJS ethers build; our ESM Wallet is structurally identical but TS sees them as distinct
  const [result, uploadErr] = await indexer.upload(memData, RPC_URL, signer as any);
  if (uploadErr) {
    throw new Error(`Upload failed: ${uploadErr.message}`);
  }

  // Handle fragmented vs single upload response
  if ('rootHashes' in result) {
    return { rootHash: result.rootHashes[0], txHash: result.txHashes[0] };
  }
  return { rootHash: result.rootHash, txHash: result.txHash };
}

export async function downloadTrace(rootHash: string): Promise<object> {
  const tmpPath = path.join(os.tmpdir(), `${rootHash}.json`);
  const indexer = makeIndexer();

  const err = await indexer.download(rootHash, tmpPath, true);
  if (err) {
    throw new Error(`Download failed for ${rootHash}: ${err.message}`);
  }

  const raw = fs.readFileSync(tmpPath, 'utf-8');
  try {
    return JSON.parse(raw) as object;
  } finally {
    fs.rmSync(tmpPath, { force: true });
  }
}

export async function verifyTrace(rootHash: string): Promise<boolean> {
  try {
    await downloadTrace(rootHash);
    return true;
  } catch {
    return false;
  }
}

// Self-test — run directly: npx tsx src/storage.ts
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error('PRIVATE_KEY not set in .env');

  const testPayload = {
    test: true,
    message: 'AgentLedger storage test',
    timestamp: new Date().toISOString(),
  };

  console.log('Uploading test trace...');
  const { rootHash, txHash } = await uploadTrace(testPayload, privateKey);
  console.log('rootHash:', rootHash);
  console.log('txHash:', txHash);
  console.log(`StorageScan: https://storagescan-galileo.0g.ai/tx/${txHash}`);

  console.log('\nDownloading trace back...');
  const retrieved = await downloadTrace(rootHash);
  console.log('Retrieved data:', JSON.stringify(retrieved, null, 2));
}
