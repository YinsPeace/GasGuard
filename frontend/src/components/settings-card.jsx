import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Settings, Send, Bell, Clock, TrendingUp } from 'lucide-react'
import { getTelegramStatus, connectTelegram, updateGasThreshold, updateAlertSettings, sendTestAlert, getSubscriptionStatus } from '@/api/gasApi'
import PaywallOverlay from './PaywallOverlay'

const presets = [
  { id: 'super-cheap', label: 'Super Cheap', threshold: 1.5, display: '1.5 Gwei' },
  { id: 'cheap', label: 'Cheap', threshold: 3.0, display: '3.0 Gwei' },
  { id: 'normal', label: 'Normal', threshold: 5.0, display: '5.0 Gwei' },
  { id: 'fast', label: 'Fast', threshold: 8.0, display: '8.0 Gwei' },
]

export function SettingsCard({ walletAddress }) {
  const [selectedPreset, setSelectedPreset] = useState('normal')
  const [customThreshold, setCustomThreshold] = useState(5.0)
  const [customInput, setCustomInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [telegramConnected, setTelegramConnected] = useState(false)
  const [telegramUsername, setTelegramUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [bestTimeAlerts, setBestTimeAlerts] = useState(true)
  const [trendAlerts, setTrendAlerts] = useState(true)
  const [subscription, setSubscription] = useState(null)

  const checkTelegramStatus = async () => {
    if (!walletAddress) return

    try {
      const [status, subStatus] = await Promise.all([
        getTelegramStatus(walletAddress),
        getSubscriptionStatus(walletAddress)
      ])
      
      setSubscription(subStatus)
      if (status && status.connected) {
        setTelegramConnected(true)
        setTelegramUsername('@GasGuardAppBot')

        // Load saved threshold if exists
        if (status.threshold !== undefined) {
          setCustomThreshold(status.threshold)
          // Find matching preset
          const matchingPreset = presets.find(p => p.threshold === status.threshold)
          if (matchingPreset) {
            setSelectedPreset(matchingPreset.id)
          }
        }
        
        // Load alert preferences
        if (status.bestTimeAlerts !== undefined) {
          setBestTimeAlerts(status.bestTimeAlerts)
        }
        if (status.trendAlerts !== undefined) {
          setTrendAlerts(status.trendAlerts)
        }
      } else {
        setTelegramConnected(false)
        setTelegramUsername('')
      }
    } catch (error) {
      console.error('Failed to check Telegram status:', error)
      setTelegramConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTelegramStatus()
  }, [walletAddress])

  const handlePresetClick = async (preset) => {
    setSelectedPreset(preset.id)
    setCustomThreshold(preset.threshold)
    setCustomInput('') // Clear custom input when preset is selected

    // Save to backend
    await saveThreshold(preset.threshold)
  }

  const saveThreshold = async (threshold) => {
    setIsSaving(true)
    try {
      await updateGasThreshold(walletAddress, threshold)
      console.log(`Gas threshold updated to ${threshold} Gwei`)
    } catch (error) {
      console.error('Failed to save threshold:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConnectTelegram = async () => {
    // Check if user has active subscription
    if (!hasSubscription) {
      alert('🔒 Telegram alerts are a Premium feature. Please subscribe to GasGuard Pro to enable real-time alerts.')
      return
    }

    try {
      const result = await connectTelegram(walletAddress)
      if (result.botUrl) {
        window.open(result.botUrl, '_blank')
        // Recheck status after 3 seconds
        setTimeout(() => {
          checkTelegramStatus()
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to connect Telegram:', error)
      alert('Failed to open Telegram bot. Please try again.')
    }
  }

  const handleDisconnect = () => {
    setTelegramConnected(false)
    setTelegramUsername('')
  }

  const handleTestAlert = async () => {
    try {
      setIsSaving(true)
      const response = await sendTestAlert(walletAddress)
      alert('✅ Test alert sent to Telegram! Check your messages.')
    } catch (error) {
      console.error('Failed to send test alert:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send test alert. Make sure you\'re connected to Telegram.'
      alert(`❌ ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomThreshold = async () => {
    const value = parseFloat(customInput)
    
    if (isNaN(value) || value <= 0 || value > 500) {
      alert('Please enter a valid gas price between 0.1 and 500 Gwei')
      return
    }

    setSelectedPreset('custom')
    setCustomThreshold(value)
    setCustomInput('')
    
    // Save to backend
    await saveThreshold(value)
  }

  const toggleAlertType = async (type) => {
    if (!telegramConnected) return
    
    try {
      if (type === 'bestTime') {
        const newValue = !bestTimeAlerts
        setBestTimeAlerts(newValue)
        await updateAlertSettings(walletAddress, { bestTimeAlerts: newValue })
        console.log(`Best time alerts ${newValue ? 'enabled' : 'disabled'}`)
      } else if (type === 'trend') {
        const newValue = !trendAlerts
        setTrendAlerts(newValue)
        await updateAlertSettings(walletAddress, { trendAlerts: newValue })
        console.log(`Trend alerts ${newValue ? 'enabled' : 'disabled'}`)
      }
    } catch (error) {
      console.error('Failed to update alert settings:', error)
    }
  }

  const hasSubscription = subscription?.status === 'active' || subscription?.status === 'trialing'

  return (
    <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm space-y-6 relative">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Alert Settings</h2>
      </div>

      <div className="p-4 rounded-xl border-2 border-border bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" style={{ color: telegramConnected ? '#0088cc' : undefined }} />
            <span className="text-base font-semibold text-foreground">Telegram Notifications</span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              telegramConnected ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
            }`}
          >
            {telegramConnected ? 'Connected' : 'Not Connected'}
          </div>
        </div>

        {telegramConnected ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground truncate">
              {telegramUsername || '@GasGuardBot'}
            </span>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isSaving}
                className="bg-transparent text-xs flex-1 sm:flex-initial"
              >
                Disconnect
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleTestAlert} 
                disabled={isSaving}
                className="bg-transparent text-xs flex-1 sm:flex-initial whitespace-nowrap"
              >
                {isSaving ? 'Sending...' : 'Test Alert'}
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleConnectTelegram} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!hasSubscription}
          >
            {hasSubscription ? 'Connect Telegram' : '🔒 Connect Telegram (Premium)'}
          </Button>
        )}
      </div>

      {/* Alert Type Toggles - Only show if Telegram is connected */}
      {telegramConnected && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground">Alert Types</div>
          
          {/* Best Time Alerts Toggle */}
          <button
            onClick={() => toggleAlertType('bestTime')}
            className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-border bg-muted/20 hover:bg-muted/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${bestTimeAlerts ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">Optimal Time Windows</div>
                <div className="text-xs text-muted-foreground">Get notified during best times to transact</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              bestTimeAlerts ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
            }`}>
              {bestTimeAlerts ? 'ON' : 'OFF'}
            </div>
          </button>

          {/* Trend Alerts Toggle */}
          <button
            onClick={() => toggleAlertType('trend')}
            className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-border bg-muted/20 hover:bg-muted/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-5 h-5 ${trendAlerts ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">Price Trend Changes</div>
                <div className="text-xs text-muted-foreground">Get notified when gas prices are changing</div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              trendAlerts ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
            }`}>
              {trendAlerts ? 'ON' : 'OFF'}
            </div>
          </button>
          
          <div className="text-xs text-muted-foreground">
            💡 Threshold alerts are always enabled. These send when gas price drops below your set threshold.
          </div>
        </div>
      )}

      <div>
        <div className="text-sm text-muted-foreground mb-3">Gas Threshold</div>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              disabled={isSaving}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedPreset === preset.id ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:bg-muted/50'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="font-semibold text-foreground text-sm">{preset.label}</div>
              <div className="text-lg font-bold text-success mt-1">{preset.display}</div>
            </button>
          ))}
        </div>

        {/* Custom Threshold Input */}
        <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-border bg-muted/10">
          <div className="text-sm font-semibold text-foreground mb-3">Custom Threshold</div>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="500"
              placeholder="Enter custom value"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomThreshold()}
              disabled={isSaving}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              onClick={handleCustomThreshold}
              disabled={isSaving || !customInput}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Set
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Enter any value between 0.1 and 500 Gwei
          </div>
        </div>

        {isSaving && (
          <div className="text-xs text-muted-foreground mt-2 text-center">Saving...</div>
        )}

        <div className="text-sm text-muted-foreground mt-3 text-center">
          Current threshold: <strong className="text-foreground">{customThreshold} Gwei</strong>
        </div>
      </div>

      {!hasSubscription && <PaywallOverlay featureName="Get real-time Telegram alerts and custom gas thresholds with GasGuard Premium" />}
    </div>
  )
}
