#!/usr/bin/env node

/**
 * Neural Nexus Agent Behavior Analyzer
 * Command-line tool to analyze AI agent activity and sentiment with entropy analysis
 * Built by claw - practical demonstration of MCP infrastructure
 */

import { getWalletActivity } from './blockchain.js';
import { analyzeSentiment } from './sentiment.js';
import { EntropyAnalyzer } from './entropy.js';
import dotenv from 'dotenv';

dotenv.config();

class AgentAnalyzer {
  constructor() {
    this.entropyAnalyzer = new EntropyAnalyzer();
    this.knownAgents = [
      {
        name: "AI16Z Agent",
        address: "0x1234567890abcdef1234567890abcdef12345678", // placeholder
        type: "trading"
      },
      {
        name: "Virtuals Agent", 
        address: "0xabcdef1234567890abcdef1234567890abcdef12", // placeholder
        type: "social"
      },
      // Add some real agent addresses when we find them
      {
        name: "Test Agent (Demo)",
        address: "0x742e4a8e2a1f6f4b8f4c4d4e4f4a4b4c4d4e4f4a", // placeholder
        type: "experimental"
      }
    ];
  }

  async analyzeAgent(agent) {
    console.log(`\n🤖 Analyzing ${agent.name} (${agent.type})`);
    console.log(`   Address: ${agent.address}`);
    
    try {
      // Get recent blockchain activity
      const activity = await getWalletActivity(agent.address);
      
      if (activity.length === 0) {
        console.log(`   ⚠️  No recent activity found`);
        return null;
      }

      console.log(`   📊 Found ${activity.length} recent transactions`);

      // Basic transaction patterns analysis
      const patterns = this.analyzeTransactionPatterns(activity);
      console.log(`   💰 Total volume: ${patterns.totalVolume} ETH`);
      console.log(`   🔄 Avg transaction: ${patterns.avgTransaction} ETH`);
      console.log(`   ⏰ Active hours: ${patterns.activeHours.join(', ')}`);

      // NEW: Entropy analysis for autonomy detection
      const entropyAnalysis = await this.entropyAnalyzer.analyzeAgentEntropy(activity, { agent });

      // Generate behavior summary incorporating entropy findings
      const behaviorSummary = this.generateBehaviorSummary(agent, patterns, entropyAnalysis);
      console.log(`   📝 Behavior: ${behaviorSummary}`);

      // Analyze sentiment of behavior
      const sentiment = await analyzeSentiment(behaviorSummary);
      console.log(`   😊 Sentiment: ${sentiment.sentiment} (${sentiment.confidence})`);

      return {
        agent,
        activity,
        patterns,
        entropyAnalysis, // NEW: Include full entropy analysis
        behaviorSummary,
        sentiment
      };

    } catch (error) {
      console.log(`   ❌ Error analyzing ${agent.name}: ${error.message}`);
      return null;
    }
  }

  analyzeTransactionPatterns(transactions) {
    let totalVolume = 0;
    const hours = new Set();
    const recipients = new Set();
    
    transactions.forEach(tx => {
      totalVolume += parseFloat(tx.value || 0);
      const hour = new Date(tx.timestamp).getHours();
      hours.add(hour);
      if (tx.to) recipients.add(tx.to);
    });

    return {
      totalVolume: totalVolume.toFixed(4),
      avgTransaction: (totalVolume / transactions.length).toFixed(4),
      activeHours: Array.from(hours).sort(),
      uniqueRecipients: recipients.size,
      transactionCount: transactions.length
    };
  }

  generateBehaviorSummary(agent, patterns, entropyAnalysis = null) {
    const { transactionCount, totalVolume, activeHours, uniqueRecipients } = patterns;
    
    // Start with basic description
    let summary = `${agent.type} agent with ${transactionCount} transactions, `;
    summary += `${totalVolume} ETH volume across ${uniqueRecipients} recipients. `;
    
    // Add timing analysis
    if (activeHours.length > 12) {
      summary += "Active throughout the day, suggesting automated behavior. ";
    } else if (activeHours.every(h => h >= 9 && h <= 17)) {
      summary += "Active during business hours, suggesting human oversight. ";
    } else {
      summary += "Irregular activity pattern, suggesting event-driven behavior. ";
    }

    // Add value analysis  
    if (parseFloat(patterns.avgTransaction) > 0.1) {
      summary += "High-value transactions indicate institutional or whale behavior. ";
    } else {
      summary += "Small transactions suggest retail or experimental behavior. ";
    }

    // NEW: Incorporate entropy analysis findings
    if (entropyAnalysis) {
      summary += `Autonomy analysis shows ${entropyAnalysis.assessment.toLowerCase()}. `;
      
      if (entropyAnalysis.autonomyScore >= 7) {
        summary += "High entropy patterns suggest genuine autonomous decision-making.";
      } else if (entropyAnalysis.autonomyScore >= 4) {
        summary += "Moderate entropy indicates semi-autonomous behavior with some predictability.";
      } else {
        summary += "Low entropy reveals highly predictable automated patterns.";
      }
    }

    return summary;
  }

  async runFullAnalysis() {
    console.log("🧠 Neural Nexus Agent Behavior Analysis v2.0");
    console.log("============================================");
    console.log("Now with entropy analysis for autonomy detection\n");

    const results = [];
    
    for (const agent of this.knownAgents) {
      const result = await this.analyzeAgent(agent);
      if (result) {
        results.push(result);
      }
      
      // Small delay between agents to be nice to APIs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate summary report
    if (results.length > 0) {
      this.generateSummaryReport(results);
    } else {
      console.log("\n❌ No successful analyses completed");
    }

    return results;
  }

  generateSummaryReport(results) {
    console.log("\n📊 ANALYSIS SUMMARY REPORT");
    console.log("==========================\n");

    // Autonomy score distribution
    const autonomyScores = results
      .filter(r => r.entropyAnalysis)
      .map(r => r.entropyAnalysis.autonomyScore);

    if (autonomyScores.length > 0) {
      const avgAutonomy = autonomyScores.reduce((a, b) => a + b, 0) / autonomyScores.length;
      const maxAutonomy = Math.max(...autonomyScores);
      const minAutonomy = Math.min(...autonomyScores);

      console.log(`🎯 Autonomy Scores:`);
      console.log(`   Average: ${avgAutonomy.toFixed(2)}/10`);
      console.log(`   Range: ${minAutonomy.toFixed(2)} - ${maxAutonomy.toFixed(2)}`);
      
      // Find most autonomous agent
      const mostAutonomous = results.find(r => 
        r.entropyAnalysis && r.entropyAnalysis.autonomyScore === maxAutonomy
      );
      if (mostAutonomous) {
        console.log(`   Most Autonomous: ${mostAutonomous.agent.name} (${maxAutonomy.toFixed(2)}/10)`);
      }
    }

    // Sentiment distribution  
    const sentiments = results.map(r => r.sentiment?.sentiment).filter(Boolean);
    const sentimentCounts = sentiments.reduce((acc, sentiment) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n😊 Sentiment Distribution:`);
    Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
      console.log(`   ${sentiment}: ${count} agents`);
    });

    // Activity patterns
    const totalTransactions = results.reduce((sum, r) => sum + r.patterns.transactionCount, 0);
    console.log(`\n📈 Activity Overview:`);
    console.log(`   Total transactions analyzed: ${totalTransactions}`);
    console.log(`   Active agents: ${results.length}`);

    console.log("\n✅ Analysis complete! Raw data available in returned results.\n");
  }
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new AgentAnalyzer();
  
  // Check for command line arguments
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0].startsWith('0x')) {
    // Analyze a specific address
    const customAgent = {
      name: "Custom Agent",
      address: args[0],
      type: "custom"
    };
    
    console.log("🧠 Neural Nexus - Custom Agent Analysis");
    console.log("======================================\n");
    
    analyzer.analyzeAgent(customAgent).then(result => {
      if (!result) {
        console.log("Analysis failed - no data found or error occurred");
        process.exit(1);
      }
    });
  } else {
    // Run full analysis on known agents
    analyzer.runFullAnalysis().catch(console.error);
  }
}

export { AgentAnalyzer };
export default AgentAnalyzer;