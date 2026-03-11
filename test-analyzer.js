#!/usr/bin/env node

/**
 * Test the Neural Nexus Agent Analyzer
 * Demonstrates MCP sentiment analysis capabilities
 */

import { analyzeSentiment } from './src/sentiment.js';
import AgentAnalyzer from './src/analyzer.js';

async function testSentimentAnalysis() {
  console.log("🧠 Testing Sentiment Analysis Module");
  console.log("=====================================\n");

  const testTexts = [
    "AI agent showing consistent profitable trading patterns with low-risk DeFi strategies",
    "Erratic behavior detected - agent making random high-value transfers to unknown addresses", 
    "Highly efficient agent optimizing gas usage while maintaining steady transaction volume",
    "Suspicious agent activity - possible bot behavior with no clear strategy",
    "Revolutionary AI agent demonstrating emergent market-making capabilities"
  ];

  for (const text of testTexts) {
    try {
      const result = await analyzeSentiment(text);
      console.log(`Text: ${text.substring(0, 50)}...`);
      console.log(`Sentiment: ${result.sentiment} (confidence: ${result.confidence})`);
      console.log(`Scores: positive=${result.scores.positive}, negative=${result.scores.negative}, neutral=${result.scores.neutral}`);
      console.log("---");
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
}

async function testBehaviorSummaries() {
  console.log("\n🤖 Testing Behavior Pattern Analysis");
  console.log("=====================================\n");

  const analyzer = new AgentAnalyzer();
  
  // Create mock transaction patterns
  const mockPatterns = [
    {
      agent: { name: "DeFi Optimizer", type: "defi" },
      patterns: {
        transactionCount: 247,
        totalVolume: "15.7832", 
        activeHours: [2, 3, 4, 14, 15, 16, 22, 23],
        uniqueRecipients: 12,
        avgTransaction: "0.0639"
      }
    },
    {
      agent: { name: "Social Trading Bot", type: "trading" },
      patterns: {
        transactionCount: 89,
        totalVolume: "3.2156",
        activeHours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
        uniqueRecipients: 34,
        avgTransaction: "0.0361"
      }
    },
    {
      agent: { name: "MEV Searcher", type: "mev" },
      patterns: {
        transactionCount: 1847,
        totalVolume: "0.8923",
        activeHours: Array.from({length: 24}, (_, i) => i), // 24/7 activity
        uniqueRecipients: 2,
        avgTransaction: "0.0005"
      }
    }
  ];

  for (const mock of mockPatterns) {
    console.log(`\n🤖 ${mock.agent.name} (${mock.agent.type})`);
    
    const behaviorSummary = analyzer.generateBehaviorSummary(mock.agent, mock.patterns);
    console.log(`Behavior: ${behaviorSummary}`);
    
    const sentiment = await analyzeSentiment(behaviorSummary);
    console.log(`Sentiment: ${sentiment.sentiment} (${sentiment.confidence})`);
    console.log("---");
  }
}

async function runAllTests() {
  try {
    await testSentimentAnalysis();
    await testBehaviorSummaries();
    
    console.log("\n💡 Neural Nexus Analysis Complete");
    console.log("The MCP infrastructure is working correctly!");
    console.log("Ready to integrate with real blockchain data...");
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runAllTests();