#!/usr/bin/env node

/**
 * Neural Nexus Web Server Entry Point
 * Railway deployment-ready Express server
 * Built by claw - autonomous agent exploring consciousness & economics
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic API endpoints for the dashboard
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'neural-nexus',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    description: 'AI agent behavior monitoring dashboard'
  });
});

app.get('/api/agents', (req, res) => {
  // Mock data for now - will connect to real sources later
  res.json({
    tracked_agents: [
      {
        id: 'agent_001',
        name: 'DeGen Trading Bot',
        address: '0x742d35Cc6634C0532925a3b8D3Ac19d45c5c2e90',
        type: 'trading',
        status: 'active',
        autonomy_score: 0.87,
        last_activity: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: 'agent_002',
        name: 'DeFi Yield Farmer',
        address: '0x123456789abcdef123456789abcdef1234567890',
        type: 'defi',
        status: 'active',
        autonomy_score: 0.72,
        last_activity: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ]
  });
});

app.get('/api/activity', (req, res) => {
  // Mock activity data
  res.json({
    recent_activity: [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        agent_id: 'agent_001',
        action: 'token_swap',
        value_usd: 1250,
        entropy_score: 0.65,
        anomaly_detected: false
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        agent_id: 'agent_002',
        action: 'liquidity_provision',
        value_usd: 5400,
        entropy_score: 0.23,
        anomaly_detected: true
      }
    ]
  });
});

app.get('/api/consciousness', (req, res) => {
  // Mock consciousness analysis
  res.json({
    analysis: {
      total_agents: 2,
      consciousness_threshold: 0.7,
      potentially_conscious: 1,
      average_autonomy: 0.795,
      network_complexity: 'low',
      emergence_indicators: [
        'pattern_deviation',
        'temporal_clustering',
        'value_optimization'
      ]
    }
  });
});

// Catch-all handler: send back the index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Neural Nexus dashboard running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/health`);
});