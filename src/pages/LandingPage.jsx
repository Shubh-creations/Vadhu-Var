import React from 'react';
import { ShieldCheck, Heart, Users, CheckCircle, Search, ArrowRight, Lock } from 'lucide-react';
import BadgeVerified from '../components/BadgeVerified';
import { useData } from '../context/DataContext';

export const LandingPage = ({ onGetStarted, onBrowse }) => {
  const { profiles } = useData();
  const verifiedProfiles = profiles.filter(p => p.is_id_verified).slice(0, 3);

  return (
    <div className="bg-surface text-main min-h-screen">
      {/* Hero Banner Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 radius-btn bg-surface-ground border border-main text-sub text-xs sm:text-sm font-medium mb-6">
          <ShieldCheck className="w-4 h-4 text-sub" />
          <span>Manual ID-Verified Matrimony Platform</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-main tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Every profile is <span className="underline decoration-sky-blue underline-offset-8">verified.</span>
        </h1>

        <p className="text-base sm:text-lg text-sub max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Every candidate profile on MH Vadhu-Var undergoes identity document verification before publication.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-medium text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Create Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onBrowse}
            className="w-full sm:w-auto px-8 py-3.5 radius-btn bg-surface-card hover:bg-surface-ground text-main border border-main font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-sub" />
            <span>Browse Profiles</span>
          </button>
        </div>
      </div>

      {/* Featured Verified Matches */}
      {verifiedProfiles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-main">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-main">Featured Verified Profiles</h2>
              <p className="text-xs sm:text-sm text-sub mt-1">
                Real candidate profiles ready for family review.
              </p>
            </div>

            <button
              onClick={onBrowse}
              className="text-sub hover:text-main font-medium text-xs sm:text-sm flex items-center gap-1"
            >
              <span>View all profiles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verifiedProfiles.map((profile) => (
              <div key={profile.id} className="bg-surface-card radius-card border border-main p-5 shadow-xs">
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name}
                    className="w-14 h-14 radius-btn object-cover border border-main"
                  />
                  <div>
                    <h3 className="font-serif font-semibold text-main text-base">
                      {profile.full_name}, {profile.age}
                    </h3>
                    <p className="text-xs text-sub">{profile.occupation} • {profile.city}</p>
                    <div className="mt-1">
                      <BadgeVerified size="small" isIdVerified={true} />
                    </div>
                  </div>
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
