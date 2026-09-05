import React from 'react';
import { Home, Heart, Search, User, Download, LogOut, Star, MessageSquare, Shield, Sun, Moon, Globe, Settings, Sparkles } from 'lucide-react';
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
    { id: 'landing', label: t('home'), icon: Home },
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
    <header className="sticky top-0 z-40 glass-card border-b border-zinc-200 dark:border-white/[0.08] shadow-lg backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo with Clean Transparent Emblem */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => setActiveTab('landing')}
              className="flex items-center gap-2.5 text-left focus:outline-none hover:opacity-90 transition-opacity flex-shrink-0"
              aria-label={t('home')}
              title={`${t('brandName')} ${t('home')}`}
            >
              <Logo variant="icon" size="small" />
              <div className="flex flex-col">
                <span className="font-serif text-base sm:text-lg font-black text-zinc-900 dark:text-white whitespace-nowrap tracking-tight leading-tight">
                  {t('brandName')}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-none hidden sm:inline">
                  {t('brandSubtitle')}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 radius-btn text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500/10 dark:bg-white/[0.08] text-amber-700 dark:text-gold-300 border border-amber-500/30 dark:border-gold-400/40 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-gold-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-bold text-zinc-950 bg-gold-400 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Install Button, Language, Theme, & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Install Button */}
            {!isInstalled && (
              <>
                <button
                  onClick={triggerInstall}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 radius-btn bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 hover:border-amber-500/40 dark:hover:border-gold-400/40 text-xs font-bold transition-all shadow-xs"
                  title={t('installVadhuVarApp')}
                  aria-label={t('installApp')}
                >
                  <Download className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400" />
                  <span>{t('installApp')}</span>
                </button>

                <button
                  onClick={triggerInstall}
                  className="sm:hidden p-1.5 radius-btn text-amber-600 dark:text-gold-400 hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors"
                  title={t('installApp')}
                  aria-label={t('installApp')}
                >
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Trilingual Language Selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/90 radius-btn border border-zinc-200 dark:border-white/10 p-0.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
              <button
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 radius-btn transition-colors ${
                  lang === 'en' ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-gold-300 font-bold shadow-xs' : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-1.5 py-0.5 radius-btn transition-colors ${
                  lang === 'hi' ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-gold-300 font-bold shadow-xs' : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="हिंदी (Hindi)"
              >
                HI
              </button>
              <button
                onClick={() => setLang('mr')}
                className={`px-1.5 py-0.5 radius-btn transition-colors ${
                  lang === 'mr' ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-gold-300 font-bold shadow-xs' : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
                title="मराठी (Marathi)"
              >
                MR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 radius-btn text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors"
              title={t('toggleTheme')}
              aria-label={t('toggleTheme')}
            >
              {isDark ? <Sun className="w-4 h-4 text-gold-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>

            {/* Privacy Controls */}
            <button
              onClick={onOpenPrivacyModal}
              className="hidden lg:block p-1.5 radius-btn text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors"
              title={t('privacyControls')}
              aria-label={t('privacyControls')}
            >
              <Shield className="w-4 h-4 text-emerald-500" />
            </button>

            {/* User Profile & Sign Out or Sign In */}
            {user || profile ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-1.5 p-0.5 sm:pr-2.5 rounded-full border border-amber-500/30 dark:border-gold-400/30 hover:border-amber-500 dark:hover:border-gold-400 transition-colors bg-zinc-100 dark:bg-zinc-900"
                  title={profile ? t('myProfile') : t('createProfile')}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-500 to-amber-600 text-zinc-950 font-black text-xs flex items-center justify-center shadow-xs">
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[85px] truncate">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="p-1.5 radius-btn text-zinc-400 hover:text-crimson-400 hover:bg-crimson-500/10 transition-colors flex items-center gap-1"
                  title={t('signOut')}
                  aria-label={t('signOut')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs shadow-md gold-glow-subtle transition-all active:scale-95 flex items-center gap-1.5"
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
