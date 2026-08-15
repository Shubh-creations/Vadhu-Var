import React from 'react';
import { ShieldCheck, Heart, Users, CheckCircle, Search, ArrowRight, Lock, UserCheck, Sparkles, Download, Smartphone } from 'lucide-react';
import { Logo } from '../components/Logo';
import BadgeVerified from '../components/BadgeVerified';
import { useData } from '../context/DataContext';
import { usePWA } from '../context/PWAContext';

export const LandingPage = ({ onGetStarted, onBrowse }) => {
  const { profiles } = useData();
  const { isInstalled, triggerInstall } = usePWA();
  const verifiedProfiles = profiles.filter(p => p.is_id_verified).slice(0, 3);

  const trustPillars = [
    {
      icon: ShieldCheck,
      title: '100% ID Verified Profiles',
      desc: 'Government ID verification ensures real, authentic matrimonial candidates.'
    },
    {
      icon: Lock,
      title: 'Total Privacy & Control',
      desc: 'You control photo visibility, phone numbers, and contact request permissions.'
    },
    {
      icon: Heart,
      title: 'Direct Family Connections',
      desc: 'Connect directly with candidates and families without brokerage barriers.'
    }
  ];

  return (
    <div className="bg-surface text-main min-h-screen">
      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 text-center">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-main tracking-tight leading-tight max-w-4xl mx-auto mb-5">
          Finding Your <span className="underline decoration-sky-blue underline-offset-8">Perfect Match.</span>
        </h1>

        <p className="text-sm sm:text-base text-sub max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          The verified, privacy-focused matrimony platform for brides and grooms across India.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Create Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onBrowse}
            className="w-full sm:w-auto px-8 py-3.5 radius-btn bg-surface-card hover:bg-surface-ground text-main border border-main font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-sub" />
            <span>Discover Matches</span>
          </button>

          {!isInstalled && (
            <button
              onClick={triggerInstall}
              className="w-full sm:w-auto px-6 py-3.5 radius-btn bg-surface-ground hover:bg-surface-card text-main border border-main hover:border-sky-blue font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-sky-blue" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>

      {/* Trust Pillars Section (Familiar, Established Matrimony Layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-main">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="bg-surface-card radius-card border border-main p-6 text-left space-y-2 shadow-xs transition-all hover:border-sky-blue/50"
              >
                <div className="w-10 h-10 radius-btn bg-sky-blue/10 text-sky-blue flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-main text-base">
                  {pillar.title}
                </h3>
                <p className="text-xs text-sub leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile App Promotion Card (PWA) */}
      {!isInstalled && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-surface-card radius-card border border-main p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <Logo type="app" size="medium" />
              <div>
                <h3 className="font-serif font-bold text-main text-lg sm:text-xl">
                  Install Vadhu Var on your Mobile or Desktop
                </h3>
                <p className="text-xs sm:text-sm text-sub mt-1 max-w-xl">
                  Get instant offline matchmaking access, fullscreen browsing, and direct home screen launch.
                </p>
              </div>
            </div>

            <button
              onClick={triggerInstall}
              className="w-full md:w-auto px-6 py-3 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Install Vadhu Var App</span>
            </button>
          </div>
        </div>
      )}

      {/* Featured Verified Matches (Dynamic real profiles only) */}
      {verifiedProfiles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-main">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-main">
                Featured Verified Candidates
              </h2>
              <p className="text-xs text-sub mt-1">
                Recent 100% ID-verified brides and grooms on Vadhu Var.
              </p>
            </div>
            <button
              onClick={onBrowse}
              className="text-xs font-semibold text-sky-blue hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedProfiles.map((p) => (
              <div
                key={p.id}
                onClick={onBrowse}
                className="bg-surface-card radius-card border border-main p-5 hover:border-sky-blue transition-all cursor-pointer shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={p.full_name}
                    className="w-14 h-14 rounded-full object-cover border border-main"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-main text-base">
                      {p.full_name}, {p.age}
                    </h3>
                    <p className="text-xs text-sub">
                      {p.occupation || 'Professional'} • {p.city}
                    </p>
                  </div>
                </div>
                <div>
                  <BadgeVerified
                    isFullyVerified={p.is_fully_verified}
                    isIdVerified={p.is_id_verified}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
