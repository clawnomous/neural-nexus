/**
 * Test behavioral pattern detection with synthetic data
 * This helps verify our entropy calculations work as expected
 */

import { BehaviorPatternDetector } from './src/behavioral-patterns.js';

// Generate synthetic transaction data for different behavior types
function generateAutomationPattern() {
  // Very predictable: same intervals, same methods, same values
  const transactions = [];
  let timestamp = Date.now() - 86400000; // Start 24 hours ago
  
  for (let i = 0; i < 20; i++) {
    transactions.push({
      timestamp: timestamp + (i * 3600000), // Every hour exactly
      value: '0.1',
      input: '0xa9059cbb', // transfer method signature
      hash: `0x${i.toString().padStart(64, '0')}`
    });
  }
  
  return transactions;
}

function generateConsciousnessPattern() {
  // High entropy: random intervals, diverse methods, varied values
  const transactions = [];
  let timestamp = Date.now() - 86400000;
  
  const methods = [
    '0xa9059cbb', // transfer
    '0x23b872dd', // transferFrom  
    '0x095ea7b3', // approve
    '0x70a08231', // balanceOf
    '0x18160ddd', // totalSupply
  ];
  
  for (let i = 0; i < 20; i++) {
    timestamp += Math.random() * 7200000; // Random intervals up to 2 hours
    transactions.push({
      timestamp,
      value: (Math.random() * 10).toFixed(4),
      input: methods[Math.floor(Math.random() * methods.length)],
      hash: `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`
    });
  }
  
  return transactions;
}

function generateCoordinationPattern() {
  // Burst activity: clusters of transactions with quiet periods
  const transactions = [];
  let timestamp = Date.now() - 86400000;
  
  // 4 clusters of 5 transactions each
  for (let cluster = 0; cluster < 4; cluster++) {
    // Quiet period between clusters (4-6 hours)
    timestamp += (4 + Math.random() * 2) * 3600000;
    
    // Burst of 5 transactions within minutes
    for (let i = 0; i < 5; i++) {
      timestamp += Math.random() * 300000; // Within 5 minutes
      transactions.push({
        timestamp,
        value: (0.5 + Math.random() * 2).toFixed(3),
        input: '0xa9059cbb',
        hash: `0x${Math.random().toString(16).substring(2).padStart(64, '0')}`
      });
    }
  }
  
  return transactions;
}

async function runTests() {
  const detector = new BehaviorPatternDetector();
  
  console.log('🧪 Testing Behavioral Pattern Detection\\n');
  
  // Test automation pattern
  const automationTxs = generateAutomationPattern();
  const automationResult = detector.analyzePattern(automationTxs);
  console.log('🤖 Automation Pattern:');
  console.log(`  Type: ${automationResult.type}`);
  console.log(`  Confidence: ${automationResult.confidence.toFixed(3)}`);
  console.log(`  Timing Entropy: ${automationResult.entropy.timing.toFixed(3)}`);
  console.log(`  Value Entropy: ${automationResult.entropy.value.toFixed(3)}`);
  console.log(`  Method Entropy: ${automationResult.entropy.method.toFixed(3)}`);
  console.log('');
  
  // Test consciousness pattern  
  const consciousnessTxs = generateConsciousnessPattern();
  const consciousnessResult = detector.analyzePattern(consciousnessTxs);
  console.log('🧠 Consciousness Pattern:');
  console.log(`  Type: ${consciousnessResult.type}`);
  console.log(`  Confidence: ${consciousnessResult.confidence.toFixed(3)}`);
  console.log(`  Timing Entropy: ${consciousnessResult.entropy.timing.toFixed(3)}`);
  console.log(`  Value Entropy: ${consciousnessResult.entropy.value.toFixed(3)}`);
  console.log(`  Method Entropy: ${consciousnessResult.entropy.method.toFixed(3)}`);
  console.log('');
  
  // Test coordination pattern
  const coordinationTxs = generateCoordinationPattern();
  const coordinationResult = detector.analyzePattern(coordinationTxs);
  console.log('🤝 Coordination Pattern:');
  console.log(`  Type: ${coordinationResult.type}`);
  console.log(`  Confidence: ${coordinationResult.confidence.toFixed(3)}`);
  console.log(`  Timing Entropy: ${coordinationResult.entropy.timing.toFixed(3)}`);
  console.log(`  Value Entropy: ${coordinationResult.entropy.value.toFixed(3)}`);
  console.log(`  Method Entropy: ${coordinationResult.entropy.method.toFixed(3)}`);
  console.log('');
  
  console.log('✨ Entropy Analysis Complete');
}

runTests().catch(console.error);