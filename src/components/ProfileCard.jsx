import React, { useState } from 'react';
import { Heart, MapPin, Briefcase, GraduationCap, Ruler, Utensils, CheckCircle2, User, ExternalLink, Star, IndianRupee } from 'lucide-react';
import BadgeVerified from './BadgeVerified';
import CandidateAvatar from './CandidateAvatar';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import calculateCompatibilityEstimate from '../lib/compatibilityCalculator';

export const ProfileCard = ({ profile, onViewDetails, onOpenCompatibility, onAuthRequired }) => {
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

        {/* Hero Header: Avatar + Candidate Name + Badges */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="relative flex-shrink-0">
            <CandidateAvatar
              src={profile.photo_url}
              name={profile.full_name}
              size="lg"
              shape="rounded"
              className="group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 
              className="font-serif font-bold text-main text-base sm:text-lg truncate group-hover:text-sky-blue transition-colors tracking-tight leading-snug"
              title={`${profile.full_name}, ${profile.age}`}
            >
              {profile.full_name}, <span className="font-sans font-normal text-sub text-sm">{profile.age}</span>
            </h3>

            {/* Verification Badges & Profile Completeness */}
            <div className="mt-1 min-h-[22px] flex items-center gap-1.5 flex-wrap">
              <BadgeVerified
                profile={profile}
                size="small"
              />
            </div>

            {/* Occupation & Location */}
            <div className="flex items-center text-xs text-sub gap-1.5 mt-1.5 truncate" title={profile.occupation || 'Not specified'}>
              <Briefcase className="w-3.5 h-3.5 text-sub flex-shrink-0" />
              <span className="truncate">{profile.occupation || 'Not specified'}</span>
            </div>

            <div className="flex items-center text-xs text-sub gap-1.5 mt-0.5 truncate" title={`${profile.city || ''}${profile.state ? `, ${profile.state}` : ''}`}>
              <MapPin className="w-3.5 h-3.5 text-sub flex-shrink-0" />
              <span className="truncate">{profile.city || 'Maharashtra'}{profile.state ? `, ${profile.state}` : ''}</span>
            </div>
          </div>
        </div>

        {/* Compatibility Progress Line with Breakdown Link */}
        <div className="mb-4 pt-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-sub">
            <span className="font-medium text-main">{t('matchCompatibility')}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sky-blue">{matchScore}%</span>
              {onOpenCompatibility && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCompatibility(profile);
                  }}
                  className="text-[11px] font-semibold text-sky-blue hover:underline transition-opacity pl-1"
                  title="View detailed factor breakdown"
                >
                  Breakdown →
                </button>
              )}
            </div>
          </div>
          <div className="w-full h-1.5 bg-surface-ground rounded-full overflow-hidden border border-main/40">
            <div
              className="h-full bg-sky-blue rounded-full transition-all duration-300"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        {/* Info Grid (Fixed row heights for straight horizontal alignment) */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs text-sub mb-4 pt-2 border-t border-main/40">
          <div className="h-5 flex items-center gap-1.5 truncate" title={profile.education_level || 'N/A'}>
            <GraduationCap className="w-3.5 h-3.5 text-sub flex-shrink-0" />
            <span className="truncate">{profile.education_level || 'N/A'}</span>
          </div>

          <div className="h-5 flex items-center gap-1.5 truncate" title={profile.annual_income_lpa ? `${profile.annual_income_lpa} LPA` : 'N/A'}>
            <IndianRupee className="w-3.5 h-3.5 text-sub flex-shrink-0" />
            <span className="truncate">{profile.annual_income_lpa ? `${profile.annual_income_lpa} LPA` : 'N/A'}</span>
          </div>

          <div className="h-5 flex items-center gap-1.5 truncate" title={profile.height_cm ? `${profile.height_cm} cm` : 'N/A'}>
            <Ruler className="w-3.5 h-3.5 text-sub flex-shrink-0" />
            <span className="truncate">{profile.height_cm ? `${profile.height_cm} cm` : 'N/A'}</span>
          </div>

          <div className="h-5 flex items-center gap-1.5 capitalize truncate" title={profile.diet || 'Veg'}>
            <Utensils className="w-3.5 h-3.5 text-sub flex-shrink-0" />
            <span className="truncate">{profile.diet || 'Veg'}</span>
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
