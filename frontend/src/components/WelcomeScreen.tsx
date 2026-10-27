import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, FileCheck, ArrowRight, Compass, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onExplore: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onExplore }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-900/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-subtle overflow-hidden">
        {/* Decorative Top Gradient Header */}
        <div className="h-3 w-full bg-gradient-to-r from-brand-blue via-blue-400 to-navy-800" />
        
        <div className="p-8 sm:p-12 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
            <Logo size={64} showText={false} />
          </div>

          {/* Title and Taglines */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-brand-blue font-semibold text-xs tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Document Intelligence SaaS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-800 tracking-tight">
            DOCUSURE <span className="text-brand-blue">AI</span>
          </h1>

          <p className="text-base sm:text-lg font-semibold text-brand-blue mt-2">
            Verify Documents. Validate Applications. Ensure Compliance.
          </p>

          <p className="text-xs uppercase tracking-widest text-ink-secondary font-medium mt-1">
            “Smarter document verification. Clearer decisions. Greater confidence.”
          </p>

          {/* Problem Statement Description */}
          <div className="mt-6 p-5 rounded-2xl bg-surface-bg border border-surface-border text-ink-primary text-sm sm:text-base leading-relaxed text-balance">
            “An intelligent platform for application validation, document analysis, and regulatory compliance. 
            Identify missing information, investigate inconsistencies, and understand what needs attention through 
            clear, evidence-based verification reports.”
          </div>

          {/* Highlights / Badges */}
          <div className="grid grid-cols-3 gap-3 w-full mt-6 text-xs text-ink-secondary font-medium">
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <FileCheck className="w-5 h-5 text-brand-blue mb-1" />
              <span>Evidence-Based</span>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <ShieldCheck className="w-5 h-5 text-status-success mb-1" />
              <span>Transparent Rules</span>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <Compass className="w-5 h-5 text-indigo-600 mb-1" />
              <span>No Sign-Up Needed</span>
            </div>
          </div>

          {/* Two Prominent Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full mt-8">
            <button
              onClick={onGetStarted}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue text-white font-semibold text-sm sm:text-base shadow-lg shadow-brand-blue/25 hover:bg-brand-dark transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExplore}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-bg text-navy-800 font-semibold text-sm sm:text-base border border-surface-border hover:bg-surface-hover hover:border-slate-300 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-navy-800 focus:ring-offset-2"
            >
              <span>Explore Platform</span>
            </button>
          </div>

          <p className="text-[11px] text-ink-muted mt-4">
            No registration, credit card, or personal information required to explore and verify.
          </p>
        </div>
      </div>
    </div>
  );
};
