#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest,
} from '@modelcontextprotocol/sdk/types.js';

// Import JavaScript modules (no type declarations needed)
const { AgentAnalyzer } = await import('./analyzer.js');
const { BlockchainMonitor } = await import('./monitor.js'); 
const { EntropyAnalyzer } = await import('./entropy.js');

class NeuralNexusServer {
  private server: Server;
  private analyzer: any;
  private monitor: any;
  private entropyAnalyzer: any;

  constructor() {
    this.server = new Server(
      {
        name: 'neural-nexus',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.analyzer = new AgentAnalyzer();
    this.monitor = new BlockchainMonitor();
    this.entropyAnalyzer = new EntropyAnalyzer();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async (request: ListToolsRequest) => {
      return {
        tools: [
          {
            name: 'analyze_agent_behavior',
            description: 'Analyze behavioral patterns of an on-chain agent by address',
            inputSchema: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  description: 'The agent\'s wallet address to analyze',
                },
                chainId: {
                  type: 'number',
                  description: 'Blockchain network ID (default: 1 for Ethereum)',
                  default: 1,
                },
                timeframe: {
                  type: 'string',
                  description: 'Analysis timeframe: 1h, 24h, 7d, 30d',
                  default: '24h',
                },
              },
              required: ['address'],
            },
          },
          {
            name: 'detect_agent_networks',
            description: 'Identify networks of interacting agents',
            inputSchema: {
              type: 'object',
              properties: {
                addresses: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of agent addresses to analyze for network patterns',
                },
                chainId: {
                  type: 'number',
                  description: 'Blockchain network ID',
                  default: 1,
                },
              },
              required: ['addresses'],
            },
          },
          {
            name: 'monitor_agent_activity',
            description: 'Start real-time monitoring of agent activity patterns',
            inputSchema: {
              type: 'object',
              properties: {
                addresses: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Addresses to monitor',
                },
                chainId: {
                  type: 'number',
                  description: 'Blockchain network ID',
                  default: 1,
                },
                alertThreshold: {
                  type: 'number',
                  description: 'Anomaly detection threshold (0-1)',
                  default: 0.7,
                },
              },
              required: ['addresses'],
            },
          },
          {
            name: 'calculate_autonomy_score',
            description: 'Calculate autonomy score based on behavioral entropy and patterns',
            inputSchema: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  description: 'Agent address to score',
                },
                chainId: {
                  type: 'number',
                  description: 'Blockchain network ID',
                  default: 1,
                },
              },
              required: ['address'],
            },
          },
          {
            name: 'get_trending_agents',
            description: 'Get currently trending or most active AI agents',
            inputSchema: {
              type: 'object',
              properties: {
                chainId: {
                  type: 'number',
                  description: 'Blockchain network ID',
                  default: 1,
                },
                timeframe: {
                  type: 'string',
                  description: 'Trending timeframe: 1h, 6h, 24h',
                  default: '24h',
                },
                limit: {
                  type: 'number',
                  description: 'Number of agents to return',
                  default: 10,
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'analyze_agent_behavior':
            return await this.handleAnalyzeAgentBehavior(args);
          case 'detect_agent_networks':
            return await this.handleDetectAgentNetworks(args);
          case 'monitor_agent_activity':
            return await this.handleMonitorAgentActivity(args);
          case 'calculate_autonomy_score':
            return await this.handleCalculateAutonomyScore(args);
          case 'get_trending_agents':
            return await this.handleGetTrendingAgents(args);
          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleAnalyzeAgentBehavior(args: any) {
    const { address, chainId = 1, timeframe = '24h' } = args;
    
    try {
      // Get blockchain activity
      const { getWalletActivity } = await import('./blockchain.js');
      const activity = await getWalletActivity(address, this.getChainName(chainId));
      
      if (!activity.recent_transactions || activity.recent_transactions.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `No recent activity found for agent ${address}`,
            },
          ],
        };
      }

      // Analyze patterns using our analyzer
      const analysis = await this.analyzer.analyzeAgent({
        name: `Agent ${address.slice(0, 10)}...`,
        address,
        type: 'unknown'
      });

      if (!analysis) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to analyze agent behavior for ${address}`,
            },
          ],
          isError: true,
        };
      }

      const result = {
        agent_address: address,
        chain_id: chainId,
        timeframe,
        analysis_timestamp: new Date().toISOString(),
        transaction_count: analysis.patterns.transactionCount,
        total_volume: `${analysis.patterns.totalVolume} ETH`,
        average_transaction: `${analysis.patterns.avgTransaction} ETH`,
        active_hours: analysis.patterns.activeHours,
        unique_recipients: analysis.patterns.uniqueRecipients,
        behavior_summary: analysis.behaviorSummary,
        sentiment: analysis.sentiment,
        entropy_analysis: analysis.entropyAnalysis || null,
        autonomy_indicators: this.extractAutonomyIndicators(analysis)
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing agent behavior: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleDetectAgentNetworks(args: any) {
    const { addresses, chainId = 1 } = args;
    
    // This would implement network analysis between agents
    // For now, return a placeholder
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            network_analysis: {
              total_agents: addresses.length,
              interconnections: [],
              clustering_coefficient: 0,
              network_density: 0,
              message: "Network analysis feature coming soon"
            }
          }, null, 2),
        },
      ],
    };
  }

  private async handleMonitorAgentActivity(args: any) {
    const { addresses, chainId = 1, alertThreshold = 0.7 } = args;
    
    // This would set up real-time monitoring
    // For now, return current status
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            monitoring_status: {
              addresses: addresses,
              chain_id: chainId,
              alert_threshold: alertThreshold,
              status: "monitoring_initialized",
              message: "Real-time monitoring feature coming soon"
            }
          }, null, 2),
        },
      ],
    };
  }

  private async handleCalculateAutonomyScore(args: any) {
    const { address, chainId = 1 } = args;
    
    try {
      const { getWalletActivity } = await import('./blockchain.js');
      const activity = await getWalletActivity(address, this.getChainName(chainId));
      
      if (!activity.recent_transactions || activity.recent_transactions.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                autonomy_score: {
                  address,
                  score: 0,
                  confidence: 0,
                  reason: "No transaction data available"
                }
              }, null, 2),
            },
          ],
        };
      }

      // Calculate autonomy score using entropy analysis
      const entropyAnalysis = await this.entropyAnalyzer.analyzeAgentEntropy(
        activity.recent_transactions,
        { agent: { address } }
      );

      const score = this.calculateAutonomyScore(entropyAnalysis);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              autonomy_score: {
                address,
                score: score.score,
                confidence: score.confidence,
                factors: score.factors,
                entropy_analysis: entropyAnalysis
              }
            }, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: `Error calculating autonomy score: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleGetTrendingAgents(args: any) {
    const { chainId = 1, timeframe = '24h', limit = 10 } = args;
    
    // This would query trending agents from various sources
    // For now, return known agents as examples
    const knownAgents = [
      {
        name: "AI16Z Agent",
        address: "0x1234567890abcdef1234567890abcdef12345678",
        type: "trading",
        activity_score: 8.5
      },
      {
        name: "Virtuals Agent",
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        type: "social", 
        activity_score: 7.2
      },
      {
        name: "Neural Nexus Demo",
        address: "0x742e4a8e2a1f6f4b8f4c4d4e4f4a4b4c4d4e4f4a",
        type: "experimental",
        activity_score: 6.8
      }
    ];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            trending_agents: {
              timeframe,
              chain_id: chainId,
              agents: knownAgents.slice(0, limit),
              last_updated: new Date().toISOString()
            }
          }, null, 2),
        },
      ],
    };
  }

  private getChainName(chainId: number): string {
    const chains: { [key: number]: string } = {
      1: 'mainnet',
      8453: 'base',
      42161: 'arbitrum',
      137: 'polygon'
    };
    return chains[chainId] || 'mainnet';
  }

  private extractAutonomyIndicators(analysis: any) {
    return {
      temporal_regularity: analysis.entropyAnalysis?.temporal?.pattern || 'unknown',
      behavioral_complexity: analysis.entropyAnalysis?.behavioral?.pattern || 'unknown',
      decision_entropy: analysis.entropyAnalysis?.overall_entropy || 0,
      autonomy_probability: analysis.entropyAnalysis?.autonomy_probability || 0
    };
  }

  private calculateAutonomyScore(entropyAnalysis: any) {
    let score = 0;
    let confidence = 0;
    const factors = [];

    if (entropyAnalysis.temporal) {
      score += entropyAnalysis.temporal.score || 0;
      factors.push(`temporal_score: ${entropyAnalysis.temporal.score}`);
    }

    if (entropyAnalysis.behavioral) {
      score += entropyAnalysis.behavioral.score || 0;
      factors.push(`behavioral_score: ${entropyAnalysis.behavioral.score}`);
    }

    // Normalize to 0-10 scale
    score = Math.min(score / 2, 10);
    confidence = entropyAnalysis.autonomy_probability || 0;

    return {
      score: Math.round(score * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      factors
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Neural Nexus MCP server running...');
  }
}

// Start the server
const server = new NeuralNexusServer();
server.start().catch(console.error);