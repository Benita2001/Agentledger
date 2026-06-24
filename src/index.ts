#!/usr/bin/env node
import 'dotenv/config';
import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { uploadTrace, downloadTrace, verifyTrace } from './storage.js';
import { buildTrace, verifyChain, formatChainSummary } from './chain.js';
import type { BuildTraceParams } from './chain.js';
import { getAgentIndex, updateAgentIndex } from './kv.js';
import type { ReasoningStep, Decision, StoredEntry } from './types.js';

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const DEFAULT_AGENT_ID = process.env.AGENT_ID ?? 'agentledger-agent';

const mcp = new FastMCP({ name: 'AgentLedger', version: '1.0.0' });

// ── Tool 1: log_reasoning ─────────────────────────────────────────────────────

mcp.addTool({
  name: 'log_reasoning',
  description:
    'Log an AI agent reasoning trace permanently to 0G Storage. Every decision step is stored immutably with a root hash receipt. Decisions are chained so history cannot be tampered with.',
  parameters: z.object({
    agent_id: z.string().optional().describe('Agent identifier. Defaults to env AGENT_ID'),
    input: z.string().describe('The question or task the agent was given'),
    reasoning_steps: z
      .array(
        z.object({
          step: z.number(),
          thought: z.string(),
          tool_called: z.string().nullable().optional(),
          tool_result: z.string().nullable().optional(),
        }),
      )
      .describe("The agent's step by step reasoning"),
    action: z.string().describe('The final decision or action taken'),
    confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
    reasoning_summary: z.string().describe('One sentence summary of why this decision was made'),
    metadata: z.record(z.string(), z.unknown()).optional().describe('Any extra context'),
  }),
  execute: async (params) => {
    try {
      const agentId = params.agent_id ?? DEFAULT_AGENT_ID;

      const currentIndex = await getAgentIndex(agentId);
      const prevEntry = currentIndex.length > 0 ? currentIndex[currentIndex.length - 1] : null;

      const steps: ReasoningStep[] = params.reasoning_steps.map((s) => ({
        step: s.step,
        thought: s.thought,
        tool_called: s.tool_called ?? null,
        tool_result: s.tool_result ?? null,
      }));

      const decision: Decision = {
        action: params.action,
        confidence: params.confidence,
        reasoning_summary: params.reasoning_summary,
      };

      const traceParams: BuildTraceParams = {
        input: params.input,
        reasoning_steps: steps,
        decision,
        metadata: params.metadata,
      };

      const trace = buildTrace(traceParams, prevEntry, agentId);
      const { rootHash, txHash } = await uploadTrace(trace, PRIVATE_KEY);

      const newEntry: StoredEntry = {
        root_hash: rootHash,
        tx_hash: txHash,
        timestamp: trace.timestamp,
        decision_id: trace.decision_id,
        agent_id: agentId,
        action: params.action,
        chain_length: trace.proof.chain_length,
      };

      // Fire-and-forget KV index update — don't block the response on testnet latency
      updateAgentIndex(agentId, newEntry, PRIVATE_KEY).catch(console.error);

      return JSON.stringify(
        {
          success: true,
          agent_id: agentId,
          decision_id: trace.decision_id,
          action: params.action,
          root_hash: rootHash,
          tx_hash: txHash,
          chain_position: trace.proof.chain_length,
          storagescan_url: `https://storagescan-galileo.0g.ai/tx/${txHash}`,
          message: 'Reasoning trace stored permanently on 0G. Root hash is your proof.',
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify({ success: false, error: (error as Error).message }, null, 2);
    }
  },
});

// ── Tool 2: get_reasoning ─────────────────────────────────────────────────────

mcp.addTool({
  name: 'get_reasoning',
  description: 'Retrieve a specific reasoning trace from 0G Storage using its root hash',
  parameters: z.object({
    root_hash: z.string().describe('The root hash returned when the trace was logged'),
  }),
  execute: async (params) => {
    try {
      const trace = await downloadTrace(params.root_hash);
      return JSON.stringify(trace, null, 2);
    } catch (error) {
      return JSON.stringify({ success: false, error: (error as Error).message }, null, 2);
    }
  },
});

// ── Tool 3: verify_reasoning ──────────────────────────────────────────────────

mcp.addTool({
  name: 'verify_reasoning',
  description:
    'Verify a reasoning trace exists unchanged on 0G Storage. Returns true if the data is intact, false if tampered or missing.',
  parameters: z.object({
    root_hash: z.string(),
  }),
  execute: async (params) => {
    try {
      const verified = await verifyTrace(params.root_hash);
      return JSON.stringify(
        {
          verified,
          root_hash: params.root_hash,
          message: verified
            ? 'Trace verified — data is intact on 0G Storage.'
            : 'Trace not found or data integrity check failed.',
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify({ success: false, error: (error as Error).message }, null, 2);
    }
  },
});

// ── Tool 4: get_agent_history ─────────────────────────────────────────────────

mcp.addTool({
  name: 'get_agent_history',
  description:
    'Get the full reasoning history for an agent — all decisions they have ever logged to AgentLedger',
  parameters: z.object({
    agent_id: z.string().optional(),
  }),
  execute: async (params) => {
    try {
      const agentId = params.agent_id ?? DEFAULT_AGENT_ID;
      const index = await getAgentIndex(agentId);

      if (index.length === 0) {
        return JSON.stringify(
          { agent_id: agentId, total_decisions: 0, message: 'No reasoning traces found' },
          null,
          2,
        );
      }

      return JSON.stringify(
        {
          agent_id: agentId,
          total_decisions: index.length,
          chain_summary: formatChainSummary(index),
          entries: index,
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify({ success: false, error: (error as Error).message }, null, 2);
    }
  },
});

// ── Tool 5: audit_agent ───────────────────────────────────────────────────────

mcp.addTool({
  name: 'audit_agent',
  description:
    "Audit an agent's complete reasoning chain. Downloads every decision and verifies the chain has not been tampered with. Returns INTACT or BROKEN with details.",
  parameters: z.object({
    agent_id: z.string().optional(),
  }),
  execute: async (params) => {
    try {
      const agentId = params.agent_id ?? DEFAULT_AGENT_ID;
      const entries = await getAgentIndex(agentId);

      if (entries.length === 0) {
        return JSON.stringify({ valid: false, message: 'No history found' }, null, 2);
      }

      const traces = await Promise.all(
        entries.map((e) => downloadTrace(e.root_hash)),
      ) as import('./types.js').ReasoningTrace[];

      const result = verifyChain(entries, traces);

      return JSON.stringify(
        {
          ...result,
          agent_id: agentId,
          total_decisions: entries.length,
          chain_summary: formatChainSummary(entries),
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify({ success: false, error: (error as Error).message }, null, 2);
    }
  },
});

// ── Start ─────────────────────────────────────────────────────────────────────

mcp.start({ transportType: 'stdio' });
