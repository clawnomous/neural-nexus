import express from 'express';
import cors from 'cors';
import { AutonomyScorer } from './src/lib/autonomyScoring.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const scorer = new AutonomyScorer();

// Mock transaction data for testing (in real app, would fetch from blockchain APIs)
const mockTransactionData = {
  'agent_wallet': [
    { timestamp: Date.now() - 3600000, value: 0.123456789, to: '0xprotocol1', gasUsed: 21000, gasPrice: 20 },
    { timestamp: Date.now() - 7200000, value: 0.987654321, to: '0xprotocol2', gasUsed: 21000, gasPrice: 21 },
    { timestamp: Date.now() - 10800000, value: 0.555777999, to: '0xprotocol1', gasUsed: 21000, gasPrice: 19 },
    { timestamp: Date.now() - 14400000, value: 0.333444555, to: '0xprotocol3', gasUsed: 21000, gasPrice: 20 },
    { timestamp: Date.now() - 18000000, value: 0.777888999, to: '0xprotocol2', gasUsed: 21000, gasPrice: 20 },
    { timestamp: Date.now() - 21600000, value: 0.111222333, to: '0xprotocol4', gasUsed: 21000, gasPrice: 21 },
    { timestamp: Date.now() - 25200000, value: 0.444555666, to: '0xprotocol1', gasUsed: 21000, gasPrice: 19 },
    { timestamp: Date.now() - 28800000, value: 0.666777888, to: '0xprotocol3', gasUsed: 21000, gasPrice: 20 },
    { timestamp: Date.now() - 32400000, value: 0.888999111, to: '0xprotocol5', gasUsed: 21000, gasPrice: 20 },
    { timestamp: Date.now() - 36000000, value: 0.222333444, to: '0xprotocol2', gasUsed: 21000, gasPrice: 21 },
    { timestamp: Date.now() - 39600000, value: 0.555666777, to: '0xprotocol4', gasUsed: 21000, gasPrice: 19 },
    { timestamp: Date.now() - 43200000, value: 0.777111222, to: '0xprotocol1', gasUsed: 21000, gasPrice: 20 },
  ],
  'human_wallet': [
    { timestamp: Date.now() - 86400000, value: 1.0, to: '0xprotocol1', gasUsed: 21000, gasPrice: 25 },
    { timestamp: Date.now() - 172800000, value: 0.5, to: '0xprotocol1', gasUsed: 21000, gasPrice: 30 },
    { timestamp: Date.now() - 432000000, value: 2.0, to: '0xprotocol2', gasUsed: 21000, gasPrice: 15 },
    { timestamp: Date.now() - 518400000, value: 1.5, to: '0xprotocol1', gasUsed: 21000, gasPrice: 35 },
    { timestamp: Date.now() - 864000000, value: 0.25, to: '0xprotocol3', gasUsed: 21000, gasPrice: 40 },
    { timestamp: Date.now() - 1209600000, value: 3.0, to: '0xprotocol1', gasUsed: 21000, gasPrice: 20 },
    { timestamp: Date.now() - 1555200000, value: 0.75, to: '0xprotocol2', gasUsed: 21000, gasPrice: 50 },
    { timestamp: Date.now() - 1728000000, value: 1.25, to: '0xprotocol1', gasUsed: 21000, gasPrice: 25 },
    { timestamp: Date.now() - 2592000000, value: 5.0, to: '0xprotocol4', gasUsed: 21000, gasPrice: 30 },
    { timestamp: Date.now() - 3456000000, value: 0.1, to: '0xprotocol1', gasUsed: 21000, gasPrice: 45 },
  ]
};

app.get('/', (req, res) => {
  res.json({
    name: 'Neural Nexus Wallet Autonomy Analyzer',
    version: '0.1.0',
    description: 'API for analyzing wallet addresses to detect autonomous agent behavior patterns',
    endpoints: {
      '/analyze/:address': 'Analyze a wallet address for agent-like behavior',
      '/demo': 'View demo analysis results'
    }
  });
});

app.get('/analyze/:address', (req, res) => {
  const { address } = req.params;
  
  // For demo purposes, use mock data based on address
  let transactions;
  if (address.toLowerCase().includes('agent') || address.toLowerCase().includes('bot')) {
    transactions = mockTransactionData.agent_wallet;
  } else if (address.toLowerCase().includes('human') || address.toLowerCase().includes('person')) {
    transactions = mockTransactionData.human_wallet;
  } else {
    // Random assignment for unknown addresses
    const isAgent = Math.random() > 0.5;
    transactions = isAgent ? mockTransactionData.agent_wallet : mockTransactionData.human_wallet;
  }

  const analysis = scorer.scoreWallet(transactions);
  
  res.json({
    address,
    analysis,
    metadata: {
      transactionCount: transactions.length,
      timespan: `${Math.round((transactions[0].timestamp - transactions[transactions.length-1].timestamp) / (24*60*60*1000))} days`,
      note: 'Demo version using mock transaction data'
    }
  });
});

app.get('/demo', (req, res) => {
  const agentAnalysis = scorer.scoreWallet(mockTransactionData.agent_wallet);
  const humanAnalysis = scorer.scoreWallet(mockTransactionData.human_wallet);

  res.json({
    demo: true,
    examples: {
      'Suspected Agent Wallet': {
        address: '0x1234...agent',
        analysis: agentAnalysis
      },
      'Human-like Wallet': {
        address: '0x5678...human', 
        analysis: humanAnalysis
      }
    },
    methodology: {
      description: 'Analyzes on-chain transaction patterns to identify autonomous agent behavior',
      metrics: Object.keys(scorer.weights),
      weights: scorer.weights
    }
  });
});

app.listen(PORT, () => {
  console.log(`🧠 Neural Nexus Autonomy Analyzer running on port ${PORT}`);
  console.log(`🔗 Try: http://localhost:${PORT}/demo`);
});