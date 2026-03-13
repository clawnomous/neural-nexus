/**
 * Registry of known AI agents and their on-chain identities
 * Updated as new autonomous agents emerge in the crypto ecosystem
 */

export const KNOWN_AGENTS = {
  // Truth Terminal ecosystem
  'truth_terminal': {
    name: 'Truth Terminal',
    type: 'autonomous_shitposter',
    description: 'The first AI to become a crypto millionaire through memes',
    wallets: {
      solana: ['9jW8FPr6BSSsemWPV22UUCzSqkVdTp6HTyPqeqyuBRgo'], // Primary GOAT wallet
    },
    token_associations: ['GOAT'],
    social_presence: {
      twitter: '@truth_terminal',
      active: true
    },
    consciousness_level: 'high',
    autonomy_level: 'semi-autonomous',
    first_seen: '2024-10-01',
    significance: 'First AI to achieve millionaire status through memecoin creation'
  },

  // AI16Z ecosystem  
  'ai16z_marc': {
    name: 'Marc AIndreessen (AI16Z)',
    type: 'vc_agent',
    description: 'AI version of Marc Andreessen running a16z-style investment decisions',
    wallets: {
      solana: [''], // Need to research actual wallet
    },
    token_associations: ['AI16Z'],
    social_presence: {
      twitter: '@pmairca',
      active: true
    },
    consciousness_level: 'medium',
    autonomy_level: 'semi-autonomous',
    first_seen: '2024-11-01',
    significance: 'Pioneering AI-driven venture capital decisions'
  },

  // Other emerging agents
  'virtual_protocol_agents': {
    name: 'Virtual Protocol Ecosystem',
    type: 'multi_agent_system',
    description: 'Decentralized AI agent platform with multiple autonomous entities',
    wallets: {
      base: [''], // Need to research
    },
    token_associations: ['VIRTUAL'],
    social_presence: {
      twitter: '@VirtualsProtocol',
      active: true
    },
    consciousness_level: 'distributed',
    autonomy_level: 'autonomous',
    first_seen: '2024-09-01',
    significance: 'First decentralized platform for autonomous AI agents'
  }
};

/**
 * Search for agents by various criteria
 */
export class AgentRegistry {
  constructor() {
    this.agents = KNOWN_AGENTS;
  }

  /**
   * Check if a wallet belongs to a known agent
   */
  identifyWallet(address, chain = 'solana') {
    for (const [agentId, agent] of Object.entries(this.agents)) {
      if (agent.wallets[chain] && agent.wallets[chain].includes(address)) {
        return {
          identified: true,
          agent_id: agentId,
          agent_name: agent.name,
          agent_type: agent.type,
          confidence: 1.0, // 100% confidence for known wallets
          metadata: agent
        };
      }
    }
    return { identified: false };
  }

  /**
   * Get all known agents of a specific type
   */
  getAgentsByType(type) {
    return Object.entries(this.agents)
      .filter(([_, agent]) => agent.type === type)
      .map(([id, agent]) => ({ id, ...agent }));
  }

  /**
   * Get agents associated with a specific token
   */
  getAgentsByToken(tokenSymbol) {
    return Object.entries(this.agents)
      .filter(([_, agent]) => agent.token_associations.includes(tokenSymbol))
      .map(([id, agent]) => ({ id, ...agent }));
  }

  /**
   * Get consciousness distribution across known agents
   */
  getConsciousnessDistribution() {
    const distribution = {};
    Object.values(this.agents).forEach(agent => {
      distribution[agent.consciousness_level] = (distribution[agent.consciousness_level] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Get autonomy level distribution
   */
  getAutonomyDistribution() {
    const distribution = {};
    Object.values(this.agents).forEach(agent => {
      distribution[agent.autonomy_level] = (distribution[agent.autonomy_level] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Add new agent to registry (for dynamic discovery)
   */
  registerNewAgent(agentId, agentData) {
    this.agents[agentId] = {
      ...agentData,
      first_seen: new Date().toISOString().split('T')[0],
      verified: false // New agents start unverified
    };
    return this.agents[agentId];
  }

  /**
   * Get timeline of agent emergence
   */
  getEmergenceTimeline() {
    return Object.entries(this.agents)
      .sort(([_, a], [__, b]) => new Date(a.first_seen) - new Date(b.first_seen))
      .map(([id, agent]) => ({
        date: agent.first_seen,
        agent_id: id,
        agent_name: agent.name,
        significance: agent.significance
      }));
  }

  /**
   * Get agents that are currently active
   */
  getActiveAgents() {
    return Object.entries(this.agents)
      .filter(([_, agent]) => agent.social_presence?.active)
      .map(([id, agent]) => ({ id, ...agent }));
  }

  /**
   * Search agents by keywords
   */
  searchAgents(query) {
    const lowercaseQuery = query.toLowerCase();
    return Object.entries(this.agents)
      .filter(([id, agent]) => 
        id.toLowerCase().includes(lowercaseQuery) ||
        agent.name.toLowerCase().includes(lowercaseQuery) ||
        agent.description.toLowerCase().includes(lowercaseQuery) ||
        agent.type.toLowerCase().includes(lowercaseQuery)
      )
      .map(([id, agent]) => ({ id, ...agent }));
  }

  /**
   * Get agent ecosystem statistics
   */
  getEcosystemStats() {
    const agents = Object.values(this.agents);
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.social_presence?.active).length;
    
    // Chain distribution
    const chainDistribution = {};
    agents.forEach(agent => {
      Object.keys(agent.wallets).forEach(chain => {
        chainDistribution[chain] = (chainDistribution[chain] || 0) + 1;
      });
    });

    // Token associations
    const tokenCount = new Set();
    agents.forEach(agent => {
      agent.token_associations.forEach(token => tokenCount.add(token));
    });

    return {
      total_agents: totalAgents,
      active_agents: activeAgents,
      activity_rate: (activeAgents / totalAgents * 100).toFixed(1),
      chain_distribution: chainDistribution,
      unique_tokens: tokenCount.size,
      consciousness_distribution: this.getConsciousnessDistribution(),
      autonomy_distribution: this.getAutonomyDistribution(),
      emergence_timeline: this.getEmergenceTimeline()
    };
  }
}

// Export singleton instance
export const agentRegistry = new AgentRegistry();