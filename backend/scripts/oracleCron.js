import { predictionOracle } from '../src/services/predictionOracle.js';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Automated Oracle Cron Job
 * Runs every 5 minutes to check and resolve predictions
 */

let isRunning = false;

async function runOracleJob() {
  if (isRunning) {
    console.log('⏭️  Oracle job already running, skipping...');
    return;
  }

  isRunning = true;
  const timestamp = new Date().toLocaleString();
  
  try {
    console.log(`\n⏰ [${timestamp}] Starting oracle job...`);
    
    const summary = await predictionOracle.resolveAllPending();
    
    if (summary.resolved > 0) {
      console.log(`✅ [${timestamp}] Resolved ${summary.resolved} predictions`);
    } else {
      console.log(`😴 [${timestamp}] No pending predictions`);
    }
  } catch (error) {
    console.error(`❌ [${timestamp}] Oracle job failed:`, error.message);
  } finally {
    isRunning = false;
  }
}

async function startOracle() {
  console.log('🤖 GasGuard Automated Oracle Service\n');
  console.log('=' .repeat(50));

  try {
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ ORACLE_PRIVATE_KEY not found in .env file');
      console.log('\n💡 Add this to your .env file:');
      console.log('ORACLE_PRIVATE_KEY=your_wallet_private_key_here\n');
      process.exit(1);
    }

    console.log('🔌 Initializing oracle...');
    const initialized = await predictionOracle.initialize(privateKey);
    
    if (!initialized) {
      console.error('❌ Failed to initialize oracle');
      process.exit(1);
    }

    console.log('✅ Oracle initialized successfully');
    await predictionOracle.getBalance();
    
    console.log('\n⏰ Starting cron job (runs every 5 minutes)...');
    console.log('Press Ctrl+C to stop\n');
    console.log('=' .repeat(50));

    // Run every 5 minutes
    cron.schedule('*/5 * * * *', runOracleJob);

    // Run immediately on startup
    await runOracleJob();

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down oracle service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down oracle service...');
  process.exit(0);
});

// Start the service
startOracle();
