import { useState, useEffect } from 'react'
import { ExternalLink, FileText, Download } from 'lucide-react'
import { getUserSavings } from '@/api/gasApi'
import axios from 'axios'
import { MOCK_ENABLED, mockTransactions } from '@/mockData'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function TransactionList({ walletAddress }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isBackfilling, setIsBackfilling] = useState(false)

  const fetchTransactions = async () => {
    if (MOCK_ENABLED) {
      setTransactions(mockTransactions.map(tx => ({
        ...tx,
        actualCostUSD: tx.gasPaid,
        optimalCostUSD: tx.optimalGas,
        savingsUSD: -tx.overpayment,
        timeStamp: Math.floor(tx.timestamp / 1000),
        gasPricePaid: tx.gasPaid,
        optimalGasPrice: tx.optimalGas,
        savingsPercent: tx.overpaymentPercentage,
        wasOptimal: tx.overpaymentPercentage < 30, // Green for excellent/good
        timingRating: tx.overpaymentPercentage < 10 ? `Excellent - ${Math.abs(tx.overpaymentPercentage).toFixed(0)}%` :
                      tx.overpaymentPercentage < 30 ? `Good - ${Math.abs(tx.overpaymentPercentage).toFixed(0)}%` :
                      tx.overpaymentPercentage < 50 ? `Neutral - ${Math.abs(tx.overpaymentPercentage).toFixed(0)}%` :
                      tx.overpaymentPercentage < 85 ? `Bad - ${Math.abs(tx.overpaymentPercentage).toFixed(0)}%` :
                      `Poor - ${Math.abs(tx.overpaymentPercentage).toFixed(0)}%`,
        timingColor: tx.overpaymentPercentage < 30 ? 'good' :
                     tx.overpaymentPercentage < 50 ? 'neutral' : 'bad',
        dataSource: 'verified'
      })))
      setLoading(false)
      return
    }
    
    if (!walletAddress) return

    try {
      const data = await getUserSavings(walletAddress)
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [walletAddress])

  const handleBackfill = async () => {
    setIsBackfilling(true)
    try {
      const response = await axios.post(
        `${API_URL}/api/transactions/backfill/${walletAddress}`
      )
      console.log('Backfill complete:', response.data)

      // Show success message
      if (response.data.success) {
        alert(`Historical data fetched! ${response.data.fetched} dates updated. Refreshing...`)
        // Refresh transactions to show updated data
        await fetchTransactions()
      }
    } catch (error) {
      console.error('Backfill failed:', error)
      alert('Failed to fetch historical data: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsBackfilling(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-4 md:p-6 backdrop-blur-sm space-y-4">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">Recent Transactions</h2>
          </div>
          <button
            onClick={handleBackfill}
            disabled={isBackfilling || !walletAddress}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-primary/30 whitespace-nowrap"
            title="Fetch real blockchain data for accurate comparisons"
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span>{isBackfilling ? 'Fetching...' : 'Fetch Real Data'}</span>
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Last 90 days</p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No transactions found for this wallet
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="group p-3 md:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/50 hover:border-border transition-all hover:shadow-lg space-y-2"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-mono text-xs md:text-sm text-foreground truncate">
                    {tx.hash ? `${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}` : `0x${index}...`}
                  </span>
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0"
                    title="View on Etherscan"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                    tx.timingColor === 'good'
                      ? 'bg-success/20 text-success border border-success/30'
                      : tx.timingColor === 'neutral'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-destructive/20 text-destructive border border-destructive/30'
                  }`}>
                    {tx.timingRating || `Poor - ${Math.abs(tx.savingsPercent || 90).toFixed(0)}%`}
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap border ${
                    tx.dataSource === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`} title={tx.dataSourceLabel || '~ Estimated'}>
                    {tx.dataSource === 'verified' ? '✓ Real' : '~ Est'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs md:text-sm">
                <span className="text-muted-foreground">
                  Paid: <span className="font-medium text-foreground">{tx.gasPricePaid?.toFixed(3) || '1.50'}</span> (Opt: {tx.optimalGasPrice?.toFixed(3) || '0.15'})
                </span>
                <span className={`font-bold whitespace-nowrap ${tx.savingsUSD >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {tx.savingsUSD >= 0 ? '+' : ''}{(tx.savingsUSD || -0.15).toFixed(2)} USD
                </span>
              </div>

              {tx.dataSource && tx.dataSource !== 'verified' && (
                <div className="mt-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-400 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{tx.dataSourceLabel}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          if (walletAddress) {
            window.open(`https://etherscan.io/address/${walletAddress}`, '_blank')
          }
        }}
        className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
      >
        View all transactions →
      </button>
    </div>
  )
}
