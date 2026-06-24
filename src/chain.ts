import { v4 as uuidv4 } from 'uuid';
import type { ReasoningStep, Decision, ReasoningTrace, StoredEntry } from './types.js';

export interface BuildTraceParams {
  input: string;
  reasoning_steps: ReasoningStep[];
  decision: Decision;
  metadata?: Record<string, unknown>;
}

export function generateDecisionId(): string {
  return uuidv4();
}

export function buildTrace(
  params: BuildTraceParams,
  prevEntry: StoredEntry | null,
  agentId: string
): ReasoningTrace {
  const chainLength = prevEntry ? (prevEntry.chain_length ?? 1) + 1 : 1;

  return {
    agent_id: agentId,
    decision_id: generateDecisionId(),
    timestamp: new Date().toISOString(),
    context: {
      input: params.input,
      metadata: params.metadata ?? {},
    },
    reasoning_steps: params.reasoning_steps,
    decision: params.decision,
    proof: {
      prev_decision_hash: prevEntry ? prevEntry.root_hash : null,
      chain_length: chainLength,
    },
  };
}

export function verifyChain(
  entries: StoredEntry[],
  traces: ReasoningTrace[]
): { valid: boolean; broken_at: number | null; message: string } {
  for (let i = 1; i < entries.length; i++) {
    const expectedPrevHash = entries[i - 1].root_hash;
    const actualPrevHash = traces[i].proof.prev_decision_hash;

    if (actualPrevHash !== expectedPrevHash) {
      return {
        valid: false,
        broken_at: i,
        message: `Chain broken at decision ${i + 1} — possible tampering detected`,
      };
    }
  }

  return { valid: true, broken_at: null, message: 'Chain intact' };
}

export function formatChainSummary(entries: StoredEntry[]): string {
  if (entries.length === 0) return 'No entries in chain.';

  const agentId = entries[0].agent_id;
  const divider = '━'.repeat(26);

  const rows = entries
    .map((e, i) => {
      const rootShort = `${e.root_hash.slice(0, 6)}...`;
      return `#${i + 1} | ${e.timestamp} | ${e.action} | root: ${rootShort}`;
    })
    .join('\n');

  const lastEntry = entries[entries.length - 1];
  const chainStatus = lastEntry.chain_length !== undefined ? 'INTACT' : 'UNKNOWN';

  return [
    `AgentLedger Chain Summary — ${agentId}`,
    divider,
    rows,
    divider,
    `Total decisions: ${entries.length}`,
    `Chain status: ${chainStatus}`,
  ].join('\n');
}
