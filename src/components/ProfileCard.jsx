import React, { useState } from 'react';
import { Heart, MapPin, Briefcase, GraduationCap, Ruler, Utensils, CheckCircle2, User, ExternalLink, Star, IndianRupee } from 'lucide-react';
import BadgeVerified from './BadgeVerified';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import calculateCompatibilityEstimate from '../lib/compatibilityCalculator';

export const ProfileCard = ({ profile, onViewDetails, onAuthRequired }) => {
  const { user, profile: myProfile, partnerPreferences } = useAuth();
  const { interests, sendInterest, toggleShortlist, isShortlisted } = useData();
  const { t } = useLanguage();

  const [loadingInterest, setLoadingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  const isOwnProfile = (myProfile?.id === profile.id) || (user?.id === profile.id);
  const existingInterest = interests.find(
    i => (i.sender_id === (myProfile?.id || user?.id)) && i.receiver_id === profile.id
  );

  const hasExpressedInterest = interestSent || Boolean(existingInterest);
  const isShort = isShortlisted(profile.id);
  const matchScore = calculateCompatibilityEstimate(myProfile, profile, partnerPreferences);

  const handleExpressInterest = async (e) => {
    e.stopPropagation();
    if (!user && !myProfile) {
      if (onAuthRequired) onAuthRequired();
      return;
    }

    if (isOwnProfile) return;

    try {
      setLoadingInterest(true);
      await sendInterest(profile.id);
      setInterestSent(true);
    } catch (err) {
      // Toast handles error message
    } finally {
      setLoadingInterest(false);
    }
  };

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'VV';

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(profile)}
      className="group bg-surface-card radius-card border border-main p-6 hover:border-sky-blue transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden"
    >
      <div>
        {/* Top Header Row: Managed By (Plain text) + Sky Blue Outline Star */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <BadgeVerified type="managed_by" size="small" label={`${t('managedBySelf')}`} />

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleShortlist(profile.id);
            }}
            aria-label={`Shortlist ${profile.full_name}`}
            className="p-1 rounded transition-colors text-sub hover:text-main"
            title={isShort ? 'Shortlisted' : 'Shortlist Candidate'}
          >
            <Star className={`w-4 h-4 ${isShort ? 'fill-sky-blue text-sky-blue' : 'text-sub'}`} />
          </button>
        </div>

        {/* Hero Header: Avatar + Candidate Name (Serif Lora Font) + Badges */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative flex-shrink-0">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.full_name || 'Candidate photo'}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-main group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-surface-ground text-sub font-extrabold text-xl flex items-center justify-center border border-main">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-main text-lg sm:text-xl truncate group-hover:text-sky-blue transition-colors tracking-tight leading-snug">
              {profile.full_name}, <span className="font-sans font-normal text-sub text-base">{profile.age}</span>
            </h3>

            {/* Verification Badges */}
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <BadgeVerified
                isFullyVerified={profile.is_fully_verified}
                isIdVerified={profile.is_id_verified}
                isProfessionVerified={profile.is_profession_verified}
                size="small"
              />
            </div>

            {/* Occupation & Location */}
            <div className="flex items-center text-xs text-sub gap-1.5 mt-2 truncate">
              <Briefcase className="w-3.5 h-3.5 text-sub flex-shrink-0" />
              <span className="truncate">{profile.occupation || 'Not specified'}</span>
            </div>

            <div className="flex items-center text-xs text-sub gap-1.5 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-sub flex-shrink-0" />
              <span>{profile.city}{profile.state ? `, ${profile.state}` : ''}</span>
            </div>
          </div>
        </div>

        {/* Compatibility Progress Line */}
        <div className="mb-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-sub">
            <span>{t('matchCompatibility')}</span>
            <span className="font-bold text-main">{matchScore}%</span>
          </div>
          <div className="w-full h-1 bg-surface-ground rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-blue rounded-full transition-all duration-300"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        {/* Info Row (Plain text metadata with neutral gray icons) */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-sub mb-6 pt-2">
          <div className="flex items-center gap-2 truncate">
            <GraduationCap className="w-4 h-4 text-sub flex-shrink-0" />
            <span className="truncate">{profile.education_level || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <IndianRupee className="w-4 h-4 text-sub flex-shrink-0" />
            <span>{profile.annual_income_lpa ? `${profile.annual_income_lpa} LPA` : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <Ruler className="w-4 h-4 text-sub flex-shrink-0" />
            <span>{profile.height_cm ? `${profile.height_cm} cm` : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 capitalize truncate">
            <Utensils className="w-4 h-4 text-sub flex-shrink-0" />
            <span>{profile.diet || 'Veg'}</span>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-main">
        <button
          onClick={handleExpressInterest}
          disabled={loadingInterest || hasExpressedInterest || isOwnProfile}
          aria-label={`Express interest in ${profile.full_name}`}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 radius-btn font-medium text-xs sm:text-sm transition-all duration-150 ${
            hasExpressedInterest
              ? 'bg-surface-ground text-sub border border-main cursor-default'
              : isOwnProfile
              ? 'bg-surface-ground text-sub cursor-not-allowed opacity-50'
              : 'bg-sky-blue hover:bg-sky-blue/90 text-white shadow-xs active:scale-[0.98]'
          }`}
        >
          {hasExpressedInterest ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-sub" />
              <span>{t('interestExpressed')}</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 fill-white/20" />
              <span>{loadingInterest ? t('sending') : t('expressInterest')}</span>
            </>
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) onViewDetails(profile);
          }}
          aria-label={`View full profile details for ${profile.full_name}`}
          className="p-2.5 radius-btn border border-main text-sub hover:text-main hover:bg-surface-ground transition-colors"
          title={t('viewDetails')}
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
