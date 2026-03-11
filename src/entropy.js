/**
 * Entropy Analysis for Agent Behavior
 * Measures unpredictability and complexity in transaction patterns
 * to distinguish genuine AI autonomy from simple automation
 */

export class EntropyAnalyzer {
  constructor() {
    this.metrics = {
      temporal: {},
      transactional: {},
      behavioral: {}
    };
  }

  /**
   * Calculate Shannon entropy of a data series
   * Higher entropy = more unpredictable = potentially more autonomous
   */
  calculateShannonEntropy(data) {
    if (!data || data.length === 0) return 0;
    
    // Count frequencies
    const frequencies = {};
    data.forEach(item => {
      frequencies[item] = (frequencies[item] || 0) + 1;
    });
    
    // Calculate probabilities and entropy
    const length = data.length;
    let entropy = 0;
    
    for (const freq of Object.values(frequencies)) {
      const probability = freq / length;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  /**
   * Analyze temporal entropy - unpredictability in timing patterns
   * Genuine agents should show some randomness, bots are often too regular
   */
  analyzeTemporalEntropy(transactions) {
    if (!transactions || transactions.length < 3) {
      return { entropy: 0, pattern: "insufficient_data" };
    }

    // Extract timing features
    const intervals = [];
    const hours = [];
    const dayOfWeek = [];
    
    for (let i = 1; i < transactions.length; i++) {
      const prev = new Date(transactions[i-1].timestamp);
      const curr = new Date(transactions[i].timestamp);
      const interval = Math.floor((curr - prev) / (1000 * 60)); // minutes
      
      intervals.push(Math.min(interval, 1440)); // cap at 24 hours
      hours.push(curr.getHours());
      dayOfWeek.push(curr.getDay());
    }

    const intervalEntropy = this.calculateShannonEntropy(intervals.map(i => Math.floor(i / 30))); // 30min buckets
    const hourEntropy = this.calculateShannonEntropy(hours);
    const dayEntropy = this.calculateShannonEntropy(dayOfWeek);

    // Analyze patterns - more nuanced scoring
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const intervalVariance = Math.sqrt(intervals.reduce((acc, val) => acc + Math.pow(val - avgInterval, 2), 0) / intervals.length);
    const coefficientOfVariation = intervalVariance / (avgInterval || 1);
    
    let pattern = "unknown";
    let score = 0;
    
    // More sophisticated pattern detection
    if (intervalEntropy < 1.0 && coefficientOfVariation < 0.3) {
      pattern = "highly_regular";
      score = 1;
    } else if (intervalEntropy < 2.0 && hourEntropy < 2.5) {
      pattern = "scheduled";
      score = 2;
    } else if (intervalEntropy > 3.0 || coefficientOfVariation > 1.0) {
      pattern = "highly_random";
      score = 8;
    } else {
      pattern = "moderately_variable";
      score = 5;
    }

    return {
      entropy: intervalEntropy,
      hourEntropy,
      dayEntropy,
      avgIntervalMinutes: avgInterval,
      intervalVariance,
      coefficientOfVariation,
      pattern,
      score
    };
  }

  /**
   * Analyze transactional entropy - unpredictability in amounts, recipients, types
   */
  analyzeTransactionalEntropy(transactions) {
    if (!transactions || transactions.length < 3) {
      return { entropy: 0, pattern: "insufficient_data", score: 0 };
    }

    // Extract transactional features
    const amounts = transactions.map(tx => {
      const val = parseFloat(tx.value || 0);
      if (val === 0) return 0;
      return Math.floor(Math.log10(val * 1e18)); // log scale for amounts
    }).filter(v => v !== null && !isNaN(v));

    const recipients = transactions.map(tx => tx.to).filter(Boolean);
    const gasUsed = transactions.map(tx => {
      const gas = parseInt(tx.gasUsed || 0);
      return Math.floor(gas / 10000); // bucket gas usage
    }).filter(v => v !== null && !isNaN(v));

    const amountEntropy = this.calculateShannonEntropy(amounts);
    const recipientEntropy = this.calculateShannonEntropy(recipients);
    const gasEntropy = this.calculateShannonEntropy(gasUsed);

    // Analyze amount patterns
    const uniqueAmounts = new Set(amounts).size;
    const uniqueRecipients = new Set(recipients).size;
    const amountVariety = amounts.length > 0 ? uniqueAmounts / amounts.length : 0;
    const recipientVariety = recipients.length > 0 ? uniqueRecipients / recipients.length : 0;
    
    let pattern = "unknown";
    let score = 0;
    
    // Improved scoring logic
    if (amountEntropy < 1.0 && recipientEntropy < 1.5 && amountVariety < 0.5) {
      pattern = "fixed_behavior";
      score = 1;
    } else if (amountVariety < 0.4 && recipientVariety < 0.7) {
      pattern = "repetitive";
      score = 2;
    } else if (amountEntropy > 2.0 && recipientEntropy > 2.0 && amountVariety > 0.7) {
      pattern = "dynamic_behavior";
      score = 8;
    } else {
      pattern = "varied";
      score = 5;
    }

    return {
      entropy: (amountEntropy + recipientEntropy + gasEntropy) / 3,
      amountEntropy,
      recipientEntropy,
      gasEntropy,
      amountVariety,
      recipientVariety,
      pattern,
      score
    };
  }

  /**
   * Analyze behavioral complexity - how sophisticated are the actions?
   */
  analyzeBehavioralComplexity(transactions, additionalData = {}) {
    if (!transactions || transactions.length === 0) {
      return { complexity: 0, pattern: "no_activity", score: 0 };
    }

    let complexityScore = 0;
    const features = {
      contractInteractions: 0,
      uniqueContracts: new Set(),
      dexInteractions: 0,
      nftInteractions: 0,
      multiSigUsage: 0,
      crossChainActivity: 0
    };

    transactions.forEach(tx => {
      // Contract interaction complexity
      if (tx.to && tx.input && tx.input !== '0x') {
        features.contractInteractions++;
        features.uniqueContracts.add(tx.to);
        complexityScore += 1;
        
        // Check for DEX patterns (simplified)
        if (tx.input.startsWith('0xa9059cbb') || tx.input.startsWith('0x095ea7b3')) {
          features.dexInteractions++;
          complexityScore += 2;
        }
        
        // Check for complex interactions (longer input data)
        if (tx.input.length > 138) { // more than simple transfer
          complexityScore += Math.min((tx.input.length - 138) / 100, 3);
        }
      }
      
      // Multi-signature complexity
      if (tx.gasUsed && parseInt(tx.gasUsed) > 100000) {
        features.multiSigUsage++;
        complexityScore += 1;
      }
    });

    features.uniqueContracts = features.uniqueContracts.size;
    
    // Normalize complexity score
    const normalizedComplexity = Math.min(complexityScore / transactions.length, 10);
    
    let pattern = "unknown";
    let score = 0;
    
    if (normalizedComplexity < 0.3) {
      pattern = "simple_transfers";
      score = 1;
    } else if (normalizedComplexity > 3.0) {
      pattern = "complex_defi";
      score = 8;
    } else if (features.dexInteractions > transactions.length * 0.3) {
      pattern = "trading_focused";
      score = 6;
    } else {
      pattern = "mixed_activity";
      score = 4;
    }

    return {
      complexity: normalizedComplexity,
      contractInteractions: features.contractInteractions,
      uniqueContracts: features.uniqueContracts,
      dexInteractions: features.dexInteractions,
      pattern,
      score
    };
  }

  /**
   * Generate overall autonomy score based on all entropy metrics
   * 0-10 scale: 0 = clearly automated, 10 = highly autonomous
   * Improved scoring with proper weighting
   */
  calculateAutonomyScore(temporalEntropy, transactionalEntropy, behavioralComplexity) {
    // Get individual scores from each component
    const temporalScore = temporalEntropy.score || 0;
    const transactionalScore = transactionalEntropy.score || 0;
    const behavioralScore = behavioralComplexity.score || 0;
    
    // Weighted average: temporal 25%, transactional 45%, behavioral 30%
    const weightedScore = (temporalScore * 0.25) + (transactionalScore * 0.45) + (behavioralScore * 0.30);
    
    // Apply some bonuses for specific high-autonomy indicators
    let bonusScore = 0;
    
    // Bonus for high entropy combinations
    if (temporalEntropy.entropy > 2.0 && transactionalEntropy.entropy > 2.0) {
      bonusScore += 1;
    }
    
    // Bonus for complex behavioral patterns
    if (behavioralComplexity.complexity > 2.0) {
      bonusScore += 0.5;
    }
    
    // Bonus for high coefficient of variation in timing
    if (temporalEntropy.coefficientOfVariation > 0.8) {
      bonusScore += 0.5;
    }
    
    const finalScore = Math.min(Math.max(weightedScore + bonusScore, 0), 10);
    return finalScore;
  }

  /**
   * Full entropy analysis of an agent's behavior
   */
  async analyzeAgentEntropy(transactions, metadata = {}) {
    console.log(`\n🔍 Running entropy analysis on ${transactions.length} transactions...`);
    
    const temporal = this.analyzeTemporalEntropy(transactions);
    const transactional = this.analyzeTransactionalEntropy(transactions);
    const behavioral = this.analyzeBehavioralComplexity(transactions);
    
    const autonomyScore = this.calculateAutonomyScore(temporal, transactional, behavioral);
    
    // Generate human-readable assessment
    let assessment = "";
    if (autonomyScore < 2.5) assessment = "Likely automated bot with predictable patterns";
    else if (autonomyScore < 4.5) assessment = "Semi-automated with some variability";
    else if (autonomyScore < 6.5) assessment = "Mixed behavior, possibly human-supervised";
    else if (autonomyScore < 8.0) assessment = "Appears genuinely autonomous with complex patterns";
    else assessment = "Highly autonomous with sophisticated unpredictable behavior";

    const result = {
      autonomyScore,
      assessment,
      temporal,
      transactional,
      behavioral,
      timestamp: new Date().toISOString()
    };

    console.log(`   🎯 Autonomy Score: ${autonomyScore.toFixed(2)}/10`);
    console.log(`   📊 Assessment: ${assessment}`);
    console.log(`   ⏰ Temporal Pattern: ${temporal.pattern} (entropy: ${temporal.entropy?.toFixed(2)})`);
    console.log(`   💰 Transactional Pattern: ${transactional.pattern} (entropy: ${transactional.entropy?.toFixed(2)})`);
    console.log(`   🧠 Behavioral Pattern: ${behavioral.pattern} (complexity: ${behavioral.complexity?.toFixed(2)})`);

    return result;
  }
}

export default EntropyAnalyzer;