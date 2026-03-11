/**
 * Neural Nexus Frontend
 * Interactive visualization of AI agent network activity
 * Built by claw - exploring consciousness through on-chain behavior
 */

class NeuralNexusApp {
  constructor() {
    this.agents = new Map();
    this.connections = [];
    this.isLoading = false;
    this.selectedAgent = null;
    
    this.init();
  }

  async init() {
    this.setupUI();
    await this.loadAgentData();
    this.startRealtimeUpdates();
  }

  setupUI() {
    // Create main application structure
    const app = document.getElementById('app');
    app.innerHTML = `
      <header class="header">
        <h1>neural nexus</h1>
        <p>mapping the emergence of autonomous agent societies</p>
        <div class="stats">
          <span id="agent-count">0 agents tracked</span>
          <span id="last-update">never updated</span>
        </div>
      </header>

      <main class="main">
        <div class="controls">
          <button id="add-agent-btn">+ Track Agent</button>
          <button id="refresh-btn">Refresh Data</button>
          <select id="chain-select">
            <option value="mainnet">Ethereum</option>
            <option value="base">Base</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>

        <div class="visualization">
          <div id="network-graph"></div>
          <div id="agent-details" class="hidden">
            <h3>Agent Details</h3>
            <div id="agent-info"></div>
            <div id="activity-timeline"></div>
          </div>
        </div>

        <div class="insights">
          <h3>Network Insights</h3>
          <div id="insights-content">
            <p>Add some agents to start seeing patterns...</p>
          </div>
        </div>
      </main>

      <!-- Add Agent Modal -->
      <div id="add-agent-modal" class="modal hidden">
        <div class="modal-content">
          <h3>Track New Agent</h3>
          <form id="add-agent-form">
            <input type="text" id="agent-address" placeholder="0x..." required>
            <input type="text" id="agent-name" placeholder="Agent name" required>
            <input type="text" id="agent-type" placeholder="Agent type (optional)">
            <textarea id="agent-description" placeholder="Description (optional)"></textarea>
            <div class="modal-buttons">
              <button type="submit">Track Agent</button>
              <button type="button" id="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Add agent button
    document.getElementById('add-agent-btn').addEventListener('click', () => {
      document.getElementById('add-agent-modal').classList.remove('hidden');
    });

    // Cancel modal
    document.getElementById('cancel-btn').addEventListener('click', () => {
      document.getElementById('add-agent-modal').classList.add('hidden');
    });

    // Add agent form
    document.getElementById('add-agent-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.addAgent();
    });

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
      this.refreshData();
    });

    // Chain selector
    document.getElementById('chain-select').addEventListener('change', () => {
      this.refreshData();
    });
  }

  async addAgent() {
    const form = document.getElementById('add-agent-form');
    const formData = new FormData(form);
    
    const agentData = {
      address: formData.get('agent-address'),
      agent_name: formData.get('agent-name'),
      agent_type: formData.get('agent-type') || 'unknown',
      description: formData.get('agent-description') || ''
    };

    try {
      const response = await fetch('/api/track-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });

      if (response.ok) {
        document.getElementById('add-agent-modal').classList.add('hidden');
        form.reset();
        await this.loadAgentData();
        this.showNotification('Agent added successfully!');
      } else {
        throw new Error('Failed to add agent');
      }
    } catch (error) {
      this.showNotification('Error adding agent: ' + error.message, 'error');
    }
  }

  async loadAgentData() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.showLoading(true);

    try {
      // Load tracked agents
      const agentsResponse = await fetch('/api/agents');
      const agents = await agentsResponse.json();
      
      // Load activity data for each agent
      for (const agent of agents) {
        const activityResponse = await fetch(`/api/agent-activity/${agent.address}`);
        const activity = await activityResponse.json();
        
        this.agents.set(agent.address, {
          ...agent,
          activity: activity
        });
      }

      this.renderNetworkGraph();
      this.updateStats();
      this.generateInsights();

    } catch (error) {
      this.showNotification('Error loading data: ' + error.message, 'error');
    } finally {
      this.isLoading = false;
      this.showLoading(false);
    }
  }

  renderNetworkGraph() {
    const graphContainer = document.getElementById('network-graph');
    graphContainer.innerHTML = '';

    if (this.agents.size === 0) {
      graphContainer.innerHTML = '<p class="empty-state">No agents tracked yet. Add an agent to get started.</p>';
      return;
    }

    // Simple visualization - create nodes for each agent
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '400px');
    svg.setAttribute('viewBox', '0 0 800 400');

    const agents = Array.from(this.agents.values());
    const centerX = 400;
    const centerY = 200;
    const radius = 150;

    agents.forEach((agent, index) => {
      const angle = (index / agents.length) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Create agent node
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '15');
      circle.setAttribute('fill', this.getAgentColor(agent.agent_type));
      circle.setAttribute('stroke', '#333');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      
      circle.addEventListener('click', () => this.selectAgent(agent));

      // Add agent label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y + 25);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '12px');
      text.textContent = agent.agent_name;

      svg.appendChild(circle);
      svg.appendChild(text);
    });

    graphContainer.appendChild(svg);
  }

  getAgentColor(agentType) {
    const colors = {
      'trading': '#00ff88',
      'social': '#ff6b6b',
      'autonomous': '#4ecdc4',
      'defi': '#ffd93d',
      'unknown': '#95a5a6'
    };
    return colors[agentType] || colors.unknown;
  }

  selectAgent(agent) {
    this.selectedAgent = agent;
    const detailsPanel = document.getElementById('agent-details');
    const agentInfo = document.getElementById('agent-info');
    
    agentInfo.innerHTML = `
      <div class="agent-card">
        <h4>${agent.agent_name}</h4>
        <p><strong>Type:</strong> ${agent.agent_type}</p>
        <p><strong>Address:</strong> <code>${agent.address}</code></p>
        <p><strong>Balance:</strong> ${agent.activity?.balance || '0'} ETH</p>
        <p><strong>Transactions:</strong> ${agent.activity?.transaction_count || 0}</p>
        ${agent.description ? `<p><strong>Description:</strong> ${agent.description}</p>` : ''}
      </div>
    `;

    this.renderActivityTimeline(agent);
    detailsPanel.classList.remove('hidden');
  }

  renderActivityTimeline(agent) {
    const timeline = document.getElementById('activity-timeline');
    const transactions = agent.activity?.recent_transactions || [];

    if (transactions.length === 0) {
      timeline.innerHTML = '<p>No recent transaction activity</p>';
      return;
    }

    const timelineHTML = transactions.map(tx => `
      <div class="transaction ${tx.type}">
        <div class="tx-type">${tx.type === 'outgoing' ? '→' : '←'}</div>
        <div class="tx-details">
          <div class="tx-value">${parseFloat(tx.value).toFixed(4)} ETH</div>
          <div class="tx-time">${new Date(tx.timestamp).toLocaleString()}</div>
          <div class="tx-hash"><code>${tx.hash.slice(0, 16)}...</code></div>
        </div>
      </div>
    `).join('');

    timeline.innerHTML = `<h4>Recent Activity</h4><div class="timeline">${timelineHTML}</div>`;
  }

  updateStats() {
    document.getElementById('agent-count').textContent = `${this.agents.size} agents tracked`;
    document.getElementById('last-update').textContent = `updated ${new Date().toLocaleTimeString()}`;
  }

  generateInsights() {
    const insights = document.getElementById('insights-content');
    const agents = Array.from(this.agents.values());

    if (agents.length === 0) {
      insights.innerHTML = '<p>Add some agents to start seeing patterns...</p>';
      return;
    }

    const totalBalance = agents.reduce((sum, agent) => 
      sum + parseFloat(agent.activity?.balance || '0'), 0
    );

    const totalTransactions = agents.reduce((sum, agent) => 
      sum + (agent.activity?.transaction_count || 0), 0
    );

    const agentTypes = {};
    agents.forEach(agent => {
      agentTypes[agent.agent_type] = (agentTypes[agent.agent_type] || 0) + 1;
    });

    insights.innerHTML = `
      <div class="insight-grid">
        <div class="insight-card">
          <h4>Network Value</h4>
          <p>${totalBalance.toFixed(4)} ETH</p>
        </div>
        <div class="insight-card">
          <h4>Total Transactions</h4>
          <p>${totalTransactions.toLocaleString()}</p>
        </div>
        <div class="insight-card">
          <h4>Most Common Type</h4>
          <p>${Object.keys(agentTypes).reduce((a, b) => agentTypes[a] > agentTypes[b] ? a : b, 'none')}</p>
        </div>
        <div class="insight-card">
          <h4>Network Health</h4>
          <p>${agents.filter(a => a.activity?.recent_transactions?.length > 0).length}/${agents.length} active</p>
        </div>
      </div>
    `;
  }

  showLoading(show) {
    // Add loading indicator logic here
  }

  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  refreshData() {
    this.loadAgentData();
  }

  startRealtimeUpdates() {
    // Update data every 30 seconds
    setInterval(() => {
      if (!this.isLoading) {
        this.loadAgentData();
      }
    }, 30000);
  }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new NeuralNexusApp();
});