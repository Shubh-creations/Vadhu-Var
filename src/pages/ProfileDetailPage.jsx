import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Heart, MapPin, Briefcase, GraduationCap, Ruler, Utensils, Users, CheckCircle2, User, FileText, Sparkles, Pencil, MessageSquare } from 'lucide-react';
import BadgeVerified from '../components/BadgeVerified';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import calculateCompatibilityEstimate from '../lib/compatibilityCalculator';

export const ProfileDetailPage = ({ profile, onBack, onOpenCompatibility, onOpenChat, onEditProfile, onAuthRequired }) => {
  const { user, profile: myProfile, partnerPreferences } = useAuth();
  const { interests, sendInterest } = useData();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  if (!profile) return null;

  const currentUserId = myProfile?.id || user?.id;
  const isOwnProfile = currentUserId === profile.id;
  const existingSentInterest = interests.find(
    i => i.sender_id === currentUserId && i.receiver_id === profile.id
  );
  const existingReceivedInterest = interests.find(
    i => i.sender_id === profile.id && i.receiver_id === currentUserId
  );
  
  const mutualAcceptedInterest = (existingSentInterest?.status === 'accepted' || existingReceivedInterest?.status === 'accepted');
  const isAcceptedMatch = Boolean(mutualAcceptedInterest);
  const hasExpressedInterest = interestSent || Boolean(existingSentInterest);
  const matchScore = calculateCompatibilityEstimate(myProfile, profile, partnerPreferences);

  const handleExpressInterest = async () => {
    if (!user && !myProfile) {
      if (onAuthRequired) onAuthRequired();
      return;
    }
    if (isOwnProfile) return;

    try {
      setLoading(true);
      await sendInterest(profile.id);
      setInterestSent(true);
    } catch (err) {
      // Toast handles error message
    } finally {
      setLoading(false);
    }
  };

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'MV';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sub hover:text-main text-xs sm:text-sm font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('backToMatches')}</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-surface-card radius-card border border-main p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar / Photo */}
          <div className="relative flex-shrink-0">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.full_name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-main shadow-xs"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-surface-ground border-2 border-main flex items-center justify-center text-main font-serif text-3xl font-bold">
                {initials}
              </div>
            )}
          </div>

          {/* Name & Primary Attributes */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">
                  {profile.full_name}, {profile.age}
                </h1>
                <p className="text-xs sm:text-sm text-sub mt-0.5 font-medium">
                  {profile.occupation || 'Professional'} • {profile.city}, {profile.state}
                </p>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="mb-4 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <BadgeVerified
                isFullyVerified={profile.is_fully_verified}
                isIdVerified={profile.is_id_verified}
                isProfessionVerified={profile.is_profession_verified}
                isPending={isOwnProfile && !profile.is_id_verified && !profile.is_fully_verified}
              />
            </div>

            {/* Match Compatibility */}
            <div className="inline-flex items-center gap-3 bg-surface-ground border border-main px-4 py-2 radius-btn text-xs mb-5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-blue" />
                <span className="font-medium text-main">{t('matchCompatibility')}:</span>
                <span className="font-bold text-sky-blue text-sm">{matchScore}%</span>
              </div>
              {onOpenCompatibility && (
                <button
                  type="button"
                  onClick={() => onOpenCompatibility(profile)}
                  className="font-bold text-sky-blue hover:underline pl-2 border-l border-main"
                >
                  {t('viewBreakdown')}
                </button>
              )}
            </div>

            {/* Action Buttons: Edit Profile for Own Profile / Chat for Accepted Matches / Express Interest for Candidates */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="px-8 py-3 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2 active:scale-95"
                >
                  <Pencil className="w-4 h-4" />
                  <span>{t('editYourProfile')}</span>
                </button>
              ) : isAcceptedMatch ? (
                <>
                  <div className="px-5 py-2.5 radius-btn bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mutual Match Accepted</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenChat && onOpenChat(profile)}
                    className="px-8 py-3 radius-btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2 active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat & Plan Proposal</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleExpressInterest}
                  disabled={loading || hasExpressedInterest}
                  aria-label={`${t('expressInterest')} in ${profile.full_name}`}
                  className={`px-8 py-3 radius-btn font-medium text-sm shadow-xs transition-all flex items-center gap-2 ${
                    hasExpressedInterest
                      ? 'bg-surface-ground text-sub border border-main cursor-default'
                      : 'bg-sky-blue hover:bg-sky-blue/90 text-white active:scale-[0.98]'
                  }`}
                >
                  {hasExpressedInterest ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-sub" />
                      <span>{t('interestExpressed')}</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 fill-white/20" />
                      <span>{loading ? t('sending') : t('expressInterest')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bio */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs md:col-span-2">
          <h2 className="font-serif text-base font-bold text-main mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sub" />
            <span>About Myself</span>
          </h2>
          <p className="text-xs sm:text-sm text-sub leading-relaxed italic">
            "{profile.bio || 'No detailed bio provided yet.'}"
          </p>
        </div>

        {/* Education & Career */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs">
          <h2 className="font-serif text-base font-bold text-main mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-sub" />
            <span>Education & Career</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-main">
              <span className="text-sub">Education</span>
              <span className="font-medium text-main">{profile.education_level || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-main">
              <span className="text-sub">Occupation</span>
              <span className="font-medium text-main">{profile.occupation || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-main">
              <span className="text-sub">Work Location</span>
              <span className="font-medium text-main">{profile.city}, Maharashtra</span>
            </div>
          </div>
        </div>

        {/* Physical & Lifestyle */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs">
          <h2 className="font-serif text-base font-bold text-main mb-4 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-sub" />
            <span>Physical & Lifestyle</span>
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-main">
              <span className="text-sub">Height</span>
              <span className="font-medium text-main">{profile.height_cm} cm</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-main">
              <span className="text-sub">Diet Preference</span>
              <span className="font-medium text-main capitalize">{profile.diet || 'Veg'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-main">
              <span className="text-sub">Marital Status</span>
              <span className="font-medium text-main capitalize">
                {profile.marital_status === 'awaiting_divorce'
                  ? 'Awaiting Divorce / Separated'
                  : profile.marital_status
                  ? profile.marital_status.replace('_', ' ')
                  : 'Never Married'}
              </span>
            </div>
            {profile.has_children === 'yes' && (
              <div className="flex justify-between py-1.5 border-b border-main">
                <span className="text-sub">Children / Dependents</span>
                <span className="font-medium text-main">
                  {profile.children_count ? `${profile.children_count} child${Number(profile.children_count) > 1 ? 'ren' : ''}` : 'Yes'}
                  {profile.children_living_status === 'living_together' ? ' (Living with me)' : profile.children_living_status === 'living_separately' ? ' (Living separately)' : ''}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-main">
              <span className="text-sub">Family Type</span>
              <span className="font-medium text-main capitalize">{profile.family_type || 'Nuclear'}</span>
            </div>
          </div>
        </div>

        {/* Cultural Background */}
        <div className="bg-surface-card radius-card border border-main p-6 shadow-xs md:col-span-2">
          <h2 className="font-serif text-base font-bold text-main mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-sub" />
            <span>Cultural Background</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-surface-ground p-3.5 radius-card border border-main">
              <span className="text-sub block mb-1">Caste</span>
              <span className="font-medium text-main">{profile.caste || 'Not Specified'}</span>
            </div>
            <div className="bg-surface-ground p-3.5 radius-card border border-main">
              <span className="text-sub block mb-1">Sub-Caste</span>
              <span className="font-medium text-main">{profile.sub_caste || 'Not Specified'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailPage;
