import { Crown, Lock, Sparkles } from 'lucide-react';
import { createCheckoutSession } from '@/api/gasApi';

const TrialExpiredPaywall = ({ walletAddress, onDisconnect }) => {
  const handleStartSubscription = async () => {
    try {
      const { url } = await createCheckoutSession(walletAddress);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start subscription:', error);
      alert('Failed to start subscription. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Crown className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Your Trial Has Ended</h1>
          <p className="text-muted-foreground text-lg">
            Your 14-day free trial has expired. Subscribe now to continue using GasGuard and save on gas fees.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-sm text-muted-foreground">Premium</span>
            <div className="text-right">
              <div className="text-2xl font-bold">$7.99</div>
              <div className="text-xs text-muted-foreground">/month</div>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">Real-time price alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">Smart predictions</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">90-day savings tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm">Telegram notifications</span>
            </div>
          </div>

          <button
            onClick={handleStartSubscription}
            className="w-full px-6 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold text-lg transition-all"
          >
            Subscribe Now - $7.99/month
          </button>

          <p className="text-xs text-muted-foreground">
            Cancel anytime • Secure payment via Stripe
          </p>
        </div>

        <button
          onClick={onDisconnect}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};

export default TrialExpiredPaywall;
