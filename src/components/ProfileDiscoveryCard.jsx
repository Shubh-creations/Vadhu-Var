import React, { useState } from 'react';
import { 
  Star, MapPin, Briefcase, GraduationCap, IndianRupee, 
  Ruler, Utensils, Heart, ArrowUpRight, ShieldCheck, Sparkles, CheckCircle2,
  ChevronLeft, ChevronRight, Image as ImageIcon, Camera
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
 * ProfileDiscoveryCard - Luxury Immersive Candidate Card
 * Features large hero portrait imagery, multi-photo gallery pagination (Photo 1 & 2),
 * Bklit concentric telemetry gauge, and sacred action triggers.
 */
export const ProfileDiscoveryCard = ({
  profile,
  onViewDetails,
  onOpenCompatibility,
  onAuthRequired,
  isDeckView = false,
  className = ''
}) => {
  const { user, profile: myProfile, partnerPreferences } = useAuth();
  const { expressInterest, interests, shortlistedIds, toggleShortlist } = useData();
  const { t } = useLanguage();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [burstActive, setBurstActive] = useState(false);
  const [loadingInterest, setLoadingInterest] = useState(false);

  if (!profile) return null;

  const isOwnProfile = user && profile.id === (myProfile?.id || user?.id);
  const isShort = shortlistedIds.includes(profile.id);

  // Collect available photos (Photo 1 & Photo 2)
  const photos = [profile.photo_url, profile.photo_url_2 || profile.secondary_photo_url].filter(Boolean);
  const currentPhoto = photos[activePhotoIdx] || profile.photo_url;

  const hasExpressedInterest = interests.some(
    (i) => i.sender_id === (myProfile?.id || user?.id) && i.receiver_id === profile.id
  );

  // Precision match scores
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

  const isPrivatePhoto = profile.is_photo_private === true;

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(profile)}
      className={`group relative glass-card radius-card border border-white/[0.1] hover:border-gold-400/50 transition-all duration-300 shadow-2xl flex flex-col justify-between cursor-pointer overflow-hidden ${
        isDeckView ? 'max-w-lg w-full mx-auto' : 'h-full'
      } ${className}`}
    >
      {/* Subtle Ambient Radial Halos */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-gold-500/15 transition-colors" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-crimson-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-crimson-600/15 transition-colors" />

      {/* Mandala Particle Burst Trigger */}
      <ExpressInterestBurst active={burstActive} onComplete={() => setBurstActive(false)} />

      <div>
        {/* 1. Large Immersive Portrait Photo Showcase */}
        <div className={`relative w-full overflow-hidden bg-zinc-950 select-none ${
          isDeckView ? 'h-80 sm:h-96' : 'h-64 sm:h-72'
        }`}>
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt={profile.full_name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-zinc-600 p-6 text-center">
              <Camera className="w-12 h-12 mb-2 text-zinc-700" />
              <span className="font-serif font-bold text-sm text-zinc-400">{profile.full_name}</span>
              <span className="text-xs text-zinc-600">Photo awaiting upload</span>
            </div>
          )}

          {/* Frosted Privacy Shield if candidate has private photo setting */}
          {isPrivatePhoto && (
            <PhotoPrivacyShield
              candidateName={profile.full_name}
              onUnlockRequest={() => alert(`Requested photo access from ${profile.full_name}`)}
            />
          )}

          {/* Top Floating Badge Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 radius-btn text-[10px] font-bold bg-zinc-950/80 backdrop-blur-md text-white border border-white/15 shadow-md">
                {profile.profile_created_for ? `Managed by ${profile.profile_created_for}` : 'Self Managed'}
              </span>
              {profile.is_id_verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 radius-btn text-[10px] font-bold bg-emerald-500 text-zinc-950 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-950" />
                  Verified
                </span>
              )}
            </div>

            {/* Shortlist Star Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleShortlist(profile.id);
              }}
              className={`p-2 radius-btn backdrop-blur-md transition-all pointer-events-auto shadow-md ${
                isShort
                  ? 'bg-zinc-950/90 text-gold-400 border border-gold-400/50 gold-glow'
                  : 'bg-zinc-950/70 text-white/80 hover:text-gold-400 hover:bg-zinc-950 border border-white/10'
              }`}
              title={isShort ? 'Shortlisted' : 'Shortlist Candidate'}
              aria-label={`Shortlist ${profile.full_name}`}
            >
              <Star className={`w-4 h-4 ${isShort ? 'fill-gold-400 text-gold-400' : ''}`} />
            </button>
          </div>

          {/* Multi-Photo Pagination Dots (Photo 1 & Photo 2) */}
          {photos.length > 1 && (
            <div className="absolute top-14 right-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx(idx);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all shadow-md ${
                    activePhotoIdx === idx
                      ? 'bg-gold-400 scale-125 ring-2 ring-zinc-950'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  title={`View Photo ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Bottom Scrim Overlay with Candidate Name & Location */}
          <div className="absolute inset-x-0 bottom-0 pt-16 pb-3 px-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent flex items-end justify-between">
            <div className="min-w-0 pr-2">
              <h3 className="font-serif font-black text-white text-xl sm:text-2xl drop-shadow-md truncate tracking-tight leading-tight">
                {profile.full_name}, <span className="font-mono font-normal text-zinc-300 text-lg">{profile.age}</span>
              </h3>
              <p className="text-xs text-zinc-300 font-medium flex items-center gap-1.5 truncate mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-crimson-400 flex-shrink-0" />
                <span className="truncate">{profile.city || 'Maharashtra'}{profile.state ? `, ${profile.state}` : ''}</span>
              </p>
            </div>

            {/* Embedded Multi-Ring Gauge */}
            <div className="flex-shrink-0">
              <MatchTelemetryGauge
                score={matchScore}
                valuesScore={valuesScore}
                careerScore={careerScore}
                kundaliScore={kundaliGuna}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* 2. Content & Telemetry Section */}
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Profession & Compatibility Row */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-zinc-200 truncate font-semibold">
              <Briefcase className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span className="truncate">{profile.occupation || 'Doctor / Professional'}</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold text-gold-400 flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{matchScore}% Match</span>
            </div>
          </div>

          {/* Telemetry Attribute Matrix (4-Grid Pills with Monospace Numerics) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 radius-btn bg-zinc-900/80 border border-white/[0.06] flex items-center gap-1.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="text-zinc-300 truncate">{profile.education_level || 'Post Graduate'}</span>
            </div>

            <div className="p-2 radius-btn bg-zinc-900/80 border border-gold-400/20 flex items-center gap-1.5 truncate">
              <IndianRupee className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
              <span className="font-mono font-bold text-gold-300 truncate">
                {profile.annual_income_lpa ? `${profile.annual_income_lpa} LPA` : 'Confidential'}
              </span>
            </div>

            <div className="p-2 radius-btn bg-zinc-900/80 border border-white/[0.06] flex items-center gap-1.5 truncate">
              <Ruler className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="font-mono text-zinc-300 truncate">{profile.height_cm ? `${profile.height_cm} cm` : '5 ft 6 in'}</span>
            </div>

            <div className="p-2 radius-btn bg-zinc-900/80 border border-white/[0.06] flex items-center gap-1.5 truncate">
              <Utensils className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-zinc-300 capitalize truncate">{profile.diet || 'Vegetarian'}</span>
            </div>
          </div>

          {/* Quick Bio snippet if available in Deck Mode */}
          {isDeckView && profile.bio && (
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed italic pt-1">
              "{profile.bio}"
            </p>
          )}
        </div>
      </div>

      {/* 3. Luxury Action Bar */}
      <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
        <button
          type="button"
          onClick={handleExpressInterest}
          disabled={loadingInterest || hasExpressedInterest || isOwnProfile}
          aria-label={`Express interest in ${profile.full_name}`}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 radius-btn font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-xl ${
            hasExpressedInterest
              ? 'bg-zinc-800 text-zinc-400 border border-white/5 cursor-default'
              : isOwnProfile
              ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-crimson-600 to-rose-700 hover:from-crimson-500 hover:to-rose-600 text-white crimson-glow active:scale-[0.98]'
          }`}
        >
          {hasExpressedInterest ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Interest Sent ✓</span>
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

        {/* Deep Dive Profile Link */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(profile);
          }}
          className="p-3 radius-btn bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-gold-400 border border-white/10 transition-colors shadow-sm flex items-center justify-center"
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
