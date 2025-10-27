import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: October 22, 2025</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using GasGuard ("Service"), you agree to be bound by these Terms of Service. 
                If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                GasGuard provides Ethereum gas price tracking, forecasting, and alert services. 
                The Service uses third-party data providers and blockchain APIs to deliver real-time information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the security of your wallet and any activities conducted 
                through your wallet address. We are not responsible for any loss or damage from your failure 
                to maintain wallet security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                Certain features require a paid subscription. Subscriptions automatically renew unless canceled. 
                Refunds are handled on a case-by-case basis within 14 days of payment.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Free trial: 14 days</li>
                <li>Subscription fee: $7.99/month</li>
                <li>Payment processed via Stripe</li>
                <li>Cancel anytime from your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Gas price predictions are estimates based on historical data and statistical analysis. 
                We do not guarantee accuracy. Use information at your own risk. We are not liable for any 
                financial losses resulting from transaction timing or gas price decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may not use the Service to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Violate any laws or regulations</li>
                <li>Scrape or harvest data without permission</li>
                <li>Attempt to breach security or authentication</li>
                <li>Transmit malware or harmful code</li>
                <li>Impersonate others or misrepresent affiliation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are owned by GasGuard 
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your access immediately, without prior notice, for any reason, 
                including breach of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall GasGuard be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the Service 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, contact us at: 
                <a href="mailto:info@gen-a.dev" className="text-primary hover:underline ml-1">
                  info@gen-a.dev
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
