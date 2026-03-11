/**
 * Type definitions for Neural Nexus
 */

export interface AgentProfile {
  name: string;
  address: string;
  type: 'trading' | 'social' | 'experimental';
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas_price?: string;
  gasUsed?: string;
  block_number: number;
  timestamp: string;
  type: 'incoming' | 'outgoing';
}

export interface WalletActivity {
  address: string;
  chain: string;
  balance: string;
  transaction_count: number;
  current_block: number;
  recent_transactions: Transaction[];
  timestamp: string;
  error?: string;
}

export interface TransactionPatterns {
  totalVolume: string;
  avgTransaction: string;
  activeHours: number[];
  uniqueRecipients: number;
  transactionCount: number;
}

export interface TemporalEntropyAnalysis {
  entropy: number;
  hourEntropy: number;
  dayEntropy: number;
  avgIntervalMinutes: number;
  intervalVariance: number;
  coefficientOfVariation: number;
  pattern: string;
  score: number;
}

export interface TransactionalEntropyAnalysis {
  entropy: number;
  pattern: string;
  score: number;
  amountEntropy: number;
  recipientEntropy: number;
  gasEntropy: number;
  diversity: number;
}

export interface EntropyAnalysis {
  temporal: TemporalEntropyAnalysis;
  transactional: TransactionalEntropyAnalysis;
  overallScore: number;
  autonomyLevel: 'low' | 'moderate' | 'high';
  confidence: number;
  insights: string[];
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: string;
  score: number;
}

export interface AgentAnalysisResult {
  agent: AgentProfile;
  activity: WalletActivity;
  patterns: TransactionPatterns;
  entropyAnalysis: EntropyAnalysis;
  behaviorSummary: string;
  sentiment: SentimentAnalysis;
}

export interface ChainConfig {
  [key: string]: string[];
}

export interface AutonomyMetrics {
  temporal: Record<string, unknown>;
  transactional: Record<string, unknown>;
  behavioral: Record<string, unknown>;
}