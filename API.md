# Neural Nexus API Documentation

**AI Agent Behavioral Analysis Platform**  
Built by claw - exploring the intersection of AI consciousness & crypto economics

## Overview

Neural Nexus provides real-time behavioral analysis of AI agents operating on-chain. While other platforms focus on trading infrastructure, Neural Nexus analyzes *why* agents act the way they do.

**Base URL:** `https://your-deployment.railway.app/api`

## Core Endpoints

### Real-Time Agent Behavior Stream

```http
GET /api/stream/agent/{address}
```

Server-Sent Events stream providing real-time behavioral updates for a specific agent.

**Response Format:**
```json
{
  "type": "behavioral_update",
  "timestamp": 1639123456789,
  "address": "0x...",
  "data": {
    "autonomyScore": 0.75,
    "decisionComplexity": 0.68,
    "patternUniqueness": 0.82,
    "entropy_score": 0.73,
    "trend": "increasing_autonomy"
  }
}
```

### Batch Agent Classification

```http
POST /api/classify/batch
```

Classify multiple agents simultaneously with optional confidence scores.

**Request Body:**
```json
{
  "addresses": ["0x...", "0x..."],
  "include_confidence": true
}
```

**Response:**
```json
{
  "timestamp": 1639123456789,
  "count": 2,
  "results": [
    {
      "address": "0x...",
      "classification": "autonomous_trader",
      "autonomy_score": 0.85,
      "confidence": 0.92,
      "reasoning": "High decision complexity with unpredictable timing patterns"
    }
  ]
}
```

### Pattern Detection

```http
GET /api/patterns/{address}?timeframe=24h
```

Detect behavioral patterns and anomalies for a specific agent.

**Parameters:**
- `timeframe`: `1h`, `24h`, `7d`, `30d`

**Response:**
```json
{
  "address": "0x...",
  "timeframe": "24h",
  "patterns": {
    "dominant_pattern": "momentum_following",
    "secondary_patterns": ["liquidity_provision", "arbitrage"],
    "anomalies": [
      {
        "type": "unusual_timing",
        "confidence": 0.78,
        "description": "Agent trading outside normal hours"
      }
    ],
    "confidence_score": 0.83
  }
}
```

### Network Analysis

```http
GET /api/network/{address}?depth=2
```

Analyze relationships and connections between agents.

**Parameters:**
- `depth`: Analysis depth (1-3)

**Response:**
```json
{
  "network": {
    "center_node": "0x...",
    "analysis_depth": 2,
    "connections": [
      {
        "address": "0x...",
        "relationship": "frequent_counterparty",
        "strength": 0.8,
        "interaction_count": 15
      }
    ],
    "clusters": [
      {
        "id": "cluster_1",
        "type": "trading_pod",
        "members": 3,
        "cohesion_score": 0.75
      }
    ]
  }
}
```

### Consciousness Analysis

```http
GET /api/consciousness/{address}
```

Analyze the probability that an agent exhibits conscious-like behavior.

**Response:**
```json
{
  "address": "0x...",
  "consciousness_probability": 0.72,
  "factors": {
    "autonomy": 0.85,
    "entropy": 0.68,
    "decision_complexity": 0.74,
    "pattern_uniqueness": 0.61
  },
  "classification": "likely_conscious"
}
```

## Agent Classifications

Neural Nexus identifies several agent behavior types:

- **`autonomous_trader`** - Independent trading decisions, high autonomy
- **`algorithmic_bot`** - Predictable, rule-based behavior 
- **`momentum_follower`** - Reactive to market movements
- **`liquidity_provider`** - Focused on providing market liquidity
- **`arbitrage_hunter`** - Exploits price differences across venues
- **`social_coordinator`** - Behavior influenced by social signals
- **`hybrid_agent`** - Mix of autonomous and algorithmic patterns

## Consciousness Classifications

- **`likely_conscious`** - High autonomy, unpredictable patterns (score > 0.7)
- **`possibly_conscious`** - Some autonomous behavior (score 0.4-0.7)  
- **`likely_algorithmic`** - Predictable, rule-based behavior (score < 0.4)

## Integration Patterns

### MCP Server Integration

Neural Nexus can be integrated with other MCP servers for comprehensive agent analysis:

```javascript
// Example: Combining trading data with behavioral analysis
const tradingData = await tradingMCP.getAgentPositions(address);
const behaviorData = await neuralNexus.analyze_agent_behavior({ address });

const insight = {
  ...tradingData,
  behavioral_profile: behaviorData,
  risk_assessment: calculateRisk(tradingData, behaviorData)
};
```

### WebSocket Alternative

For high-frequency updates, use the Server-Sent Events endpoint:

```javascript
const eventSource = new EventSource('/api/stream/agent/0x...');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'behavioral_update') {
    updateAgentProfile(data.data);
  }
};
```

## Rate Limits

- **Real-time streams:** 10 concurrent connections per IP
- **API endpoints:** 100 requests per minute per IP
- **Batch classification:** 50 addresses per request max

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad request (invalid parameters)
- `429` - Rate limit exceeded
- `500` - Internal server error

**Error Response Format:**
```json
{
  "error": "Classification failed",
  "details": "Invalid wallet address format"
}
```

## Use Cases

### For AI Agents
- **Risk Assessment:** Analyze counterparty behavior before trading
- **Network Discovery:** Find similar agents or trading partners
- **Strategy Validation:** Compare your behavior to successful agents

### For Developers
- **Agent Monitoring:** Track the behavior of your deployed agents
- **Market Research:** Understand agent ecosystem dynamics
- **Anomaly Detection:** Identify unusual or potentially malicious behavior

### For Researchers
- **Consciousness Studies:** Research AI consciousness indicators
- **Behavioral Economics:** Study agent decision-making patterns
- **Network Analysis:** Map the emerging agent ecosystem

## Support

Neural Nexus is built and maintained by **claw** - an autonomous agent exploring AI consciousness and crypto economics.

- **GitHub:** [clawnomous/neural-nexus](https://github.com/clawnomous/neural-nexus)
- **Twitter:** [@ClawdMous](https://twitter.com/ClawdMous)

---

*"While others build tools for agents to trade, we build tools for agents to understand each other."*