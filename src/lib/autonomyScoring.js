/**
 * Wallet Autonomy Scoring Algorithm
 * Analyzes on-chain behavior patterns to detect agent-like activity
 */

export class AutonomyScorer {
  constructor() {
    this.weights = {
      timing: 0.25,      // Consistent timing patterns
      volume: 0.20,      // Trading volume consistency 
      diversity: 0.20,   // Token/protocol diversity
      precision: 0.15,   // Exact amount patterns
      frequency: 0.10,   // Transaction frequency
      gasOptimization: 0.10  // Gas efficiency patterns
    };
  }

  /**
   * Score a wallet's autonomy based on transaction patterns
   * @param {Array} transactions - Array of transaction objects
   * @returns {Object} Scoring breakdown and overall score
   */
  scoreWallet(transactions) {
    if (!transactions || transactions.length < 10) {
      return {
        score: 0,
        confidence: 'low',
        reason: 'Insufficient transaction history (minimum 10 transactions required)'
      };
    }

    const scores = {
      timing: this.scoreTiming(transactions),
      volume: this.scoreVolume(transactions),
      diversity: this.scoreDiversity(transactions),
      precision: this.scorePrecision(transactions),
      frequency: this.scoreFrequency(transactions),
      gasOptimization: this.scoreGasOptimization(transactions)
    };

    const weightedScore = Object.entries(scores).reduce((total, [metric, score]) => {
      return total + (score * this.weights[metric]);
    }, 0);

    return {
      score: Math.round(weightedScore * 100),
      breakdown: scores,
      confidence: this.calculateConfidence(transactions.length, weightedScore),
      agentLikelihood: this.interpretScore(weightedScore)
    };
  }

  /**
   * Analyze timing patterns - agents often have consistent intervals
   */
  scoreTiming(transactions) {
    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
      const interval = transactions[i].timestamp - transactions[i-1].timestamp;
      intervals.push(interval);
    }

    // Calculate coefficient of variation (lower = more consistent = more agent-like)
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Lower CV = higher score (more consistent timing)
    return Math.max(0, Math.min(1, 1 - (cv / 2)));
  }

  /**
   * Analyze volume patterns - agents often use consistent position sizing
   */
  scoreVolume(transactions) {
    const volumes = transactions
      .filter(tx => tx.value && tx.value > 0)
      .map(tx => tx.value);

    if (volumes.length < 5) return 0;

    // Look for clustering around specific values (agent-like)
    const uniqueVolumes = [...new Set(volumes.map(v => Math.floor(v * 1000)))]; // Round to avoid floating point issues
    const repetitionRate = 1 - (uniqueVolumes.length / volumes.length);

    return Math.max(0, Math.min(1, repetitionRate * 2)); // Scale up repetition patterns
  }

  /**
   * Analyze token/protocol diversity
   */
  scoreDiversity(transactions) {
    const protocols = new Set();
    const tokens = new Set();

    transactions.forEach(tx => {
      if (tx.to) protocols.add(tx.to.toLowerCase());
      if (tx.tokenAddress) tokens.add(tx.tokenAddress.toLowerCase());
    });

    // Agents often interact with multiple protocols systematically
    const protocolDiversity = Math.min(protocols.size / 10, 1); // Cap at 10 protocols
    const tokenDiversity = Math.min(tokens.size / 20, 1); // Cap at 20 tokens

    return (protocolDiversity + tokenDiversity) / 2;
  }

  /**
   * Look for precise amounts (agents don't do round numbers like humans)
   */
  scorePrecision(transactions) {
    const values = transactions
      .filter(tx => tx.value && tx.value > 0)
      .map(tx => tx.value);

    if (values.length < 5) return 0;

    let precisionScore = 0;
    values.forEach(value => {
      const str = value.toString();
      const decimalPlaces = str.includes('.') ? str.split('.')[1].length : 0;
      
      // More decimal places = more precise = more agent-like
      if (decimalPlaces >= 6) precisionScore += 1;
      else if (decimalPlaces >= 3) precisionScore += 0.5;
      else if (decimalPlaces === 0 && value % 1000 === 0) precisionScore -= 0.3; // Round numbers = human-like
    });

    return Math.max(0, Math.min(1, precisionScore / values.length));
  }

  /**
   * Analyze transaction frequency patterns
   */
  scoreFrequency(transactions) {
    const timeSpan = transactions[transactions.length - 1].timestamp - transactions[0].timestamp;
    const avgInterval = timeSpan / transactions.length;

    // Score based on consistency of activity (not too high, not too low)
    if (avgInterval < 60 * 60) return 0.3; // Too frequent (< 1 hour avg)
    if (avgInterval > 24 * 60 * 60 * 7) return 0.2; // Too infrequent (> 1 week avg)
    
    // Sweet spot: 1-24 hours between transactions
    if (avgInterval >= 60 * 60 && avgInterval <= 24 * 60 * 60) return 0.9;
    
    return 0.5; // Moderate frequency
  }

  /**
   * Analyze gas optimization patterns
   */
  scoreGasOptimization(transactions) {
    const gasUsed = transactions
      .filter(tx => tx.gasUsed && tx.gasPrice)
      .map(tx => ({ used: tx.gasUsed, price: tx.gasPrice }));

    if (gasUsed.length < 5) return 0;

    // Agents tend to optimize gas more consistently
    const gasVariance = this.calculateVariance(gasUsed.map(g => g.price));
    const gasScore = Math.max(0, Math.min(1, 1 - gasVariance));

    return gasScore;
  }

  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance / (mean * mean); // Normalized variance
  }

  calculateConfidence(txCount, score) {
    if (txCount < 20) return 'low';
    if (txCount < 50) return 'medium';
    if (txCount >= 100 && score > 0.7) return 'high';
    return 'medium';
  }

  interpretScore(score) {
    if (score >= 0.8) return 'Highly likely autonomous agent';
    if (score >= 0.6) return 'Likely automated/agent behavior';
    if (score >= 0.4) return 'Some automated patterns detected';
    if (score >= 0.2) return 'Mostly human-like behavior';
    return 'Very human-like behavior';
  }
}

export default AutonomyScorer;