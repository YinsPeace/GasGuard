import React from 'react';
import { ArrowRight, Zap, Bell, TrendingDown, Shield, Clock, Bot } from 'lucide-react';

const LandingPage = ({ onConnectWallet }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span>Smart gas optimization for Ethereum</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Never Overpay for
              <span className="block text-primary mt-2">Ethereum Gas Again</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Data-driven predictions and smart alerts help you transact at the perfect time. 
              Track your savings and optimize every transaction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={onConnectWallet}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg transition-all hover:scale-105"
              >
                Connect Wallet & Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-border hover:border-primary/40 bg-background hover:bg-accent transition-all"
              >
                Learn More
              </a>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Non-custodial</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Real-time data</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                <span>Proven savings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Save</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to help you optimize every Ethereum transaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold pt-1">Smart Predictions</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Historical pattern analysis and statistical forecasting predict optimal transaction times and help you save on gas fees.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold pt-1">Smart Telegram Alerts</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Get instant notifications when gas prices drop below your threshold. Never miss the perfect window.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold pt-1">Real-Time Tracking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor current gas prices, view your transaction history, and calculate exact savings in real-time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold pt-1">Best Time Windows</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover the optimal 4-hour windows for transactions based on historical patterns and predictions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold pt-1">Non-Custodial & Safe</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We never access your wallet or funds. Your keys stay in your control. We only read public blockchain data.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold pt-1">Telegram Integration</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect your Telegram account for instant mobile notifications. Stay updated wherever you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Your Dashboard</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A beautiful, intuitive interface that makes tracking gas prices effortless
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Preview Card */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-8 space-y-4 md:space-y-6">
              {/* Mock Dashboard Preview */}
              <div className="rounded-lg bg-gradient-to-br from-primary/20 via-accent to-background border border-border flex items-center justify-center overflow-hidden p-6 md:p-8">
                <div className="text-center space-y-3 md:space-y-4 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-background/80 backdrop-blur border border-border">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs md:text-sm font-medium">Live Dashboard</span>
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <div className="text-3xl md:text-5xl font-bold text-primary">0.126 Gwei</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Current Gas Price - Safe to transact</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-4 pt-2 md:pt-4 max-w-lg mx-auto">
                    <div className="p-2 md:p-4 rounded-lg bg-background/60 backdrop-blur border border-border">
                      <div className="text-lg md:text-2xl font-bold text-green-500">$47.23</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground">Saved</div>
                    </div>
                    <div className="p-2 md:p-4 rounded-lg bg-background/60 backdrop-blur border border-border">
                      <div className="text-lg md:text-2xl font-bold">93%</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground">Optimal</div>
                    </div>
                    <div className="p-2 md:p-4 rounded-lg bg-background/60 backdrop-blur border border-border">
                      <div className="text-lg md:text-2xl font-bold">12</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground">Transactions</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
                <div>
                  <div className="text-lg md:text-2xl font-bold text-primary">Real-Time</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Live Tracking</div>
                </div>
                <div>
                  <div className="text-lg md:text-2xl font-bold text-primary">Smart</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Forecasting</div>
                </div>
                <div>
                  <div className="text-lg md:text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Try free for 14 days. Cancel anytime. No credit card required.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Premium Tier */}
            <div className="rounded-xl border-2 border-primary bg-card p-8 space-y-6 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                14-Day Free Trial
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">GasGuard Premium</h3>
                <div className="text-4xl font-bold">$7.99<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-sm text-muted-foreground mt-2">Cancel anytime • No credit card required for trial</p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span>Real-time gas price tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span>Smart forecasting & predictions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span>Telegram alerts & notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span>Custom alert thresholds</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span>90-day savings tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span>Priority support</span>
                </li>
              </ul>
              <button
                onClick={onConnectWallet}
                className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all font-semibold"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background">
            <h2 className="text-4xl font-bold">Ready to Start Saving?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users who are already optimizing their Ethereum transactions
            </p>
            <button
              onClick={onConnectWallet}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg transition-all hover:scale-105"
            >
              Connect Wallet & Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
