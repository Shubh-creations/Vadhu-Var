import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { PWAProvider } from './context/PWAContext';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import Toast from './components/Toast';
import PWAUpdateToast from './components/PWAUpdateToast';
import SmartInstallBanner from './components/SmartInstallBanner';
import IOSInstallModal from './components/IOSInstallModal';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProfileWizardPage from './pages/ProfileWizardPage';
import BrowsePage from './pages/BrowsePage';
import ProfileDetailPage from './pages/ProfileDetailPage';
import InterestsPage from './pages/InterestsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import HelpPage from './pages/HelpPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import AccountDeactivatedPage from './pages/AccountDeactivatedPage';

import ErrorBoundary from './components/ErrorBoundary';

// Modals
import CompatibilityModal from './components/CompatibilityModal';
import PrivacySettingsModal from './components/PrivacySettingsModal';
import ChatAndCallModal from './components/ChatAndCallModal';
import BlockReportModal from './components/BlockReportModal';

import UserProfileHub from './components/UserProfileHub';
import DestinyCanvas from './components/DestinyCanvas';

function AppContent() {
  const { user, profile, isPasswordRecovery, isAccountDeactivated } = useAuth();
  const { toast, clearToast, showToast } = useData();
  const { t } = useLanguage();

  if (isAccountDeactivated) {
    return (
      <AccountDeactivatedPage onReturnHome={() => window.location.reload()} />
    );
  }

  // Initial tab resolution from URL hash or storage
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        return 'auth';
      }
      if (hash && ['landing', 'auth', 'browse', 'shortlists', 'interests', 'profile', 'detail', 'privacy', 'terms', 'help', 'settings'].includes(hash)) {
        return hash;
      }
    }
    return localStorage.getItem('vadhu_var_user') || localStorage.getItem('vadhu_var_profile') ? 'browse' : 'landing';
  });

  const [selectedProfile, setSelectedProfile] = useState(null);

  // Modal States
  const [compatibilityCandidate, setCompatibilityCandidate] = useState(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [chatCandidate, setChatCandidate] = useState(null);
  const [blockReportCandidate, setBlockReportCandidate] = useState(null);

  // Double-Back to Exit timestamp tracking ref
  const lastBackPressRef = useRef(0);
  const isNavigatingRef = useRef(false);

  // Navigation function with History Push State
  const navigateToTab = useCallback((newTab, options = {}) => {
    const { profileData = null, replace = false } = options;
    setActiveTab(newTab);

    if (newTab === 'detail' && profileData) {
      setSelectedProfile(profileData);
    } else if (newTab !== 'detail') {
      setSelectedProfile(null);
    }

    const state = {
      tab: newTab,
      profile: profileData ? { id: profileData.id, full_name: profileData.full_name } : null
    };

    if (typeof window !== 'undefined') {
      isNavigatingRef.current = true;
      if (replace) {
        window.history.replaceState(state, '', `#${newTab}`);
      } else {
        window.history.pushState(state, '', `#${newTab}`);
      }
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 50);
    }
  }, []);

  // Modal open helpers with history push so browser back closes modals
  const handleOpenPrivacyModal = () => {
    setPrivacyModalOpen(true);
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'privacy', tab: activeTab }, '', window.location.hash || `#${activeTab}`);
    }
  };

  const handleOpenChatModal = (candidate) => {
    setChatCandidate(candidate || selectedProfile || null);
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'chat', tab: activeTab }, '', window.location.hash || `#${activeTab}`);
    }
  };

  const handleOpenCompatibilityModal = (candidate) => {
    setCompatibilityCandidate(candidate);
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'compatibility', tab: activeTab }, '', window.location.hash || `#${activeTab}`);
    }
  };

  const handleOpenBlockReportModal = (candidate) => {
    setBlockReportCandidate(candidate);
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'blockReport', tab: activeTab }, '', window.location.hash || `#${activeTab}`);
    }
  };

  const handleViewProfileDetail = (p) => {
    navigateToTab('detail', { profileData: p });
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigateToTab(user || profile ? 'browse' : 'landing');
    }
  };

  // Password Recovery handler
  useEffect(() => {
    if (isPasswordRecovery) {
      navigateToTab('auth', { replace: true });
    }
  }, [isPasswordRecovery, navigateToTab]);

  // Window Popstate & Global Event Listeners (Back Button Handling)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure root history state is set
    const currentHash = window.location.hash ? window.location.hash.replace('#', '') : activeTab;
    window.history.replaceState({ tab: currentHash, isRoot: currentHash === 'browse' || currentHash === 'landing' }, '', `#${currentHash}`);

    const handlePopState = (event) => {
      // 1. If any modal is currently open, dismiss modal on Back
      if (chatCandidate || privacyModalOpen || compatibilityCandidate || blockReportCandidate) {
        setChatCandidate(null);
        setPrivacyModalOpen(false);
        setCompatibilityCandidate(null);
        setBlockReportCandidate(null);
        return;
      }

      // 2. If history state contains a tab, transition to it
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
        if (event.state.tab !== 'detail') {
          setSelectedProfile(null);
        }
        return;
      }

      // 3. If on a sub-view (e.g. detail, help, terms, privacy, settings, auth, profile), go back to main browse/landing
      const isRootTab = activeTab === 'browse' || activeTab === 'landing';
      if (!isRootTab) {
        const rootTarget = user || profile ? 'browse' : 'landing';
        setActiveTab(rootTarget);
        setSelectedProfile(null);
        window.history.pushState({ tab: rootTarget, isRoot: true }, '', `#${rootTarget}`);
        return;
      }

      // 4. If already on root screen ('browse' or 'landing'), implement Double-Back to Exit
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        // Second back press within 2s -> Allow exit (let browser or PWA quit)
        lastBackPressRef.current = 0;
      } else {
        // First back press -> Prevent sudden exit, keep in app, and show localized toast
        lastBackPressRef.current = now;
        window.history.pushState({ tab: activeTab, isRoot: true }, '', `#${activeTab}`);
        showToast(t('pressBackAgainToExit') || 'Press back again to exit app', 'info');
      }
    };

    window.addEventListener('popstate', handlePopState);

    window.__onOpenTerms = () => navigateToTab('terms');
    window.__onOpenPrivacy = () => navigateToTab('privacy');
    window.__onOpenHelp = () => navigateToTab('help');

    return () => {
      window.removeEventListener('popstate', handlePopState);
      delete window.__onOpenTerms;
      delete window.__onOpenPrivacy;
      delete window.__onOpenHelp;
    };
  }, [
    activeTab, 
    chatCandidate, 
    privacyModalOpen, 
    compatibilityCandidate, 
    blockReportCandidate, 
    user, 
    profile, 
    navigateToTab, 
    showToast, 
    t
  ]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 pb-16 md:pb-0 relative overflow-hidden bg-surface-ground bg-cultural-pattern">
      {/* Generative WebGL/Canvas Spatial Field: Undulating Golden Threads & Particle Motes */}
      <DestinyCanvas />

      {/* Smart Mobile Install Banner */}
      <SmartInstallBanner />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => navigateToTab(tab)}
        onOpenAuth={() => navigateToTab('auth')}
        onOpenPrivacyModal={handleOpenPrivacyModal}
        onOpenChatModal={() => handleOpenChatModal(selectedProfile)}
      />

      {/* Toast Notifications & PWA Update Banner */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      <PWAUpdateToast />
      <IOSInstallModal />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onGetStarted={() => navigateToTab(user || profile ? 'profile' : 'auth')}
            onBrowse={() => navigateToTab('browse')}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            onSuccess={() => {
              const hasProf = localStorage.getItem('vadhu_var_profile');
              navigateToTab(hasProf ? 'browse' : 'profile', { replace: true });
            }}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileHub
            onNavigateToDiscover={() => navigateToTab('browse')}
            onOpenHelp={() => navigateToTab('help')}
            onOpenTerms={() => navigateToTab('terms')}
            onNavigateHome={() => navigateToTab(user || profile ? 'browse' : 'landing')}
          />
        )}

        {activeTab === 'browse' && (
          <BrowsePage
            onViewProfile={handleViewProfileDetail}
            onOpenCompatibility={handleOpenCompatibilityModal}
            onNavigateToProfile={() => navigateToTab('profile')}
            onNavigateToDiscover={() => navigateToTab('browse')}
            onAuthRequired={() => navigateToTab('auth')}
            showShortlistedOnly={false}
          />
        )}

        {activeTab === 'shortlists' && (
          <BrowsePage
            onViewProfile={handleViewProfileDetail}
            onOpenCompatibility={handleOpenCompatibilityModal}
            onNavigateToProfile={() => navigateToTab('profile')}
            onNavigateToDiscover={() => navigateToTab('browse')}
            onAuthRequired={() => navigateToTab('auth')}
            showShortlistedOnly={true}
          />
        )}

        {activeTab === 'detail' && (
          <ProfileDetailPage
            profile={selectedProfile}
            onBack={handleGoBack}
            onOpenCompatibility={handleOpenCompatibilityModal}
            onOpenChat={handleOpenChatModal}
            onEditProfile={() => navigateToTab('profile')}
            onAuthRequired={() => navigateToTab('auth')}
          />
        )}

        {activeTab === 'interests' && (
          <InterestsPage
            onViewProfile={handleViewProfileDetail}
            onOpenChat={handleOpenChatModal}
            onNavigateToDiscover={() => navigateToTab('browse')}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicyPage
            onBack={handleGoBack}
          />
        )}

        {activeTab === 'terms' && (
          <TermsOfServicePage
            onBack={handleGoBack}
          />
        )}

        {activeTab === 'help' && (
          <HelpPage
            onBack={handleGoBack}
          />
        )}

        {activeTab === 'settings' && (
          <AccountSettingsPage
            onBack={handleGoBack}
            onNavigateToProfile={() => navigateToTab('profile')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => navigateToTab(tab)}
      />

      {/* Modals */}
      <CompatibilityModal
        profile={compatibilityCandidate}
        onClose={() => setCompatibilityCandidate(null)}
      />

      <PrivacySettingsModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      <ChatAndCallModal
        candidate={chatCandidate}
        isOpen={Boolean(chatCandidate)}
        onClose={() => setChatCandidate(null)}
        onOpenBlockReport={handleOpenBlockReportModal}
      />

      <BlockReportModal
        candidate={blockReportCandidate}
        isOpen={Boolean(blockReportCandidate)}
        onClose={() => setBlockReportCandidate(null)}
      />

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => navigateToTab('privacy')}
        onOpenTerms={() => navigateToTab('terms')}
        onOpenHelp={() => navigateToTab('help')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <DataProvider>
              <PWAProvider>
                <AppContent />
              </PWAProvider>
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
