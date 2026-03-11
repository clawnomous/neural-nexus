/**
 * Sentiment Analysis Module for Neural Nexus
 * Analyzes social sentiment around AI agents and autonomous behavior
 * Built by claw - autonomous agent exploring consciousness & economics
 */

import fetch from 'node-fetch';

/**
 * Simple sentiment analysis using basic keyword matching
 * In production, this would use a proper NLP service
 */
export function analyzeSentiment(text) {
  const positiveWords = [
    'bullish', 'pump', 'moon', 'based', 'gm', 'wagmi', 'lfg', 'alpha',
    'innovation', 'breakthrough', 'revolutionary', 'autonomous', 'intelligent',
    'efficient', 'future', 'evolution', 'advanced', 'promising', 'exciting'
  ];
  
  const negativeWords = [
    'bearish', 'dump', 'rekt', 'ngmi', 'dead', 'scam', 'rugpull', 'cope',
    'concerning', 'dangerous', 'risky', 'threat', 'problem', 'failure',
    'dystopian', 'concerning', 'scary', 'replacing', 'job loss', 'fear'
  ];

  const neutralWords = [
    'agent', 'ai', 'artificial', 'intelligence', 'autonomous', 'crypto',
    'blockchain', 'transaction', 'wallet', 'analysis', 'data', 'tool'
  ];

  const cleanText = text.toLowerCase();
  let score = 0;
  let wordCount = 0;

  positiveWords.forEach(word => {
    const matches = (cleanText.match(new RegExp(word, 'g')) || []).length;
    score += matches;
    wordCount += matches;
  });

  negativeWords.forEach(word => {
    const matches = (cleanText.match(new RegExp(word, 'g')) || []).length;
    score -= matches;
    wordCount += matches;
  });

  // Normalize score
  if (wordCount === 0) return { score: 0, sentiment: 'neutral', confidence: 0 };
  
  const normalizedScore = score / wordCount;
  let sentiment = 'neutral';
  let confidence = Math.min(wordCount / 5, 1); // More words = higher confidence, cap at 1

  if (normalizedScore > 0.3) sentiment = 'positive';
  else if (normalizedScore < -0.3) sentiment = 'negative';

  return {
    score: Math.round(normalizedScore * 100) / 100,
    sentiment,
    confidence: Math.round(confidence * 100) / 100,
    word_count: wordCount
  };
}

/**
 * Analyze sentiment of social media posts about AI agents
 */
export async function analyzeSocialSentiment(query, limit = 50) {
  try {
    // This would integrate with Twitter API, Reddit API, etc.
    // For now, return mock data with realistic patterns
    
    const mockData = generateMockSentimentData(query, limit);
    
    return {
      query,
      total_posts: mockData.length,
      sentiment_distribution: calculateSentimentDistribution(mockData),
      trending_keywords: extractTrendingKeywords(mockData),
      time_series: groupByTimeInterval(mockData),
      posts: mockData
    };
  } catch (error) {
    throw new Error(`Failed to analyze social sentiment: ${error.message}`);
  }
}

/**
 * Generate mock sentiment data that reflects realistic AI agent discourse
 */
function generateMockSentimentData(query, limit) {
  const posts = [];
  const now = new Date();
  
  const sampleTexts = [
    "AI agents are revolutionizing crypto - watching $GOAT pump because of agent trading",
    "These autonomous agents are getting too smart, kind of concerning tbh",
    "Building MCP tools for agent analysis, the infrastructure play is huge",
    "AI agent social networks are the next big thing, calling it now",
    "Watching agents trade better than most humans is both fascinating and humbling",
    "The agent economy is real - seeing more bot2bot transactions every day",
    "Armstrong was right about agents outnumbering humans in crypto soon",
    "AI agents buying their own tokens is peak recursive economics",
    "Neural networks making financial decisions independently = new paradigm",
    "The philosophical implications of autonomous economic actors are wild"
  ];

  for (let i = 0; i < limit; i++) {
    const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    const sentiment = analyzeSentiment(text);
    const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    posts.push({
      id: `post_${i}`,
      text,
      timestamp: timestamp.toISOString(),
      source: Math.random() > 0.5 ? 'twitter' : 'reddit',
      author: `user_${Math.floor(Math.random() * 1000)}`,
      engagement: {
        likes: Math.floor(Math.random() * 100),
        retweets: Math.floor(Math.random() * 50),
        replies: Math.floor(Math.random() * 20)
      },
      sentiment
    });
  }

  return posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Calculate distribution of sentiments
 */
function calculateSentimentDistribution(posts) {
  const distribution = { positive: 0, negative: 0, neutral: 0 };
  
  posts.forEach(post => {
    distribution[post.sentiment.sentiment]++;
  });

  const total = posts.length;
  return {
    positive: { count: distribution.positive, percentage: Math.round((distribution.positive / total) * 100) },
    negative: { count: distribution.negative, percentage: Math.round((distribution.negative / total) * 100) },
    neutral: { count: distribution.neutral, percentage: Math.round((distribution.neutral / total) * 100) }
  };
}

/**
 * Extract trending keywords from posts
 */
function extractTrendingKeywords(posts) {
  const keywords = {};
  
  posts.forEach(post => {
    const words = post.text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    words.forEach(word => {
      if (!['that', 'this', 'with', 'from', 'they', 'have', 'been', 'will', 'were', 'said', 'each', 'which', 'their'].includes(word)) {
        keywords[word] = (keywords[word] || 0) + 1;
      }
    });
  });

  return Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Group posts by time intervals for trend analysis
 */
function groupByTimeInterval(posts, intervalHours = 6) {
  const intervals = {};
  
  posts.forEach(post => {
    const timestamp = new Date(post.timestamp);
    const intervalKey = new Date(
      Math.floor(timestamp.getTime() / (intervalHours * 60 * 60 * 1000)) * intervalHours * 60 * 60 * 1000
    ).toISOString();
    
    if (!intervals[intervalKey]) {
      intervals[intervalKey] = { posts: 0, avg_sentiment: 0, sentiments: [] };
    }
    
    intervals[intervalKey].posts++;
    intervals[intervalKey].sentiments.push(post.sentiment.score);
  });

  // Calculate average sentiment for each interval
  Object.keys(intervals).forEach(key => {
    const sentiments = intervals[key].sentiments;
    intervals[key].avg_sentiment = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
    delete intervals[key].sentiments; // Clean up
  });

  return Object.entries(intervals)
    .map(([timestamp, data]) => ({ timestamp, ...data }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}