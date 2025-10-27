// Multi-chain API client
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.gen-a.dev';

class MultiChainApi {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10000; // Cache for 10 seconds
  }

  // Get from cache if fresh
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set cache
  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Get all supported chains
  async getSupportedChains() {
    try {
      const response = await axios.get(`${API_BASE}/api/multichain/chains`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching chains:', error);
      throw error;
    }
  }
  
  // Get current gas price for a specific chain
  async getGasPrice(chain = 'ethereum') {
    try {
      // Check cache first
      const cacheKey = `gas-${chain}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await axios.get(`${API_BASE}/api/multichain/gas/${chain}`, {
        timeout: 3000 // 3 second timeout
      });
      const data = response.data.data;
      
      // Cache the result
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching gas price for ${chain}:`, error);
      throw error;
    }
  }
  
  // Get savings analysis for wallet on specific chain
  async getSavingsAnalysis(chain, walletAddress) {
    try {
      const response = await axios.get(
        `${API_BASE}/api/multichain/savings/${chain}/${walletAddress}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching savings for ${chain}:`, error);
      throw error;
    }
  }
  
  // Get gas price history for charts
  async getGasHistory(chain = 'ethereum', hours = 24) {
    try {
      const response = await axios.get(
        `${API_BASE}/api/multichain/history/${chain}?hours=${hours}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching history for ${chain}:`, error);
      throw error;
    }
  }
  
  // Get gas prices for multiple chains at once
  async getMultiChainGasPrices(chains = ['ethereum', 'bsc', 'polygon']) {
    try {
      // Add timeout to each request (3 seconds max per chain)
      const promises = chains.map(chain => 
        Promise.race([
          this.getGasPrice(chain),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 3000)
          )
        ])
      );
      
      // Use allSettled to not fail if some chains fail
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        chain: chains[index],
        status: result.status,
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason?.message : null
      }));
    } catch (error) {
      console.error('Error fetching multi-chain gas prices:', error);
      throw error;
    }
  }
  
  // Get savings for wallet across all chains
  async getMultiChainSavings(walletAddress, chains = ['ethereum', 'bsc', 'polygon']) {
    try {
      const promises = chains.map(chain => 
        this.getSavingsAnalysis(chain, walletAddress)
      );
      const results = await Promise.allSettled(promises);
      
      // Aggregate results
      const chainResults = results.map((result, index) => ({
        chain: chains[index],
        status: result.status,
        data: result.status === 'fulfilled' ? result.value : null
      }));
      
      // Calculate total savings across all chains
      const totalSavings = chainResults.reduce((total, chain) => {
        if (chain.data && chain.data.totalOverpayment) {
          return total + parseFloat(chain.data.totalOverpayment);
        }
        return total;
      }, 0);
      
      return {
        chains: chainResults,
        totalSavingsAllChains: totalSavings,
        analyzedChains: chainResults.filter(c => c.status === 'fulfilled').length
      };
    } catch (error) {
      console.error('Error fetching multi-chain savings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const multiChainApi = new MultiChainApi();
export default multiChainApi;
