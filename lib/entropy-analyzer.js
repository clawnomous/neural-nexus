/**
 * Behavioral Entropy Analyzer
 * Analyzes on-chain transaction patterns to detect genuine autonomy vs automation
 * 
 * Core insight: Automation follows predictable patterns.
 * True autonomy exhibits behavioral entropy in timing decisions.
 */

class EntropyAnalyzer {
  constructor() {
    this.patterns = new Map();
    this.thresholds = {
      automation: 1.5,    // Low entropy = likely automation
      hybrid: 4.0,        // Medium entropy = hybrid system
      autonomous: 6.0     // High entropy = likely autonomous
    };
  }

  /**
   * Analyze transaction timing patterns for behavioral entropy
   * @param {Array} transactions - Array of transaction objects with timestamps
   * @returns {Object} Analysis results with autonomy score
   */
  analyzeTransactionEntropy(transactions) {
    if (transactions.length < 10) {
      return {
        autonomyScore: 0,
        confidence: 'low',
        reason: 'Insufficient data points'
      };
    }

    const timingIntervals = this.extractTimingIntervals(transactions);
    const entropyScore = this.calculateBehavioralEntropy(timingIntervals);
    const predictabilityIndex = this.calculatePredictabilityIndex(timingIntervals);
    const autonomyScore = this.computeAutonomyScore(entropyScore, predictabilityIndex);

    return {
      autonomyScore: Math.round(autonomyScore * 10) / 10,
      entropyScore: Math.round(entropyScore * 100) / 100,
      predictabilityIndex: Math.round(predictabilityIndex * 100) / 100,
      confidence: this.assessConfidence(transactions.length, entropyScore),
      classification: this.classifyBehavior(autonomyScore),
      patterns: this.identifyPatterns(timingIntervals),
      insights: this.generateInsights(entropyScore, predictabilityIndex, autonomyScore)
    };
  }

  /**
   * Extract intervals between transactions
   */
  extractTimingIntervals(transactions) {
    const intervals = [];
    const sortedTxs = transactions.sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 1; i < sortedTxs.length; i++) {
      const interval = sortedTxs[i].timestamp - sortedTxs[i-1].timestamp;
      intervals.push(interval);
    }
    
    return intervals;
  }

  /**
   * Calculate behavioral entropy using Shannon entropy on timing intervals
   */
  calculateBehavioralEntropy(intervals) {
    if (intervals.length === 0) return 0;

    // Group intervals into buckets for probability calculation
    const buckets = this.createTimingBuckets(intervals);
    const total = intervals.length;
    let entropy = 0;

    for (const [bucket, count] of buckets.entries()) {
      const probability = count / total;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy;
  }

  /**
   * Create timing buckets for entropy calculation
   */
  createTimingBuckets(intervals) {
    const buckets = new Map();
    
    for (const interval of intervals) {
      // Logarithmic bucketing - more sensitive to timing variations
      const bucket = Math.floor(Math.log10(interval + 1) * 10) / 10;
      buckets.set(bucket, (buckets.get(bucket) || 0) + 1);
    }
    
    return buckets;
  }

  /**
   * Calculate how predictable the timing patterns are
   */
  calculatePredictabilityIndex(intervals) {
    if (intervals.length < 3) return 1.0;

    // Calculate coefficient of variation (std dev / mean)
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    const coefficientOfVariation = stdDev / mean;
    
    // Convert to predictability index (inverse relationship)
    return Math.max(0, Math.min(1, 1 / (1 + coefficientOfVariation)));
  }

  /**
   * Compute final autonomy score combining entropy and predictability
   */
  computeAutonomyScore(entropy, predictability) {
    // High entropy + low predictability = high autonomy
    // Scale to 0-10 range
    const rawScore = (entropy * (1 - predictability)) * 2;
    return Math.max(0, Math.min(10, rawScore));
  }

  /**
   * Classify behavior based on autonomy score
   */
  classifyBehavior(score) {
    if (score < this.thresholds.automation) {
      return 'automation';
    } else if (score < this.thresholds.hybrid) {
      return 'hybrid';
    } else if (score < this.thresholds.autonomous) {
      return 'semi-autonomous';
    } else {
      return 'highly-autonomous';
    }
  }

  /**
   * Assess confidence in the analysis
   */
  assessConfidence(dataPoints, entropy) {
    if (dataPoints < 20) return 'low';
    if (dataPoints < 100) return 'medium';
    if (entropy < 1 || entropy > 8) return 'high';
    return 'medium';
  }

  /**
   * Identify specific patterns in timing
   */
  identifyPatterns(intervals) {
    const patterns = [];
    
    // Check for periodic behavior
    if (this.hasPeriodicPattern(intervals)) {
      patterns.push('periodic');
    }
    
    // Check for clustering
    if (this.hasClusteredBehavior(intervals)) {
      patterns.push('clustered');
    }
    
    // Check for random-like behavior
    if (this.hasRandomLikeBehavior(intervals)) {
      patterns.push('stochastic');
    }
    
    return patterns;
  }

  /**
   * Check for periodic timing patterns
   */
  hasPeriodicPattern(intervals) {
    const tolerance = 0.1; // 10% tolerance
    const commonIntervals = this.findCommonIntervals(intervals, tolerance);
    return commonIntervals.length > intervals.length * 0.3;
  }

  /**
   * Check for clustered behavior (bursts of activity)
   */
  hasClusteredBehavior(intervals) {
    const shortIntervals = intervals.filter(i => i < 60000); // < 1 minute
    return shortIntervals.length > intervals.length * 0.4;
  }

  /**
   * Check for random-like behavior
   */
  hasRandomLikeBehavior(intervals) {
    const entropy = this.calculateBehavioralEntropy(intervals);
    return entropy > 4.0; // High entropy suggests randomness
  }

  /**
   * Find common intervals within tolerance
   */
  findCommonIntervals(intervals, tolerance) {
    const common = [];
    const sorted = [...intervals].sort((a, b) => a - b);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const diff = Math.abs(sorted[i] - sorted[j]) / sorted[i];
        if (diff <= tolerance) {
          common.push(sorted[i]);
        }
      }
    }
    
    return common;
  }

  /**
   * Generate human-readable insights
   */
  generateInsights(entropy, predictability, autonomyScore) {
    const insights = [];
    
    if (autonomyScore < 2) {
      insights.push("Highly predictable automation-like behavior detected");
    } else if (autonomyScore > 7) {
      insights.push("High behavioral entropy suggests genuine autonomous decision-making");
    }
    
    if (predictability > 0.8) {
      insights.push("Transaction timing follows highly predictable patterns");
    } else if (predictability < 0.3) {
      insights.push("Unpredictable timing suggests conscious choice in action timing");
    }
    
    if (entropy > 5) {
      insights.push("Diverse timing patterns indicate sophisticated behavioral repertoire");
    }
    
    return insights;
  }

  /**
   * Analyze multiple agents and compare behavioral signatures
   */
  compareAgents(agentAnalyses) {
    const comparisons = [];
    
    for (let i = 0; i < agentAnalyses.length; i++) {
      for (let j = i + 1; j < agentAnalyses.length; j++) {
        const similarity = this.calculateBehavioralSimilarity(
          agentAnalyses[i], 
          agentAnalyses[j]
        );
        
        comparisons.push({
          agent1: agentAnalyses[i].id,
          agent2: agentAnalyses[j].id,
          similarity: similarity,
          relationship: this.inferRelationship(similarity)
        });
      }
    }
    
    return comparisons;
  }

  /**
   * Calculate behavioral similarity between two agents
   */
  calculateBehavioralSimilarity(analysis1, analysis2) {
    const scoreDiff = Math.abs(analysis1.autonomyScore - analysis2.autonomyScore);
    const entropyDiff = Math.abs(analysis1.entropyScore - analysis2.entropyScore);
    const predictDiff = Math.abs(analysis1.predictabilityIndex - analysis2.predictabilityIndex);
    
    // Normalize and combine (lower = more similar)
    const similarity = 1 - ((scoreDiff/10 + entropyDiff/10 + predictDiff) / 3);
    return Math.max(0, similarity);
  }

  /**
   * Infer relationship type based on behavioral similarity
   */
  inferRelationship(similarity) {
    if (similarity > 0.9) return 'likely-same-system';
    if (similarity > 0.7) return 'similar-architecture';
    if (similarity > 0.5) return 'related-behaviors';
    return 'distinct-agents';
  }
}

module.exports = EntropyAnalyzer;