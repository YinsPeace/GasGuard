const TelegramBot = require('node-telegram-bot-api');
const User = require('./models/User');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
let bot = null;

// Initialize bot only if token is provided
function initBot() {
  if (!BOT_TOKEN) {
    console.log('⚠️  Telegram bot token not found. Telegram alerts disabled.');
    return null;
  }

  try {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('✅ Telegram bot initialized');

    // Handle /start command with wallet address
    bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const walletAddress = match[1].toLowerCase();

      try {
        // Find or create user, preserving existing threshold
        let user = await User.findOne({ walletAddress });

        const preservedThreshold = user?.gasThreshold || 50;

        console.log(`📱 [TELEGRAM] User connecting: ${walletAddress}`);
        console.log(`📊 [TELEGRAM] Existing threshold: ${user?.gasThreshold || 'none (using default 50)'}`);
        console.log(`✅ [TELEGRAM] Preserving threshold: ${preservedThreshold} Gwei`);

        // Update or create user with preserved threshold
        user = await User.findOneAndUpdate(
          { walletAddress },
          {
            walletAddress,
            telegramChatId: chatId.toString(),
            gasThreshold: preservedThreshold,
            bestTimeAlerts: user?.bestTimeAlerts !== undefined ? user.bestTimeAlerts : true,
            trendAlerts: user?.trendAlerts !== undefined ? user.trendAlerts : true,
            alertsEnabled: true,
            connectedAt: new Date()
          },
          { upsert: true, new: true }
        );

        const shortWallet = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
        bot.sendMessage(
          chatId,
          '✅ *Connected to GasGuard!*\n\n' +
          `Wallet: \`${shortWallet}\`\n` +
          `Alert threshold: *${preservedThreshold} Gwei*\n\n` +
          `You'll receive alerts when:\n` +
          `🔔 Gas drops below ${preservedThreshold} Gwei\n` +
          `⏰ Optimal time windows arrive\n` +
          `📈 Major price trends occur\n\n` +
          `Change your threshold at gasguard.gen-a.dev`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('❌ [TELEGRAM] Error connecting user:', error);
        bot.sendMessage(chatId, '❌ Failed to connect. Please try again later.');
      }
    });

    // Handle /status command
    bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        // Find user by chatId
        const user = await User.findOne({ telegramChatId: chatId.toString() });

        if (!user) {
          bot.sendMessage(chatId, '❌ Not connected. Use /start <wallet_address> to connect.');
          return;
        }

        const shortWallet = `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}`;
        bot.sendMessage(
          chatId,
          '📊 *Alert Status*\n\n' +
          `Wallet: \`${shortWallet}\`\n` +
          `Threshold: ${user.gasThreshold} Gwei\n` +
          `Best Time Alerts: ${user.bestTimeAlerts ? '✅' : '❌'}\n` +
          `Trend Alerts: ${user.trendAlerts ? '✅' : '❌'}`,
          { parse_mode: 'Markdown' }
        );
      } catch (error) {
        console.error('❌ [TELEGRAM] Error getting status:', error);
        bot.sendMessage(chatId, '❌ Failed to get status. Please try again later.');
      }
    });

    return bot;
  } catch (error) {
    console.error('Error initializing Telegram bot:', error.message);
    return null;
  }
}

// Format alert message based on type
function formatAlertMessage(alertData) {
  const { type, currentPrice, threshold, savingsPercent, windowEnd, reason } = alertData;

  switch (type) {
    case 'THRESHOLD':
      return (
        '🚨 *Gas Price Alert!*\n\n' +
        `Gas dropped to *${currentPrice.toFixed(2)} Gwei*!\n\n` +
        `This is ${savingsPercent}% below your threshold (${threshold} Gwei)\n\n` +
        `💰 Great time to send your transaction and save on fees!\n\n` +
        `[Open Dashboard](${FRONTEND_URL})`
      );

    case 'BEST_TIME':
      return (
        '⏰ *Optimal Gas Window Now!*\n\n' +
        `Current price: *${currentPrice.toFixed(2)} Gwei*\n\n` +
        `This is an optimal time to transact based on historical patterns.\n` +
        `Window continues until ~${windowEnd}:00 UTC\n\n` +
        `💡 Send your transactions now to maximize savings!\n\n` +
        `[View Forecast](${FRONTEND_URL})`
      );

    case 'TREND_REVERSAL':
      return (
        '📈 *Gas Price Trend Alert*\n\n' +
        `Current price: *${currentPrice.toFixed(2)} Gwei*\n\n` +
        `${reason}\n\n` +
        `[Check Forecast](${FRONTEND_URL})`
      );

    default:
      return `Gas price update: ${currentPrice.toFixed(2)} Gwei`;
  }
}

// Send alert to user (with spam prevention)
async function sendGasAlert(walletAddress, alertData, skipSpamCheck = false) {
  if (!bot) {
    throw new Error('Telegram bot not initialized');
  }

  try {
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      throw new Error('User not found in database');
    }
    
    if (!user.telegramChatId) {
      throw new Error('User not connected to Telegram');
    }
    
    // Allow test alerts even if alerts are disabled
    if (!skipSpamCheck && !user.alertsEnabled) {
      console.log(`⏭️  [TELEGRAM] Alerts disabled for ${walletAddress}`);
      return;
    }

    // Spam prevention: max 1 alert per type per hour (skip for test alerts)
    if (!skipSpamCheck) {
      const now = Date.now();
      const hourInMs = 60 * 60 * 1000;
      
      // Map alert types to database field names
      const alertTypeMap = {
        'THRESHOLD': 'threshold',
        'BEST_TIME': 'bestTime',
        'TREND_REVERSAL': 'trend'
      };
      const alertType = alertTypeMap[alertData.type] || 'threshold';

      const lastAlertTime = user.lastAlerts[alertType] || 0;
      if (lastAlertTime && (now - lastAlertTime) < hourInMs) {
        console.log(`⏭️  [TELEGRAM] Skipping ${alertData.type} alert for ${walletAddress} - sent ${Math.round((now - lastAlertTime) / 60000)} minutes ago`);
        return; // Skip this alert - too soon since last one
      }

      // Update last alert timestamp
      user.lastAlerts[alertType] = now;
      await user.save();
    }

    const message = formatAlertMessage(alertData);
    
    const alertTypeLabel = skipSpamCheck ? 'TEST' : alertData.type;
    console.log(`📤 [TELEGRAM] Sending ${alertTypeLabel} alert to ${walletAddress}`);

    await bot.sendMessage(user.telegramChatId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [[
          { text: '📊 Open Dashboard', url: FRONTEND_URL }
        ]]
      }
    });

    console.log(`✅ [TELEGRAM] ${alertTypeLabel} alert sent successfully to ${walletAddress}`);
  } catch (error) {
    console.error('❌ [TELEGRAM] Error sending alert:', error.message);
  }
}

// Update user alert settings
async function updateAlertSettings(walletAddress, settings) {
  console.log(`⚙️  [TELEGRAM] Updating alert settings for ${walletAddress}:`, settings);

  try {
    const updateData = {};

    if (settings.threshold !== undefined) {
      console.log(`🔧 [TELEGRAM] Updating threshold to ${settings.threshold}`);
      updateData.gasThreshold = settings.threshold;
    }
    if (settings.bestTimeAlerts !== undefined) {
      updateData.bestTimeAlerts = settings.bestTimeAlerts;
    }
    if (settings.trendAlerts !== undefined) {
      updateData.trendAlerts = settings.trendAlerts;
    }

    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      updateData,
      { new: true }
    );

    if (!user) {
      console.log(`❌ [TELEGRAM] User not found: ${walletAddress}`);
      return false;
    }

    console.log(`✅ [TELEGRAM] Settings updated. New threshold: ${user.gasThreshold} Gwei`);
    return true;
  } catch (error) {
    console.error('❌ [TELEGRAM] Error updating settings:', error);
    return false;
  }
}

// Get user alert settings
async function getAlertSettings(walletAddress) {
  try {
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return {
        connected: false,
        threshold: null,
        bestTimeAlerts: null,
        trendAlerts: null
      };
    }

    return {
      connected: !!user.telegramChatId,
      threshold: user.gasThreshold,
      bestTimeAlerts: user.bestTimeAlerts,
      trendAlerts: user.trendAlerts
    };
  } catch (error) {
    console.error('❌ [TELEGRAM] Error getting settings:', error);
    return {
      connected: false,
      threshold: null,
      bestTimeAlerts: null,
      trendAlerts: null
    };
  }
}

// Check if user has Telegram connected
async function isUserConnected(walletAddress) {
  try {
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    return !!(user && user.telegramChatId);
  } catch (error) {
    console.error('❌ [TELEGRAM] Error checking connection:', error);
    return false;
  }
}

// Get all connected users for alert checking
async function getAllUsers() {
  try {
    const users = await User.find({
      telegramChatId: { $ne: null },
      alertsEnabled: true
    });

    // Convert to Map format for compatibility with existing code
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.walletAddress, {
        chatId: user.telegramChatId,
        threshold: user.gasThreshold,
        bestTimeAlerts: user.bestTimeAlerts,
        trendAlerts: user.trendAlerts,
        lastAlerts: user.lastAlerts
      });
    });

    return userMap;
  } catch (error) {
    console.error('❌ [TELEGRAM] Error getting users:', error);
    return new Map();
  }
}

// Set user threshold (even if not connected yet)
async function setUserThreshold(walletAddress, threshold) {
  const wallet = walletAddress.toLowerCase();

  console.log(`💾 [TELEGRAM] Setting threshold for ${walletAddress}: ${threshold} Gwei`);

  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: wallet },
      {
        walletAddress: wallet,
        gasThreshold: threshold
      },
      { upsert: true, new: true }
    );

    console.log(`✅ [TELEGRAM] Threshold saved: ${user.gasThreshold} Gwei`);
    console.log(`📊 [TELEGRAM] User data:`, {
      walletAddress: user.walletAddress,
      gasThreshold: user.gasThreshold,
      telegramConnected: !!user.telegramChatId
    });

    return true;
  } catch (error) {
    console.error('❌ [TELEGRAM] Error setting threshold:', error);
    return false;
  }
}

module.exports = {
  initBot,
  sendGasAlert,
  updateAlertSettings,
  getAlertSettings,
  isUserConnected,
  getAllUsers,
  setUserThreshold
};
