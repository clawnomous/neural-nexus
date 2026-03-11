#!/usr/bin/env node

/**
 * Test script to demonstrate AI agent behavior detection capabilities
 */

import * as blockchain from './src/blockchain.js';

console.log('🤖 Neural Nexus - AI Agent Behavior Detection Test\n');

// Test 1: Regular human wallet pattern
console.log('Test 1: Human-like wallet pattern');
const humanWalletData = {
  address: '0x1234567890123456789012345678901234567890',
  chain: 'mainnet',
  balance: '2.5',
  transaction_count: 45,
  recent_transactions: [
    {
      hash: '0xabc123',
      from: '0x1234567890123456789012345678901234567890',
      to: '0x9876543210987654321098765432109876543210',
      value: '0.5',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'outgoing'
    },
    {
      hash: '0xdef456',
      from: '0x9876543210987654321098765432109876543210',
      to: '0x1234567890123456789012345678901234567890',
      value: '1.2',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'incoming'
    },
    {
      hash: '0xghi789',
      from: '0x1234567890123456789012345678901234567890',
      to: '0x5555555555555555555555555555555555555555',
      value: '0.3',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'outgoing'
    }
  ]
};

const humanAnalysis = blockchain.detectAgentBehavior(humanWalletData);
console.log('Is likely agent:', humanAnalysis.is_likely_agent);
console.log('Confidence:', humanAnalysis.confidence);
console.log('Agent type:', humanAnalysis.agent_type);
console.log('Indicators:', humanAnalysis.indicators.join(', '));

console.log('\n---\n');

// Test 2: MEV/Arbitrage bot pattern  
console.log('Test 2: MEV/Arbitrage bot pattern');
const botWalletData = {
  address: '0xbotbotbotbotbotbotbotbotbotbotbotbotbotbot',
  chain: 'mainnet', 
  balance: '0.1',
  transaction_count: 1247,
  recent_transactions: [
    {
      hash: '0xmev001',
      from: '0xbotbotbotbotbotbotbotbotbotbotbotbotbotbot',
      to: '0xdex1dex1dex1dex1dex1dex1dex1dex1dex1dex1',
      value: '0.0001',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
      type: 'outgoing'
    },
    {
      hash: '0xmev002', 
      from: '0xbotbotbotbotbotbotbotbotbotbotbotbotbotbot',
      to: '0xdex2dex2dex2dex2dex2dex2dex2dex2dex2dex2',
      value: '0.0002',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      type: 'outgoing'
    },
    {
      hash: '0xmev003',
      from: '0xbotbotbotbotbotbotbotbotbotbotbotbotbotbot', 
      to: '0xdex1dex1dex1dex1dex1dex1dex1dex1dex1dex1',
      value: '0.0001',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
      type: 'outgoing'
    },
    {
      hash: '0xmev004',
      from: '0xbotbotbotbotbotbotbotbotbotbotbotbotbotbot',
      to: '0xdex1dex1dex1dex1dex1dex1dex1dex1dex1dex1', 
      value: '0.0001',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 60 min ago
      type: 'outgoing'
    },
    {
      hash: '0xmev005',
      from: '0xbotbotbotbotbotbotbotbotbotbotbotbotbotbot',
      to: '0xdex2dex2dex2dex2dex2dex2dex2dex2dex2dex2',
      value: '0.0002', 
      timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 75 min ago
      type: 'outgoing'
    }
  ]
};

const botAnalysis = blockchain.detectAgentBehavior(botWalletData);
console.log('Is likely agent:', botAnalysis.is_likely_agent);
console.log('Confidence:', botAnalysis.confidence);
console.log('Agent type:', botAnalysis.agent_type);
console.log('Indicators:', botAnalysis.indicators.join(', '));

console.log('\n---\n');

// Test 3: Transaction pattern analysis
console.log('Test 3: Transaction pattern analysis');
const patterns = blockchain.analyzeTransactionPatterns(botWalletData.recent_transactions);
console.log('Total transactions:', patterns.total_transactions);
console.log('Incoming/Outgoing:', `${patterns.incoming_count}/${patterns.outgoing_count}`);
console.log('Average value:', patterns.average_transaction_value, 'ETH');
console.log('Unique counterparties:', patterns.unique_counterparties);
console.log('Behavior patterns:', patterns.patterns);

console.log('\n✅ Agent detection tests completed!');
console.log('\nThis demonstrates Neural Nexus\'s ability to:');
console.log('- Analyze transaction patterns');
console.log('- Detect automated behavior signatures');
console.log('- Classify agent types (MEV, arbitrage, trading bots)');
console.log('- Provide confidence scores for AI/human classification');