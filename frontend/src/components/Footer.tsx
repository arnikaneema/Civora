import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Mail, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, sectionId?: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="bg-navy-900 text-white pt-16 pb-12 border-t border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-700">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="brightness-125">
              <Logo size={36} />
            </div>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              Docusure AI is an intelligent platform for application validation, document authentication, 
              and regulatory compliance verification. Providing transparent, evidence-based reports 
              for applicants, universities, and administrative reviewers.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-800 border border-navy-700 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" />
                <span>Deterministic Rule Engine • Zero-Knowledge Local Pipeline</span>
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-brand-blue transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'features')} className="hover:text-brand-blue transition-colors">
                  Core Features
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'how-it-works')} className="hover:text-brand-blue transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'compliance')} className="hover:text-brand-blue transition-colors">
                  Compliance Framework
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-brand-blue transition-colors">
                  Applications Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Feedback */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-brand-blue transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="hover:text-brand-blue transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <span className="text-xs text-slate-400 block pt-1">
                  Prototype demonstration policies provided for technical evaluation.
                </span>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:support@docusure.demo"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-subtle hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>support@docusure.demo</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Docusure AI. All rights reserved.</p>
          <p className="max-w-2xl text-center md:text-right text-[11px] leading-normal text-slate-400">
            Docusure AI evaluates internal cross-document consistency and configured compliance constraints. 
            Automated verification does not replace official statutory authority issuance records.
          </p>
        </div>
      </div>
    </footer>
  );
};
