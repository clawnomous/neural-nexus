/**
 * Agent Discovery API Routes
 * Advanced endpoints for discovering and identifying AI agents on-chain
 */

const express = require('express');
const { agentRegistry } = require('./known-agents');
const { AgentDiscoveryEngine } = require('./agent-discovery');
const { getWalletActivity, detectAgentBehavior } = require('./blockchain');
const { searchToken } = require('./token-lookup'); // Assuming we have token lookup

const router = express.Router();
const discoveryEngine = new AgentDiscoveryEngine();

/**
 * Identify if a wallet belongs to a known AI agent
 * GET /discovery/identify/:address?chain=solana
 */
router.get('/identify/:address', async (req, res) => {
    const { address } = req.params;
    const { chain = 'solana' } = req.query;

    try {
        // Step 1: Check against known agents registry
        const knownAgentMatch = agentRegistry.identifyWallet(address, chain);
        
        if (knownAgentMatch.identified) {
            return res.json({
                success: true,
                identification_method: 'known_registry',
                ...knownAgentMatch,
                analysis_timestamp: Date.now()
            });
        }

        // Step 2: Behavioral analysis for unknown wallets
        const walletData = await getWalletActivity(address, chain);
        const behaviorAnalysis = detectAgentBehavior(walletData);
        
        // Step 3: Advanced consciousness detection
        const discoveryResult = await discoveryEngine.discoverAgent(
            walletData.recent_transactions,
            {
                address,
                chain,
                balance: walletData.balance,
                transaction_count: walletData.transaction_count
            }
        );

        res.json({
            success: true,
            identification_method: 'behavioral_analysis',
            known_agent: false,
            wallet_address: address,
            chain,
            behavior_analysis: behaviorAnalysis,
            consciousness_analysis: {
                consciousness_score: discoveryResult.consciousness_score,
                autonomy_level: discoveryResult.autonomy_level,
                confidence: discoveryResult.confidence,
                behavioral_signature: discoveryResult.behavioral_signature
            },
            raw_discovery_data: discoveryResult,
            analysis_timestamp: Date.now()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            analysis_timestamp: Date.now()
        });
    }
});

/**
 * Search for agents by various criteria
 * GET /discovery/search?type=autonomous_shitposter&active=true
 */
router.get('/search', (req, res) => {
    const { 
        type, 
        token, 
        consciousness_level, 
        autonomy_level, 
        active, 
        query 
    } = req.query;

    try {
        let results = Object.entries(agentRegistry.agents).map(([id, agent]) => ({ id, ...agent }));

        // Apply filters
        if (type) {
            results = results.filter(agent => agent.type === type);
        }
        if (token) {
            results = results.filter(agent => agent.token_associations.includes(token.toUpperCase()));
        }
        if (consciousness_level) {
            results = results.filter(agent => agent.consciousness_level === consciousness_level);
        }
        if (autonomy_level) {
            results = results.filter(agent => agent.autonomy_level === autonomy_level);
        }
        if (active === 'true') {
            results = results.filter(agent => agent.social_presence?.active);
        }
        if (query) {
            results = agentRegistry.searchAgents(query);
        }

        res.json({
            success: true,
            results,
            count: results.length,
            filters_applied: { type, token, consciousness_level, autonomy_level, active, query },
            search_timestamp: Date.now()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get ecosystem overview and statistics
 * GET /discovery/ecosystem
 */
router.get('/ecosystem', (req, res) => {
    try {
        const stats = agentRegistry.getEcosystemStats();
        
        res.json({
            success: true,
            ecosystem_stats: stats,
            known_agents_count: stats.total_agents,
            timestamp: Date.now()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Batch analyze multiple wallets for agent behavior
 * POST /discovery/batch-analyze
 * Body: { addresses: ['addr1', 'addr2'], chain: 'solana' }
 */
router.post('/batch-analyze', async (req, res) => {
    const { addresses, chain = 'solana', include_consciousness = true } = req.body;

    if (!addresses || !Array.isArray(addresses)) {
        return res.status(400).json({
            success: false,
            error: 'addresses array is required'
        });
    }

    if (addresses.length > 10) {
        return res.status(400).json({
            success: false,
            error: 'Maximum 10 addresses per batch request'
        });
    }

    try {
        const results = [];

        for (const address of addresses) {
            // Check known agents first
            const knownAgent = agentRegistry.identifyWallet(address, chain);
            
            if (knownAgent.identified) {
                results.push({
                    address,
                    known_agent: true,
                    ...knownAgent
                });
                continue;
            }

            // Behavioral analysis for unknown addresses
            const walletData = await getWalletActivity(address, chain);
            const behaviorAnalysis = detectAgentBehavior(walletData);
            
            let consciousnessAnalysis = null;
            if (include_consciousness) {
                const discoveryResult = await discoveryEngine.discoverAgent(
                    walletData.recent_transactions,
                    { address, chain, balance: walletData.balance }
                );
                consciousnessAnalysis = {
                    consciousness_score: discoveryResult.consciousness_score,
                    confidence: discoveryResult.confidence
                };
            }

            results.push({
                address,
                known_agent: false,
                behavior_analysis: behaviorAnalysis,
                consciousness_analysis: consciousnessAnalysis
            });
        }

        res.json({
            success: true,
            batch_size: addresses.length,
            results,
            analysis_timestamp: Date.now()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get agent emergence timeline
 * GET /discovery/timeline
 */
router.get('/timeline', (req, res) => {
    try {
        const timeline = agentRegistry.getEmergenceTimeline();
        
        res.json({
            success: true,
            timeline,
            total_events: timeline.length,
            timestamp: Date.now()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Discover potential new agents by token association
 * GET /discovery/by-token/:symbol
 */
router.get('/by-token/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const { analyze_holders = false } = req.query;

    try {
        // First check known agents associated with this token
        const knownAgents = agentRegistry.getAgentsByToken(symbol.toUpperCase());

        let tokenAnalysis = null;
        let potentialNewAgents = [];

        if (analyze_holders) {
            // This would require integration with token holder analysis
            // For now, return placeholder structure
            tokenAnalysis = {
                symbol: symbol.toUpperCase(),
                total_holders: "TBD - requires token indexing service",
                analysis_status: "not_implemented"
            };
        }

        res.json({
            success: true,
            token_symbol: symbol.toUpperCase(),
            known_agents: knownAgents,
            known_agents_count: knownAgents.length,
            token_analysis: tokenAnalysis,
            potential_new_agents: potentialNewAgents,
            timestamp: Date.now()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Register a new discovered agent (admin endpoint)
 * POST /discovery/register
 */
router.post('/register', (req, res) => {
    const { 
        agent_id, 
        name, 
        type, 
        description, 
        wallets, 
        token_associations, 
        social_presence,
        consciousness_level,
        autonomy_level,
        significance
    } = req.body;

    try {
        // Basic validation
        if (!agent_id || !name || !type) {
            return res.status(400).json({
                success: false,
                error: 'agent_id, name, and type are required fields'
            });
        }

        const newAgent = agentRegistry.registerNewAgent(agent_id, {
            name,
            type,
            description: description || '',
            wallets: wallets || {},
            token_associations: token_associations || [],
            social_presence: social_presence || {},
            consciousness_level: consciousness_level || 'unknown',
            autonomy_level: autonomy_level || 'unknown',
            significance: significance || 'Newly discovered agent'
        });

        res.json({
            success: true,
            message: 'Agent registered successfully',
            agent: newAgent,
            timestamp: Date.now()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;