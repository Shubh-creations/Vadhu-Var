import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import Toast from './components/Toast';
import PWAUpdateToast from './components/PWAUpdateToast';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProfileWizardPage from './pages/ProfileWizardPage';
import BrowsePage from './pages/BrowsePage';
import ProfileDetailPage from './pages/ProfileDetailPage';
import InterestsPage from './pages/InterestsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AccountSettingsPage from './pages/AccountSettingsPage';

// Modals
import CompatibilityModal from './components/CompatibilityModal';
import PrivacySettingsModal from './components/PrivacySettingsModal';
import ChatAndCallModal from './components/ChatAndCallModal';
import BlockReportModal from './components/BlockReportModal';

function AppContent() {
  const { user, profile } = useAuth();
  const { toast, clearToast } = useData();

  const [activeTab, setActiveTab] = useState(() => {
    // If user has local token/profile, open in browse mode; otherwise landing page
    return localStorage.getItem('vadhu_var_user') || localStorage.getItem('vadhu_var_profile') ? 'browse' : 'landing';
  });
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Modal State Triggers
  const [compatibilityCandidate, setCompatibilityCandidate] = useState(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [chatCandidate, setChatCandidate] = useState(null);
  const [blockReportCandidate, setBlockReportCandidate] = useState(null);

  const handleViewProfileDetail = (p) => {
    setSelectedProfile(p);
    setActiveTab('detail');
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'detail') setSelectedProfile(null);
        }}
        onOpenAuth={() => setActiveTab('auth')}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        onOpenChatModal={() => setChatCandidate(selectedProfile || null)}
      />

      {/* Toast Notifications & PWA Update Banner */}
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      <PWAUpdateToast />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onGetStarted={() => setActiveTab(user || profile ? 'profile' : 'auth')}
            onBrowse={() => setActiveTab('browse')}
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage
            onSuccess={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileWizardPage
            onComplete={() => setActiveTab('browse')}
          />
        )}

        {activeTab === 'browse' && (
          <BrowsePage
            onViewProfile={handleViewProfileDetail}
            onOpenCompatibility={(p) => setCompatibilityCandidate(p)}
            onNavigateToProfile={() => setActiveTab('profile')}
            onAuthRequired={() => setActiveTab('auth')}
            showShortlistedOnly={false}
          />
        )}

        {activeTab === 'shortlists' && (
          <BrowsePage
            onViewProfile={handleViewProfileDetail}
            onOpenCompatibility={(p) => setCompatibilityCandidate(p)}
            onNavigateToProfile={() => setActiveTab('profile')}
            onAuthRequired={() => setActiveTab('auth')}
            showShortlistedOnly={true}
          />
        )}

        {activeTab === 'detail' && (
          <ProfileDetailPage
            profile={selectedProfile}
            onBack={() => setActiveTab('browse')}
            onOpenCompatibility={(p) => setCompatibilityCandidate(p)}
            onOpenChat={(p) => setChatCandidate(p)}
            onAuthRequired={() => setActiveTab('auth')}
          />
        )}

        {activeTab === 'interests' && (
          <InterestsPage
            onViewProfile={handleViewProfileDetail}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicyPage
            onBack={() => setActiveTab('browse')}
          />
        )}

        {activeTab === 'settings' && (
          <AccountSettingsPage
            onBack={() => setActiveTab('browse')}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'detail') setSelectedProfile(null);
        }}
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
        onOpenBlockReport={(c) => setBlockReportCandidate(c)}
      />

      <BlockReportModal
        candidate={blockReportCandidate}
        isOpen={Boolean(blockReportCandidate)}
        onClose={() => setBlockReportCandidate(null)}
      />

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setActiveTab('privacy')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
