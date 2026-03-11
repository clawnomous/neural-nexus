#!/usr/bin/env node

/**
 * Test script for the Entropy Analyzer
 * Demonstrates autonomy detection with mock transaction data
 */

import { EntropyAnalyzer } from './src/entropy.js';

// Mock transaction data representing different agent types

// Bot-like: Very regular patterns, same amounts, same timing
const botTransactions = [
  { timestamp: '2024-03-10T09:00:00Z', value: '0.01', to: '0xabc123', gasUsed: '21000' },
  { timestamp: '2024-03-10T09:30:00Z', value: '0.01', to: '0xabc123', gasUsed: '21000' },
  { timestamp: '2024-03-10T10:00:00Z', value: '0.01', to: '0xabc123', gasUsed: '21000' },
  { timestamp: '2024-03-10T10:30:00Z', value: '0.01', to: '0xabc123', gasUsed: '21000' },
  { timestamp: '2024-03-10T11:00:00Z', value: '0.01', to: '0xabc123', gasUsed: '21000' },
  { timestamp: '2024-03-10T11:30:00Z', value: '0.01', to: '0xabc123', gasUsed: '21000' },
];

// Semi-autonomous: Some variety but patterns remain
const semiAutonomousTransactions = [
  { timestamp: '2024-03-10T09:15:00Z', value: '0.005', to: '0xabc123', gasUsed: '21000' },
  { timestamp: '2024-03-10T10:45:00Z', value: '0.02', to: '0xdef456', gasUsed: '25000' },
  { timestamp: '2024-03-10T11:20:00Z', value: '0.01', to: '0xabc123', gasUsed: '21000' },
  { timestamp: '2024-03-10T13:10:00Z', value: '0.008', to: '0xghi789', gasUsed: '23000' },
  { timestamp: '2024-03-10T15:30:00Z', value: '0.05', to: '0xdef456', gasUsed: '30000' },
  { timestamp: '2024-03-10T16:50:00Z', value: '0.012', to: '0xjkl012', gasUsed: '22000' },
];

// Highly autonomous: Unpredictable timing, varied amounts, complex interactions
const autonomousTransactions = [
  { 
    timestamp: '2024-03-10T03:22:00Z', 
    value: '0.15738', 
    to: '0x1inch456', 
    gasUsed: '180000',
    input: '0x38ed17398f43043c9b273b79084f069ac7b73b7e4b'  // DEX interaction
  },
  { 
    timestamp: '2024-03-10T07:45:00Z', 
    value: '0.002341', 
    to: '0xnft789', 
    gasUsed: '95000',
    input: '0xa22cb4651234567890abcdef'  // NFT interaction
  },
  { 
    timestamp: '2024-03-10T11:03:00Z', 
    value: '0.08291', 
    to: '0xuniswap123', 
    gasUsed: '220000',
    input: '0x095ea7b30000000000000000000000001234567890abcdef'  // Complex DEX
  },
  { 
    timestamp: '2024-03-10T14:17:00Z', 
    value: '0.0', 
    to: '0xcompound987', 
    gasUsed: '150000',
    input: '0xa9059cbb0000000000000000000000009876543210fedcba'  // DeFi interaction
  },
  { 
    timestamp: '2024-03-10T19:38:00Z', 
    value: '0.04127', 
    to: '0xrandom456', 
    gasUsed: '65000',
    input: '0x'
  },
  { 
    timestamp: '2024-03-10T23:52:00Z', 
    value: '0.31582', 
    to: '0xmulti789', 
    gasUsed: '320000',
    input: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'  // Very complex
  },
];

async function runEntropyTests() {
  const analyzer = new EntropyAnalyzer();
  
  console.log("🧪 Neural Nexus Entropy Analyzer Test Suite");
  console.log("===========================================\n");
  
  // Test 1: Bot-like behavior (should score low on autonomy)
  console.log("🤖 TEST 1: Bot-like Transactions");
  console.log("Expected: Low autonomy score (~0-3)");
  const botResult = await analyzer.analyzeAgentEntropy(botTransactions);
  console.log(`Result: ${botResult.autonomyScore.toFixed(2)}/10 - ${botResult.assessment}`);
  
  // Test 2: Semi-autonomous behavior (should score medium)
  console.log("\n🔄 TEST 2: Semi-Autonomous Transactions");
  console.log("Expected: Medium autonomy score (~4-6)");
  const semiResult = await analyzer.analyzeAgentEntropy(semiAutonomousTransactions);
  console.log(`Result: ${semiResult.autonomyScore.toFixed(2)}/10 - ${semiResult.assessment}`);
  
  // Test 3: Highly autonomous behavior (should score high)
  console.log("\n🧠 TEST 3: Highly Autonomous Transactions");
  console.log("Expected: High autonomy score (~7-10)");
  const autoResult = await analyzer.analyzeAgentEntropy(autonomousTransactions);
  console.log(`Result: ${autoResult.autonomyScore.toFixed(2)}/10 - ${autoResult.assessment}`);
  
  // Summary comparison
  console.log("\n📊 COMPARISON SUMMARY");
  console.log("====================");
  console.log(`Bot-like:        ${botResult.autonomyScore.toFixed(2)}/10`);
  console.log(`Semi-autonomous: ${semiResult.autonomyScore.toFixed(2)}/10`);
  console.log(`Fully autonomous: ${autoResult.autonomyScore.toFixed(2)}/10`);
  
  // Verify the scoring makes sense
  const scoresInOrder = [
    botResult.autonomyScore,
    semiResult.autonomyScore, 
    autoResult.autonomyScore
  ];
  
  const isCorrectOrder = scoresInOrder[0] < scoresInOrder[1] && scoresInOrder[1] < scoresInOrder[2];
  
  console.log(`\n✅ Scoring validation: ${isCorrectOrder ? 'PASSED' : 'FAILED'}`);
  if (isCorrectOrder) {
    console.log("   Entropy analyzer correctly distinguishes autonomy levels!");
  } else {
    console.log("   ⚠️  Scoring may need calibration");
  }
  
  console.log("\n🎯 Test Results:");
  console.log("The entropy analyzer can distinguish between:");
  console.log("• Predictable bot behavior (regular timing, fixed amounts)");
  console.log("• Semi-autonomous agents (some variety, moderate complexity)"); 
  console.log("• Genuinely autonomous agents (unpredictable, complex interactions)");
  console.log("\nThis infrastructure can help identify truly autonomous AI agents in crypto! 🚀");
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runEntropyTests().catch(console.error);
}