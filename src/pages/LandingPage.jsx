import React from 'react';
import { ShieldCheck, Heart, Users, CheckCircle, Search, ArrowRight, Lock, UserCheck, Sparkles, Download, Smartphone } from 'lucide-react';
import { Logo } from '../components/Logo';
import ProfileDiscoveryCard from '../components/ProfileDiscoveryCard';
import { useData } from '../context/DataContext';
import { usePWA } from '../context/PWAContext';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage = ({ onGetStarted, onBrowse }) => {
  const { profiles } = useData();
  const { isInstalled, triggerInstall } = usePWA();
  const { t } = useLanguage();

  const featuredProfiles = profiles.filter(p => p.full_name && p.is_active !== false).slice(0, 3);

  const trustPillars = [
    {
      icon: ShieldCheck,
      color: 'emerald',
      title: '100% ID Verified Profiles',
      desc: 'Government photo ID verification guarantees authentic matrimonial candidates without fake accounts.'
    },
    {
      icon: Lock,
      color: 'gold',
      title: 'Total Photo Privacy Shield',
      desc: 'Dynamic frosted glass protection. You control photo visibility, phone numbers, and contact permissions.'
    },
    {
      icon: Heart,
      color: 'crimson',
      title: 'Direct Family Connections',
      desc: 'Connect directly with verified brides, grooms, and families with zero brokerage or middleman fees.'
    }
  ];

  return (
    <div className="min-h-screen text-white relative z-10">
      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
        {/* Sacred Brand Emblem */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/20 via-crimson-500/20 to-gold-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-3 rounded-2xl glass-card border border-gold-400/30 shadow-2xl flex items-center justify-center">
              <Logo variant="icon" size="large" className="h-14 w-14 sm:h-18 sm:w-18 object-contain" />
            </div>
          </div>
        </div>

        {/* Editorial Heading with Gold Gradient */}
        <div className="space-y-4 max-w-4xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 radius-btn glass-card border border-gold-400/30 text-gold-300 text-xs font-semibold tracking-wider uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Next-Generation Luxury Matrimony</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Finding Your <span className="gold-gradient-text drop-shadow">Sacred & Perfect Match.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            The ultra-premium, verified matrimony portal featuring precision Bklit match telemetry, Kundali alignment, and complete photo privacy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm shadow-xl gold-glow transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Create Verified Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onBrowse}
            className="w-full sm:w-auto px-8 py-4 radius-btn glass-card hover:bg-white/[0.08] text-white border border-white/10 hover:border-gold-400/40 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-gold-400" />
            <span>Discover Matches</span>
          </button>

          {!isInstalled && (
            <button
              onClick={triggerInstall}
              className="w-full sm:w-auto px-6 py-4 radius-btn glass-card hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 hover:border-crimson-500/40 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-crimson-400" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>

      {/* Trust Pillars Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Built on Uncompromising Trust & Privacy
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Engineered to eliminate fake accounts, commercial brokers, and privacy leaks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPillars.map((pillar, i) => {
            const Icon = pillar.icon;
            const isGold = pillar.color === 'gold';
            const isCrimson = pillar.color === 'crimson';

            return (
              <div
                key={i}
                className="glass-card radius-card p-6 sm:p-8 text-left space-y-3 border border-white/[0.08] hover:border-gold-500/30 transition-all hover:shadow-[0_12px_40px_rgba(245,158,11,0.08)] group"
              >
                <div className={`w-12 h-12 radius-btn flex items-center justify-center mb-4 border ${
                  isGold 
                    ? 'bg-gold-500/10 text-gold-400 border-gold-500/20' 
                    : isCrimson
                    ? 'bg-crimson-500/10 text-crimson-400 border-crimson-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-white text-lg group-hover:text-gold-300 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Verified Matches Showcase */}
      {featuredProfiles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/[0.08]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 text-center sm:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 radius-btn bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs font-serif font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Verified Candidates</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                Recently Active Profiles
              </h2>
            </div>

            <button
              onClick={onBrowse}
              className="px-5 py-2.5 radius-btn glass-card hover:bg-white/[0.08] text-white border border-white/10 hover:border-gold-400/40 text-xs font-bold transition-colors flex items-center gap-2"
            >
              <span>Explore All Verified Matches</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProfiles.map((p) => (
              <ProfileDiscoveryCard
                key={p.id}
                profile={p}
                onViewDetails={onBrowse}
                onAuthRequired={onGetStarted}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
