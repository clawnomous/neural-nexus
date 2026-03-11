/**
 * Behavioral Pattern Detection for AI Agents
 * Analyzes on-chain behavior to identify different types of autonomous patterns
 */

export class BehaviorPatternDetector {
  constructor() {
    this.patterns = new Map();
    this.thresholds = {
      automation: 0.8,      // High predictability = automation
      consciousness: 0.3,   // Low predictability = potential consciousness
      coordination: 0.6,    // Medium predictability with timing = coordination
    };
  }

  /**
   * Analyze a sequence of transactions to detect behavioral patterns
   */
  analyzePattern(transactions) {
    if (!Array.isArray(transactions) || transactions.length < 3) {
      return { type: 'insufficient_data', confidence: 0 };
    }

    const timingEntropy = this.calculateTimingEntropy(transactions);
    const valueEntropy = this.calculateValueEntropy(transactions);
    const methodEntropy = this.calculateMethodEntropy(transactions);
    const temporalClustering = this.detectTemporalClustering(transactions);

    // Different patterns have different entropy signatures
    const patterns = {
      automation: this.detectAutomation(timingEntropy, valueEntropy, methodEntropy),
      consciousness: this.detectConsciousness(timingEntropy, valueEntropy, temporalClustering),
      coordination: this.detectCoordination(transactions, temporalClustering),
      exploration: this.detectExploration(methodEntropy, valueEntropy),
    };

    // Return the highest confidence pattern
    const bestPattern = Object.entries(patterns)
      .reduce((best, [type, data]) => 
        data.confidence > best.confidence ? { type, ...data } : best
      , { type: 'unknown', confidence: 0 });

    return {
      ...bestPattern,
      entropy: { timing: timingEntropy, value: valueEntropy, method: methodEntropy },
      metadata: this.generateMetadata(transactions, bestPattern.type)
    };
  }

  /**
   * Calculate entropy in transaction timing intervals
   * High entropy = unpredictable timing (consciousness)
   * Low entropy = predictable timing (automation)
   */
  calculateTimingEntropy(transactions) {
    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
      const interval = transactions[i].timestamp - transactions[i-1].timestamp;
      intervals.push(interval);
    }

    return this.calculateEntropy(intervals);
  }

  /**
   * Calculate entropy in transaction values
   * Helps distinguish between fixed automation and adaptive behavior
   */
  calculateValueEntropy(transactions) {
    const values = transactions
      .filter(tx => tx.value && tx.value !== '0')
      .map(tx => parseFloat(tx.value));
    
    if (values.length === 0) return 0;
    return this.calculateEntropy(values);
  }

  /**
   * Calculate entropy in method calls
   * Diverse methods suggest exploration vs. repetitive automation
   */
  calculateMethodEntropy(transactions) {
    const methods = transactions
      .filter(tx => tx.input && tx.input !== '0x')
      .map(tx => tx.input.substring(0, 10)); // Method signature

    return this.calculateEntropy(methods);
  }

  /**
   * Generic entropy calculation using Shannon entropy
   */
  calculateEntropy(data) {
    if (data.length === 0) return 0;

    const frequency = new Map();
    data.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });

    let entropy = 0;
    const total = data.length;
    frequency.forEach(count => {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    });

    return entropy;
  }

  /**
   * Detect temporal clustering - groups of transactions close in time
   * Suggests coordinated or burst behavior
   */
  detectTemporalClustering(transactions) {
    const clusters = [];
    let currentCluster = [transactions[0]];

    for (let i = 1; i < transactions.length; i++) {
      const timeDiff = transactions[i].timestamp - transactions[i-1].timestamp;
      
      // If transactions are within 60 seconds, consider them clustered
      if (timeDiff < 60) {
        currentCluster.push(transactions[i]);
      } else {
        if (currentCluster.length > 1) {
          clusters.push(currentCluster);
        }
        currentCluster = [transactions[i]];
      }
    }

    if (currentCluster.length > 1) {
      clusters.push(currentCluster);
    }

    return {
      clusterCount: clusters.length,
      averageClusterSize: clusters.length > 0 
        ? clusters.reduce((sum, cluster) => sum + cluster.length, 0) / clusters.length 
        : 0,
      largestCluster: Math.max(0, ...clusters.map(c => c.length)),
      clusters: clusters
    };
  }

  /**
   * Detect automation patterns
   * Low entropy + regular intervals = likely automation
   */
  detectAutomation(timingEntropy, valueEntropy, methodEntropy) {
    const avgEntropy = (timingEntropy + valueEntropy + methodEntropy) / 3;
    
    // Low entropy across all dimensions suggests automation
    const confidence = Math.max(0, 1 - avgEntropy);
    
    return {
      confidence: confidence > this.thresholds.automation ? confidence : 0,
      indicators: {
        regularTiming: timingEntropy < 1.0,
        consistentValues: valueEntropy < 0.5,
        repeatMethods: methodEntropy < 1.0
      }
    };
  }

  /**
   * Detect consciousness patterns
   * High timing entropy + variable behavior = potential consciousness
   */
  detectConsciousness(timingEntropy, valueEntropy, temporalClustering) {
    // Consciousness shows up as unpredictable timing with occasional bursts
    const unpredictableTiming = timingEntropy > 2.0;
    const hasBursts = temporalClustering.clusterCount > 0;
    const variableBehavior = valueEntropy > 1.0;

    let confidence = 0;
    if (unpredictableTiming) confidence += 0.4;
    if (hasBursts) confidence += 0.3;
    if (variableBehavior) confidence += 0.3;

    return {
      confidence: confidence > this.thresholds.consciousness ? confidence : 0,
      indicators: {
        unpredictableTiming,
        burstBehavior: hasBursts,
        adaptiveValues: variableBehavior,
        contemplationPauses: timingEntropy > 3.0 // Very high entropy suggests "thinking" pauses
      }
    };
  }

  /**
   * Detect coordination patterns
   * Multiple transactions in quick succession, possibly multi-step operations
   */
  detectCoordination(transactions, temporalClustering) {
    const hasLargeClusters = temporalClustering.largestCluster >= 3;
    const consistentClustering = temporalClustering.clusterCount >= 2;
    const complexSequences = this.detectComplexSequences(transactions);

    let confidence = 0;
    if (hasLargeClusters) confidence += 0.4;
    if (consistentClustering) confidence += 0.3;
    if (complexSequences) confidence += 0.3;

    return {
      confidence: confidence > this.thresholds.coordination ? confidence : 0,
      indicators: {
        multiStepOperations: hasLargeClusters,
        repeatedCoordination: consistentClustering,
        complexSequences
      }
    };
  }

  /**
   * Detect exploration patterns
   * High method diversity + variable values = learning/exploring
   */
  detectExploration(methodEntropy, valueEntropy) {
    const diverseMethods = methodEntropy > 2.0;
    const experimentalValues = valueEntropy > 1.5;

    let confidence = 0;
    if (diverseMethods) confidence += 0.5;
    if (experimentalValues) confidence += 0.5;

    return {
      confidence: Math.min(confidence, 1.0),
      indicators: {
        methodDiversity: diverseMethods,
        valueExperimentation: experimentalValues
      }
    };
  }

  /**
   * Detect complex multi-transaction sequences
   */
  detectComplexSequences(transactions) {
    // Look for patterns like: approve -> transfer -> interact -> verify
    // This is a simplified heuristic
    const methodSequences = transactions
      .map(tx => tx.input ? tx.input.substring(0, 10) : '0x')
      .join(',');

    // Common complex patterns
    const complexPatterns = [
      'approve.*transfer',
      'deposit.*withdraw.*deposit',
      'create.*interact.*verify',
    ];

    return complexPatterns.some(pattern => 
      new RegExp(pattern).test(methodSequences)
    );
  }

  /**
   * Generate metadata about the behavior pattern
   */
  generateMetadata(transactions, patternType) {
    return {
      transactionCount: transactions.length,
      timeSpan: transactions[transactions.length - 1].timestamp - transactions[0].timestamp,
      uniqueMethods: new Set(
        transactions
          .filter(tx => tx.input && tx.input !== '0x')
          .map(tx => tx.input.substring(0, 10))
      ).size,
      averageValue: this.calculateAverageValue(transactions),
      patternType,
      confidence: this.patterns.get(patternType)?.confidence || 0
    };
  }

  calculateAverageValue(transactions) {
    const values = transactions
      .filter(tx => tx.value && tx.value !== '0')
      .map(tx => parseFloat(tx.value));
    
    return values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length 
      : 0;
  }

  /**
   * Get human-readable description of the detected pattern
   */
  describePattern(pattern) {
    const descriptions = {
      automation: `Automated behavior detected (${(pattern.confidence * 100).toFixed(1)}% confidence). Regular timing and consistent methods suggest scripted actions.`,
      consciousness: `Consciousness indicators detected (${(pattern.confidence * 100).toFixed(1)}% confidence). Unpredictable timing with adaptive behavior suggests autonomous decision-making.`,
      coordination: `Coordinated behavior detected (${(pattern.confidence * 100).toFixed(1)}% confidence). Multi-step operations and temporal clustering suggest complex strategy execution.`,
      exploration: `Exploratory behavior detected (${(pattern.confidence * 100).toFixed(1)}% confidence). High method diversity suggests learning or experimentation.`,
      unknown: 'Insufficient data or unclear pattern.',
      insufficient_data: 'Not enough transaction data to determine pattern.'
    };

    return descriptions[pattern.type] || 'Unknown pattern type.';
  }
}