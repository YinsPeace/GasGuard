import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Zap, Trophy, TrendingUp, Clock, Target, HelpCircle, X } from 'lucide-react'
import { 
  CONTRACT_ADDRESS, 
  CONTRACT_ABI, 
  SUPPORTED_CHAINS,
  CHAIN_ID 
} from '@/contracts/GasPredictionLeague'

export function PredictionLeague({ walletAddress }) {
  const [predictions, setPredictions] = useState([])
  const [userPredictions, setUserPredictions] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [selectedChain, setSelectedChain] = useState(56) // Default to BNB
  const [predictedGas, setPredictedGas] = useState('')
  const [timeWindow, setTimeWindow] = useState(2) // Hours from now
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contract, setContract] = useState(null)
  const [provider, setProvider] = useState(null)
  const [currentChainId, setCurrentChainId] = useState(null)
  const [txStatus, setTxStatus] = useState('')
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const [activeTab, setActiveTab] = useState('make') // 'make', 'history', or 'leaderboard'
  const [showHelpModal, setShowHelpModal] = useState(false)

  // Initialize contract connection
  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum === 'undefined') {
        console.log('MetaMask not installed')
        return
      }

      try {
        // Request network switch to BSC Testnet if needed
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        const currentId = parseInt(chainId, 16)
        setCurrentChainId(currentId)

        if (currentId !== CHAIN_ID) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
            })
          } catch (switchError) {
            // Chain not added, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${CHAIN_ID.toString(16)}`,
                  chainName: 'BNB Smart Chain Testnet',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'tBNB',
                    decimals: 18
                  },
                  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
                  blockExplorerUrls: ['https://testnet.bscscan.com']
                }]
              })
            }
          }
        }

        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = web3Provider.getSigner()
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS, // v2 contract with decimal support
          CONTRACT_ABI,
          signer
        )

        setProvider(web3Provider)
        setContract(contractInstance)

        // Load user stats and predictions if wallet connected
        if (walletAddress) {
          await loadUserStats(contractInstance, walletAddress)
          await loadUserPredictions(contractInstance, walletAddress)
        }
      } catch (error) {
        console.error('Error initializing contract:', error)
      }
    }

    initContract()
  }, [walletAddress])

  // Load user statistics
  const loadUserStats = async (contractInstance, address) => {
    try {
      const stats = await contractInstance.getUserStats(address)
      setUserStats({
        totalPredictions: stats[0].toNumber(),
        averageScore: stats[1].toNumber(),
        perfectPredictions: stats[2].toNumber(),
        currentStreak: stats[3].toNumber(),
        bestStreak: stats[4].toNumber()
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Load user's prediction history
  const loadUserPredictions = async (contractInstance, address) => {
    setLoadingPredictions(true)
    try {
      const predictionCount = await contractInstance.predictionCount()
      const userPreds = []

      // Loop through all predictions and find user's ones
      for (let i = 1; i <= predictionCount.toNumber(); i++) {
        try {
          const pred = await contractInstance.getPrediction(i)
          const [predictor, chainId, targetTimestamp, predictedMilliGwei, actualMilliGwei, resolved, accuracyScore] = pred
          
          // Only include this user's predictions
          if (predictor.toLowerCase() === address.toLowerCase()) {
            userPreds.push({
              id: i,
              chainId: chainId.toNumber(),
              targetTimestamp: targetTimestamp.toNumber(),
              predictedGwei: predictedMilliGwei.toNumber() / 1000,
              actualGwei: actualMilliGwei.toNumber() / 1000,
              resolved,
              accuracyScore: accuracyScore.toNumber()
            })
          }
        } catch (err) {
          console.error(`Error loading prediction ${i}:`, err)
        }
      }

      // Sort by ID descending (newest first)
      userPreds.sort((a, b) => b.id - a.id)
      setUserPredictions(userPreds)
    } catch (error) {
      console.error('Error loading predictions:', error)
    } finally {
      setLoadingPredictions(false)
    }
  }

  // Make a prediction
  const handleMakePrediction = async () => {
    if (!contract || !predictedGas) return

    setIsSubmitting(true)
    setTxStatus('Preparing transaction...')

    try {
      // Add 5 minutes buffer to prevent "too soon" errors due to TX delays
      const bufferMinutes = 5 * 60; // 5 minutes safety buffer
      const targetTimestamp = Math.floor(Date.now() / 1000) + (timeWindow * 3600) + bufferMinutes
      const gasInGweiFloat = parseFloat(predictedGas)
      
      // Convert to milliGwei (contract stores integers representing 0.001 Gwei units)
      // User enters: 0.096 Gwei → Contract stores: 96 (meaning 96 milliGwei = 0.096 Gwei)
      const gasInMilliGwei = Math.round(gasInGweiFloat * 1000)

      // Validate gas price (1-9999999 milliGwei = 0.001-9999.999 Gwei)
      if (gasInMilliGwei <= 0 || gasInMilliGwei >= 10000000) {
        setTxStatus('❌ Gas price must be between 0.001-9999.999 Gwei')
        setIsSubmitting(false)
        setTimeout(() => setTxStatus(''), 5000)
        return
      }

      // Warn about unrealistic predictions
      if (selectedChain === 1 && gasInGweiFloat < 0.05) {
        const proceed = window.confirm(`⚠️ Warning: ${gasInGweiFloat} Gwei seems very low for Ethereum. Current gas is around 0.09-0.1 Gwei. Continue anyway?`)
        if (!proceed) {
          setIsSubmitting(false)
          return
        }
      }

      setTxStatus('Please confirm in MetaMask...')
      const tx = await contract.makePrediction(
        selectedChain,
        targetTimestamp,
        gasInMilliGwei
      )

      setTxStatus('Transaction submitted! Waiting for confirmation...')
      await tx.wait()

      setTxStatus('✅ Prediction submitted successfully!')
      
      // Reload stats and predictions
      await loadUserStats(contract, walletAddress)
      await loadUserPredictions(contract, walletAddress)
      
      // Clear form
      setPredictedGas('')
      
      // Auto-switch to history tab to show the new prediction
      setTimeout(() => {
        setActiveTab('history')
        setTxStatus('')
      }, 2000)

    } catch (error) {
      console.error('Error making prediction:', error)
      
      // Parse specific error messages
      let errorMessage = '❌ Error: '
      if (error.message.includes('Too soon')) {
        errorMessage += 'Predictions must be at least 1 hour in the future'
      } else if (error.message.includes('Too far')) {
        errorMessage += 'Predictions cannot be more than 24 hours ahead'
      } else if (error.message.includes('Invalid gas price')) {
        errorMessage += 'Gas price must be realistic (0.001-9999 Gwei)'
      } else if (error.message.includes('Unsupported chain')) {
        errorMessage += 'This chain is not supported yet'
      } else if (error.message.includes('user rejected')) {
        errorMessage = '❌ Transaction cancelled by user'
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = '❌ Insufficient BNB for gas fees'
      } else {
        errorMessage += error.reason || error.message || 'Transaction failed'
      }
      
      setTxStatus(errorMessage)
      setTimeout(() => setTxStatus(''), 7000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Header */}
      <div className="bg-card rounded-2xl p-4 sm:p-8 border border-border">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Gas Prediction League
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Predict future gas prices and compete for the top spot!
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-xs bg-green-500/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full font-semibold border border-green-500/40">
                🔴 LIVE on BSC Testnet
              </span>
              <a 
                href={`https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline"
              >
                View Contract →
              </a>
            </div>
          </div>
          <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 dark:text-yellow-400 flex-shrink-0" fill="currentColor" />
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Total Predictions</div>
              <div className="text-2xl font-bold text-foreground">{userStats.totalPredictions}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Avg Score</div>
              <div className="text-2xl font-bold text-foreground">{userStats.averageScore}%</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Perfect Predictions</div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{userStats.perfectPredictions}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Current Streak</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">🔥 {userStats.currentStreak}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Best Streak</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">👑 {userStats.bestStreak}</div>
            </div>
          </div>
        )}

        {/* Network Status */}
        {currentChainId && currentChainId !== CHAIN_ID && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-400">
              ⚠️ Please switch to BSC Testnet to make predictions
            </p>
          </div>
        )}
      </div>

      {/* Make Prediction Form with Tabs */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-border w-full overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-6 border-b border-border overflow-x-auto">
          <div className="flex gap-1 sm:gap-2 min-w-0">
            <button
              onClick={() => setActiveTab('make')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'make'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="w-5 h-5" />
              <span className="hidden sm:inline">Make Prediction</span>
              <span className="sm:hidden">Make</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="hidden sm:inline">My Predictions</span>
              <span className="sm:hidden">History</span>
              {userPredictions.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                  {userPredictions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'leaderboard'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="hidden sm:inline">Top Predictors</span>
              <span className="sm:hidden">Top</span>
            </button>
          </div>
          
          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
            title="How it Works"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Make Prediction Tab */}
        {activeTab === 'make' && (
        <div className="space-y-4">
          {/* Chain Selection */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">Select Chain</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {SUPPORTED_CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedChain(chain.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedChain === chain.id
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-border bg-muted/50 hover:border-border/70'
                  }`}
                >
                  <div className="text-xs font-medium" style={{ color: chain.color }}>
                    {chain.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground">{chain.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Window */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Predict for
              <span className="ml-2 text-xs text-gray-500">
                (includes 5min safety buffer)
              </span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 4, 8, 12, 24].map(hours => (
                <button
                  key={hours}
                  onClick={() => setTimeWindow(hours)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    timeWindow === hours
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
            {timeWindow === 1 && (
              <div className="mt-2 text-xs text-yellow-400">
                ⚠️ Actual prediction time: ~1h 5min from submission
              </div>
            )}
          </div>

          {/* Gas Prediction */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Predicted Gas (Gwei) - Decimals Supported!
              <span className="ml-2 text-xs text-gray-500">
                Current: Check the Multi-Chain Tracker above
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.001"
                max="9999.999"
                value={predictedGas}
                onChange={(e) => setPredictedGas(e.target.value)}
                placeholder="e.g., 0.096 for Ethereum, 0.003 for BNB"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
              />
              {/* Helpful suggestions based on selected chain */}
              <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                💡 <strong>Tip:</strong> {
                  selectedChain === 56 ? "BNB Chain typically runs at very low gas (usually under 0.01 Gwei)" :
                  selectedChain === 137 ? "Polygon gas can vary between 0.03-0.5 Gwei depending on network activity" :
                  selectedChain === 1 ? "Ethereum gas fluctuates throughout the day. Check the Multi-Chain Tracker above for current prices!" :
                  selectedChain === 42161 ? "Arbitrum has extremely low gas, typically 0.001-0.01 Gwei" :
                  selectedChain === 10 ? "Optimism has extremely low gas, typically 0.001-0.01 Gwei" :
                  "Base has extremely low gas, typically 0.001-0.01 Gwei"
                }
                <span className="block mt-1 text-green-400">✅ Accepts any value from 0.001 to 9999.999 Gwei</span>
                <span className="block mt-1 text-yellow-400">⚠️ Make sure your prediction is realistic for the selected chain!</span>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          {txStatus && (
            <div className={`p-3 rounded-lg ${
              txStatus.includes('✅') ? 'bg-green-500/20 text-green-400' :
              txStatus.includes('❌') ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {txStatus}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleMakePrediction}
            disabled={!walletAddress || isSubmitting || !predictedGas || currentChainId !== CHAIN_ID}
            className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              !walletAddress || currentChainId !== CHAIN_ID
                ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                : isSubmitting
                ? 'bg-blue-600 text-white opacity-50 cursor-wait'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : !walletAddress ? (
              <>🔗 Connect Wallet to Start Predicting</>
            ) : currentChainId !== CHAIN_ID ? (
              <>⚠️ Switch to BSC Testnet (Required)</>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Make Prediction (Costs ~0.001 tBNB)
              </>
            )}
          </button>
          
          {/* Help text for wallet connection */}
          {!walletAddress && (
            <div className="text-center text-xs text-muted-foreground mt-2">
              <p>👆 Connect your wallet using the button in the header first</p>
              <p className="mt-1">You'll need MetaMask with some test BNB on BSC Testnet</p>
            </div>
          )}
        </div>
        )}

        {/* Prediction History Tab */}
        {activeTab === 'history' && (
        <div>
          
          {loadingPredictions ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-3" />
              <p className="text-muted-foreground">Loading your predictions...</p>
            </div>
          ) : userPredictions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No predictions yet!</p>
              <p className="text-sm">Switch to "Make Prediction" tab to get started</p>
              <button
                onClick={() => setActiveTab('make')}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
              >
                Make First Prediction
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userPredictions.map((pred) => {
                const chainName = SUPPORTED_CHAINS.find(c => c.id === pred.chainId)?.name || `Chain ${pred.chainId}`
                const targetDate = new Date(pred.targetTimestamp * 1000)
                const isPending = !pred.resolved
                const isUpcoming = pred.targetTimestamp > Date.now() / 1000
                
                return (
                  <div
                    key={pred.id}
                    className={`p-4 rounded-lg border ${
                      isPending 
                        ? isUpcoming
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-yellow-500/10 border-yellow-500/30'
                        : pred.accuracyScore >= 95
                        ? 'bg-green-500/10 border-green-500/30'
                        : pred.accuracyScore >= 70
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">#{pred.id}</span>
                        <span className="px-2 py-1 bg-muted rounded text-xs font-semibold text-foreground">
                          {chainName}
                        </span>
                        {isPending && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            isUpcoming ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {isUpcoming ? '⏳ Pending' : '⚡ Ready to Resolve'}
                          </span>
                        )}
                        {!isPending && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            pred.accuracyScore >= 95 ? 'bg-green-500/20 text-green-400' :
                            pred.accuracyScore >= 70 ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-600/20 text-muted-foreground'
                          }`}>
                            ✅ Resolved
                          </span>
                        )}
                      </div>
                      {!isPending && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            pred.accuracyScore >= 95 ? 'text-green-400' :
                            pred.accuracyScore >= 70 ? 'text-blue-400' :
                            'text-muted-foreground'
                          }`}>
                            {pred.accuracyScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">accuracy</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Target Time</div>
                        <div className="text-foreground font-mono text-xs">
                          {targetDate.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Your Prediction</div>
                        <div className="text-foreground font-semibold">
                          {pred.predictedGwei.toFixed(3)} Gwei
                        </div>
                      </div>
                      {!isPending && (
                        <>
                          <div>
                            <div className="text-muted-foreground text-xs mb-1">Actual Gas</div>
                            <div className="text-foreground font-semibold">
                              {pred.actualGwei.toFixed(3)} Gwei
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs mb-1">Difference</div>
                            <div className={`font-semibold ${
                              Math.abs(pred.predictedGwei - pred.actualGwei) < 0.01 ? 'text-green-400' :
                              Math.abs(pred.predictedGwei - pred.actualGwei) < 0.05 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {Math.abs(pred.predictedGwei - pred.actualGwei).toFixed(3)} Gwei
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {isPending && !isUpcoming && (
                      <div className="mt-3 pt-3 border-t border-yellow-500/20">
                        <p className="text-xs text-yellow-400">
                          ⚡ This prediction is ready to be resolved! Run the oracle to get your score.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
        <div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥇</span>
                <div>
                  <div className="font-semibold text-foreground text-lg">You</div>
                  <div className="text-sm text-muted-foreground">Score: {userStats?.averageScore || 0}%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">{userStats?.totalPredictions || 0} predictions</div>
                <div className="text-xs text-muted-foreground">🔥 {userStats?.currentStreak || 0} streak</div>
                {userStats?.bestStreak > 0 && (
                  <div className="text-xs text-muted-foreground">Best: {userStats.bestStreak}</div>
                )}
              </div>
            </div>
            
            {walletAddress ? (
              <div className="text-center text-muted-foreground py-8">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-600 dark:text-yellow-400 opacity-40" />
                <p className="text-sm">More predictors will appear as the league grows!</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Keep making accurate predictions to climb the rankings
                </p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-600 dark:text-yellow-400 opacity-40" />
                <p>Connect your wallet to see the leaderboard</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowHelpModal(false)}>
          <div className="bg-card border border-blue-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Target className="w-6 h-6" />
                How it Works
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span><strong>Predict gas prices</strong> 1-24 hours in the future</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span><strong>Get accuracy scores</strong> based on actual gas prices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span><strong>Build streaks</strong> with accurate predictions (95%+ accuracy)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span><strong>Compete on the leaderboard</strong> - no betting required!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span><strong>Smart contract on BSC Testnet</strong> - fully decentralized</span>
              </li>
            </ul>
            
            <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-300">
                💡 <strong>Tip:</strong> Check the Multi-Chain Tracker above to see current gas prices before making your prediction!
              </p>
            </div>
            
            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
