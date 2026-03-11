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

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// MCP Server instance
const server = new Server(
  {
    name: 'neural-nexus',
    version: '0.2.0',
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
        name: 'analyze_text_sentiment',
        description: 'Analyze sentiment of text related to AI agents or crypto',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text content to analyze' }
          },
          required: ['text']
        }
      },
      {
        name: 'analyze_social_sentiment',
        description: 'Analyze social media sentiment around AI agents',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query for social analysis' },
            limit: { type: 'number', description: 'Maximum number of posts to analyze (default: 50)' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_network_insights',
        description: 'Get insights about the AI agent ecosystem',
        inputSchema: {
          type: 'object',
          properties: {}
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

  try {
    switch (name) {
      case 'track_agent_wallet': {
        const { address, agent_name, agent_type, description } = args;
        
        if (!ethers.isAddress(address)) {
          throw new Error('Invalid Ethereum address format');
        }

        const agentData = {
          address: address.toLowerCase(),
          agent_name,
          agent_type: agent_type || 'unknown',
          description: description || '',
          added_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        };

        agentWallets.set(address.toLowerCase(), agentData);
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully added AI agent "${agent_name}" (${address}) to tracking system.`
            }
          ]
        };
      }

      case 'get_agent_activity': {
        const { address, chain = 'mainnet' } = args;
        
        if (!ethers.isAddress(address)) {
          throw new Error('Invalid Ethereum address format');
        }

        const activity = await getWalletActivity(address, chain);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(activity, null, 2)
            }
          ]
        };
      }

      case 'analyze_agent_behavior': {
        const { timeframe = '24h', agent_type } = args;
        const agents = Array.from(agentWallets.values())
          .filter(agent => !agent_type || agent.agent_type === agent_type);

        const analysis = {
          timeframe,
          total_agents: agents.length,
          agent_types: {},
          behavior_patterns: []
        };

        // Group by type
        agents.forEach(agent => {
          analysis.agent_types[agent.agent_type] = (analysis.agent_types[agent.agent_type] || 0) + 1;
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2)
            }
          ]
        };
      }

      case 'analyze_text_sentiment': {
        const { text } = args;
        const sentiment = analyzeSentiment(text);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                sentiment
              }, null, 2)
            }
          ]
        };
      }

      case 'analyze_social_sentiment': {
        const { query, limit = 50 } = args;
        const cacheKey = `${query}_${limit}`;
        
        // Check cache (5 minute expiry)
        if (sentimentCache.has(cacheKey)) {
          const cached = sentimentCache.get(cacheKey);
          if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(cached.data, null, 2)
                }
              ]
            };
          }
        }

        const socialSentiment = await analyzeSocialSentiment(query, limit);
        
        // Cache results
        sentimentCache.set(cacheKey, {
          data: socialSentiment,
          timestamp: Date.now()
        });
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(socialSentiment, null, 2)
            }
          ]
        };
      }

      case 'get_network_insights': {
        const agents = Array.from(agentWallets.values());
        const insights = {
          total_agents: agents.length,
          agent_types: {},
          active_agents: 0,
          recent_activity: [],
          system_health: 'operational'
        };

        // Calculate type distribution
        agents.forEach(agent => {
          insights.agent_types[agent.agent_type] = (insights.agent_types[agent.agent_type] || 0) + 1;
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(insights, null, 2)
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

/**
 * REST API Endpoints for the web interface
 */

// Get all tracked agents
app.get('/api/agents', (req, res) => {
  const agents = Array.from(agentWallets.values());
  res.json(agents);
});

// Add new agent to tracking
app.post('/api/track-agent', async (req, res) => {
  try {
    const { address, agent_name, agent_type, description } = req.body;
    
    if (!address || !agent_name) {
      return res.status(400).json({ error: 'Address and agent_name are required' });
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    const agentData = {
      address: address.toLowerCase(),
      agent_name,
      agent_type: agent_type || 'unknown',
      description: description || '',
      added_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    agentWallets.set(address.toLowerCase(), agentData);
    
    res.json({ success: true, agent: agentData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activity for a specific agent
app.get('/api/agent-activity/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const chain = req.query.chain || 'mainnet';
    
    if (!agentWallets.has(address)) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const activity = await getWalletActivity(address, chain);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sentiment analysis endpoint
app.post('/api/analyze-sentiment', async (req, res) => {
  try {
    const { text, query, limit } = req.body;
    
    if (text) {
      const sentiment = analyzeSentiment(text);
      res.json({ text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), sentiment });
    } else if (query) {
      const socialSentiment = await analyzeSocialSentiment(query, limit || 50);
      res.json(socialSentiment);
    } else {
      res.status(400).json({ error: 'Either text or query parameter is required' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get network insights
app.get('/api/network-insights', (req, res) => {
  try {
    const agents = Array.from(agentWallets.values());
    const insights = {
      total_agents: agents.length,
      agent_types: {},
      active_agents: 0,
      system_health: 'operational',
      version: '0.2.0',
      features: ['wallet_tracking', 'sentiment_analysis', 'behavior_patterns']
    };

    // Calculate type distribution
    agents.forEach(agent => {
      insights.agent_types[agent.agent_type] = (insights.agent_types[agent.agent_type] || 0) + 1;
    });

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start the servers
 */
async function main() {
  // Start HTTP server for web interface
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Neural Nexus HTTP server running on port ${port}`);
    console.log(`Web interface: http://localhost:${port}`);
  });

  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Neural Nexus MCP server running');
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down Neural Nexus...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}