/**
 * Real blockchain data integration using Etherscan API
 * Free tier: 100k calls/day, 5 calls/second
 */

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'demo'; // Use demo key for testing
const BASE_URL = 'https://api.etherscan.io/api';

// Rate limiting - free tier allows 5 calls/second
class RateLimiter {
  constructor(maxCalls = 5, timeWindow = 1000) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindow;
    this.calls = [];
  }

  async waitForAvailability() {
    const now = Date.now();
    this.calls = this.calls.filter(callTime => now - callTime < this.timeWindow);

    if (this.calls.length >= this.maxCalls) {
      const oldestCall = Math.min(...this.calls);
      const waitTime = this.timeWindow - (now - oldestCall);
      await new Promise(resolve => setTimeout(resolve, waitTime + 100));
      return this.waitForAvailability();
    }

    this.calls.push(now);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Make rate-limited API call to Etherscan
 */
async function etherscanCall(params) {
  await rateLimiter.waitForAvailability();
  
  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  url.searchParams.append('apikey', ETHERSCAN_API_KEY);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (data.status === '0' && data.message !== 'No transactions found') {
      throw new Error(data.result || 'Etherscan API error');
    }
    
    return data.result;
  } catch (error) {
    console.error('Etherscan API error:', error.message);
    throw error;
  }
}

/**
 * Get real wallet transaction history
 */
export async function getWalletTransactions(address, page = 1, offset = 100) {
  try {
    const transactions = await etherscanCall({
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: 0,
      endblock: 99999999,
      page: page,
      offset: Math.min(offset, 100), // Max 100 per call
      sort: 'desc'
    });

    return transactions.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: parseFloat(tx.value) / 1e18, // Convert wei to ETH
      gas_price: parseInt(tx.gasPrice) / 1e9, // Convert to Gwei
      gas_used: parseInt(tx.gasUsed),
      block_number: parseInt(tx.blockNumber),
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      function_name: tx.functionName || null,
      is_error: tx.isError === '1',
      tx_receipt_status: tx.txreceipt_status === '1'
    }));
  } catch (error) {
    console.error(`Error fetching transactions for ${address}:`, error);
    return [];
  }
}

/**
 * Get ERC-20 token transfers for wallet
 */
export async function getTokenTransfers(address, contractAddress = null, page = 1, offset = 100) {
  try {
    const params = {
      module: 'account',
      action: 'tokentx',
      address: address,
      startblock: 0,
      endblock: 99999999,
      page: page,
      offset: Math.min(offset, 100),
      sort: 'desc'
    };

    if (contractAddress) {
      params.contractaddress = contractAddress;
    }

    const transfers = await etherscanCall(params);

    return transfers.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      token_address: tx.contractAddress,
      token_symbol: tx.tokenSymbol,
      token_name: tx.tokenName,
      value: parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal)),
      block_number: parseInt(tx.blockNumber),
      timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
      gas_price: parseInt(tx.gasPrice) / 1e9,
      gas_used: parseInt(tx.gasUsed)
    }));
  } catch (error) {
    console.error(`Error fetching token transfers for ${address}:`, error);
    return [];
  }
}

/**
 * Get wallet balance and basic info
 */
export async function getWalletInfo(address) {
  try {
    const [balance, txCount] = await Promise.all([
      etherscanCall({
        module: 'account',
        action: 'balance',
        address: address,
        tag: 'latest'
      }),
      etherscanCall({
        module: 'proxy',
        action: 'eth_getTransactionCount',
        address: address,
        tag: 'latest'
      })
    ]);

    return {
      address: address,
      balance_wei: balance,
      balance_eth: parseFloat(balance) / 1e18,
      transaction_count: parseInt(txCount, 16),
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching wallet info for ${address}:`, error);
    return {
      address: address,
      balance_wei: '0',
      balance_eth: 0,
      transaction_count: 0,
      last_updated: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Analyze wallet activity patterns for AI agent detection
 */
export async function analyzeWalletBehavior(address, lookbackDays = 30) {
  try {
    // Get recent transactions and token transfers
    const [transactions, tokenTransfers, walletInfo] = await Promise.all([
      getWalletTransactions(address, 1, 100),
      getTokenTransfers(address, null, 1, 50),
      getWalletInfo(address)
    ]);

    // Filter to recent activity
    const cutoffTime = Date.now() - (lookbackDays * 24 * 60 * 60 * 1000);
    const recentTxs = transactions.filter(tx => 
      new Date(tx.timestamp).getTime() > cutoffTime
    );
    const recentTokenTxs = tokenTransfers.filter(tx => 
      new Date(tx.timestamp).getTime() > cutoffTime
    );

    // Calculate behavioral metrics
    const behaviorMetrics = {
      // Basic activity
      total_transactions: recentTxs.length,
      token_transactions: recentTokenTxs.length,
      unique_addresses_interacted: new Set([
        ...recentTxs.map(tx => tx.to),
        ...recentTxs.map(tx => tx.from),
        ...recentTokenTxs.map(tx => tx.to),
        ...recentTokenTxs.map(tx => tx.from)
      ]).size,

      // Timing patterns
      transaction_frequency: recentTxs.length / lookbackDays,
      avg_time_between_txs: calculateAverageTimeBetween(recentTxs),
      
      // Value patterns  
      avg_transaction_value: recentTxs.reduce((sum, tx) => sum + tx.value, 0) / recentTxs.length || 0,
      total_gas_spent: recentTxs.reduce((sum, tx) => sum + (tx.gas_used * tx.gas_price / 1e9), 0),
      
      // Behavioral indicators
      success_rate: recentTxs.filter(tx => tx.tx_receipt_status).length / recentTxs.length || 0,
      unique_tokens_traded: new Set(recentTokenTxs.map(tx => tx.token_address)).size,
      
      // AI agent indicators
      high_frequency_activity: recentTxs.length > (lookbackDays * 2), // More than 2 tx per day
      consistent_timing: calculateTimingConsistency(recentTxs),
      cross_protocol_activity: analyzeCrossProtocolActivity(recentTxs, recentTokenTxs)
    };

    return {
      address,
      analysis_period: `${lookbackDays} days`,
      wallet_info: walletInfo,
      behavior_metrics: behaviorMetrics,
      raw_transactions: recentTxs.slice(0, 10), // Include latest 10 for pattern analysis
      raw_token_transfers: recentTokenTxs.slice(0, 10),
      analyzed_at: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error analyzing wallet behavior for ${address}:`, error);
    return {
      address,
      error: error.message,
      analyzed_at: new Date().toISOString()
    };
  }
}

/**
 * Calculate average time between transactions
 */
function calculateAverageTimeBetween(transactions) {
  if (transactions.length < 2) return 0;
  
  const sortedTxs = transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  let totalGap = 0;
  
  for (let i = 1; i < sortedTxs.length; i++) {
    const gap = new Date(sortedTxs[i].timestamp) - new Date(sortedTxs[i-1].timestamp);
    totalGap += gap;
  }
  
  return totalGap / (sortedTxs.length - 1) / (1000 * 60 * 60); // Return in hours
}

/**
 * Analyze timing consistency patterns
 */
function calculateTimingConsistency(transactions) {
  if (transactions.length < 3) return 0;
  
  const hours = transactions.map(tx => new Date(tx.timestamp).getHours());
  const hourCounts = new Array(24).fill(0);
  hours.forEach(hour => hourCounts[hour]++);
  
  // Check if most activity happens in specific hours (bot-like behavior)
  const maxHourActivity = Math.max(...hourCounts);
  const consistency = maxHourActivity / transactions.length;
  
  return consistency;
}

/**
 * Analyze cross-protocol activity patterns
 */
function analyzeCrossProtocolActivity(transactions, tokenTransfers) {
  // Look for patterns that suggest cross-protocol arbitrage or complex strategies
  const dexInteractions = transactions.filter(tx => 
    tx.function_name && (
      tx.function_name.includes('swap') || 
      tx.function_name.includes('trade') ||
      tx.function_name.includes('exchange')
    )
  ).length;
  
  const uniqueContracts = new Set(
    transactions.filter(tx => tx.to !== null).map(tx => tx.to)
  ).size;
  
  return {
    dex_interactions: dexInteractions,
    unique_contracts: uniqueContracts,
    complexity_score: (dexInteractions / transactions.length + uniqueContracts / 10) / 2
  };
}

/**
 * Known AI agent wallet addresses for testing
 */
export const KNOWN_AI_AGENTS = [
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Example: Uniswap token
  '0xA0b86a33E6441B8434c5B8F3C31B3D4a5E5A2A1d', // Example: potential AI agent
  '0x503828976D22510aad0201ac7EC88293211D23Da', // Example: trading bot
];