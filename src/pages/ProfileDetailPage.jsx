import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Heart, MapPin, Briefcase, GraduationCap, Ruler, Utensils, Users, CheckCircle2, User, FileText, Sparkles } from 'lucide-react';
import BadgeVerified from '../components/BadgeVerified';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import calculateCompatibilityEstimate from '../lib/compatibilityCalculator';

export const ProfileDetailPage = ({ profile, onBack, onAuthRequired }) => {
  const { user, profile: myProfile } = useAuth();
  const { interests, sendInterest } = useData();
  const [loading, setLoading] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  if (!profile) return null;

  const currentUserId = myProfile?.id || user?.id;
  const isOwnProfile = currentUserId === profile.id;
  const existingInterest = interests.find(
    i => i.sender_id === currentUserId && i.receiver_id === profile.id
  );
  const hasExpressedInterest = interestSent || Boolean(existingInterest);
  const matchScore = calculateCompatibilityEstimate(myProfile, profile);

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 radius-btn bg-surface-card border border-main text-sub font-medium text-xs sm:text-sm hover:opacity-80 transition-opacity shadow-xs"
      >
        <ArrowLeft className="w-4 h-4 text-sub" />
        <span>Back to Discovery</span>
      </button>

      {/* Hero Header Card */}
      <div className="bg-surface-card radius-card border border-main p-6 sm:p-8 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative flex-shrink-0">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.full_name || 'Candidate photo'}
                className="w-32 h-32 sm:w-40 sm:h-40 radius-card object-cover border border-main shadow-xs"
              />
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 radius-card bg-surface-ground text-sub font-serif font-bold text-3xl flex items-center justify-center border border-main">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">
                {profile.full_name}, <span className="font-sans font-normal text-sub">{profile.age}</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-sub mb-3">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-sub" />
                <span>{profile.occupation}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-sub" />
                <span>{profile.city}, {profile.state || 'Maharashtra'}</span>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="mb-4 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <BadgeVerified
                isFullyVerified={profile.is_fully_verified}
                isIdVerified={profile.is_id_verified}
              />
            </div>

            {/* Match Compatibility */}
            <div className="inline-flex items-center gap-2 bg-surface-ground border border-main px-3.5 py-1.5 radius-btn text-xs mb-5">
              <Sparkles className="w-4 h-4 text-sky-blue" />
              <span className="font-medium text-main">Match Compatibility:</span>
              <span className="font-bold text-sky-blue text-sm">{matchScore}%</span>
            </div>

            {/* Express Interest Button (Sky Blue) */}
            <div className="flex items-center justify-center sm:justify-start">
              <button
                onClick={handleExpressInterest}
                disabled={loading || hasExpressedInterest || isOwnProfile}
                aria-label={`Express interest in ${profile.full_name}`}
                className={`px-8 py-3 radius-btn font-medium text-sm shadow-xs transition-all flex items-center gap-2 ${
                  hasExpressedInterest
                    ? 'bg-surface-ground text-sub border border-main cursor-default'
                    : isOwnProfile
                    ? 'bg-surface-ground text-sub cursor-not-allowed opacity-50'
                    : 'bg-sky-blue hover:bg-sky-blue/90 text-white active:scale-[0.98]'
                }`}
              >
                {hasExpressedInterest ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-sub" />
                    <span>Interest Expressed</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 fill-white/20" />
                    <span>{loading ? 'Sending...' : 'Express Interest'}</span>
                  </>
                )}
              </button>
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
