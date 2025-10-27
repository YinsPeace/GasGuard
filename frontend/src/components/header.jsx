import { Zap, TrendingDown, Moon, Sun, DollarSign, TrendingUp, FileText, Bell, Sparkles, Menu, X, Crown, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { getSubscriptionStatus } from '@/api/gasApi'

export function Header({ theme, onToggleTheme, activeSection, walletAddress, onDisconnect, onConnect }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    if (walletAddress) {
      checkSubscription()
    }
  }, [walletAddress])

  const checkSubscription = async () => {
    try {
      const status = await getSubscriptionStatus(walletAddress)
      setSubscription(status)
    } catch (error) {
      console.error('Failed to check subscription:', error)
    }
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      setMobileMenuOpen(false)
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  const navItems = [
    { id: 'multichain', label: 'Track', icon: Zap },
    { id: 'prediction-league', label: 'Predict', icon: Trophy, badge: 'LIVE' },
    { id: 'savings', label: 'Save', icon: DollarSign },
    { id: 'subscription', label: 'Pro', icon: Crown },
  ]

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border backdrop-blur-md bg-card/80">
      <div className="container mx-auto px-4 h-full flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-3 mr-8">
          <div className="relative flex items-center justify-center w-8 h-8">
            <Zap className="w-6 h-6 text-blue-500 absolute" fill="currentColor" />
            <TrendingDown className="w-4 h-4 text-green-500 absolute translate-x-1 translate-y-1" strokeWidth={3} />
          </div>
          <span className="text-xl font-bold text-foreground">GasGuard</span>

          {/* Subscription badge */}
          {subscription?.isSubscribed && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg">
              <Crown className="w-3.5 h-3.5" />
              {subscription.status === 'trialing' ? 'Pro Trial' : 'Pro'}
            </span>
          )}
        </div>

        {walletAddress && (
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon
              // For "Save", highlight when in savings or forecast sections
              const isActive = item.id === 'savings' 
                ? ['savings', 'forecast'].includes(activeSection)
                : activeSection === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-2 py-1 text-base font-medium border-b-2 transition-all duration-300 ${
                    isActive
                      ? 'text-blue-500 border-blue-500'
                      : 'text-muted-foreground border-transparent hover:text-blue-400 hover:border-blue-400/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <div className="hidden lg:block w-px h-6 bg-border" />

          <Button variant="ghost" size="icon" onClick={onToggleTheme} className="rounded-full">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {walletAddress ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm font-mono">
                {formatAddress(walletAddress)}
              </div>

              <Button variant="outline" size="sm" onClick={onDisconnect} className="hidden sm:inline-flex bg-transparent">
                Disconnect
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden rounded-full"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </>
          ) : (
            onConnect && (
              <Button variant="default" size="sm" onClick={onConnect} className="bg-primary hover:bg-primary/90">
                Connect Wallet
              </Button>
            )
          )}
        </div>
      </div>

      {walletAddress && mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 border-b border-border backdrop-blur-md bg-card/95 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2 max-w-7xl">
            {navItems.map((item) => {
              const Icon = item.icon
              // For "Save", highlight when in savings or forecast sections
              const isActive = item.id === 'savings' 
                ? ['savings', 'forecast'].includes(activeSection)
                : activeSection === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'text-blue-500 bg-blue-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
