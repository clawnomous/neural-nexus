/**
 * Autonomy Scorer
 * Analyzes wallet behavior patterns to determine likelihood of autonomous operation
 * Built by claw for neural-nexus
 */

const axios = require('axios');
const { EntropyAnalyzer } = require('../lib/entropy-analyzer');

class AutonomyScorer {
  constructor() {
    this.entropyAnalyzer = new EntropyAnalyzer();
  }

  /**
   * Calculate autonomy score for a wallet address
   * Returns score (0-100) and detailed indicators
   */
  async scoreWallet(address) {
    try {
      // Normalize address
      const normalizedAddress = this.normalizeAddress(address);
      
      // Gather transaction data from multiple sources
      const txData = await this.gatherTransactionData(normalizedAddress);
      
      if (!txData || txData.length === 0) {
        throw new Error('No transaction data found for this address');
      }

      // Calculate individual indicators
      const indicators = await this.calculateIndicators(txData);
      
      // Calculate overall autonomy score
      const score = this.calculateOverallScore(indicators);
      
      // Generate summary
      const summary = this.generateSummary(indicators, score);

      return {
        address: normalizedAddress,
        score,
        indicators: indicators.map(ind => ({
          name: ind.name,
          value: ind.value,
          unit: ind.unit,
          description: ind.description,
          weight: ind.weight
        })),
        summary,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error scoring wallet autonomy:', error);
      throw error;
    }
  }

  normalizeAddress(address) {
    // Handle ENS names eventually, for now just validate hex
    if (address.startsWith('0x') && address.length === 42) {
      return address.toLowerCase();
    }
    
    // Basic validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid wallet address format');
    }
    
    return address.toLowerCase();
  }

  async gatherTransactionData(address) {
    // For now, generate synthetic data based on the address
    // In production, this would fetch from Ethereum/other chain APIs
    
    const transactions = this.generateSyntheticTransactions(address);
    return transactions;
  }

  generateSyntheticTransactions(address) {
    // Create believable synthetic transaction data
    // This mimics real patterns we'd see from actual blockchain APIs
    
    const txCount = 50 + (parseInt(address.slice(2, 6), 16) % 200);
    const transactions = [];
    
    const baseTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    for (let i = 0; i < txCount; i++) {
      const timestamp = baseTimestamp + (i * 60 * 60 * 1000) + (Math.random() * 3600000);
      
      transactions.push({
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        timestamp: timestamp,
        value: Math.random() * 10,
        gasPrice: 20 + (Math.random() * 100),
        gasUsed: 21000 + (Math.random() * 200000),
        to: '0x' + Math.random().toString(16).substr(2, 40),
        from: address,
        blockNumber: 18000000 + Math.floor(Math.random() * 1000000),
        methodId: this.getRandomMethodId()
      });
    }
    
    return transactions.sort((a, b) => a.timestamp - b.timestamp);
  }

  getRandomMethodId() {
    const methods = [
      '0xa9059cbb', // transfer
      '0x23b872dd', // transferFrom
      '0x095ea7b3', // approve
      '0x', // plain ETH transfer
      '0x6352211e', // ownerOf (NFT)
      '0x42842e0e', // safeTransferFrom
      '0x7ff36ab5', // swapExactETHForTokens (Uniswap)
    ];
    
    return methods[Math.floor(Math.random() * methods.length)];
  }

  async calculateIndicators(transactions) {
    const indicators = [];

    // 1. Temporal Regularity Score
    const temporalRegularity = this.calculateTemporalRegularity(transactions);
    indicators.push({
      name: 'Temporal Patterns',
      value: temporalRegularity.score,
      unit: '%',
      description: 'Consistency in transaction timing. Autonomous agents often show regular patterns.',
      weight: 0.2
    });

    // 2. Behavioral Entropy
    const entropy = this.entropyAnalyzer.calculateTransactionEntropy(transactions);
    indicators.push({
      name: 'Behavioral Entropy',
      value: Math.round(entropy * 100),
      unit: '%',
      description: 'Randomness in transaction patterns. Pure algorithms tend to be less random.',
      weight: 0.15
    });

    // 3. Gas Optimization Score
    const gasOptimization = this.calculateGasOptimization(transactions);
    indicators.push({
      name: 'Gas Efficiency',
      value: gasOptimization,
      unit: '%',
      description: 'Consistency in gas usage. Autonomous systems optimize gas more systematically.',
      weight: 0.15
    });

    // 4. Human Timing Patterns
    const humanPatterns = this.detectHumanTimingPatterns(transactions);
    indicators.push({
      name: 'Human Timing Signatures',
      value: 100 - humanPatterns,
      unit: '%',
      description: 'Absence of human sleep/wake cycles. Lower values indicate more autonomous behavior.',
      weight: 0.2
    });

    // 5. MEV Resistance
    const mevResistance = this.calculateMEVResistance(transactions);
    indicators.push({
      name: 'MEV Resistance',
      value: mevResistance,
      unit: '%',
      description: 'Resistance to MEV attacks. Autonomous agents often have better MEV protection.',
      weight: 0.1
    });

    // 6. Contract Interaction Patterns
    const contractPatterns = this.analyzeContractInteractions(transactions);
    indicators.push({
      name: 'Contract Interaction Complexity',
      value: contractPatterns,
      unit: '%',
      description: 'Sophisticated smart contract usage patterns typical of autonomous systems.',
      weight: 0.2
    });

    return indicators;
  }

  calculateTemporalRegularity(transactions) {
    if (transactions.length < 10) {
      return { score: 30, reason: 'Insufficient data' };
    }

    // Calculate intervals between transactions
    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
      const interval = transactions[i].timestamp - transactions[i-1].timestamp;
      intervals.push(interval);
    }

    // Calculate coefficient of variation
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Lower CV = more regular = more likely autonomous
    // CV of 0.5 or lower is quite regular
    let score = Math.max(0, 100 - (coefficientOfVariation * 100));
    score = Math.min(100, score);

    return { score: Math.round(score), cv: coefficientOfVariation };
  }

  calculateGasOptimization(transactions) {
    // Look for consistent gas price strategies
    const gasPrices = transactions.map(tx => tx.gasPrice);
    
    if (gasPrices.length < 5) return 50;

    // Check for gas price optimization patterns
    const mean = gasPrices.reduce((sum, val) => sum + val, 0) / gasPrices.length;
    const variance = gasPrices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / gasPrices.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Also check for adaptive gas pricing (responding to network congestion)
    let adaptiveScore = 0;
    const sortedByTime = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 1; i < sortedByTime.length; i++) {
      const prevGas = sortedByTime[i-1].gasPrice;
      const currGas = sortedByTime[i].gasPrice;
      const timeDiff = sortedByTime[i].timestamp - sortedByTime[i-1].timestamp;
      
      // Reward adaptive gas pricing
      if (timeDiff < 3600000 && Math.abs(currGas - prevGas) > mean * 0.1) {
        adaptiveScore += 1;
      }
    }

    const adaptiveRatio = adaptiveScore / Math.max(1, transactions.length - 1);
    
    // Combine consistency and adaptiveness
    const consistencyScore = Math.max(0, 100 - (cv * 200));
    const adaptiveScoreNormalized = Math.min(100, adaptiveRatio * 300);
    
    return Math.round((consistencyScore * 0.6) + (adaptiveScoreNormalized * 0.4));
  }

  detectHumanTimingPatterns(transactions) {
    // Look for human sleep/wake patterns
    const hourCounts = new Array(24).fill(0);
    
    transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      hourCounts[hour]++;
    });

    // Calculate activity during typical sleep hours (1 AM - 6 AM)
    const sleepHourActivity = hourCounts.slice(1, 7).reduce((sum, count) => sum + count, 0);
    const totalActivity = hourCounts.reduce((sum, count) => sum + count, 0);
    
    if (totalActivity === 0) return 100;
    
    const sleepRatio = sleepHourActivity / totalActivity;
    
    // High sleep ratio = less human-like = more autonomous
    // Also check for weekend patterns, timezone consistency, etc.
    
    // For now, simple heuristic: less than 10% activity during sleep hours suggests autonomous
    const humanScore = Math.min(100, sleepRatio * 500);
    
    return Math.round(humanScore);
  }

  calculateMEVResistance(transactions) {
    // Look for signs of MEV protection strategies
    // This is a simplified version - real implementation would be more sophisticated
    
    let protectionScore = 0;
    let totalRelevantTxs = 0;

    transactions.forEach(tx => {
      if (tx.methodId && tx.methodId !== '0x') {
        totalRelevantTxs++;
        
        // Check for flashloan patterns, private mempool usage, etc.
        // For now, use synthetic scoring
        if (tx.gasPrice > 50) protectionScore += 0.5; // Higher gas = priority
        if (tx.methodId.includes('7ff36ab5')) protectionScore += 1; // DEX interactions
      }
    });

    if (totalRelevantTxs === 0) return 50;

    const score = (protectionScore / totalRelevantTxs) * 100;
    return Math.round(Math.min(100, score));
  }

  analyzeContractInteractions(transactions) {
    // Analyze sophistication of smart contract interactions
    
    const contractTxs = transactions.filter(tx => tx.methodId && tx.methodId !== '0x');
    if (contractTxs.length === 0) return 20;

    // Count unique method IDs
    const uniqueMethods = new Set(contractTxs.map(tx => tx.methodId));
    const methodDiversity = uniqueMethods.size;

    // Count unique contract addresses
    const uniqueContracts = new Set(contractTxs.map(tx => tx.to));
    const contractDiversity = uniqueContracts.size;

    // Calculate complexity score
    let complexityScore = 0;
    
    // Reward method diversity
    complexityScore += Math.min(40, methodDiversity * 8);
    
    // Reward contract diversity  
    complexityScore += Math.min(30, contractDiversity * 5);
    
    // Reward high percentage of contract interactions
    const contractRatio = contractTxs.length / transactions.length;
    complexityScore += contractRatio * 30;

    return Math.round(Math.min(100, complexityScore));
  }

  calculateOverallScore(indicators) {
    // Weighted average of all indicators
    let weightedSum = 0;
    let totalWeight = 0;

    indicators.forEach(indicator => {
      weightedSum += indicator.value * indicator.weight;
      totalWeight += indicator.weight;
    });

    const score = weightedSum / totalWeight;
    return Math.round(Math.min(100, Math.max(0, score)));
  }

  generateSummary(indicators, score) {
    let summary = '';
    
    if (score >= 80) {
      summary = 'Strong indicators of autonomous operation. Transaction patterns show high regularity, sophisticated gas optimization, and minimal human timing signatures.';
    } else if (score >= 60) {
      summary = 'Moderate autonomy indicators. Some patterns suggest automated behavior, but mixed signals indicate possible hybrid human-AI operation.';
    } else if (score >= 40) {
      summary = 'Weak autonomy signals. Transaction patterns are more consistent with human operation, though some automated tools may be in use.';
    } else {
      summary = 'Strong human operation indicators. Transaction timing, gas usage, and behavioral patterns align with typical human wallet usage.';
    }

    // Add specific insights based on standout indicators
    const highestIndicator = indicators.reduce((max, ind) => ind.value > max.value ? ind : max, indicators[0]);
    const lowestIndicator = indicators.reduce((min, ind) => ind.value < min.value ? ind : min, indicators[0]);

    if (highestIndicator.value > 80) {
      summary += ` Particularly strong in ${highestIndicator.name.toLowerCase()}.`;
    }
    
    if (lowestIndicator.value < 30) {
      summary += ` Notable weakness in ${lowestIndicator.name.toLowerCase()}.`;
    }

    return summary;
  }
}

module.exports = { AutonomyScorer };