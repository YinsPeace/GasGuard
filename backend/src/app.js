const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./database');
const gasTracker = require('./gasTracker');
const savingsTracker = require('./savingsTracker');
const predictor = require('./gasPricePredictor');
const telegramBot = require('./telegramBot');
const stripeHandler = require('./stripe');
const transactionTracker = require('./transactionTracker');
const analytics = require('./analytics');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Stripe webhook needs raw body, so add this BEFORE express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    await stripeHandler.handleWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.use(express.json());

// Multi-chain routes (NEW!)
const multichainRoutes = require('./routes/multichain');
app.use('/api/multichain', multichainRoutes);

// Gas price endpoints (original - keep for backward compatibility)
app.get('/api/gas/current', async (req, res) => {
  try {
    const prices = await gasTracker.getCurrentGasPrices();
    res.json({ success: true, data: prices });
  } catch (error) {
    console.error('Error in /api/gas/current:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/gas/predict', async (req, res) => {
  try {
    const prediction = await gasTracker.predictGasTrend();
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/gas/history', (req, res) => {
  const history = gasTracker.getHistory();
  res.json({ success: true, data: history });
});

app.get('/api/gas/forecast', (req, res) => {
  try {
    const forecast = predictor.getForecast();
    res.json({ success: true, data: forecast });
  } catch (error) {
    console.error('Error getting forecast:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real transaction tracking endpoints
app.get('/api/transactions/savings/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address format' });
    }

    const savingsReport = await transactionTracker.getUserSavingsReport(walletAddress);
    res.json({ success: true, data: savingsReport });
  } catch (error) {
    console.error('Error fetching transaction savings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/transactions/refresh/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address format' });
    }

    // Clear cache to force fresh data
    transactionTracker.clearCache(walletAddress);

    const savingsReport = await transactionTracker.getUserSavingsReport(walletAddress);
    res.json({ success: true, data: savingsReport });
  } catch (error) {
    console.error('Error refreshing transaction data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to backfill missing historical data for a wallet's transactions
app.post('/api/transactions/backfill/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address format' });
    }

    console.log(`Starting backfill for wallet: ${walletAddress}`);

    // Get transactions
    const transactions = await transactionTracker.fetchUserTransactions(walletAddress);

    if (transactions.length === 0) {
      return res.json({
        success: true,
        message: 'No transactions found for this wallet',
        dates: 0,
        fetched: 0,
        skipped: 0
      });
    }

    // Get unique dates that need historical data
    const dates = [...new Set(
      transactions.map(tx => {
        const date = new Date(tx.timeStamp * 1000);
        return date.toISOString().split('T')[0];
      })
    )];

    console.log(`Backfilling ${dates.length} unique dates for ${walletAddress}`);

    // Fetch missing dates (this will cache them)
    let fetched = 0;
    let skipped = 0;

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const timestamp = Math.floor(date.getTime() / 1000);

      // This will fetch and cache if not already cached
      const result = await transactionTracker.getDailyMinimumGasPrice(timestamp);

      if (result) {
        fetched++;
        console.log(`✓ Fetched data for ${dateStr}`);
      } else {
        skipped++;
        console.log(`✗ Skipped ${dateStr} (already cached or failed)`);
      }
    }

    console.log(`Backfill complete: ${fetched} fetched, ${skipped} skipped`);

    res.json({
      success: true,
      message: `Backfilled ${fetched} dates, ${skipped} already cached or failed`,
      dates: dates.length,
      fetched,
      skipped
    });
  } catch (error) {
    console.error('Error backfilling data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy savings tracking endpoints (kept for backward compatibility)
app.get('/api/savings/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Initialize transaction data for new wallets
    savingsTracker.initializeTransactions(walletAddress);

    const savings = savingsTracker.calculateSavings(walletAddress);
    res.json({ success: true, data: savings });
  } catch (error) {
    console.error('Error fetching savings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/savings/track', (req, res) => {
  try {
    const { walletAddress, txHash, gasUsed, gasPriceGwei } = req.body;

    if (!walletAddress || !txHash || !gasUsed || !gasPriceGwei) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const transaction = savingsTracker.trackTransaction(walletAddress, txHash, gasUsed, gasPriceGwei);
    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error tracking transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alert management endpoints
app.get('/api/alerts/status/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const settings = await telegramBot.getAlertSettings(walletAddress);
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error getting alert status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/alerts/settings', async (req, res) => {
  try {
    const { walletAddress, threshold, bestTimeAlerts, trendAlerts } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }

    const updated = await telegramBot.updateAlertSettings(walletAddress, {
      threshold,
      bestTimeAlerts,
      trendAlerts
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not connected to Telegram' });
    }

    res.json({ success: true, data: { updated: true } });
  } catch (error) {
    console.error('Error updating alert settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update gas threshold for alerts
app.post('/api/alerts/threshold', async (req, res) => {
  try {
    const { walletAddress, gasThreshold } = req.body;

    if (!walletAddress || gasThreshold === undefined) {
      return res.status(400).json({ success: false, error: 'Missing parameters' });
    }

    // Update threshold in Telegram bot settings
    const updated = await telegramBot.updateAlertSettings(walletAddress, { threshold: gasThreshold });

    if (!updated) {
      // Even if user not connected yet, store it for future use
      await telegramBot.setUserThreshold(walletAddress, gasThreshold);
    }

    res.json({
      success: true,
      message: `Gas threshold updated to ${gasThreshold} Gwei`
    });
  } catch (error) {
    console.error('Error updating threshold:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send test alert to Telegram
app.post('/api/alerts/test', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }

    console.log(`🧪 [TEST ALERT] Request from ${walletAddress}`);

    // Get current gas price
    const currentPrices = await gasTracker.getCurrentGasPrices();
    
    if (!currentPrices || !currentPrices.proposed) {
      return res.status(500).json({ 
        success: false, 
        error: 'Gas price data not available yet. Please try again in a few seconds.' 
      });
    }
    
    // Send test alert (skip spam check for test alerts)
    await telegramBot.sendGasAlert(walletAddress, {
      type: 'THRESHOLD',
      currentPrice: currentPrices.proposed,
      threshold: 999, // High threshold to make it look like a good deal
      savingsPercent: 95
    }, true); // Skip spam check

    console.log(`✅ [TEST ALERT] Successfully sent to ${walletAddress}`);
    res.json({ 
      success: true, 
      message: 'Test alert sent to Telegram!' 
    });
  } catch (error) {
    console.error('❌ [TEST ALERT] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send test alert. Make sure you\'re connected to Telegram.'
    });
  }
});

// Stripe payment endpoints
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }

    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}`;

    const session = await stripeHandler.createCheckoutSession(walletAddress, successUrl, cancelUrl);

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stripe/subscription-status/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    console.log(`🔍 [DEBUG] Checking subscription status for wallet: ${walletAddress}`);

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.log('❌ [DEBUG] Invalid wallet address format');
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }

    const status = await stripeHandler.getSubscriptionStatus(walletAddress);

    console.log('✅ [DEBUG] Subscription status:', JSON.stringify(status, null, 2));

    res.json({ success: true, data: status });
  } catch (error) {
    console.error('❌ [DEBUG] Error getting subscription status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address required' });
    }

    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}`;
    const session = await stripeHandler.createPortalSession(walletAddress, returnUrl);

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/stripe/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID required' });
    }

    const result = await stripeHandler.verifyAndActivateSession(sessionId);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics endpoint (protected by API key)
app.get('/api/admin/analytics', async (req, res) => {
  try {
    // API key protection
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.ADMIN_API_KEY || 'dev-key-change-in-production';
    
    if (apiKey !== expectedKey) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const summary = await analytics.getAnalyticsSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect to MongoDB before starting server
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.log('⚠️  App will run with in-memory storage only');
});

app.listen(PORT, async () => {
  console.log(`GasGuard backend running on port ${PORT}`);

  // Initialize Telegram bot
  telegramBot.initBot();

  // Start gas price tracking
  gasTracker.startTracking();

  // Log analytics summary after a brief delay (to ensure DB is connected)
  setTimeout(async () => {
    try {
      await analytics.logAnalyticsSummary();
    } catch (error) {
      console.log('Analytics not available yet (DB still connecting)');
    }
  }, 3000);
});
