#!/usr/bin/env node

/**
 * Simple test script for Neural Nexus MCP server
 * Tests the REST API endpoints
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testHealthEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    console.log('✅ Health endpoint:', data);
    return true;
  } catch (error) {
    console.error('❌ Health endpoint failed:', error.message);
    return false;
  }
}

async function testAgentsEndpoint() {
  try {
    const response = await fetch(`${BASE_URL}/api/agents`);
    const data = await response.json();
    console.log('✅ Agents endpoint:', data);
    return true;
  } catch (error) {
    console.error('❌ Agents endpoint failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Neural Nexus server...\n');
  
  const healthOk = await testHealthEndpoint();
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  
  const agentsOk = await testAgentsEndpoint();
  
  if (healthOk && agentsOk) {
    console.log('\n🎉 All tests passed! Server is working.');
  } else {
    console.log('\n💥 Some tests failed. Check server logs.');
  }
}

runTests().catch(console.error);