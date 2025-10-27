import { useState, useEffect } from 'react'
import { Sparkles, Gift, Check, Crown, TrendingUp, DollarSign, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createCheckoutSession, getSubscriptionStatus, getUserSavings } from '@/api/gasApi'
import { SettingsCard } from '@/components/settings-card'

const features = [
  'Real-time price alerts',
  'Smart predictions',
  '90-day savings tracking',
  'Telegram notifications',
]

const MONTHLY_COST = 7.99

export function SubscriptionCTA({ walletAddress }) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingsSinceSubscription, setSavingsSinceSubscription] = useState(null)
  const [activeTab, setActiveTab] = useState('pro') // 'pro' or 'alerts'

  useEffect(() => {
    if (walletAddress) {
      checkSubscription()
    }
  }, [walletAddress])

  const checkSubscription = async () => {
    try {
      const status = await getSubscriptionStatus(walletAddress)
      setSubscription(status)

      // If subscribed, fetch savings to calculate ROI
      if (status?.isSubscribed && status.startedAt) {
        const savingsData = await getUserSavings(walletAddress)

        // Use the actual subscription start date from backend
        const subscriptionStartDate = new Date(status.startedAt).getTime()
        calculateROI(savingsData, subscriptionStartDate)
      }
    } catch (error) {
      console.error('Failed to check subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateROI = (savingsData, subscriptionStart) => {
    if (!savingsData?.transactions) return

    const startDate = new Date(subscriptionStart).getTime()
    const filtered = savingsData.transactions.filter(tx => tx.timeStamp * 1000 >= startDate)

    const totalSaved = filtered.reduce((sum, tx) => sum + (tx.savingsUSD || 0), 0)

    // Calculate cost - FREE during trial!
    let costSoFar = 0
    
    if (subscription?.status === 'active') {
      // Only calculate cost for paying customers
      const daysSinceStart = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24))
      costSoFar = (daysSinceStart / 30) * MONTHLY_COST // Pro-rated monthly cost
    }
    // If status is 'trialing', cost remains $0.00

    // If overpaying, total saved will be negative. ROI = savings - cost
    const roi = totalSaved - costSoFar
    const roiPercentage = costSoFar > 0 ? (totalSaved / costSoFar) * 100 : 0

    setSavingsSinceSubscription({
      totalSaved,
      costSoFar,
      roi,
      roiPercentage,
      transactionCount: filtered.length,
      isProfit: roi > 0 || (subscription?.status === 'trialing' && totalSaved >= 0) // Trial users with savings are "profitable"
    })
  }

  const handleStartTrial = async () => {
    try {
      const { url } = await createCheckoutSession(walletAddress)
      window.location.href = url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    }
  }

  // If already subscribed, show status instead of CTA
  if (subscription?.isSubscribed) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-yellow-500/20 via-card to-card border border-yellow-500/30 p-6 backdrop-blur-sm">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-yellow-500/30">
          <button
            onClick={() => setActiveTab('pro')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'pro'
                ? 'border-yellow-500 text-yellow-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Crown className="w-5 h-5" />
            Pro Status
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
              activeTab === 'alerts'
                ? 'border-yellow-500 text-yellow-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bell className="w-5 h-5" />
            Alert Settings
          </button>
        </div>

        {/* Pro Status Tab */}
        {activeTab === 'pro' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">GasGuard Pro Active</h3>
          </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-semibold text-foreground">
              {subscription.status === 'trialing' ? '🎁 Free Trial' : '✅ Active'}
            </span>
          </div>

          {subscription.status === 'trialing' && subscription.trialEnd && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Trial ends:</span>
              <span className="font-semibold text-yellow-500">
                {new Date(subscription.trialEnd).toLocaleDateString()}
              </span>
            </div>
          )}

          {subscription.status === 'active' && subscription.currentPeriodEnd && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Renews:</span>
              <span className="font-semibold text-green-500">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* ROI Tracking */}
        {savingsSinceSubscription && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-green-500">Your Savings vs. Subscription</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  {savingsSinceSubscription.totalSaved >= 0 ? 'Total Saved' : 'Total Overpaid'}
                </div>
                <div className={`text-lg font-bold ${savingsSinceSubscription.totalSaved >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {savingsSinceSubscription.totalSaved >= 0 ? '+' : ''}${savingsSinceSubscription.totalSaved.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cost So Far</div>
                <div className="text-lg font-bold text-foreground">
                  ${savingsSinceSubscription.costSoFar.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Net Benefit:</span>
                <div className={`text-xl font-bold ${savingsSinceSubscription.isProfit ? 'text-green-500' : 'text-red-500'}`}>
                  {savingsSinceSubscription.isProfit ? '+' : ''}${savingsSinceSubscription.roi.toFixed(2)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {subscription?.status === 'trialing'
                  ? savingsSinceSubscription.totalSaved > 0
                    ? `🎉 You're already saving during your free trial!`
                    : `💡 Start using GasGuard alerts to maximize your savings!`
                  : savingsSinceSubscription.isProfit
                    ? `🎉 GasGuard is paying for itself! You're ${Math.abs(savingsSinceSubscription.roiPercentage).toFixed(0)}x ahead!`
                    : savingsSinceSubscription.totalSaved >= 0
                      ? `💡 Keep using GasGuard! You're ${Math.abs(savingsSinceSubscription.roiPercentage).toFixed(0)}% of the way there.`
                      : '💡 Use GasGuard alerts to save on future transactions!'
                }
              </div>
              {savingsSinceSubscription.transactionCount > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Based on {savingsSinceSubscription.transactionCount} transaction{savingsSinceSubscription.transactionCount !== 1 ? 's' : ''} since {subscription?.status === 'trialing' ? 'trial started' : 'subscribing'}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border space-y-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Premium Features Active:</p>
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
              <span className="text-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Alert Settings Tab */}
      {activeTab === 'alerts' && (
        <div>
          <SettingsCard walletAddress={walletAddress} />
        </div>
      )}
    </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30 p-6 backdrop-blur-sm">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-primary/30">
        <button
          onClick={() => setActiveTab('pro')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'pro'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Crown className="w-5 h-5" />
          Pro Features
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'alerts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell className="w-5 h-5" />
          Alert Settings
        </button>
      </div>

      {/* Pro Features Tab */}
      {activeTab === 'pro' && (
      <div className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-bold">
          <Gift className="w-3.5 h-3.5" />
          14-day free trial
        </div>
        <div className="text-4xl font-bold text-foreground">
          $7.99<span className="text-lg text-muted-foreground">/month</span>
        </div>
      </div>

      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-success" strokeWidth={3} />
            </div>
            <span className="text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleStartTrial}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start Free Trial
        </Button>
        <p className="text-xs text-center text-muted-foreground">No credit card required</p>
      </div>
    </div>
    )}

    {/* Alert Settings Tab */}
    {activeTab === 'alerts' && (
      <div>
        <SettingsCard walletAddress={walletAddress} />
      </div>
    )}
  </div>
  )
}
