import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: October 22, 2025</p>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We collect information you provide directly and automatically when using our Service:
              </p>
              <h3 className="text-xl font-semibold mb-2">Information You Provide:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
                <li>Ethereum wallet address (public blockchain data)</li>
                <li>Telegram username (for notifications)</li>
                <li>Email address (if provided for support)</li>
                <li>Payment information (processed securely by Stripe)</li>
              </ul>
              <h3 className="text-xl font-semibold mb-2">Information Collected Automatically:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Usage data and analytics</li>
                <li>Browser type and version</li>
                <li>IP address and location (approximate)</li>
                <li>Device information</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We use collected information to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Provide and maintain the Service</li>
                <li>Send gas price alerts via Telegram</li>
                <li>Process payments and manage subscriptions</li>
                <li>Analyze transaction patterns to improve forecasts</li>
                <li>Personalize your experience</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Send service updates and marketing communications (opt-out available)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                We share your information only in these circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Service Providers:</strong> Stripe (payments), MongoDB Atlas (data storage), Etherscan API (blockchain data)</li>
                <li><strong>Telegram:</strong> Your Telegram username to send notifications</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                <strong>We never sell your personal information to third parties.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encrypted database storage</li>
                <li>Secure API authentication</li>
                <li>Regular security audits</li>
                <li>Access controls and monitoring</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Blockchain Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your wallet address and transaction history are publicly available on the Ethereum blockchain. 
                We access this public data to provide our services. This data cannot be deleted or modified as 
                it exists permanently on the blockchain.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your experience and analyze usage. 
                You can control cookies through your browser settings, but some features may not function properly without them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Export your data (data portability)</li>
                <li>Withdraw consent at any time</li>
                <li>Opt-out of marketing communications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                To exercise these rights, contact us at: 
                <a href="mailto:privacy@gasguard.gen-a.dev" className="text-primary hover:underline ml-1">
                  privacy@gasguard.gen-a.dev
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your information for as long as necessary to provide services and comply with legal obligations. 
                After account deletion, we may retain anonymized data for analytics and legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for users under 18 years of age. We do not knowingly collect data from children. 
                If you believe a child has provided us with personal information, contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. International Users</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be transferred to and processed in countries other than your own. 
                By using the Service, you consent to these transfers. We comply with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email 
                or prominent notice on our website. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about this Privacy Policy or to exercise your rights, contact us at:
              </p>
              <div className="mt-3 text-muted-foreground">
                <p>Email: <a href="mailto:info@gen-a.dev" className="text-primary hover:underline">info@gen-a.dev</a></p>
                <p>Website: <a href="https://gasguard.gen-a.dev" className="text-primary hover:underline">https://gasguard.gen-a.dev</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
