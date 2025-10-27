// Multi-chain API routes
const express = require('express');
const router = express.Router();
const { BlockscoutApi, SUPPORTED_CHAINS } = require('../services/blockscoutApi');

// Middleware to validate chain parameter
function validateChain(req, res, next) {
  const chain = req.query.chain || req.params.chain || 'ethereum';
  
  if (!SUPPORTED_CHAINS.includes(chain)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported chain. Valid chains: ${SUPPORTED_CHAINS.join(', ')}`
    });
  }
  
  req.chain = chain;
  req.chainApi = new BlockscoutApi(chain);
  next();
}

// Get supported chains
router.get('/chains', (req, res) => {
  const chainDetails = SUPPORTED_CHAINS.map(id => {
    const config = require('../../../shared/chainConfig')[id];
    return config || { id, name: id };
  });
  
  res.json({
    success: true,
    data: chainDetails
  });
});

// Get current gas price for specific chain
router.get('/gas/:chain', validateChain, async (req, res) => {
  try {
    const gasPrice = await req.chainApi.getCurrentGasPrice();
    res.json({
      success: true,
      data: gasPrice
    });
  } catch (error) {
    console.error(`Gas price error for ${req.chain}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction analysis for specific chain
router.get('/savings/:chain/:walletAddress', validateChain, async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }
    
    // Fetch transactions using Blockscout
    const transactions = await req.chainApi.fetchUserTransactions(walletAddress);
    
    if (transactions.length === 0) {
      return res.json({
        success: true,
        data: {
          chain: req.chain,
          totalTransactions: 0,
          totalOverpayment: 0,
          averageOverpayment: 0,
          potentialSavings: 0,
          message: 'No transactions found for this address on this chain'
        }
      });
    }
    
    // Analyze overpayment (simplified for now)
    let totalOverpayment = 0;
    let analyzedCount = 0;
    
    for (const tx of transactions.slice(0, 100)) { // Analyze last 100 txs
      const txGasPrice = parseInt(tx.gasPrice) / 1e9; // Convert to Gwei
      const txTimestamp = parseInt(tx.timeStamp) * 1000;
      
      // Get historical minimum for that day
      try {
        const historicalGas = await req.chainApi.getHistoricalDailyGasPrice(txTimestamp);
        const optimalGas = historicalGas.min;
        
        if (txGasPrice > optimalGas) {
          const overpayment = txGasPrice - optimalGas;
          const gasUsed = parseInt(tx.gasUsed || tx.gas);
          const overpaymentEth = (overpayment * gasUsed) / 1e9;
          totalOverpayment += overpaymentEth;
          analyzedCount++;
        }
      } catch (err) {
        // Skip if we can't get historical data
        console.log(`Skipping tx ${tx.hash}: ${err.message}`);
      }
    }
    
    const averageOverpayment = analyzedCount > 0 ? totalOverpayment / analyzedCount : 0;
    const monthlyProjection = averageOverpayment * 30; // Rough monthly estimate
    
    res.json({
      success: true,
      data: {
        chain: req.chain,
        walletAddress,
        totalTransactions: transactions.length,
        analyzedTransactions: analyzedCount,
        totalOverpayment: totalOverpayment.toFixed(6),
        averageOverpayment: averageOverpayment.toFixed(6),
        monthlyPotentialSavings: monthlyProjection.toFixed(4),
        currency: req.chain === 'bsc' ? 'BNB' : req.chain === 'polygon' ? 'MATIC' : 'ETH'
      }
    });
    
  } catch (error) {
    console.error(`Savings analysis error for ${req.chain}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get gas price history for chart
router.get('/history/:chain', validateChain, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const history = [];
    const now = Date.now();
    const interval = 60 * 60 * 1000; // 1 hour intervals
    
    for (let i = 0; i < parseInt(hours); i++) {
      const timestamp = now - (i * interval);
      try {
        const gasData = await req.chainApi.getHistoricalDailyGasPrice(timestamp);
        history.push({
          timestamp,
          ...gasData
        });
      } catch (err) {
        // Use current if historical fails
        const current = await req.chainApi.getCurrentGasPrice();
        history.push({
          timestamp,
          min: current.safe,
          avg: current.proposed,
          max: current.fast
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        chain: req.chain,
        history: history.reverse() // Oldest first
      }
    });
    
  } catch (error) {
    console.error(`History error for ${req.chain}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
