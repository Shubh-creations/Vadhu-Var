import React, { useState } from 'react';
import { 
  Star, MapPin, Briefcase, GraduationCap, IndianRupee, 
  Ruler, Utensils, Heart, ArrowUpRight, ShieldCheck, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import CandidateAvatar from './CandidateAvatar';
import MatchTelemetryGauge from './MatchTelemetryGauge';
import PhotoPrivacyShield from './PhotoPrivacyShield';
import ExpressInterestBurst from './ExpressInterestBurst';
import BadgeVerified from './BadgeVerified';
import { calculateCompatibilityEstimate } from '../lib/compatibilityCalculator';

/**
 * ProfileDiscoveryCard - Luxury Obsidian & Champagne Gold Candidate Card
 * Integrates precision Bklit match telemetry, photo privacy shields, and sacred action triggers.
 */
export const ProfileDiscoveryCard = ({
  profile,
  onViewDetails,
  onOpenCompatibility,
  onAuthRequired,
  className = ''
}) => {
  const { user, profile: myProfile, partnerPreferences } = useAuth();
  const { expressInterest, interests, shortlistedIds, toggleShortlist } = useData();
  const { t } = useLanguage();

  const [burstActive, setBurstActive] = useState(false);
  const [loadingInterest, setLoadingInterest] = useState(false);

  if (!profile) return null;

  const isOwnProfile = user && profile.id === (myProfile?.id || user?.id);
  const isShort = shortlistedIds.includes(profile.id);

  // Check if current user has already sent an interest to this candidate
  const hasExpressedInterest = interests.some(
    (i) => i.sender_id === (myProfile?.id || user?.id) && i.receiver_id === profile.id
  );

  // Calculate precision match scores
  const matchScore = calculateCompatibilityEstimate(myProfile, profile, partnerPreferences);
  const valuesScore = Math.min(98, Math.max(70, matchScore + 4));
  const careerScore = Math.min(96, Math.max(65, matchScore - 3));
  const kundaliGuna = Math.min(36, Math.max(22, Math.round((matchScore / 100) * 36)));

  const handleExpressInterest = async (e) => {
    e.stopPropagation();
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    if (isOwnProfile || hasExpressedInterest || loadingInterest) return;

    setLoadingInterest(true);
    setBurstActive(true);

    try {
      await expressInterest(profile.id);
    } catch (err) {
      console.warn('Interest expression handled:', err);
    } finally {
      setLoadingInterest(false);
    }
  };

  // Determine if photo privacy shield should be active
  const isPrivatePhoto = profile.is_photo_private === true;

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(profile)}
      className={`group relative glass-card radius-card p-5 sm:p-6 transition-all duration-300 hover:border-gold-400/40 hover:shadow-[0_12px_40px_rgba(245,158,11,0.12)] flex flex-col justify-between h-full cursor-pointer overflow-hidden ${className}`}
    >
      {/* Background Subtle Radial Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-gold-500/10 transition-colors" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-crimson-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-crimson-600/10 transition-colors" />

      {/* Mandala Particle Burst Trigger */}
      <ExpressInterestBurst active={burstActive} onComplete={() => setBurstActive(false)} />

      <div>
        {/* 1. Header Row: Managed By Tag & Shortlist Star */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 radius-btn text-[10px] font-semibold bg-zinc-900/80 text-zinc-300 border border-white/10 tracking-wide">
              {profile.profile_created_for ? `Managed by ${profile.profile_created_for}` : 'Managed by Self'}
            </span>
            {profile.is_id_verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 radius-btn text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleShortlist(profile.id);
            }}
            className={`p-1.5 radius-btn transition-all duration-200 ${
              isShort
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30 gold-glow-subtle'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-gold-400 hover:bg-zinc-800 border border-white/5'
            }`}
            title={isShort ? 'Shortlisted' : 'Shortlist Candidate'}
            aria-label={`Shortlist ${profile.full_name}`}
          >
            <Star className={`w-4 h-4 ${isShort ? 'fill-gold-400 text-gold-400' : 'text-zinc-400'}`} />
          </button>
        </div>

        {/* 2. Hero Section: Avatar + Name + Telemetry Gauge */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0 overflow-hidden rounded-xl border border-white/10 group-hover:border-gold-400/40 transition-colors shadow-lg">
            <CandidateAvatar
              src={profile.photo_url}
              name={profile.full_name}
              size="lg"
              shape="rounded"
              className="group-hover:scale-105 transition-transform duration-300"
            />
            {isPrivatePhoto && (
              <PhotoPrivacyShield
                candidateName={profile.full_name}
                onUnlockRequest={() => alert(`Requested photo access from ${profile.full_name}`)}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-serif font-bold text-white text-lg sm:text-xl truncate group-hover:text-gold-300 transition-colors tracking-tight leading-snug"
              title={`${profile.full_name}, ${profile.age}`}
            >
              {profile.full_name}, <span className="font-mono font-normal text-zinc-400 text-sm">{profile.age}</span>
            </h3>

            {/* Profession & Location */}
            <div className="flex items-center text-xs text-zinc-300 gap-1.5 mt-1 truncate" title={profile.occupation || 'Doctor / Professional'}>
              <Briefcase className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span className="truncate">{profile.occupation || 'Not specified'}</span>
            </div>

            <div className="flex items-center text-xs text-zinc-400 gap-1.5 mt-0.5 truncate" title={`${profile.city || ''}${profile.state ? `, ${profile.state}` : ''}`}>
              <MapPin className="w-3.5 h-3.5 text-crimson-400 flex-shrink-0" />
              <span className="truncate">{profile.city || 'Maharashtra'}{profile.state ? `, ${profile.state}` : ''}</span>
            </div>
          </div>

          {/* Embedded Bklit Multi-Ring Gauge */}
          <div className="flex-shrink-0 pl-1">
            <MatchTelemetryGauge
              score={matchScore}
              valuesScore={valuesScore}
              careerScore={careerScore}
              kundaliScore={kundaliGuna}
              size="sm"
            />
          </div>
        </div>

        {/* 3. Match Telemetry Breakdown Bar */}
        <div className="p-2.5 radius-btn bg-zinc-900/70 border border-white/[0.06] mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-gold-400" />
              Compatibility Engine
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-gold-400">{matchScore}% Match</span>
              {onOpenCompatibility && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCompatibility(profile);
                  }}
                  className="text-[10px] font-semibold text-zinc-300 hover:text-gold-300 hover:underline transition-colors"
                >
                  Breakdown →
                </button>
              )}
            </div>
          </div>

          {/* Precision Horizontal Telemetry Progress */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-crimson-600 via-gold-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        {/* 4. Telemetry Attribute Grid (Tabular Monospace Fonts) */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs text-zinc-300 mb-4 pt-2 border-t border-white/[0.06]">
          <div className="h-5 flex items-center gap-1.5 truncate" title={profile.education_level || 'Degree'}>
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <span className="truncate">{profile.education_level || 'Graduate'}</span>
          </div>

          <div className="h-5 flex items-center gap-1.5 truncate" title={profile.annual_income_lpa ? `${profile.annual_income_lpa} LPA` : 'Confidential'}>
            <IndianRupee className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
            <span className="font-mono font-medium truncate">
              {profile.annual_income_lpa ? `${profile.annual_income_lpa} LPA` : 'Confidential'}
            </span>
          </div>

          <div className="h-5 flex items-center gap-1.5 truncate" title={profile.height_cm ? `${profile.height_cm} cm` : '5 ft 6 in'}>
            <Ruler className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <span className="font-mono font-medium truncate">{profile.height_cm ? `${profile.height_cm} cm` : '5 ft 6 in'}</span>
          </div>

          <div className="h-5 flex items-center gap-1.5 capitalize truncate" title={profile.diet || 'Vegetarian'}>
            <Utensils className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{profile.diet || 'Vegetarian'}</span>
          </div>
        </div>
      </div>

      {/* 5. Luxury Action Bar */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={handleExpressInterest}
          disabled={loadingInterest || hasExpressedInterest || isOwnProfile}
          aria-label={`Express interest in ${profile.full_name}`}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 radius-btn font-bold text-xs sm:text-sm transition-all duration-200 ${
            hasExpressedInterest
              ? 'bg-zinc-800 text-zinc-400 border border-white/5 cursor-default'
              : isOwnProfile
              ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-crimson-600 to-rose-700 hover:from-crimson-500 hover:to-rose-600 text-white shadow-lg crimson-glow active:scale-[0.98]'
          }`}
        >
          {hasExpressedInterest ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Interest Sent</span>
            </>
          ) : isOwnProfile ? (
            <span>Your Profile</span>
          ) : loadingInterest ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Heart className="w-4 h-4 fill-current text-white" />
              <span>Express Interest</span>
            </>
          )}
        </button>

        {/* Detailed Match View Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(profile);
          }}
          className="p-2.5 radius-btn bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-gold-400 border border-white/10 transition-colors shadow-sm flex items-center justify-center"
          title="View Full Profile & Kundali Match"
          aria-label="View Bio-Data"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileDiscoveryCard;
