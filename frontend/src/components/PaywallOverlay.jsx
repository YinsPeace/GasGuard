import React from 'react';
import { Crown } from 'lucide-react';

const PaywallOverlay = ({ featureName = "this feature", showButton = false }) => {
  const scrollToSubscription = () => {
    const element = document.getElementById('subscription');
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-background/98 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg cursor-not-allowed">
      <div className="text-center space-y-4 p-6 max-w-xs">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Premium Feature</h3>
          <p className="text-muted-foreground text-sm">
            {featureName}
          </p>
        </div>

        {showButton && (
          <>
            <button
              onClick={scrollToSubscription}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all cursor-pointer"
            >
              Start Free Trial
            </button>

            <p className="text-xs text-muted-foreground">
              14-day free trial • $7.99/month
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaywallOverlay;
