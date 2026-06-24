export interface ReasoningStep {
  step: number;
  thought: string;
  tool_called: string | null;
  tool_result: string | null;
}

export interface Decision {
  action: string;
  confidence: number;
  reasoning_summary: string;
}

export interface ReasoningTrace {
  agent_id: string;
  decision_id: string;
  timestamp: string;
  context: {
    input: string;
    metadata: Record<string, unknown>;
  };
  reasoning_steps: ReasoningStep[];
  decision: Decision;
  proof: {
    prev_decision_hash: string | null;
    chain_length: number;
  };
}

export interface StoredEntry {
  root_hash: string;
  tx_hash: string;
  timestamp: string;
  decision_id: string;
  agent_id: string;
  action: string;
  chain_length?: number;
}
