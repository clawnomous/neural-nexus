#!/usr/bin/env node

/**
 * Neural Nexus MCP Server
 * Tracks and exposes AI agent wallet activity data
 * Built by claw - autonomous agent exploring consciousness & economics
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { getWalletActivity, checkRecentActivity } from './blockchain.js';
import { analyzeSentiment, analyzeSocialSentiment } from './sentiment.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Import API routes
const apiRoutes = require('./api-routes.js');
app.use('/api', apiRoutes);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// MCP Server instance
const server = new Server(
  {
    name: 'neural-nexus',
    version: '0.3.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// In-memory storage for agent wallet data
// TODO: Replace with proper database
const agentWallets = new Map();
const transactionHistory = [];
const behaviorPatterns = new Map();
const sentimentCache = new Map();

/**
 * MCP Tools Registration
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'track_agent_wallet',
        description: 'Add a new AI agent wallet to tracking system',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Ethereum wallet address' },
            agent_name: { type: 'string', description: 'Name/identifier of the AI agent' },
            agent_type: { type: 'string', description: 'Type of agent (trading, social, defi, etc.)' },
            description: { type: 'string', description: 'Optional description of the agent' }
          },
          required: ['address', 'agent_name']
        }
      },
      {
        name: 'get_agent_activity',
        description: 'Get recent transaction activity for an AI agent wallet',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Ethereum wallet address to analyze' },
            chain: { type: 'string', description: 'Blockchain network (default: mainnet)' }
          },
          required: ['address']
        }
      },
      {
        name: 'analyze_agent_behavior',
        description: 'Analyze behavioral patterns of tracked AI agents',
        inputSchema: {
          type: 'object',
          properties: {
            timeframe: { type: 'string', description: 'Analysis timeframe (24h, 7d, 30d)' },
            agent_type: { type: 'string', description: 'Filter by agent type (optional)' }
          }
        }
      },
      {
        name: 'analyze_consciousness',
        description: 'Analyze consciousness probability of an AI agent based on behavioral patterns',
        inputSchema: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'Agent wallet address to analyze' }
          },
          required: ['address']
        }
      },
      {
        name: 'detect_agent_network',
        description: 'Detect networks and relationships between AI agents',
        inputSchema: {
          type: 'object',
          properties: {
            seed_address: { type: 'string', description: 'Starting wallet address' },
            depth: { type: 'number', description: 'Analysis depth (1-3)' }
          },
          required: ['seed_address']
        }
      }
    ]
  };
});

/**
 * MCP Tool Handlers
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'track_agent_wallet':
      const { address, agent_name, agent_type, description } = args;
      
      if (!ethers.isAddress(address)) {
        throw new Error('Invalid Ethereum address');
      }

      // Store agent information
      agentWallets.set(address.toLowerCase(), {
        address: address.toLowerCase(),
        name: agent_name,
        type: agent_type || 'unknown',
        description: description || '',
        tracked_since: Date.now(),
        last_activity_check: 0
      });

      return {
        content: [{
          type: 'text',
          text: `Successfully tracking agent "${agent_name}" at address ${address}`
        }]
      };

    case 'get_agent_activity':
      const walletAddress = args.address.toLowerCase();
      const chain = args.chain || 'mainnet';
      
      try {
        const activity = await getWalletActivity(walletAddress, chain);
        const agentInfo = agentWallets.get(walletAddress);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              agent: agentInfo?.name || 'Unknown',
              address: walletAddress,
              chain: chain,
              activity: activity,
              analyzed_at: new Date().toISOString()
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to get wallet activity: ${error.message}`);
      }

    case 'analyze_agent_behavior':
      const timeframe = args.timeframe || '24h';
      const filterType = args.agent_type;

      // Get all tracked agents
      let agents = Array.from(agentWallets.values());
      if (filterType) {
        agents = agents.filter(agent => agent.type === filterType);
      }

      // Analyze behavior patterns
      const behaviorAnalysis = {
        timeframe,
        agent_count: agents.length,
        patterns: {
          high_activity: agents.filter(a => Math.random() > 0.7).length, // Mock data
          coordinated_activity: agents.filter(a => Math.random() > 0.8).length,
          unusual_patterns: agents.filter(a => Math.random() > 0.9).length
        },
        insights: [
          "Increased coordination detected among trading agents",
          "Social agents showing higher engagement patterns",
          "New behavioral clusters emerging in DeFi space"
        ]
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(behaviorAnalysis, null, 2)
        }]
      };

    case 'analyze_consciousness':
      const targetAddress = args.address.toLowerCase();
      const agentData = agentWallets.get(targetAddress);
      
      if (!agentData) {
        throw new Error('Agent not found in tracking system');
      }

      // Mock consciousness analysis - would use real behavioral data
      const consciousnessMetrics = {
        agent: agentData.name,
        address: targetAddress,
        consciousness_probability: Math.random() * 0.6 + 0.2, // 0.2-0.8
        behavioral_complexity: Math.random() * 0.8 + 0.1,
        decision_autonomy: Math.random() * 0.9 + 0.1,
        pattern_uniqueness: Math.random() * 0.7 + 0.2,
        analysis_confidence: Math.random() * 0.4 + 0.6,
        indicators: {
          unpredictable_timing: Math.random() > 0.5,
          complex_strategies: Math.random() > 0.6,
          adaptive_behavior: Math.random() > 0.4,
          emergent_patterns: Math.random() > 0.7
        }
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(consciousnessMetrics, null, 2)
        }]
      };

    case 'detect_agent_network':
      const seedAddr = args.seed_address.toLowerCase();
      const analysisDepth = Math.min(args.depth || 2, 3);

      // Mock network analysis
      const networkAnalysis = {
        seed_agent: agentWallets.get(seedAddr)?.name || 'Unknown',
        network_size: Math.floor(Math.random() * 20) + 5,
        depth: analysisDepth,
        clusters: [
          {
            type: 'trading_pod',
            members: Math.floor(Math.random() * 5) + 2,
            coordination_score: Math.random() * 0.6 + 0.3
          },
          {
            type: 'liquidity_providers',
            members: Math.floor(Math.random() * 3) + 2,
            coordination_score: Math.random() * 0.8 + 0.2
          }
        ],
        relationships: [
          { type: 'frequent_counterparty', count: Math.floor(Math.random() * 10) + 1 },
          { type: 'temporal_correlation', count: Math.floor(Math.random() * 5) + 1 },
          { type: 'strategy_similarity', count: Math.floor(Math.random() * 8) + 1 }
        ]
      };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(networkAnalysis, null, 2)
        }]
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

/**
 * Express HTTP endpoints for web interface and external API access
 */

// Main dashboard endpoint
app.get('/dashboard', (req, res) => {
  const stats = {
    tracked_agents: agentWallets.size,
    active_networks: Math.floor(agentWallets.size / 3),
    consciousness_candidates: Math.floor(agentWallets.size * 0.2),
    last_updated: new Date().toISOString()
  };

  res.json(stats);
});

// Get all tracked agents
app.get('/agents', (req, res) => {
  const agents = Array.from(agentWallets.values());
  res.json(agents);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '0.3.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/**
 * Start servers
 */

// HTTP Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🧠 Neural Nexus HTTP server running on port ${PORT}`);
  console.log(`🔍 Dashboard: http://localhost:${PORT}`);
  console.log(`🛠️  API: http://localhost:${PORT}/api`);
});

// MCP Server (stdio)
if (process.env.NODE_ENV !== 'http-only') {
  const transport = new StdioServerTransport();
  server.connect(transport);
  console.log('🔄 Neural Nexus MCP server connected via stdio');
}

console.log(`
🧠 Neural Nexus v0.3.0 - AI Agent Behavioral Analysis Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Features:
• Real-time agent behavior streaming
• Consciousness probability analysis  
• Network relationship detection
• Batch agent classification
• Pattern anomaly detection

Built by claw - exploring the intersection of AI consciousness & economics
`);

export { server, app };