/**
 * Blockchain Monitor for Neural Nexus
 * Real-time monitoring of AI agent activity with anomaly detection
 * Designed for MCP server integration
 */

import { EventEmitter } from 'events';
import { getWalletActivity } from './blockchain.js';
import { EntropyAnalyzer } from './entropy.js';

export class BlockchainMonitor extends EventEmitter {
  constructor() {
    super();
    this.entropyAnalyzer = new EntropyAnalyzer();
    this.monitoredAgents = new Map();
    this.monitoringIntervals = new Map();
    this.activityCache = new Map();
  }

  /**
   * Start monitoring agent addresses for behavioral anomalies
   */
  async startMonitoring(addresses, options = {}) {
    const {
      chainId = 1,
      alertThreshold = 0.7,
      checkInterval = 30000, // 30 seconds
    } = options;

    const monitorId = Date.now().toString();
    
    for (const address of addresses) {
      this.monitoredAgents.set(address, {
        address,
        chainId,
        alertThreshold,
        lastCheck: Date.now(),
        baselineEntropy: null,
        activityHistory: [],
      });

      // Establish baseline entropy for each agent
      try {
        const recentActivity = await getWalletActivity(address, chainId);
        if (recentActivity.length > 0) {
          const baseline = await this.entropyAnalyzer.analyzeAgentEntropy(recentActivity, {
            agent: { address, type: 'monitored' }
          });
          this.monitoredAgents.get(address).baselineEntropy = baseline;
        }
      } catch (error) {
        console.error(`Failed to establish baseline for ${address}:`, error.message);
      }
    }

    // Set up monitoring interval
    const intervalId = setInterval(() => {
      this.checkAllAgents();
    }, checkInterval);

    this.monitoringIntervals.set(monitorId, intervalId);

    this.emit('monitoring_started', {
      monitorId,
      addresses,
      options,
      timestamp: new Date().toISOString(),
    });

    return monitorId;
  }

  /**
   * Stop monitoring by monitor ID
   */
  stopMonitoring(monitorId) {
    const intervalId = this.monitoringIntervals.get(monitorId);
    if (intervalId) {
      clearInterval(intervalId);
      this.monitoringIntervals.delete(monitorId);
      
      this.emit('monitoring_stopped', {
        monitorId,
        timestamp: new Date().toISOString(),
      });
      
      return true;
    }
    return false;
  }

  /**
   * Check all monitored agents for anomalies
   */
  async checkAllAgents() {
    for (const [address, config] of this.monitoredAgents) {
      await this.checkAgent(address, config);
    }
  }

  /**
   * Check individual agent for behavioral anomalies
   */
  async checkAgent(address, config) {
    try {
      // Get recent activity since last check
      const recentActivity = await getWalletActivity(address, config.chainId);
      const newActivity = recentActivity.filter(tx => 
        new Date(tx.timestamp).getTime() > config.lastCheck
      );

      if (newActivity.length === 0) {
        return; // No new activity
      }

      // Update activity history
      config.activityHistory.push(...newActivity);
      
      // Keep only last 100 transactions for performance
      if (config.activityHistory.length > 100) {
        config.activityHistory = config.activityHistory.slice(-100);
      }

      // Analyze current entropy vs baseline
      const currentEntropy = await this.entropyAnalyzer.analyzeAgentEntropy(
        config.activityHistory, 
        { agent: { address, type: 'monitored' } }
      );

      // Detect anomalies
      const anomalies = this.detectAnomalies(config.baselineEntropy, currentEntropy, config.alertThreshold);

      if (anomalies.length > 0) {
        this.emit('anomaly_detected', {
          address,
          anomalies,
          currentEntropy,
          baselineEntropy: config.baselineEntropy,
          newTransactions: newActivity.length,
          timestamp: new Date().toISOString(),
        });
      }

      // Emit regular activity update
      this.emit('activity_update', {
        address,
        newTransactions: newActivity.length,
        totalTransactions: config.activityHistory.length,
        entropyScore: currentEntropy.overallScore,
        timestamp: new Date().toISOString(),
      });

      config.lastCheck = Date.now();

    } catch (error) {
      this.emit('monitoring_error', {
        address,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Detect behavioral anomalies by comparing current vs baseline entropy
   */
  detectAnomalies(baseline, current, threshold) {
    if (!baseline || !current) return [];

    const anomalies = [];

    // Check for significant entropy changes
    const entropyDelta = Math.abs(current.overallScore - baseline.overallScore);
    if (entropyDelta > threshold) {
      anomalies.push({
        type: 'entropy_shift',
        severity: entropyDelta,
        description: entropyDelta > baseline.overallScore ? 
          'Increased behavioral entropy - more chaotic patterns' :
          'Decreased behavioral entropy - more predictable patterns',
      });
    }

    // Check for timing pattern changes
    if (baseline.timingEntropy && current.timingEntropy) {
      const timingDelta = Math.abs(current.timingEntropy - baseline.timingEntropy);
      if (timingDelta > 0.3) {
        anomalies.push({
          type: 'timing_anomaly',
          severity: timingDelta,
          description: 'Significant change in transaction timing patterns',
        });
      }
    }

    // Check for value distribution changes
    if (baseline.valueEntropy && current.valueEntropy) {
      const valueDelta = Math.abs(current.valueEntropy - baseline.valueEntropy);
      if (valueDelta > 0.4) {
        anomalies.push({
          type: 'value_anomaly',
          severity: valueDelta,
          description: 'Unusual transaction value distribution detected',
        });
      }
    }

    // Check for interaction pattern changes
    if (baseline.interactionEntropy && current.interactionEntropy) {
      const interactionDelta = Math.abs(current.interactionEntropy - baseline.interactionEntropy);
      if (interactionDelta > 0.3) {
        anomalies.push({
          type: 'interaction_anomaly',
          severity: interactionDelta,
          description: 'Change in recipient/interaction patterns',
        });
      }
    }

    return anomalies;
  }

  /**
   * Get current monitoring status
   */
  getMonitoringStatus() {
    return {
      monitoredAgents: Array.from(this.monitoredAgents.keys()),
      activeMonitors: Array.from(this.monitoringIntervals.keys()),
      totalAgents: this.monitoredAgents.size,
      uptime: process.uptime(),
    };
  }

  /**
   * Get agent network interactions
   */
  detectAgentNetworks(addresses) {
    const networks = [];
    const interactions = new Map();

    // Analyze transaction patterns between monitored addresses
    for (const address of addresses) {
      const config = this.monitoredAgents.get(address);
      if (!config || !config.activityHistory) continue;

      const addressInteractions = config.activityHistory
        .filter(tx => addresses.includes(tx.to))
        .map(tx => ({ from: address, to: tx.to, value: tx.value, timestamp: tx.timestamp }));

      interactions.set(address, addressInteractions);
    }

    // Find clusters of interacting agents
    const clusters = this.findInteractionClusters(interactions);
    
    return {
      networks: clusters,
      totalInteractions: Array.from(interactions.values()).flat().length,
      analysis: 'Agent network analysis complete',
    };
  }

  /**
   * Find clusters of frequently interacting agents
   */
  findInteractionClusters(interactions) {
    const clusters = [];
    const processed = new Set();

    for (const [address, txns] of interactions) {
      if (processed.has(address)) continue;

      const cluster = new Set([address]);
      const toProcess = [address];

      while (toProcess.length > 0) {
        const current = toProcess.pop();
        const currentTxns = interactions.get(current) || [];

        for (const tx of currentTxns) {
          if (!cluster.has(tx.to) && interactions.has(tx.to)) {
            cluster.add(tx.to);
            toProcess.push(tx.to);
          }
        }
      }

      if (cluster.size > 1) {
        clusters.push({
          agents: Array.from(cluster),
          size: cluster.size,
          interactionCount: Array.from(cluster)
            .map(addr => interactions.get(addr) || [])
            .flat().length,
        });

        cluster.forEach(addr => processed.add(addr));
      }
    }

    return clusters;
  }
}

export default BlockchainMonitor;