import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile-first centered layout */}
        <div className="max-w-5xl mx-auto">
          
          {/* Brand - centered on mobile only */}
          <div className="text-center md:hidden mb-6">
            <div className="flex items-center gap-2 justify-center mb-3">
              <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span className="font-bold text-lg">GasGuard</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Optimize your multi-chain transactions with smart gas price predictions.
            </p>
          </div>

          {/* Desktop 3-column layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span className="font-bold text-lg">GasGuard</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-4">
                Optimize your multi-chain transactions with smart gas price predictions.
              </p>
              <a 
                href="https://t.me/GasGuardAppBot" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                <span className="font-medium">Get Alerts</span>
              </a>
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-4 text-sm">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link to="/terms" className="hover:text-foreground hover:underline transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-foreground hover:underline transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-4 text-sm">Connect</h3>
              <div className="flex items-center gap-3 justify-end">
                <a 
                  href="https://github.com/YinsPeace" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group p-3 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/40 transition-all hover:scale-105"
                  title="GitHub"
                >
                  <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                <a 
                  href="https://discord.com/users/yinspeace" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group p-3 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/40 transition-all hover:scale-105"
                  title="Discord"
                >
                  <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>
                <a 
                  href="mailto:info@gen-a.dev" 
                  className="group p-3 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/40 transition-all hover:scale-105"
                  title="Email"
                >
                  <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* Mobile centered layout */}
          <div className="md:hidden space-y-6 mb-6">
            {/* Get Alerts button */}
            <div className="flex justify-center">
              <a 
                href="https://t.me/GasGuardAppBot" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
                <span className="font-medium">Get Alerts</span>
              </a>
            </div>

            {/* Social icons - centered row */}
            <div className="flex items-center justify-center gap-4">
              <a 
                href="https://github.com/YinsPeace" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group p-3 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/40 transition-all"
                title="GitHub"
              >
                <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="https://discord.com/users/yinspeace" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group p-3 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/40 transition-all"
                title="Discord"
              >
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a 
                href="mailto:info@gen-a.dev" 
                className="group p-3 rounded-lg bg-muted/50 hover:bg-primary/10 border border-border hover:border-primary/40 transition-all"
                title="Email"
              >
                <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>

            {/* Legal links - centered inline */}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
            <p className="text-xs text-muted-foreground">
              © {currentYear} GasGuard. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Made with</span>
              <span className="text-primary">⚡</span>
              <span>for blockchain traders</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
