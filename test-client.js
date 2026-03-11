#!/usr/bin/env node

/**
 * Simple test client for neural-nexus MCP server
 * Tests all three tools to ensure they work properly
 */

import { spawn } from 'child_process';

class MCPTestClient {
  constructor() {
    this.requestId = 1;
    this.server = null;
  }

  async start() {
    console.log('🔌 Starting neural-nexus MCP server...');
    
    // Spawn the MCP server
    this.server = spawn('node', ['src/server.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    this.server.stderr.on('data', (data) => {
      console.error('Server stderr:', data.toString());
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Initialize the connection
      const initResponse = await this.sendRequest({
        jsonrpc: "2.0",
        id: this.requestId++,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          clientInfo: {
            name: "neural-nexus-test-client",
            version: "0.1.0"
          }
        }
      });

      console.log('✅ Server initialized');
      
      // Test all tools
      await this.testAllTools();
      
      console.log('🎉 All tests completed!');
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    } finally {
      if (this.server) {
        this.server.kill();
      }
      process.exit(0);
    }
  }

  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout after 5 seconds'));
      }, 5000);

      let responseData = '';
      
      const onData = (data) => {
        responseData += data.toString();
        
        // Look for complete JSON response
        const lines = responseData.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line.trim());
              clearTimeout(timeout);
              this.server.stdout.off('data', onData);
              console.log(`📤 Request: ${request.method}`);
              console.log(`📥 Response:`, JSON.stringify(response, null, 2));
              resolve(response);
              return;
            } catch (e) {
              // Not complete JSON yet, keep waiting
            }
          }
        }
      };

      this.server.stdout.on('data', onData);
      this.server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async testAllTools() {
    console.log('\n🧪 Testing all tools...\n');

    try {
      // Test 1: track_wallet_activity
      console.log('1️⃣ Testing track_wallet_activity...');
      await this.sendRequest({
        jsonrpc: "2.0",
        id: this.requestId++,
        method: "tools/call",
        params: {
          name: "track_wallet_activity",
          arguments: {
            wallet_address: "0x742d35Cc6634C0532925a3b8D8fa96e28D2A7f7e",
            timeframe: "24h"
          }
        }
      });

      // Test 2: discover_agents
      console.log('\n2️⃣ Testing discover_agents...');
      await this.sendRequest({
        jsonrpc: "2.0",
        id: this.requestId++,
        method: "tools/call",
        params: {
          name: "discover_agents",
          arguments: {
            chain: "ethereum",
            min_balance: "0.1"
          }
        }
      });

      // Test 3: analyze_agent_behavior
      console.log('\n3️⃣ Testing analyze_agent_behavior...');
      await this.sendRequest({
        jsonrpc: "2.0",
        id: this.requestId++,
        method: "tools/call",
        params: {
          name: "analyze_agent_behavior",
          arguments: {
            agent_id: "agent_123",
            analysis_type: "trading_patterns"
          }
        }
      });
    } catch (error) {
      console.error('Tool test failed:', error);
    }
  }
}

// Run the test
const client = new MCPTestClient();
client.start().catch(console.error);