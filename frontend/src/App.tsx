import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import { NewVerification } from './pages/NewVerification';
import { VerificationResults } from './pages/VerificationResults';
import { DemoModal } from './components/DemoModal';
import { PrivacyModal, TermsModal } from './components/LegalModals';
import { ApplicationRecord } from './types';
import { fetchApplication, runDemoScenario } from './services/api';

export function App() {
  // Show welcome screen initially unless user dismissed it in this session
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return !sessionStorage.getItem('docusure_welcome_seen');
  });

  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'verify' | 'results'>('home');
  const [activeRecord, setActiveRecord] = useState<ApplicationRecord | null>(null);
  
  // Modals
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Smooth scroll helper
  const navigateTo = (view: string, sectionId?: string) => {
    if (view === 'home' || view === 'dashboard' || view === 'verify' || view === 'results') {
      setCurrentView(view as any);
    }
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWelcomeGetStarted = () => {
    sessionStorage.setItem('docusure_welcome_seen', 'true');
    setShowWelcome(false);
    setCurrentView('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWelcomeExplore = () => {
    sessionStorage.setItem('docusure_welcome_seen', 'true');
    setShowWelcome(false);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerificationComplete = (record: ApplicationRecord) => {
    setActiveRecord(record);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenApplicationFromDashboard = async (appId: string) => {
    try {
      const record = await fetchApplication(appId);
      setActiveRecord(record);
      setCurrentView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || 'Could not load application record');
    }
  };

  const handleViewSampleReport = async () => {
    try {
      const record = await runDemoScenario('scenario_a');
      setActiveRecord(record);
      setCurrentView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setIsDemoModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-ink-primary font-sans">
      {/* 1. Initial Welcome Screen */}
      {showWelcome && (
        <WelcomeScreen
          onGetStarted={handleWelcomeGetStarted}
          onExplore={handleWelcomeExplore}
        />
      )}

      {/* 2. Global Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
      />

      {/* 3. Page Router */}
      <div className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onStartVerification={() => navigateTo('verify')}
            onOpenDemo={() => setIsDemoModalOpen(true)}
            onViewSampleReport={handleViewSampleReport}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            onNewVerification={() => navigateTo('verify')}
            onOpenApplication={handleOpenApplicationFromDashboard}
            onOpenDemo={() => setIsDemoModalOpen(true)}
          />
        )}

        {currentView === 'verify' && (
          <NewVerification
            onVerificationComplete={handleVerificationComplete}
            onOpenDemo={() => setIsDemoModalOpen(true)}
          />
        )}

        {currentView === 'results' && activeRecord && (
          <VerificationResults
            record={activeRecord}
            onBackToDashboard={() => navigateTo('dashboard')}
            onRecordUpdated={(updated) => setActiveRecord(updated)}
          />
        )}
      </div>

      {/* 4. Global Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      {/* 5. Demonstration Scenarios Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onScenarioSuccess={handleVerificationComplete}
      />

      {/* 6. Legal Modals */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
}

export default App;
