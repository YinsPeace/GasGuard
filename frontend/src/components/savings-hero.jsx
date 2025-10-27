import { useEffect, useState } from 'react'
import { Bell, DollarSign, Crown, TrendingUp, History, PiggyBank } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUserSavings, getSubscriptionStatus } from '@/api/gasApi'
import { TransactionList } from '@/components/transaction-list'
import { MOCK_ENABLED, mockSavingsData, mockTransactions } from '@/mockData'

export function SavingsHero({ walletAddress }) {
  const [mounted, setMounted] = useState(false)
  const [savings, setSavings] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' or 'history'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (MOCK_ENABLED) {
        setSavings({
          totalSavedUSD: mockSavingsData.totalSavings,
          transactionCount: mockSavingsData.transactionCount,
          optimalTimingCount: 0,
          avgSavingsPercent: mockSavingsData.savingsPercentage,
          transactions: mockTransactions.map(tx => ({
            ...tx,
            actualCostUSD: tx.gasPaid,
            optimalCostUSD: tx.optimalGas,
            savingsUSD: tx.overpayment,
            timeStamp: Math.floor(tx.timestamp / 1000)
          }))
        })
        setSubscription({
          isSubscribed: true,
          status: 'trialing',
          trialEnd: new Date(Date.now() + 86400000 * 12).toISOString()
        })
        setLoading(false)
        return
      }
      
      if (!walletAddress) return

      try {
        const [savingsData, subStatus] = await Promise.all([
          getUserSavings(walletAddress),
          getSubscriptionStatus(walletAddress)
        ])

        setSavings(savingsData)
        setSubscription(subStatus)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [walletAddress])

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/10 border border-border p-8 backdrop-blur-sm">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="h-12 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  const totalSaved = savings?.totalSavedUSD || 0
  const transactionCount = savings?.transactionCount || 0
  const optimalCount = savings?.optimalTimingCount || 0
  const avgSavingsPercent = savings?.avgSavingsPercent || 0
  const overpaidPercentage = Math.abs(avgSavingsPercent)

  // Calculate costs from transactions if available
  let optimalCost = 0.03
  let actualCost = 0.51

  if (savings?.transactions && savings.transactions.length > 0) {
    actualCost = savings.transactions.reduce((sum, tx) => sum + (tx.actualCostUSD || 0), 0)
    optimalCost = savings.transactions.reduce((sum, tx) => sum + (tx.optimalCostUSD || 0), 0)
  }

  // Calculate savings since subscription started (for Pro members)
  const calculateSavingsSince = (transactions, startDate) => {
    if (!transactions || !startDate) return null

    const start = new Date(startDate).getTime()
    const filtered = transactions.filter(tx => tx.timeStamp * 1000 >= start)

    const saved = filtered.reduce((sum, tx) => sum + (tx.savingsUSD || 0), 0)

    return {
      saved,
      count: filtered.length
    }
  }

  const savingsSinceSubscription = subscription?.isSubscribed && subscription.trialEnd
    ? calculateSavingsSince(savings?.transactions, subscription.trialEnd)
    : null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/10 border border-border p-8 backdrop-blur-sm">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <PiggyBank className="w-5 h-5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-5 h-5" />
          Transaction History
          {transactionCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-bold">
              {transactionCount}
            </span>
          )}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
      <div className="relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <DollarSign className={`w-12 h-12 ${totalSaved >= 0 ? 'text-success' : 'text-destructive'}`} />
            <div className={`text-6xl font-bold ${totalSaved >= 0 ? 'text-success' : 'text-destructive'} ${mounted ? 'animate-count-up' : ''}`}>
              {totalSaved < 0 ? '-' : ''}{Math.abs(totalSaved).toFixed(2)}
            </div>
          </div>
          <p className="text-lg text-muted-foreground">
            {totalSaved >= 0 ? (
              <>
                <span className="font-semibold text-success">You saved ${Math.abs(totalSaved).toFixed(2)}</span> in the past 90 days
                {overpaidPercentage > 0 && (
                  <> by timing transactions <span className="font-semibold text-foreground">{overpaidPercentage.toFixed(1)}%</span> better than average</>
                )}
              </>
            ) : (
              <>
                In the past 90 days, <span className="font-semibold text-destructive">you overpaid ${Math.abs(totalSaved).toFixed(2)}</span> on transaction fees.
                {overpaidPercentage > 0 && (
                  <> You could have saved <span className="font-semibold text-foreground">{overpaidPercentage.toFixed(1)}%</span> using GasGuard.</>
                )}
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <div className="px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm text-sm font-medium">
            {transactionCount} Transactions
          </div>
          <div className="px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm text-sm font-medium">
            {optimalCount} Optimal Timings
          </div>
          <div className="px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm text-sm font-medium">
            Last 90 Days
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Optimal</span>
            <span className="font-semibold text-success">${optimalCost.toFixed(2)}</span>
          </div>
          <div className="relative h-8 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-success/80 rounded-full"
              style={{ width: `${(optimalCost / actualCost * 100)}%` }}
            />
            <div className="absolute inset-y-0 left-0 w-full flex items-center justify-end pr-3">
              <span className="text-xs font-medium text-foreground">Actually Paid: ${actualCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pro Member Stats */}
        {subscription?.isSubscribed && savingsSinceSubscription && savingsSinceSubscription.count > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-500">Pro Member Stats</span>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-500">
                  ${Math.abs(savingsSinceSubscription.saved).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {savingsSinceSubscription.saved >= 0 ? 'Saved' : 'Overpaid'} since {subscription.status === 'trialing' ? 'trial started' : 'subscribing'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button - Only show for non-premium users */}
        {!subscription?.isSubscribed && (
          <Button
            className="w-full h-12 text-base font-semibold"
            size="lg"
            onClick={() => {
              const subscriptionSection = document.getElementById('subscription')
              if (subscriptionSection) {
                const headerOffset = 80
                const elementPosition = subscriptionSection.getBoundingClientRect().top
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                })
              }
            }}
          >
            <Bell className="w-5 h-5 mr-2" />
            {totalSaved >= 0 && overpaidPercentage < 10 ? (
              <>Keep Up the Good Work - Get Premium</>
            ) : totalSaved >= 0 ? (
              <>Get Alerts to Save Even More</>
            ) : (
              <>Get Alerts to Save {overpaidPercentage > 0 ? `${overpaidPercentage.toFixed(0)}%` : 'More'}</>
            )}
          </Button>
        )}

        {/* Premium User Message */}
        {subscription?.isSubscribed && totalSaved >= 0 && overpaidPercentage < 15 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-foreground">Excellent Trading!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You've been trading at the right times. Keep using GasGuard alerts to maintain this performance effortlessly.
            </p>
          </div>
        )}
      </div>
      )}

      {/* Transaction History Tab */}
      {activeTab === 'history' && (
        <div className="relative z-10">
          <TransactionList walletAddress={walletAddress} />
        </div>
      )}
    </div>
  )
}
