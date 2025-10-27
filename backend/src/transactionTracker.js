const axios = require('axios');
const predictor = require('./gasPricePredictor');
const fs = require('fs');
const path = require('path');
const TransactionCache = require('./models/TransactionCache');

// Cache duration: 1 hour (transactions don't change frequently)
const CACHE_DURATION = 60 * 60 * 1000;

// Cache for block gas prices (blockNumber -> gasPrice) - never expires (blocks don't change)
const blockGasPriceCache = new Map();

// Cache for daily minimum gas prices (date -> {minGasPrice, timestamp}) - never expires
const dailyMinGasPriceCache = new Map();

// File paths for persistent storage
const CACHE_DIR = path.join(__dirname, '../.cache');
const DAILY_MIN_CACHE_FILE = path.join(CACHE_DIR, 'daily_min_gas_prices.json');
const BLOCK_CACHE_FILE = path.join(CACHE_DIR, 'block_gas_prices.json');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Load caches from disk on startup
function loadCachesFromDisk() {
  try {
    if (fs.existsSync(DAILY_MIN_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(DAILY_MIN_CACHE_FILE, 'utf8'));
      Object.entries(data).forEach(([key, value]) => {
        dailyMinGasPriceCache.set(key, value);
      });
      console.log(`Loaded ${dailyMinGasPriceCache.size} daily minimum gas prices from cache`);
    }

    if (fs.existsSync(BLOCK_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(BLOCK_CACHE_FILE, 'utf8'));
      Object.entries(data).forEach(([key, value]) => {
        blockGasPriceCache.set(parseInt(key), value);
      });
      console.log(`Loaded ${blockGasPriceCache.size} block gas prices from cache`);
    }
  } catch (error) {
    console.error('Error loading caches from disk:', error.message);
  }
}

// Save caches to disk periodically
function saveCachesToDisk() {
  try {
    // Save daily minimums
    const dailyMinData = Object.fromEntries(dailyMinGasPriceCache);
    fs.writeFileSync(DAILY_MIN_CACHE_FILE, JSON.stringify(dailyMinData, null, 2));

    // Save block prices
    const blockData = Object.fromEntries(blockGasPriceCache);
    fs.writeFileSync(BLOCK_CACHE_FILE, JSON.stringify(blockData, null, 2));

    console.log(`Saved ${dailyMinGasPriceCache.size} daily mins and ${blockGasPriceCache.size} blocks to disk`);
  } catch (error) {
    console.error('Error saving caches to disk:', error.message);
  }
}

// Load caches on module initialization
loadCachesFromDisk();

// Save caches every 5 minutes
setInterval(saveCachesToDisk, 5 * 60 * 1000);

// ETH/USD price estimate
const ETH_USD_PRICE = 2000;

// Number of days to track (90 days for comprehensive history)
const TRACKING_DAYS = 90;

/**
 * Fetch user's transaction history from Etherscan
 * @param {string} walletAddress - Ethereum wallet address
 * @returns {Array} Array of transaction objects
 */
async function fetchUserTransactions(walletAddress) {
  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error('Etherscan API key not configured');
  }

  try {
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`;

    const response = await axios.get(url);

    if (response.data.status !== '1') {
      console.error('Etherscan API error:', response.data.message);
      console.error('Full response:', JSON.stringify(response.data, null, 2));
      return [];
    }

    const transactions = response.data.result;

    // Filter to last 90 days
    const trackingDaysAgo = Math.floor(Date.now() / 1000) - (TRACKING_DAYS * 24 * 60 * 60);
    const recentTransactions = transactions.filter(tx =>
      parseInt(tx.timeStamp) >= trackingDaysAgo &&
      tx.from.toLowerCase() === walletAddress.toLowerCase() // Only outgoing transactions
    );

    console.log(`Fetched ${recentTransactions.length} transactions for ${walletAddress} (last ${TRACKING_DAYS} days)`);

    return recentTransactions.map(tx => ({
      hash: tx.hash,
      timeStamp: parseInt(tx.timeStamp),
      gasUsed: parseInt(tx.gasUsed),
      gasPrice: parseInt(tx.gasPrice), // in Wei
      blockNumber: parseInt(tx.blockNumber),
      success: tx.isError === '0',
    }));
  } catch (error) {
    console.error('Error fetching transactions from Etherscan:', error.message);
    throw error;
  }
}

/**
 * Fetch gas price for a specific block from Etherscan
 * @param {number} blockNumber - Block number
 * @returns {Promise<number>} Gas price in Gwei
 */
async function getBlockGasPrice(blockNumber) {
  // Check cache first
  if (blockGasPriceCache.has(blockNumber)) {
    return blockGasPriceCache.get(blockNumber);
  }

  try {
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=false&apikey=${process.env.ETHERSCAN_API_KEY}`;

    const response = await axios.get(url);

    if (response.data.result && response.data.result.baseFeePerGas) {
      // Convert from hex Wei to Gwei
      const baseFeeWei = parseInt(response.data.result.baseFeePerGas, 16);
      const baseFeeGwei = baseFeeWei / 1e9;

      // Cache forever (blocks don't change)
      blockGasPriceCache.set(blockNumber, baseFeeGwei);

      return baseFeeGwei;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching block ${blockNumber}:`, error.message);
    return null;
  }
}

/**
 * Get block number at a specific timestamp (approximate)
 * @param {number} timestamp - Unix timestamp
 * @returns {Promise<number>} Approximate block number
 */
async function getBlockNumberAtTimestamp(timestamp) {
  try {
    const date = new Date(timestamp * 1000).toISOString();
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${process.env.ETHERSCAN_API_KEY}`;

    console.log(`Fetching block for timestamp ${timestamp} (${date})`);

    // Rate limiting: wait 500ms between calls (2 calls/sec to be safe)
    // Etherscan free tier allows 5 calls/sec, but we use 2/sec for safety margin
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = await axios.get(url);

    console.log(`Etherscan block response:`, JSON.stringify(response.data, null, 2));

    if (response.data.status === '1' && response.data.result) {
      return parseInt(response.data.result);
    }

    console.error(`Failed to get block for timestamp ${timestamp}: status=${response.data.status}, message=${response.data.message}`);
    return null;
  } catch (error) {
    console.error(`Error fetching block number for timestamp ${timestamp}:`, error.message);
    return null;
  }
}

/**
 * Calculate minimum gas price for a specific day
 * Samples blocks throughout the day to find the lowest gas price
 * @param {number} timestamp - Unix timestamp (any time during the day)
 * @returns {Promise<Object>} {minGasPrice, optimalTimestamp}
 */
async function getDailyMinimumGasPrice(timestamp) {
  // Get date string for caching (YYYY-MM-DD)
  const date = new Date(timestamp * 1000);
  const dateKey = date.toISOString().split('T')[0];

  // Check cache
  if (dailyMinGasPriceCache.has(dateKey)) {
    return dailyMinGasPriceCache.get(dateKey);
  }

  try {
    // Get start and end of day (UTC)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const startTimestamp = Math.floor(startOfDay.getTime() / 1000);
    const endTimestamp = Math.floor(endOfDay.getTime() / 1000);

    // Get block numbers for start and end of day
    console.log(`Getting blocks for ${dateKey}: start=${startTimestamp}, end=${endTimestamp}`);
    const startBlock = await getBlockNumberAtTimestamp(startTimestamp);
    const endBlock = await getBlockNumberAtTimestamp(endTimestamp);

    if (!startBlock || !endBlock) {
      console.error(`Could not get blocks for date ${dateKey}: startBlock=${startBlock}, endBlock=${endBlock}`);
      return null;
    }

    console.log(`Got blocks for ${dateKey}: startBlock=${startBlock}, endBlock=${endBlock}`);

    // Sample ~24 blocks throughout the day (every hour)
    // Ethereum has ~7200 blocks/day, so sample every 300 blocks (~1 hour)
    // Reduced from 96 to minimize API calls while still getting good accuracy
    const sampleInterval = Math.floor((endBlock - startBlock) / 24);
    const samplesToFetch = [];

    for (let block = startBlock; block <= endBlock; block += sampleInterval) {
      samplesToFetch.push(block);
    }

    console.log(`Sampling ${samplesToFetch.length} blocks for ${dateKey} (blocks ${startBlock}-${endBlock})`);

    // Fetch gas prices for sampled blocks (with rate limiting)
    let minGasPrice = Infinity;
    let optimalBlock = null;

    for (const block of samplesToFetch) {
      const gasPrice = await getBlockGasPrice(block);

      if (gasPrice && gasPrice < minGasPrice) {
        minGasPrice = gasPrice;
        optimalBlock = block;
      }

      // Rate limiting: 2 calls per second (500ms delay for safety)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (minGasPrice === Infinity) {
      console.error(`No valid gas prices found for ${dateKey}`);
      return null;
    }

    const result = {
      minGasPrice,
      optimalBlock,
      date: dateKey,
      sampleCount: samplesToFetch.length
    };

    // Cache forever (historical data doesn't change)
    dailyMinGasPriceCache.set(dateKey, result);

    console.log(`Daily minimum for ${dateKey}: ${minGasPrice.toFixed(2)} Gwei at block ${optimalBlock}`);

    return result;
  } catch (error) {
    console.error(`Error calculating daily minimum for ${dateKey}:`, error.message);
    return null;
  }
}

/**
 * Get optimal gas price at a specific timestamp from historical data
 * Uses real blockchain data via Etherscan API
 * @param {number} timestamp - Unix timestamp
 * @param {number} actualGasPaid - The actual gas price paid (for context)
 * @returns {Promise<Object>} {price, dataSource} - Optimal gas price in Gwei and data source type
 */
async function getOptimalGasPriceAtTime(timestamp, actualGasPaid) {
  const dailyMin = await getDailyMinimumGasPrice(timestamp);

  if (dailyMin && dailyMin.minGasPrice) {
    console.log(`Using accurate historical data for ${new Date(timestamp * 1000).toISOString().split('T')[0]}: ${dailyMin.minGasPrice.toFixed(4)} Gwei`);
    return {
      price: dailyMin.minGasPrice,
      dataSource: 'verified'
    };
  }

  // Smart fallback strategy when we don't have exact historical data
  // Strategy 1: Look for similar dates we DO have data for
  const nearbyDate = findNearestCachedDate(timestamp);
  if (nearbyDate) {
    console.warn(`Using nearby date data (${nearbyDate.date}) as estimate for ${new Date(timestamp * 1000).toISOString().split('T')[0]}: ${nearbyDate.minGasPrice.toFixed(4)} Gwei`);
    return {
      price: nearbyDate.minGasPrice,
      dataSource: 'nearby_date'
    };
  }

  // Strategy 2: Use average of all cached minimums if available
  if (dailyMinGasPriceCache.size > 0) {
    const allMins = Array.from(dailyMinGasPriceCache.values()).map(d => d.minGasPrice);
    const avgMin = allMins.reduce((sum, val) => sum + val, 0) / allMins.length;
    console.warn(`Using average of cached minimums for ${new Date(timestamp * 1000).toISOString().split('T')[0]}: ${avgMin.toFixed(4)} Gwei (from ${dailyMinGasPriceCache.size} days)`);
    return {
      price: avgMin,
      dataSource: 'average'
    };
  }

  // Strategy 3: Use 70% of actual price paid (conservative estimate)
  // Assume typical daily minimum is 70% of peak prices
  const fallbackOptimal = actualGasPaid * 0.70;
  console.warn(`Using fallback estimate for ${new Date(timestamp * 1000).toISOString().split('T')[0]}: ${fallbackOptimal.toFixed(4)} Gwei (70% of actual: ${actualGasPaid.toFixed(4)} Gwei)`);
  return {
    price: fallbackOptimal,
    dataSource: 'fallback'
  };
}

/**
 * Find the nearest date in cache to use as estimate
 * @param {number} timestamp - Target timestamp
 * @returns {Object|null} Cached data from nearest date
 */
function findNearestCachedDate(timestamp) {
  const targetDate = new Date(timestamp * 1000);
  const targetDateKey = targetDate.toISOString().split('T')[0];

  let nearest = null;
  let minDiff = Infinity;

  for (const [dateKey, data] of dailyMinGasPriceCache.entries()) {
    const cachedDate = new Date(dateKey);
    const diff = Math.abs(cachedDate - targetDate);

    // Only consider dates within 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000 && diff < minDiff) {
      minDiff = diff;
      nearest = { ...data, date: dateKey };
    }
  }

  return nearest;
}

/**
 * Get human-readable label for data source
 * @param {string} dataSource - Data source type
 * @returns {string} Human-readable label
 */
function getDataSourceLabel(dataSource) {
  const labels = {
    'verified': '✓ Verified blockchain data',
    'nearby_date': '~ Estimated from nearby date',
    'average': '~ Estimated from average',
    'fallback': '~ Rough estimate (70%)'
  };
  return labels[dataSource] || '~ Estimated';
}

/**
 * Calculate savings for a single transaction
 * @param {Object} transaction - Transaction object
 * @returns {Promise<Object>} Savings calculation
 */
async function calculateTransactionSavings(transaction) {
  // Convert gas price from Wei to Gwei
  const gasPricePaidGwei = transaction.gasPrice / 1e9;

  // Get optimal gas price at transaction time (from historical data)
  const optimalData = await getOptimalGasPriceAtTime(transaction.timeStamp, gasPricePaidGwei);
  const optimalGasPriceGwei = optimalData.price;
  const dataSource = optimalData.dataSource;

  // Calculate costs in ETH
  const actualCostETH = (transaction.gasUsed * gasPricePaidGwei) / 1e9;
  const optimalCostETH = (transaction.gasUsed * optimalGasPriceGwei) / 1e9;

  // Calculate savings in ETH and USD
  // Positive = saved money (paid less than optimal)
  // Negative = overpaid (paid more than optimal)
  const savingsETH = optimalCostETH - actualCostETH;
  const savingsUSD = savingsETH * ETH_USD_PRICE;

  // Calculate savings percentage
  const savingsPercent = actualCostETH > 0
    ? ((savingsETH / actualCostETH) * 100)
    : 0;

  // Determine timing rating
  let timingRating;
  if (gasPricePaidGwei <= optimalGasPriceGwei * 1.1) {
    timingRating = 'Perfect timing!';
  } else if (gasPricePaidGwei <= optimalGasPriceGwei * 1.5) {
    timingRating = 'Good timing';
  } else if (gasPricePaidGwei <= optimalGasPriceGwei * 2) {
    timingRating = 'Could be better';
  } else {
    timingRating = 'Poor timing - could save ' + Math.abs(savingsPercent).toFixed(0) + '%';
  }

  const wasOptimal = gasPricePaidGwei <= optimalGasPriceGwei * 1.1; // Within 10% is considered good

  return {
    hash: transaction.hash,
    timestamp: transaction.timeStamp,
    blockNumber: transaction.blockNumber,
    gasUsed: transaction.gasUsed,
    gasPricePaid: gasPricePaidGwei,
    optimalGasPrice: optimalGasPriceGwei,
    actualCostUSD: actualCostETH * ETH_USD_PRICE,
    optimalCostUSD: optimalCostETH * ETH_USD_PRICE,
    savingsUSD: savingsUSD,
    savingsPercent: savingsPercent,
    wasOptimal: wasOptimal,
    timingRating: timingRating,
    dataSource: dataSource,
    dataSourceLabel: getDataSourceLabel(dataSource),
  };
}

/**
 * Generate comprehensive savings report for a wallet
 * @param {string} walletAddress - Ethereum wallet address
 * @returns {Object} Savings report
 */
async function getUserSavingsReport(walletAddress) {
  // Check MongoDB cache first
  try {
    const cached = await TransactionCache.findOne({
      walletAddress: walletAddress.toLowerCase()
    });

    if (cached && (Date.now() - cached.lastUpdated.getTime()) < CACHE_DURATION) {
      console.log(`Using cached data for ${walletAddress}`);
      return cached.data;
    }
  } catch (error) {
    console.error('Error checking cache:', error.message);
    // Continue to fetch fresh data
  }

  try {
    // Fetch transactions
    const transactions = await fetchUserTransactions(walletAddress);

    if (transactions.length === 0) {
      const emptyReport = {
        walletAddress,
        transactionCount: 0,
        totalSavedUSD: 0,
        avgSavingsPercent: 0,
        optimalTimingCount: 0,
        transactions: [],
        lastSynced: Date.now(),
      };

      // Cache empty result in MongoDB
      try {
        await TransactionCache.findOneAndUpdate(
          { walletAddress: walletAddress.toLowerCase() },
          {
            walletAddress: walletAddress.toLowerCase(),
            data: emptyReport,
            lastUpdated: new Date()
          },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error caching empty report:', error.message);
      }

      return emptyReport;
    }

    // Calculate savings for each transaction (with Promise.all for async)
    console.log(`Calculating savings for ${transactions.length} transactions...`);
    const transactionSavings = await Promise.all(
      transactions.map(tx => calculateTransactionSavings(tx))
    );

    // Aggregate statistics
    const totalSavedUSD = transactionSavings.reduce((sum, tx) => sum + tx.savingsUSD, 0);
    const optimalTimingCount = transactionSavings.filter(tx => tx.wasOptimal).length;

    // Calculate average savings percentage (weighted by transaction cost)
    const totalCost = transactionSavings.reduce((sum, tx) => sum + tx.actualCostUSD, 0);
    const avgSavingsPercent = totalCost > 0
      ? (totalSavedUSD / totalCost) * 100
      : 0;

    const report = {
      walletAddress,
      transactionCount: transactions.length,
      totalSavedUSD: parseFloat(totalSavedUSD.toFixed(2)),
      avgSavingsPercent: parseFloat(avgSavingsPercent.toFixed(2)),
      optimalTimingCount,
      transactions: transactionSavings.slice(0, 10), // Return last 10 for display
      lastSynced: Date.now(),
    };

    // Cache the result in MongoDB
    try {
      await TransactionCache.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        {
          walletAddress: walletAddress.toLowerCase(),
          data: report,
          lastUpdated: new Date()
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error caching report:', error.message);
    }

    console.log(`Generated savings report for ${walletAddress}: $${totalSavedUSD.toFixed(2)} saved`);

    return report;
  } catch (error) {
    console.error('Error generating savings report:', error.message);

    // If we have stale cached data, return it instead of failing
    try {
      const staleCache = await TransactionCache.findOne({
        walletAddress: walletAddress.toLowerCase()
      });

      if (staleCache && staleCache.data) {
        console.log(`Returning stale cached data for ${walletAddress} due to error`);
        return staleCache.data;
      }
    } catch (cacheError) {
      console.error('Error checking stale cache:', cacheError.message);
    }

    // No cache available, throw error
    throw error;
  }
}

/**
 * Clear cache for a specific wallet (for manual refresh)
 * @param {string} walletAddress - Ethereum wallet address
 */
async function clearCache(walletAddress) {
  try {
    await TransactionCache.deleteOne({ walletAddress: walletAddress.toLowerCase() });
    console.log(`Cache cleared for ${walletAddress}`);
  } catch (error) {
    console.error(`Error clearing cache for ${walletAddress}:`, error.message);
  }
}

/**
 * Clear all cached data
 */
async function clearAllCache() {
  try {
    await TransactionCache.deleteMany({});
    console.log('All transaction cache cleared');
  } catch (error) {
    console.error('Error clearing all cache:', error.message);
  }
}

module.exports = {
  fetchUserTransactions,
  calculateTransactionSavings,
  getUserSavingsReport,
  clearCache,
  clearAllCache,
  getDailyMinimumGasPrice,
};
