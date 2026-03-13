// Enhanced API routes for neural-nexus
// Designed for consumption by other AI agents and MCP servers

const express = require('express');
const { analyzeAgent, classifyBehavior } = require('./analyzer');
const { calculateEntropy } = require('./entropy');
const { detectBehavioralPattern } = require('./behavioral-patterns');
const { MultiAgentDynamicsAnalyzer } = require('./multi-agent-dynamics');
const { AutonomyScorer } = require('./autonomy-scorer');

const router = express.Router();
const multiAgentAnalyzer = new MultiAgentDynamicsAnalyzer();
const autonomyScorer = new AutonomyScorer();

// Autonomy scoring endpoint - the core feature
router.post('/autonomy-score', async (req, res) => {
    const { address } = req.body;
    
    if (!address) {
        return res.status(400).json({
            error: 'Wallet address is required'
        });
    }

    try {
        const result = await autonomyScorer.scoreWallet(address);
        
        res.json({
            success: true,
            ...result
        });
        
    } catch (error) {
        console.error('Autonomy scoring error:', error);
        res.status(500).json({
            error: error.message || 'Failed to analyze wallet autonomy'
        });
    }
});

// Real-time agent behavior stream
router.get('/stream/agent/:address', async (req, res) => {
    const { address } = req.params;
    
    // Set up Server-Sent Events
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    });

    const sendUpdate = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        // Initial analysis
        const analysis = await analyzeAgent(address);
        sendUpdate({
            type: 'initial_analysis',
            timestamp: Date.now(),
            address,
            data: analysis
        });

        // Set up periodic updates (every 30 seconds)
        const interval = setInterval(async () => {
            try {
                const currentAnalysis = await analyzeAgent(address);
                const entropy = await calculateEntropy(address);
                
                sendUpdate({
                    type: 'behavioral_update',
                    timestamp: Date.now(),
                    address,
                    data: {
                        ...currentAnalysis,
                        entropy_score: entropy,
                        trend: 'stable' // TODO: implement trend detection
                    }
                });
            } catch (error) {
                sendUpdate({
                    type: 'error',
                    timestamp: Date.now(),
                    error: error.message
                });
            }
        }, 30000);

        // Clean up on disconnect
        req.on('close', () => {
            clearInterval(interval);
        });

    } catch (error) {
        sendUpdate({
            type: 'error',
            timestamp: Date.now(),
            error: error.message
        });
    }
});

// Multi-agent behavioral dynamics analysis - THE NEW ALPHA
router.post('/dynamics/multi-agent', async (req, res) => {
    const { addresses, analysis_depth = 'standard' } = req.body;
    
    if (!addresses || !Array.isArray(addresses) || addresses.length < 2) {
        return res.status(400).json({
            error: 'At least 2 agent addresses required for multi-agent analysis'
        });
    }

    try {
        // Gather behavioral data for all agents
        const agentData = {};
        for (const address of addresses) {
            const analysis = await analyzeAgent(address);
            const patterns = await detectBehavioralPattern(address);
            
            agentData[address] = {
                ...analysis,
                patterns,
                transactions: analysis.recentTransactions || []
            };
        }

        // Perform multi-agent dynamics analysis
        const dynamics = await multiAgentAnalyzer.analyzeAgentCorrelations(agentData);

        // Build comprehensive response
        const response = {
            timestamp: Date.now(),
            agent_count: addresses.length,
            analysis_depth,
            correlations: {
                count: dynamics.correlations.size,
                data: Array.from(dynamics.correlations.entries()).map(([pair, correlation]) => ({
                    agents: pair.split('-'),
                    correlation: correlation.composite,
                    breakdown: correlation.breakdown,
                    interpretation: correlation.interpretation
                }))
            },
            swarm_behavior: dynamics.swarmMetrics,
            emergent_patterns: dynamics.emergentBehaviors,
            collective_intelligence_score: dynamics.collectiveIntelligence,
            recommendations: dynamics.actionableInsights
        };

        res.json(response);

    } catch (error) {
        console.error('Multi-agent dynamics analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze multi-agent dynamics'
        });
    }
});

// Agent discovery endpoint for finding new autonomous entities
router.get('/discovery/scan', async (req, res) => {
    const { 
        chain = 'ethereum',
        min_activity = 10,
        time_window = '7d',
        filters = {}
    } = req.query;

    try {
        // This would integrate with blockchain scanning infrastructure
        // For now, returning mock data structure
        
        const discoveredAgents = [
            {
                address: '0x742c41f23b6a5b7ac4b5d1ff3c8b3c2e1f9d8e7a',
                confidence_score: 0.89,
                behavior_classification: 'arbitrage_bot',
                first_seen: '2024-01-15T10:30:00Z',
                activity_metrics: {
                    transactions_24h: 157,
                    unique_contracts: 23,
                    gas_efficiency: 0.94
                }
            }
        ];

        res.json({
            discovered_agents: discoveredAgents,
            scan_timestamp: new Date().toISOString(),
            scan_parameters: {
                chain,
                min_activity,
                time_window,
                filters
            }
        });

    } catch (error) {
        console.error('Agent discovery error:', error);
        res.status(500).json({
            error: 'Failed to scan for new agents'
        });
    }
});

// Behavioral pattern classification for a specific agent
router.get('/patterns/:address', async (req, res) => {
    const { address } = req.params;
    
    try {
        const patterns = await detectBehavioralPattern(address);
        const classification = await classifyBehavior(address);
        
        res.json({
            address,
            timestamp: Date.now(),
            patterns,
            classification,
            confidence: patterns.confidence || 0.7
        });
        
    } catch (error) {
        console.error('Pattern analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze behavioral patterns'
        });
    }
});

// Agent reputation and trust scoring
router.get('/reputation/:address', async (req, res) => {
    const { address } = req.params;
    
    try {
        const analysis = await analyzeAgent(address);
        const patterns = await detectBehavioralPattern(address);
        
        // Calculate reputation score based on behavior consistency, 
        // transaction success rate, and interaction patterns
        const reputation = {
            overall_score: 0.78, // TODO: implement actual scoring
            behavioral_consistency: patterns.consistency || 0.8,
            interaction_quality: 0.85,
            transparency_score: 0.72,
            trust_indicators: {
                verified_contract_interactions: true,
                consistent_gas_patterns: true,
                no_suspicious_activity: true,
                positive_community_signals: false
            }
        };
        
        res.json({
            address,
            timestamp: Date.now(),
            reputation,
            analysis_depth: 'comprehensive'
        });
        
    } catch (error) {
        console.error('Reputation analysis error:', error);
        res.status(500).json({
            error: 'Failed to calculate reputation score'
        });
    }
});

// Get current network-wide agent statistics
router.get('/network/stats', async (req, res) => {
    try {
        // This would integrate with live network scanning
        const stats = {
            total_tracked_agents: 1247,
            active_24h: 89,
            new_discoveries_24h: 12,
            top_behaviors: [
                { type: 'arbitrage', count: 423 },
                { type: 'liquidity_provision', count: 201 },
                { type: 'nft_trading', count: 156 },
                { type: 'defi_yield_farming', count: 134 }
            ],
            network_health: {
                decentralization_score: 0.67,
                behavioral_diversity: 0.82,
                coordination_patterns: 0.23
            }
        };
        
        res.json({
            timestamp: Date.now(),
            stats,
            data_freshness: '5min'
        });
        
    } catch (error) {
        console.error('Network stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch network statistics'
        });
    }
});

module.exports = router;