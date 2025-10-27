import { ethers } from 'ethers';
import axios from 'axios';

// Contract details (v2 with decimal support)
const CONTRACT_ADDRESS = '0xA18F113ADC48B3823057ED892989320b5FD5C055';
const CHAIN_ID = 97; // BSC Testnet

// Oracle functions ABI
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "predictionCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "predictionId", "type": "uint256"}],
    "name": "getPrediction",
    "outputs": [
      {"internalType": "address", "name": "predictor", "type": "address"},
      {"internalType": "uint256", "name": "chainId", "type": "uint256"},
      {"internalType": "uint256", "name": "targetTimestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "predictedMilliGwei", "type": "uint256"},
      {"internalType": "uint256", "name": "actualMilliGwei", "type": "uint256"},
      {"internalType": "bool", "name": "resolved", "type": "bool"},
      {"internalType": "uint256", "name": "accuracyScore", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_predictionId", "type": "uint256"},
      {"internalType": "uint256", "name": "_actualMilliGwei", "type": "uint256"}
    ],
    "name": "resolvePrediction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// RPC endpoints for fetching gas prices
const RPC_ENDPOINTS = {
  1: 'https://eth.llamarpc.com',
  56: 'https://bsc-dataseed1.binance.org',
  137: 'https://polygon-rpc.com',
  42161: 'https://arb1.arbitrum.io/rpc',
  10: 'https://mainnet.optimism.io',
  8453: 'https://mainnet.base.org'
};

// Etherscan API for Ethereum
const ETHERSCAN_API = 'https://api.etherscan.io/api';

class PredictionOracle {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.isInitialized = false;
  }

  /**
   * Initialize oracle with wallet private key
   */
  async initialize(privateKey) {
    try {
      // Connect to BSC Testnet
      this.provider = new ethers.providers.JsonRpcProvider(
        'https://data-seed-prebsc-1-s1.binance.org:8545'
      );

      // Create wallet
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Connect to contract
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        this.wallet
      );

      // Verify connection
      const network = await this.provider.getNetwork();
      console.log('✅ Oracle connected to network:', network.chainId);
      console.log('✅ Oracle wallet address:', this.wallet.address);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize oracle:', error);
      return false;
    }
  }

  /**
   * Get actual gas price for a chain (in Gwei)
   */
  async getActualGasPrice(chainId) {
    try {
      // Special handling for Ethereum using Etherscan
      if (chainId === 1) {
        const response = await axios.get(ETHERSCAN_API, {
          params: {
            module: 'gastracker',
            action: 'gasoracle',
            apikey: 'YourApiKeyToken'
          },
          timeout: 5000
        });

        if (response.data?.status === '1' && response.data.result) {
          const gasPriceGwei = parseFloat(response.data.result.ProposeGasPrice);
          const gasPriceMilliGwei = Math.round(gasPriceGwei * 1000);
          console.log(`📊 Ethereum gas price: ${gasPriceGwei.toFixed(3)} Gwei (${gasPriceMilliGwei} milliGwei)`);
          return gasPriceMilliGwei;
        }
      }

      // For other chains, use direct RPC call
      const rpcUrl = RPC_ENDPOINTS[chainId];
      if (!rpcUrl) {
        throw new Error(`No RPC endpoint for chain ${chainId}`);
      }

      const response = await axios.post(rpcUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1
      }, { timeout: 5000 });

      if (response.data?.result) {
        const gasPriceWei = BigInt(response.data.result);
        const gasPriceGwei = Number(gasPriceWei) / 1e9;
        const gasPriceMilliGwei = Math.round(gasPriceGwei * 1000);
        console.log(`📊 Chain ${chainId} gas price: ${gasPriceGwei.toFixed(3)} Gwei (${gasPriceMilliGwei} milliGwei)`);
        return gasPriceMilliGwei;
      }

      throw new Error('Invalid RPC response');
    } catch (error) {
      console.error(`❌ Failed to get gas price for chain ${chainId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all pending predictions that need resolution
   */
  async getPendingPredictions() {
    if (!this.isInitialized) {
      throw new Error('Oracle not initialized');
    }

    try {
      const totalPredictions = await this.contract.predictionCount();
      const pending = [];
      const currentTime = Math.floor(Date.now() / 1000);

      console.log(`🔍 Checking ${totalPredictions} predictions...`);

      for (let i = 1; i <= totalPredictions; i++) {
        try {
          const prediction = await this.contract.getPrediction(i);
          
          const [
            predictor,
            chainId,
            targetTimestamp,
            predictedMilliGwei,
            actualMilliGwei,
            resolved,
            accuracyScore
          ] = prediction;

          // Check if prediction needs resolution
          if (!resolved && targetTimestamp.toNumber() <= currentTime) {
            pending.push({
              id: i,
              predictor,
              chainId: chainId.toNumber(),
              targetTimestamp: targetTimestamp.toNumber(),
              predictedMilliGwei: predictedMilliGwei.toNumber(),
              resolved,
              accuracyScore: accuracyScore.toNumber()
            });
          }
        } catch (error) {
          console.error(`Error fetching prediction ${i}:`, error.message);
        }
      }

      console.log(`✅ Found ${pending.length} predictions ready for resolution`);
      return pending;
    } catch (error) {
      console.error('❌ Failed to get pending predictions:', error);
      throw error;
    }
  }

  /**
   * Resolve a single prediction
   */
  async resolveSinglePrediction(prediction) {
    try {
      console.log(`\n🔧 Resolving prediction #${prediction.id}...`);
      console.log(`   Chain: ${prediction.chainId}`);
      console.log(`   Predictor: ${prediction.predictor}`);
      console.log(`   Predicted: ${(prediction.predictedMilliGwei / 1000).toFixed(3)} Gwei`);

      // Fetch actual gas price (returns milliGwei)
      const actualMilliGwei = await this.getActualGasPrice(prediction.chainId);
      console.log(`   Actual: ${(actualMilliGwei / 1000).toFixed(3)} Gwei`);

      // Calculate accuracy (for logging)
      const diff = Math.abs(prediction.predictedMilliGwei - actualMilliGwei);
      const percentError = (diff / actualMilliGwei) * 100;
      const accuracy = Math.max(0, 100 - percentError);
      console.log(`   Accuracy: ${accuracy.toFixed(1)}%`);

      // Call smart contract to resolve
      console.log(`   📝 Submitting transaction...`);
      const tx = await this.contract.resolvePrediction(
        prediction.id,
        actualMilliGwei,
        {
          gasLimit: 300000 // Set gas limit to avoid estimation issues
        }
      );

      console.log(`   ⏳ Waiting for confirmation... TX: ${tx.hash}`);
      const receipt = await tx.wait();
      
      console.log(`   ✅ Prediction #${prediction.id} resolved! Gas used: ${receipt.gasUsed.toString()}`);
      
      return {
        success: true,
        predictionId: prediction.id,
        actualGwei: actualMilliGwei / 1000,
        accuracy,
        txHash: tx.hash
      };
    } catch (error) {
      console.error(`   ❌ Failed to resolve prediction #${prediction.id}:`, error.message);
      return {
        success: false,
        predictionId: prediction.id,
        error: error.message
      };
    }
  }

  /**
   * Resolve all pending predictions
   */
  async resolveAllPending() {
    if (!this.isInitialized) {
      throw new Error('Oracle not initialized. Call initialize() first.');
    }

    console.log('\n🤖 Starting Oracle Resolution Process...\n');
    
    try {
      // Get all pending predictions
      const pending = await this.getPendingPredictions();

      if (pending.length === 0) {
        console.log('✅ No predictions to resolve at this time.\n');
        return {
          total: 0,
          resolved: 0,
          failed: 0,
          results: []
        };
      }

      // Resolve each prediction
      const results = [];
      for (const prediction of pending) {
        const result = await this.resolveSinglePrediction(prediction);
        results.push(result);
        
        // Add delay between transactions to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const resolved = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log('\n📊 Resolution Summary:');
      console.log(`   Total pending: ${pending.length}`);
      console.log(`   ✅ Resolved: ${resolved}`);
      console.log(`   ❌ Failed: ${failed}\n`);

      return {
        total: pending.length,
        resolved,
        failed,
        results
      };
    } catch (error) {
      console.error('❌ Oracle resolution failed:', error);
      throw error;
    }
  }

  /**
   * Get oracle wallet balance
   */
  async getBalance() {
    if (!this.wallet) {
      throw new Error('Oracle not initialized');
    }

    const balance = await this.wallet.getBalance();
    const balanceBNB = ethers.utils.formatEther(balance);
    console.log(`💰 Oracle wallet balance: ${balanceBNB} BNB`);
    return balanceBNB;
  }
}

// Create singleton instance
export const predictionOracle = new PredictionOracle();

// Export class for manual instantiation if needed
export default PredictionOracle;
