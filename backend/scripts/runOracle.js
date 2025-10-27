import { predictionOracle } from '../src/services/predictionOracle.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Manual Oracle Runner
 * Run this script to resolve all pending predictions
 */
async function main() {
  console.log('🤖 GasGuard Prediction Oracle\n');
  console.log('=' .repeat(50));

  try {
    // Get oracle private key from environment
    const privateKey = process.env.ORACLE_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('❌ ORACLE_PRIVATE_KEY not found in .env file');
      console.log('\n💡 Add this to your .env file:');
      console.log('ORACLE_PRIVATE_KEY=your_wallet_private_key_here\n');
      process.exit(1);
    }

    // Initialize oracle
    console.log('🔌 Initializing oracle...');
    const initialized = await predictionOracle.initialize(privateKey);
    
    if (!initialized) {
      console.error('❌ Failed to initialize oracle');
      process.exit(1);
    }

    // Check oracle wallet balance
    await predictionOracle.getBalance();

    // Resolve all pending predictions
    const summary = await predictionOracle.resolveAllPending();

    // Display final results
    console.log('=' .repeat(50));
    if (summary.resolved > 0) {
      console.log('🎉 Oracle run completed successfully!\n');
      summary.results.forEach(result => {
        if (result.success) {
          console.log(`✅ Prediction #${result.predictionId}: ${result.accuracy.toFixed(1)}% accuracy`);
          console.log(`   TX: https://testnet.bscscan.com/tx/${result.txHash}`);
        }
      });
    } else if (summary.total === 0) {
      console.log('😴 No predictions to resolve. Try again later!\n');
    } else {
      console.log('⚠️  Some predictions failed to resolve. Check logs above.\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the oracle
main();
