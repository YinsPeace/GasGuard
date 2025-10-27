/**
 * Super Simple Prediction Resolution Script
 * No Hardhat needed! Just Node.js + ethers
 */

const ethers = require('ethers');
const axios = require('axios');
require('dotenv').config();

// Contract details (v2 with decimal support)
const CONTRACT_ADDRESS = '0xA18F113ADC48B3823057ED892989320b5FD5C055';
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "predictionCount",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "predictionId", "type": "uint256"}],
    "name": "getPrediction",
    "outputs": [
      {"name": "predictor", "type": "address"},
      {"name": "chainId", "type": "uint256"},
      {"name": "targetTimestamp", "type": "uint256"},
      {"name": "predictedMilliGwei", "type": "uint256"},
      {"name": "actualMilliGwei", "type": "uint256"},
      {"name": "resolved", "type": "bool"},
      {"name": "accuracyScore", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_predictionId", "type": "uint256"},
      {"name": "_actualMilliGwei", "type": "uint256"}
    ],
    "name": "resolvePrediction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function main() {
  console.log('\n🤖 Simple Prediction Resolver\n');
  console.log('=' .repeat(60));

  // Check for private key
  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY not found in .env file');
    console.log('\n💡 Add this to your backend/.env file:');
    console.log('PRIVATE_KEY=your_metamask_private_key_here\n');
    process.exit(1);
  }

  try {
    // Connect to BSC Testnet
    console.log('🔌 Connecting to BSC Testnet...');
    const provider = new ethers.providers.JsonRpcProvider(
      'https://data-seed-prebsc-1-s1.binance.org:8545'
    );

    // Create wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log('✅ Connected with wallet:', wallet.address);

    // Check balance
    const balance = await wallet.getBalance();
    const balanceBNB = ethers.utils.formatEther(balance);
    console.log('💰 Balance:', balanceBNB, 'BNB');

    if (parseFloat(balanceBNB) < 0.001) {
      console.warn('⚠️  Low balance! Get tBNB from faucet: https://testnet.bnbchain.org/faucet-smart\n');
    }

    // Connect to contract
    console.log('\n📝 Connecting to contract...');
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    // Get total predictions
    const count = await contract.predictionCount();
    console.log('✅ Total predictions:', count.toString());

    if (count.toNumber() === 0) {
      console.log('\n😴 No predictions yet. Make some predictions in the UI first!\n');
      process.exit(0);
    }

    // Check each prediction
    console.log('\n🔍 Checking predictions...\n');
    const currentTime = Math.floor(Date.now() / 1000);
    let found = 0;

    for (let i = 1; i <= count.toNumber(); i++) {
      const pred = await contract.getPrediction(i);
      const [predictor, chainId, targetTime, predictedMilliGwei, actualMilliGwei, resolved] = pred;

      console.log(`Prediction #${i}:`);
      console.log(`  Predictor: ${predictor}`);
      console.log(`  Chain: ${chainId.toString()}`);
      console.log(`  Target Time: ${new Date(targetTime.toNumber() * 1000).toLocaleString()}`);
      console.log(`  Predicted: ${(predictedMilliGwei.toNumber() / 1000).toFixed(3)} Gwei`);
      console.log(`  Resolved: ${resolved ? '✅ Yes' : '❌ Not yet'}`);

      // Check if needs resolution
      if (!resolved && targetTime.toNumber() <= currentTime) {
        found++;
        console.log(`  ⚡ READY TO RESOLVE!\n`);

        // Fetch actual gas price
        console.log(`  📈 Fetching actual gas price for chain ${chainId}...`);
        const actualGasGwei = await getGasPrice(chainId.toNumber());
        const actualGasMilliGwei = Math.round(actualGasGwei * 1000); // Convert to milliGwei
        console.log(`  💰 Actual gas price: ${actualGasGwei.toFixed(3)} Gwei`);

        // Calculate accuracy
        const predictedGwei = predictedMilliGwei.toNumber() / 1000;
        const diff = Math.abs(predictedGwei - actualGasGwei);
        const percentError = (diff / actualGasGwei) * 100;
        const accuracy = Math.max(0, 100 - percentError);
        console.log(`  📈 Accuracy: ${accuracy.toFixed(1)}%`);

        // Resolve
        console.log(`  📝 Submitting resolution transaction...`);
        const tx = await contract.resolvePrediction(i, actualGasMilliGwei, {
          gasLimit: 300000
        });
        console.log(`  ⏳ TX Hash: ${tx.hash}`);
        console.log(`  ⏳ Waiting for confirmation...`);
        
        await tx.wait();
        console.log(`  ✅ RESOLVED!\n`);
      } else if (!resolved) {
        const timeLeft = targetTime.toNumber() - currentTime;
        console.log(`  ⏰ Wait ${Math.floor(timeLeft / 60)} more minutes\n`);
      } else {
        console.log(`  ✅ Already resolved\n`);
      }
    }

    if (found === 0) {
      console.log('😴 No predictions ready to resolve right now.\n');
    } else {
      console.log('=' .repeat(60));
      console.log(`🎉 Successfully resolved ${found} prediction(s)!\n`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Get tBNB from: https://testnet.bnbchain.org/faucet-smart\n');
    }
    process.exit(1);
  }
}

// Get gas price for a chain
async function getGasPrice(chainId) {
  const rpcUrls = {
    1: 'https://eth.llamarpc.com',
    56: 'https://bsc-dataseed1.binance.org',
    137: 'https://polygon-rpc.com',
    42161: 'https://arb1.arbitrum.io/rpc',
    10: 'https://mainnet.optimism.io',
    8453: 'https://mainnet.base.org'
  };

  try {
    // For Ethereum, try Etherscan first
    if (chainId === 1) {
      try {
        const response = await axios.get('https://api.etherscan.io/api', {
          params: {
            module: 'gastracker',
            action: 'gasoracle',
            apikey: 'YourApiKeyToken'
          },
          timeout: 5000
        });
        if (response.data?.status === '1') {
          return parseFloat(response.data.result.ProposeGasPrice); // Return actual decimal value
        }
      } catch (e) {
        console.log('  ⚠️  Etherscan failed, using RPC...');
      }
    }

    // Use RPC
    const rpcUrl = rpcUrls[chainId];
    if (!rpcUrl) {
      throw new Error(`No RPC for chain ${chainId}`);
    }

    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1
    }, { timeout: 5000 });

    const gasPriceWei = BigInt(response.data.result);
    const gasPriceGwei = Number(gasPriceWei) / 1e9;
    return gasPriceGwei; // Return actual decimal value
  } catch (error) {
    console.error(`  ❌ Failed to get gas for chain ${chainId}`);
    throw error;
  }
}

// Run it!
main();
