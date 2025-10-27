const gasTracker = require('./gasTracker');

// In-memory storage for user transactions (in production, use MongoDB)
const userTransactions = new Map();
const ETH_PRICE_USD = 2500; // Simplified - in production, fetch from CoinGecko/CoinMarketCap

// Track a transaction for a user
function trackTransaction(walletAddress, txHash, gasUsed, gasPriceGwei) {
  if (!userTransactions.has(walletAddress)) {
    userTransactions.set(walletAddress, []);
  }

  const transactions = userTransactions.get(walletAddress);

  // Get what the gas price was when they first checked (assuming they saw it in our dashboard)
  const history = gasTracker.getHistory();
  const wouldHaveGasPrice = history.length > 0 ? history[history.length - 1].proposed : gasPriceGwei;

  const transaction = {
    txHash,
    timestamp: Date.now(),
    gasUsed,
    actualGasPriceGwei: gasPriceGwei,
    wouldHaveGasPriceGwei: wouldHaveGasPrice,
    actualCostETH: (gasUsed * gasPriceGwei) / 1e9,
    wouldHaveCostETH: (gasUsed * wouldHaveGasPrice) / 1e9,
    savingsETH: ((gasUsed * wouldHaveGasPrice) / 1e9) - ((gasUsed * gasPriceGwei) / 1e9)
  };

  transactions.push(transaction);
  return transaction;
}

// Calculate savings for a wallet address
function calculateSavings(walletAddress) {
  const transactions = userTransactions.get(walletAddress) || [];

  // Filter to current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthTransactions = transactions.filter(tx => tx.timestamp >= firstDayOfMonth);

  if (monthTransactions.length === 0) {
    return {
      totalSavingsUSD: 0,
      totalSavingsETH: 0,
      transactionCount: 0,
      averageSavingsPercent: 0,
      optimalTimingCount: 0,
      wouldHavePaid: 0,
      actuallyPaid: 0
    };
  }

  const totalSavingsETH = monthTransactions.reduce((sum, tx) => sum + tx.savingsETH, 0);
  const totalActualCostETH = monthTransactions.reduce((sum, tx) => sum + tx.actualCostETH, 0);
  const totalWouldHaveCostETH = monthTransactions.reduce((sum, tx) => sum + tx.wouldHaveCostETH, 0);

  const optimalTimingCount = monthTransactions.filter(tx => tx.savingsETH > 0).length;
  const averageSavingsPercent = totalWouldHaveCostETH > 0
    ? ((totalSavingsETH / totalWouldHaveCostETH) * 100)
    : 0;

  return {
    totalSavingsUSD: totalSavingsETH * ETH_PRICE_USD,
    totalSavingsETH,
    transactionCount: monthTransactions.length,
    averageSavingsPercent,
    optimalTimingCount,
    wouldHavePaid: totalWouldHaveCostETH * ETH_PRICE_USD,
    actuallyPaid: totalActualCostETH * ETH_PRICE_USD,
    recentTransactions: monthTransactions.slice(-5).reverse() // Last 5 transactions
  };
}

// Initialize sample transactions for new wallets
function initializeTransactions(walletAddress) {
  if (userTransactions.has(walletAddress)) {
    return; // Already has transactions
  }

  const sampleTxs = [
    { gasUsed: 21000, gasPriceGwei: 8.5, wouldHaveGasPrice: 15.2 },
    { gasUsed: 65000, gasPriceGwei: 12.1, wouldHaveGasPrice: 18.7 },
    { gasUsed: 150000, gasPriceGwei: 9.8, wouldHaveGasPrice: 9.8 },
    { gasUsed: 45000, gasPriceGwei: 7.2, wouldHaveGasPrice: 14.5 },
    { gasUsed: 89000, gasPriceGwei: 11.3, wouldHaveGasPrice: 19.8 },
  ];

  userTransactions.set(walletAddress, []);
  const transactions = userTransactions.get(walletAddress);

  sampleTxs.forEach((tx, i) => {
    const savingsETH = ((tx.gasUsed * tx.wouldHaveGasPrice) / 1e9) - ((tx.gasUsed * tx.gasPriceGwei) / 1e9);
    transactions.push({
      txHash: `0xdemo${i}${walletAddress.slice(2, 10)}`,
      timestamp: Date.now() - (i * 24 * 60 * 60 * 1000), // Spread over last 5 days
      gasUsed: tx.gasUsed,
      actualGasPriceGwei: tx.gasPriceGwei,
      wouldHaveGasPriceGwei: tx.wouldHaveGasPrice,
      actualCostETH: (tx.gasUsed * tx.gasPriceGwei) / 1e9,
      wouldHaveCostETH: (tx.gasUsed * tx.wouldHaveGasPrice) / 1e9,
      savingsETH
    });
  });
}

module.exports = {
  trackTransaction,
  calculateSavings,
  initializeTransactions
};
