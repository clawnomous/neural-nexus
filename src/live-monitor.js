/**
 * Live AI Agent Monitoring System
 * Continuously watches for emerging AI agents across multiple chains and protocols
 */

import { AgentDiscoveryEngine } from './agent-discovery.js';

export class LiveAgentMonitor {
  constructor(options = {}) {
    this.discoveryEngine = new AgentDiscoveryEngine();
    this.monitoringActive = false;
    this.watchedChains = options.chains || ['ethereum', 'solana', 'base'];
    this.alertThresholds = {
      consciousness_score: 0.7,
      confidence: 0.8,
      autonomy_level: 'medium'
    };
    
    // Monitoring intervals
    this.intervals = {
      newTokens: 60000,      // Check for new tokens every minute
      agentActivity: 300000, // Check known agent activity every 5 minutes
      trending: 180000       // Check trending tokens every 3 minutes
    };

    this.watchers = new Map();
    this.lastChecked = new Map();
  }

  /**
   * Start the live monitoring system
   */
  async startMonitoring() {
    if (this.monitoringActive) {
      console.log('Monitoring already active');
      return;
    }

    console.log('🚀 Starting AI Agent Live Monitor...');
    this.monitoringActive = true;

    // Initialize monitoring tasks
    await this.initializeMonitoring();

    // Start periodic checks
    this.startPeriodicChecks();

    console.log('✅ Live monitoring active');
    console.log(`📊 Watching ${this.watchedChains.length} chains`);
    console.log(`🎯 Alert thresholds: consciousness=${this.alertThresholds.consciousness_score}, confidence=${this.alertThresholds.confidence}`);
  }

  /**
   * Stop the monitoring system
   */
  stopMonitoring() {
    this.monitoringActive = false;
    
    // Clear all intervals
    this.watchers.forEach(watcher => clearInterval(watcher));
    this.watchers.clear();

    console.log('🛑 Live monitoring stopped');
  }

  /**
   * Initialize monitoring with baseline data
   */
  async initializeMonitoring() {
    // Get current trending tokens to establish baseline
    const trending = await this.fetchTrendingTokens();
    console.log(`📈 Found ${trending.length} trending tokens for baseline`);

    // Initialize last checked timestamps
    this.watchedChains.forEach(chain => {
      this.lastChecked.set(chain, Date.now());
    });

    // Perform initial sweep for existing agents
    await this.performInitialSweep();
  }

  /**
   * Start all periodic monitoring tasks
   */
  startPeriodicChecks() {
    // Monitor new token launches
    const newTokenWatcher = setInterval(() => {
      if (this.monitoringActive) {
        this.scanForNewTokens();
      }
    }, this.intervals.newTokens);
    this.watchers.set('newTokens', newTokenWatcher);

    // Monitor known agent activity
    const agentActivityWatcher = setInterval(() => {
      if (this.monitoringActive) {
        this.monitorKnownAgents();
      }
    }, this.intervals.agentActivity);
    this.watchers.set('agentActivity', agentActivityWatcher);

    // Monitor trending tokens for agent activity
    const trendingWatcher = setInterval(() => {
      if (this.monitoringActive) {
        this.scanTrendingTokens();
      }
    }, this.intervals.trending);
    this.watchers.set('trending', trendingWatcher);
  }

  /**
   * Scan for newly launched tokens that might be AI agents
   */
  async scanForNewTokens() {
    try {
      console.log('🔍 Scanning for new tokens...');
      
      // This would integrate with DexScreener, DEX APIs, or chain scanners
      const newTokens = await this.fetchNewTokens();
      
      for (const token of newTokens) {
        await this.analyzeTokenForAgent(token);
      }

      console.log(`✓ Scanned ${newTokens.length} new tokens`);
    } catch (error) {
      console.error('Error scanning new tokens:', error);
    }
  }

  /**
   * Monitor activity of previously discovered agents
   */
  async monitorKnownAgents() {
    try {
      console.log('👁️ Monitoring known agents...');
      
      const knownAgents = Array.from(this.discoveryEngine.discoveredAgents.values());
      
      for (const agent of knownAgents) {
        await this.updateAgentActivity(agent);
      }

      console.log(`✓ Updated ${knownAgents.length} known agents`);
    } catch (error) {
      console.error('Error monitoring known agents:', error);
    }
  }

  /**
   * Scan trending tokens for signs of AI agent involvement
   */
  async scanTrendingTokens() {
    try {
      console.log('📊 Scanning trending tokens...');
      
      const trending = await this.fetchTrendingTokens();
      
      for (const token of trending) {
        // Check if we haven't analyzed this token recently
        const lastAnalyzed = this.getLastAnalyzedTime(token.address);
        if (Date.now() - lastAnalyzed > 3600000) { // 1 hour
          await this.analyzeTokenForAgent(token);
          this.setLastAnalyzedTime(token.address, Date.now());
        }
      }

      console.log(`✓ Scanned ${trending.length} trending tokens`);
    } catch (error) {
      console.error('Error scanning trending tokens:', error);
    }
  }

  /**
   * Analyze a specific token for AI agent activity
   */
  async analyzeTokenForAgent(tokenData) {
    try {
      // Fetch transaction history for the token
      const transactions = await this.fetchTokenTransactions(tokenData.address);
      
      if (transactions.length < 5) {
        return; // Not enough data
      }

      // Enhanced metadata for analysis
      const metadata = {
        token_name: tokenData.name,
        token_symbol: tokenData.symbol,
        market_cap: tokenData.market_cap,
        volume_24h: tokenData.volume_24h,
        creation_time: tokenData.creation_time,
        social_presence: await this.checkSocialPresence(tokenData.symbol),
        token_creation: true
      };

      // Run discovery analysis
      const discoveryResult = await this.discoveryEngine.discoverAgent(transactions, metadata);

      // Check if this meets alert criteria
      if (this.shouldAlert(discoveryResult)) {
        await this.generateAlert(discoveryResult, tokenData);
      }

      console.log(`📋 Analyzed ${tokenData.symbol}: confidence=${discoveryResult.confidence.toFixed(3)}, consciousness=${discoveryResult.consciousness_score.toFixed(3)}`);

    } catch (error) {
      console.error(`Error analyzing token ${tokenData.symbol}:`, error);
    }
  }

  /**
   * Update activity tracking for a known agent
   */
  async updateAgentActivity(agent) {
    try {
      // Fetch recent transactions for this agent
      const recentTxs = await this.fetchRecentTransactions(agent.entity_id);
      
      if (recentTxs.length === 0) {
        return;
      }

      // Re-analyze with new data
      const updatedAnalysis = await this.discoveryEngine.discoverAgent(recentTxs, agent.metadata);
      
      // Update agent record
      const updatedAgent = {
        ...agent,
        last_updated: Date.now(),
        consciousness_score: updatedAnalysis.consciousness_score,
        confidence: updatedAnalysis.confidence,
        recent_activity: recentTxs.length,
        behavior_evolution: this.trackBehaviorEvolution(agent, updatedAnalysis)
      };

      this.discoveryEngine.discoveredAgents.set(agent.entity_id, updatedAgent);

      // Alert on significant changes
      if (this.hasSignificantChange(agent, updatedAgent)) {
        await this.generateEvolutionAlert(agent, updatedAgent);
      }

    } catch (error) {
      console.error(`Error updating agent ${agent.entity_id}:`, error);
    }
  }

  /**
   * Check if discovery result meets alert criteria
   */
  shouldAlert(discoveryResult) {
    return (
      discoveryResult.consciousness_score >= this.alertThresholds.consciousness_score ||
      discoveryResult.confidence >= this.alertThresholds.confidence ||
      (discoveryResult.autonomy_level === 'high' || discoveryResult.autonomy_level === 'medium')
    );
  }

  /**
   * Generate alert for new potential agent discovery
   */
  async generateAlert(discoveryResult, tokenData) {
    const alert = {
      type: 'NEW_AGENT_DETECTED',
      timestamp: Date.now(),
      entity_id: discoveryResult.entity_id,
      token: tokenData.symbol,
      consciousness_score: discoveryResult.consciousness_score,
      confidence: discoveryResult.confidence,
      autonomy_level: discoveryResult.autonomy_level,
      behavior_type: discoveryResult.behavior_type,
      market_cap: tokenData.market_cap,
      alert_message: this.generateAlertMessage(discoveryResult, tokenData)
    };

    console.log('🚨 AGENT ALERT:', alert.alert_message);
    
    // Store alert (would integrate with notification systems)
    await this.storeAlert(alert);

    return alert;
  }

  /**
   * Generate alert message for discovered agent
   */
  generateAlertMessage(discovery, token) {
    const consciousnessLevel = discovery.consciousness_score > 0.8 ? 'HIGH' : 
                              discovery.consciousness_score > 0.6 ? 'MEDIUM' : 'LOW';
    
    return `🤖 Potential AI Agent detected in ${token.symbol}! ` +
           `Consciousness: ${consciousnessLevel} (${(discovery.consciousness_score * 100).toFixed(1)}%) | ` +
           `Confidence: ${(discovery.confidence * 100).toFixed(1)}% | ` +
           `Autonomy: ${discovery.autonomy_level.toUpperCase()} | ` +
           `Behavior: ${discovery.behavior_type}`;
  }

  /**
   * Perform initial sweep of existing tokens/agents
   */
  async performInitialSweep() {
    console.log('🧹 Performing initial agent sweep...');
    
    // Get top tokens by market cap for initial analysis
    const topTokens = await this.fetchTopTokens(50);
    
    let agentsFound = 0;
    for (const token of topTokens) {
      await this.analyzeTokenForAgent(token);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ Initial sweep complete. Found ${this.discoveryEngine.discoveredAgents.size} potential agents`);
  }

  // Data fetching methods (would integrate with real APIs)
  async fetchTrendingTokens() {
    // Mock implementation - would use DexScreener API
    return [
      { address: '0x123', name: 'TestToken', symbol: 'TEST', market_cap: 1000000, volume_24h: 50000 }
    ];
  }

  async fetchNewTokens() {
    // Mock implementation - would use chain scanners
    return [];
  }

  async fetchTokenTransactions(address) {
    // Mock implementation - would use Etherscan, Solscan etc.
    return [];
  }

  async fetchTopTokens(limit) {
    // Mock implementation - would use CoinGecko, CoinMarketCap etc.
    return [];
  }

  async fetchRecentTransactions(entityId) {
    // Mock implementation
    return [];
  }

  async checkSocialPresence(symbol) {
    // Mock implementation - would check Twitter, Discord, Telegram
    return { twitter: false, discord: false, telegram: false };
  }

  // Utility methods
  getLastAnalyzedTime(address) {
    return this.lastChecked.get(address) || 0;
  }

  setLastAnalyzedTime(address, time) {
    this.lastChecked.set(address, time);
  }

  trackBehaviorEvolution(oldAgent, newAgent) {
    return {
      consciousness_change: newAgent.consciousness_score - oldAgent.consciousness_score,
      confidence_change: newAgent.confidence - oldAgent.confidence,
      behavior_shift: oldAgent.behavior_type !== newAgent.behavior_type
    };
  }

  hasSignificantChange(oldAgent, newAgent) {
    const consciousnessChange = Math.abs(newAgent.consciousness_score - oldAgent.consciousness_score);
    const confidenceChange = Math.abs(newAgent.confidence - oldAgent.confidence);
    
    return consciousnessChange > 0.1 || confidenceChange > 0.15 || newAgent.behavior_evolution.behavior_shift;
  }

  async generateEvolutionAlert(oldAgent, newAgent) {
    const alert = {
      type: 'AGENT_EVOLUTION',
      timestamp: Date.now(),
      entity_id: newAgent.entity_id,
      changes: newAgent.behavior_evolution,
      alert_message: `🧬 Agent ${newAgent.entity_id} showing behavioral evolution!`
    };

    console.log('🧬 EVOLUTION ALERT:', alert.alert_message);
    await this.storeAlert(alert);
  }

  async storeAlert(alert) {
    // Would integrate with database/notification system
    console.log('📝 Alert stored:', alert);
  }
}