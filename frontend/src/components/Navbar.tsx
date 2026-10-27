import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X, ArrowRight, ShieldCheck, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, sectionId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="focus:outline-none focus:ring-2 focus:ring-brand-blue rounded-lg"
          aria-label="Docusure AI Home"
        >
          <Logo size={38} />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-secondary">
          <button
            onClick={() => handleNavClick('home')}
            className={`transition-colors hover:text-brand-blue ${currentView === 'home' ? 'text-brand-blue font-semibold' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('home', 'features')}
            className="transition-colors hover:text-brand-blue"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick('home', 'how-it-works')}
            className="transition-colors hover:text-brand-blue"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('home', 'compliance')}
            className="transition-colors hover:text-brand-blue"
          >
            Compliance
          </button>
          <button
            onClick={() => handleNavClick('home', 'about')}
            className="transition-colors hover:text-brand-blue"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-1.5 transition-colors hover:text-brand-blue ${currentView === 'dashboard' ? 'text-brand-blue font-semibold' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => handleNavClick('verify')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-blue text-white text-sm font-semibold shadow-md shadow-brand-blue/20 hover:bg-brand-dark transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Start Verification</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-brand-blue"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-surface-border bg-white px-4 pt-2 pb-6 space-y-3 animate-fadeIn">
          <button
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 text-base font-medium text-ink-primary hover:text-brand-blue"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('home', 'features')}
            className="block w-full text-left py-2 text-base font-medium text-ink-secondary hover:text-brand-blue"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick('home', 'how-it-works')}
            className="block w-full text-left py-2 text-base font-medium text-ink-secondary hover:text-brand-blue"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('home', 'compliance')}
            className="block w-full text-left py-2 text-base font-medium text-ink-secondary hover:text-brand-blue"
          >
            Compliance
          </button>
          <button
            onClick={() => handleNavClick('home', 'about')}
            className="block w-full text-left py-2 text-base font-medium text-ink-secondary hover:text-brand-blue"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className="block w-full text-left py-2 text-base font-medium text-ink-secondary hover:text-brand-blue"
          >
            Dashboard
          </button>

          <div className="pt-2">
            <button
              onClick={() => handleNavClick('verify')}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-blue text-white text-base font-semibold shadow-md hover:bg-brand-dark transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Start Verification</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
