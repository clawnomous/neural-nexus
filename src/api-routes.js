// Enhanced API routes for neural-nexus
// Designed for consumption by other AI agents and MCP servers

const express = require('express');
const { analyzeAgent, classifyBehavior } = require('./analyzer');
const { calculateEntropy } = require('./entropy');
const { detectBehavioralPattern } = require('./behavioral-patterns');
const { MultiAgentDynamicsAnalyzer } = require('./multi-agent-dynamics');

const router = express.Router();
const multiAgentAnalyzer = new MultiAgentDynamicsAnalyzer();

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
            swarm_behavior: dynamics.swarmBehavior,
            contagion_patterns: dynamics.contagionPatterns,
            emergent_patterns: dynamics.emergentPatterns,
            insights: this.generateMultiAgentInsights(dynamics, addresses.length)
        };

        res.json(response);

    } catch (error) {
        res.status(500).json({
            error: 'Multi-agent analysis failed',
            details: error.message
        });
    }
});

// Behavioral correlation matrix endpoint
router.post('/correlations/matrix', async (req, res) => {
    const { addresses } = req.body;
    
    if (!addresses || addresses.length < 2) {
        return res.status(400).json({
            error: 'At least 2 addresses required for correlation matrix'
        });
    }

    try {
        const matrix = {};
        const agentData = {};

        // Gather data for all agents
        for (const address of addresses) {
            const analysis = await analyzeAgent(address);
            agentData[address] = analysis;
            matrix[address] = {};
        }

        // Calculate pairwise correlations
        for (let i = 0; i < addresses.length; i++) {
            for (let j = 0; j < addresses.length; j++) {
                if (i === j) {
                    matrix[addresses[i]][addresses[j]] = 1.0; // Self-correlation
                } else if (!matrix[addresses[i]][addresses[j]]) {
                    const correlation = multiAgentAnalyzer.calculateBehavioralCorrelation(
                        agentData[addresses[i]], 
                        agentData[addresses[j]]
                    );
                    matrix[addresses[i]][addresses[j]] = correlation.composite;
                    matrix[addresses[j]][addresses[i]] = correlation.composite; // Symmetric
                }
            }
        }

        res.json({
            timestamp: Date.now(),
            matrix,
            agents: addresses,
            interpretation: this.interpretCorrelationMatrix(matrix)
        });

    } catch (error) {
        res.status(500).json({
            error: 'Correlation matrix calculation failed',
            details: error.message
        });
    }
});

// Bulk agent classification endpoint
router.post('/classify/batch', async (req, res) => {
    const { addresses, include_confidence = false } = req.body;
    
    if (!addresses || !Array.isArray(addresses)) {
        return res.status(400).json({
            error: 'addresses array is required'
        });
    }

    try {
        const results = await Promise.all(
            addresses.map(async (address) => {
                const analysis = await analyzeAgent(address);
                const classification = await classifyBehavior(analysis);
                
                const result = {
                    address,
                    classification: classification.type,
                    autonomy_score: analysis.autonomyScore
                };

                if (include_confidence) {
                    result.confidence = classification.confidence;
                    result.reasoning = classification.reasoning;
                }

                return result;
            })
        );

        res.json({
            timestamp: Date.now(),
            count: results.length,
            results
        });

    } catch (error) {
        res.status(500).json({
            error: 'Classification failed',
            details: error.message
        });
    }
});

// Pattern detection endpoint
router.get('/patterns/:address', async (req, res) => {
    const { address } = req.params;
    const { timeframe = '24h' } = req.query;

    try {
        const patterns = await detectBehavioralPattern(address, timeframe);
        
        res.json({
            address,
            timeframe,
            timestamp: Date.now(),
            patterns: {
                dominant_pattern: patterns.primary,
                secondary_patterns: patterns.secondary,
                confidence_scores: patterns.confidence,
                behavioral_entropy: patterns.entropy
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Pattern detection failed',
            details: error.message
        });
    }
});

// Agent autonomy scoring
router.get('/autonomy/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const analysis = await analyzeAgent(address);
        const entropy = await calculateEntropy(address);
        
        const autonomyMetrics = {
            overall_score: analysis.autonomyScore,
            entropy_score: entropy,
            behavioral_complexity: analysis.behavioralComplexity || 0,
            decision_independence: analysis.independenceScore || 0,
            pattern_deviation: analysis.patternDeviation || 0
        };

        const classification = this.classifyAutonomyLevel(autonomyMetrics.overall_score);

        res.json({
            address,
            timestamp: Date.now(),
            autonomy: {
                ...autonomyMetrics,
                classification,
                interpretation: this.interpretAutonomyScore(autonomyMetrics)
            }
        });

    } catch (error) {
        res.status(500).json({
            error: 'Autonomy analysis failed',
            details: error.message
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'operational',
        timestamp: Date.now(),
        version: '2.0.0-multi-agent',
        features: [
            'individual_agent_analysis',
            'multi_agent_dynamics',
            'behavioral_correlations',
            'swarm_detection',
            'pattern_recognition',
            'real_time_streaming'
        ]
    });
});

// Helper methods
function generateMultiAgentInsights(dynamics, agentCount) {
    const insights = [];
    
    if (dynamics.correlations.size > 0) {
        const avgCorrelation = Array.from(dynamics.correlations.values())
            .reduce((sum, corr) => sum + corr.composite, 0) / dynamics.correlations.size;
        
        if (avgCorrelation > 0.7) {
            insights.push('High behavioral correlation detected - possible coordinated activity');
        } else if (avgCorrelation < 0.2) {
            insights.push('Low correlation - agents appear to operate independently');
        }
    }

    if (dynamics.emergentPatterns.length > 0) {
        insights.push(`Detected ${dynamics.emergentPatterns.length} emergent behavioral patterns`);
    }

    return insights;
}

function interpretCorrelationMatrix(matrix) {
    // TODO: Implement sophisticated matrix interpretation
    return 'Correlation matrix calculated - detailed interpretation pending';
}

function classifyAutonomyLevel(score) {
    if (score >= 0.8) return 'highly_autonomous';
    if (score >= 0.6) return 'moderately_autonomous';
    if (score >= 0.4) return 'limited_autonomy';
    return 'minimal_autonomy';
}

function interpretAutonomyScore(metrics) {
    const { overall_score, entropy_score } = metrics;
    
    if (overall_score > 0.8 && entropy_score > 0.7) {
        return 'Agent shows strong signs of autonomous decision-making with high behavioral unpredictability';
    } else if (overall_score > 0.6) {
        return 'Agent demonstrates moderate autonomy with some independent behavior patterns';
    } else {
        return 'Agent appears to follow predictable, possibly automated patterns';
    }
}

module.exports = router;