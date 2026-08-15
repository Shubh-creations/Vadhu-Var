import React from 'react';
import { Heart, Search, User, Download, LogOut, Star, MessageSquare, Shield, Sun, Moon, Globe, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePWA } from '../context/PWAContext';

export const Navbar = ({ activeTab, setActiveTab, onOpenAuth, onOpenPrivacyModal, onOpenChatModal }) => {
  const { user, profile, logout } = useAuth();
  const { interests, shortlistedIds } = useData();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { isInstalled, triggerInstall } = usePWA();

  const userId = profile?.id || user?.id;
  const receivedInterestsCount = interests.filter(
    i => i.receiver_id === userId && i.status === 'pending'
  ).length;

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
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface-card border-b border-main shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo with 1st Image Website Icon */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('browse')}
              className="flex items-center gap-2 text-left focus:outline-none"
              aria-label="Go to Discover"
            >
              <Logo type="icon" size="medium" />
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-black text-main leading-tight tracking-tight">
                  {t('brandName')}
                </span>
                <span className="text-[10px] text-sub font-medium leading-none hidden sm:inline">
                  {t('brandSubtitle')}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 radius-btn text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-ground text-main border border-main'
                      : 'text-sub hover:text-main hover:bg-surface-ground/50'
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

          {/* Right Action Tools: Install Button, Language, Dark Mode, Settings & Auth */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Install Button (Desktop Pill / Mobile Icon) */}
            {!isInstalled && (
              <>
                {/* Desktop/Tablet Install Button */}
                <button
                  onClick={triggerInstall}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 radius-btn bg-surface-ground hover:bg-surface-card text-main border border-main hover:border-sky-blue text-xs font-semibold shadow-xs transition-colors"
                  title="Install Vadhu Var App"
                  aria-label="Install App"
                >
                  <Download className="w-3.5 h-3.5 text-sky-blue" />
                  <span>Install App</span>
                </button>

                {/* Mobile Install Icon */}
                <button
                  onClick={triggerInstall}
                  className="sm:hidden p-1.5 radius-btn text-sky-blue hover:bg-surface-ground transition-colors"
                  title="Install App"
                  aria-label="Install App"
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Trilingual Language Selector */}
            <div className="flex items-center bg-surface-ground radius-btn border border-main p-0.5 text-[11px] font-bold text-sub">
              <button
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 radius-btn transition-colors ${
                  lang === 'en' ? 'bg-surface-card text-main shadow-xs font-bold' : 'hover:text-main'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-1.5 py-0.5 radius-btn transition-colors ${
                  lang === 'hi' ? 'bg-surface-card text-main shadow-xs font-bold' : 'hover:text-main'
                }`}
                title="हिंदी (Hindi)"
              >
                HI
              </button>
              <button
                onClick={() => setLang('mr')}
                className={`px-1.5 py-0.5 radius-btn transition-colors ${
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
              className="p-1.5 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Desktop Privacy & Messaging Icons */}
            <button
              onClick={onOpenPrivacyModal}
              className="hidden lg:block p-1.5 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
              title={t('privacyControls')}
              aria-label="Privacy Controls"
            >
              <Shield className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenChatModal}
              className="hidden lg:block p-1.5 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
              title={t('messaging')}
              aria-label="Messaging"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* User Profile & Account Settings or Sign In */}
            {user || profile ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-1.5 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
                  title={t('accountSettings')}
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-1.5 p-0.5 sm:pr-2.5 rounded-full border border-main hover:border-sky-blue transition-colors"
                  title="My Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-sky-blue text-white font-bold text-xs flex items-center justify-center">
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-main max-w-[85px] truncate">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="hidden sm:block p-1.5 radius-btn text-sub hover:text-main hover:bg-surface-ground transition-colors"
                  title={t('signOut')}
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('signIn')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
