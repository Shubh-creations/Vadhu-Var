import React, { useState, useEffect } from 'react';
import { Heart, Search, User, Download, Menu, X, LogOut, Star, MessageSquare, Shield, Sun, Moon, Globe } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth, onOpenPrivacyModal, onOpenChatModal }) => {
  const { user, profile, logout } = useAuth();
  const { interests, shortlistedIds } = useData();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const userId = profile?.id || user?.id || 'demo-user-me';
  const receivedInterestsCount = interests.filter(
    i => i.receiver_id === userId && i.status === 'pending'
  ).length;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const navItems = [
    { id: 'browse', label: t('discover'), icon: Search },
    { 
      id: 'interests', 
      label: t('interests'), 
      icon: Heart, 
      badge: receivedInterestsCount > 0 ? receivedInterestsCount : null 
    },
    { 
      id: 'shortlists', 
      label: t('shortlisted'), 
      icon: Star, 
      badge: shortlistedIds.length > 0 ? shortlistedIds.length : null 
    },
    { 
      id: 'profile', 
      label: profile ? t('myProfile') : t('createProfile'), 
      icon: User 
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface-card border-b border-main transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo Mark: 1st Website Icon emblem + "वधू - वर" */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="cursor-pointer group flex-shrink-0"
          >
            <Logo variant="header" />
          </div>

          {/* Desktop Primary Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`h-full flex items-center gap-2 px-1 text-sm font-medium transition-colors relative border-b-2 ${
                    isActive
                      ? 'border-sky-blue text-main font-bold'
                      : 'border-transparent text-sub hover:text-main'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sub" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-xs font-bold text-sub bg-surface-ground rounded-full border border-main">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Trilingual Language Switcher (EN / HI / MR), Theme Toggle & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Trilingual Language Selector */}
            <div className="flex items-center bg-surface-ground radius-btn border border-main p-0.5 text-xs font-bold text-sub">
              <Globe className="w-3.5 h-3.5 mx-1 text-sub hidden sm:block" />
              <button
                onClick={() => setLang('en')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 radius-btn transition-colors ${
                  lang === 'en' ? 'bg-surface-card text-main shadow-xs font-bold' : 'hover:text-main'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 radius-btn transition-colors ${
                  lang === 'hi' ? 'bg-surface-card text-main shadow-xs font-bold' : 'hover:text-main'
                }`}
                title="हिंदी (Hindi)"
              >
                HI
              </button>
              <button
                onClick={() => setLang('mr')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 radius-btn transition-colors ${
                  lang === 'mr' ? 'bg-surface-card text-main shadow-xs font-bold' : 'hover:text-main'
                }`}
                title="मराठी (Marathi)"
              >
                MR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Privacy Controls */}
            <button
              onClick={onOpenPrivacyModal}
              className="hidden sm:block p-2 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
              title={t('privacyControls')}
              aria-label="Privacy Controls"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Messaging */}
            <button
              onClick={onOpenChatModal}
              className="p-1.5 sm:p-2 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
              title={t('messaging')}
              aria-label="Messaging"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {isInstallable && (
              <button
                onClick={handleInstallPWA}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 radius-btn bg-surface-ground text-main text-xs font-medium hover:opacity-80 transition-opacity border border-main"
                title="Install app"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {user || profile ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-1.5 p-1 sm:pr-3 rounded-full border border-main hover:border-sky-blue transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-sky-blue text-white font-bold text-xs flex items-center justify-center">
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-main max-w-[90px] truncate">
                    {profile?.full_name || user?.email}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 sm:p-2 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
                  title={t('signOut')}
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 sm:px-4 sm:py-2 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white text-xs sm:text-sm font-medium transition-colors shadow-xs"
              >
                {t('signIn')}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 radius-btn text-sub hover:bg-surface-ground"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-main bg-surface-card px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 radius-btn text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-ground text-main border-l-2 border-sky-blue'
                    : 'text-sub hover:bg-surface-ground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-sub" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold text-sub bg-surface-ground rounded-full border border-main">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
