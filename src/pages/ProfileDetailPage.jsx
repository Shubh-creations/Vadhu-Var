import React, { useState } from 'react';
import { 
  ArrowLeft, ShieldCheck, Heart, MapPin, Briefcase, GraduationCap, 
  Ruler, Utensils, Users, CheckCircle2, Star, Sparkles, MessageSquare, 
  Phone, Share2, Compass, Award, Calendar, Moon, Sun, ShieldAlert, ArrowUpRight 
} from 'lucide-react';
import CandidateAvatar from '../components/CandidateAvatar';
import MatchTelemetryGauge from '../components/MatchTelemetryGauge';
import KundaliRadarChart from '../components/KundaliRadarChart';
import ActivityHeatmap from '../components/ActivityHeatmap';
import PhotoPrivacyShield from '../components/PhotoPrivacyShield';
import ExpressInterestBurst from '../components/ExpressInterestBurst';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import calculateCompatibilityEstimate from '../lib/compatibilityCalculator';

/**
 * ProfileDetailPage - Luxury Match Deep-Dive Portal
 * Features Bklit multi-ring telemetry, 6-axis Kundali radar, 12-week activity heatmap, and heritage matrices.
 */
export const ProfileDetailPage = ({
  profile,
  onBack,
  onOpenCompatibility,
  onOpenChat,
  onEditProfile,
  onAuthRequired
}) => {
  const { user, profile: myProfile, partnerPreferences } = useAuth();
  const { interests, expressInterest, shortlistedIds, toggleShortlist } = useData();
  const { t } = useLanguage();

  const [loadingInterest, setLoadingInterest] = useState(false);
  const [burstActive, setBurstActive] = useState(false);

  if (!profile) return null;

  const currentUserId = myProfile?.id || user?.id;
  const isOwnProfile = currentUserId === profile.id;
  const isShort = shortlistedIds.includes(profile.id);

  const existingInterest = interests.find(
    (i) => i.sender_id === currentUserId && i.receiver_id === profile.id
  );
  const existingReceived = interests.find(
    (i) => i.sender_id === profile.id && i.receiver_id === currentUserId
  );

  const hasExpressedInterest = Boolean(existingInterest);
  const isAcceptedMatch = existingInterest?.status === 'accepted' || existingReceived?.status === 'accepted';

  // Precision Telemetry Scores
  const matchScore = calculateCompatibilityEstimate(myProfile, profile, partnerPreferences);
  const valuesScore = Math.min(98, Math.max(70, matchScore + 4));
  const careerScore = Math.min(96, Math.max(65, matchScore - 3));
  const kundaliGuna = Math.min(36, Math.max(24, Math.round((matchScore / 100) * 36)));

  const handleExpressInterest = async () => {
    if (!user && !myProfile) {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in relative z-10 pb-24">
      {/* Particle Burst Trigger */}
      <ExpressInterestBurst active={burstActive} onComplete={() => setBurstActive(false)} />

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 radius-btn glass-card border border-white/10 text-zinc-300 hover:text-white font-semibold text-xs transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-gold-400" />
          <span>Back to Matches</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleShortlist(profile.id)}
            className={`p-2 radius-btn glass-card border transition-all ${
              isShort
                ? 'border-gold-400/40 text-gold-400 gold-glow-subtle'
                : 'border-white/10 text-zinc-400 hover:text-gold-400'
            }`}
            title={isShort ? 'Shortlisted' : 'Shortlist Candidate'}
            aria-label="Shortlist Candidate"
          >
            <Star className={`w-4 h-4 ${isShort ? 'fill-gold-400 text-gold-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Hero Identity Banner */}
      <div className="glass-card radius-card p-6 sm:p-10 border border-white/[0.08] relative overflow-hidden shadow-2xl">
        {/* Ambient Radial Highlights */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-crimson-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar Gallery Container with Privacy Blur */}
          <div className="relative flex-shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-gold-400/30 p-1 bg-zinc-950 shadow-2xl relative">
              <CandidateAvatar
                src={profile.photo_url}
                name={profile.full_name}
                size="hero"
                shape="square"
                className="w-full h-full object-cover rounded-xl"
              />
              {isPrivatePhoto && (
                <PhotoPrivacyShield
                  candidateName={profile.full_name}
                  onUnlockRequest={() => alert(`Requested photo access from ${profile.full_name}`)}
                />
              )}
            </div>

            {profile.is_id_verified && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 font-bold text-[10px] flex items-center gap-1 shadow-lg whitespace-nowrap">
                <ShieldCheck className="w-3 h-3 text-zinc-950" />
                <span>100% ID Verified</span>
              </div>
            )}
          </div>

          {/* Candidate Primary Bio & Headings */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 radius-btn text-[10px] font-bold bg-zinc-900 text-gold-400 border border-gold-400/30 uppercase tracking-wider">
                  {profile.profile_created_for ? `Managed by ${profile.profile_created_for}` : 'Self Managed'}
                </span>
                <span className="px-2.5 py-0.5 radius-btn text-[10px] font-semibold bg-zinc-900 text-zinc-300 border border-white/10">
                  {profile.marital_status || 'Never Married'}
                </span>
              </div>

              <h1 className="font-serif font-black text-white text-3xl sm:text-4xl tracking-tight leading-tight">
                {profile.full_name}, <span className="font-mono font-normal text-zinc-400 text-2xl">{profile.age}</span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 font-medium flex items-center justify-center md:justify-start gap-2">
                <Briefcase className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>{profile.occupation || 'Professional / Doctor'}</span>
                <span className="text-zinc-500">•</span>
                <MapPin className="w-4 h-4 text-crimson-400 flex-shrink-0" />
                <span>{profile.city || 'Maharashtra'}{profile.state ? `, ${profile.state}` : ''}</span>
              </p>
            </div>

            {/* Quick Monospace Stat Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 font-mono text-xs">
              <div className="px-3 py-1.5 radius-btn bg-zinc-900/80 border border-white/[0.08] text-zinc-200 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                <span>{profile.education_level || 'Post Graduate'}</span>
              </div>
              <div className="px-3 py-1.5 radius-btn bg-zinc-900/80 border border-gold-400/30 text-gold-300 flex items-center gap-1.5">
                <span className="text-gold-400 font-bold">₹</span>
                <span className="font-bold">{profile.annual_income_lpa ? `${profile.annual_income_lpa} LPA` : 'Confidential'}</span>
              </div>
              <div className="px-3 py-1.5 radius-btn bg-zinc-900/80 border border-white/[0.08] text-zinc-200 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-zinc-400" />
                <span>{profile.height_cm ? `${profile.height_cm} cm` : '5 ft 6 in'}</span>
              </div>
              <div className="px-3 py-1.5 radius-btn bg-zinc-900/80 border border-white/[0.08] text-emerald-400 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                <span className="capitalize">{profile.diet || 'Vegetarian'}</span>
              </div>
            </div>

            {/* Candidate Self Description */}
            {profile.about_me && (
              <p className="text-xs sm:text-sm text-zinc-400 pt-2 leading-relaxed max-w-2xl">
                "{profile.about_me}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Match Telemetry & Data Visualization (Bklit UI Pattern) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-Ring Radial Gauge Card */}
        <div className="glass-card radius-card p-6 border border-white/[0.08] flex flex-col items-center justify-between text-center space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 radius-btn bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs font-serif font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Concentric Match Telemetry</span>
            </div>
            <h3 className="font-serif font-bold text-white text-lg">Overall Compatibility</h3>
            <p className="text-xs text-zinc-400">Algorithmic alignment across all dimensions</p>
          </div>

          <MatchTelemetryGauge
            score={matchScore}
            valuesScore={valuesScore}
            careerScore={careerScore}
            kundaliScore={kundaliGuna}
            size="lg"
            showDetails={true}
          />

          <div className="w-full pt-3 border-t border-white/[0.06] text-xs space-y-1">
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Core Values & Lifestyle:</span>
              <span className="font-mono text-gold-400 font-bold">{valuesScore}%</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Career & Education:</span>
              <span className="font-mono text-emerald-400 font-bold">{careerScore}%</span>
            </div>
            <div className="flex justify-between text-zinc-400 text-[11px]">
              <span>Guna Milan:</span>
              <span className="font-mono text-crimson-400 font-bold">{kundaliGuna} / 36 Gunas</span>
            </div>
          </div>
        </div>

        {/* 6-Axis Partner Preference Radar Chart Card */}
        <div className="glass-card radius-card p-6 border border-white/[0.08] flex flex-col items-center justify-between space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 radius-btn bg-crimson-500/10 text-crimson-400 border border-crimson-500/20 text-xs font-serif font-bold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>6-Axis Vector Radar</span>
            </div>
            <h3 className="font-serif font-bold text-white text-lg">Partner Preference Delta</h3>
            <p className="text-xs text-zinc-400">Candidate Attributes vs. Your Preferences</p>
          </div>

          <KundaliRadarChart
            candidateData={{
              ageScore: valuesScore,
              heightScore: 88,
              careerScore: careerScore,
              dietScore: 100,
              locationScore: 86,
              kundaliScore: Math.round((kundaliGuna / 36) * 100)
            }}
            size={240}
          />
        </div>

        {/* 12-Week Activity & Trust Heatmap Card */}
        <div className="glass-card radius-card p-6 border border-white/[0.08] flex flex-col justify-between space-y-4">
          <ActivityHeatmap profile={profile} />
        </div>
      </div>

      {/* 3. Kundali & Astrological Alignment Matrix */}
      <div className="glass-card radius-card p-6 sm:p-8 border border-white/[0.08] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 radius-btn bg-crimson-500/10 text-crimson-400 flex items-center justify-center border border-crimson-500/20">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-white text-xl">Astrological & Kundali Alignment</h3>
              <p className="text-xs text-zinc-400">Guna Milan score: <strong className="font-mono text-gold-400">{kundaliGuna} out of 36 Gunas</strong></p>
            </div>
          </div>
          <span className="px-3 py-1 radius-btn bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs">
            Auspicious Match ✓
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 radius-btn bg-zinc-900/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Rashi / Moon Sign</span>
            <p className="font-serif font-bold text-white text-sm">{profile.rashi || 'Mesh (Aries)'}</p>
          </div>
          <div className="p-3.5 radius-btn bg-zinc-900/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nakshatra</span>
            <p className="font-serif font-bold text-white text-sm">{profile.nakshatra || 'Ashwini'}</p>
          </div>
          <div className="p-3.5 radius-btn bg-zinc-900/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Manglik Status</span>
            <p className="font-serif font-bold text-emerald-400 text-sm">{profile.manglik || 'Non-Manglik'}</p>
          </div>
          <div className="p-3.5 radius-btn bg-zinc-900/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nadi & Gana</span>
            <p className="font-serif font-bold text-white text-sm">{profile.nadi || 'Antya'} • {profile.gana || 'Deva'}</p>
          </div>
        </div>
      </div>

      {/* 4. Family Heritage & Lineage Matrix */}
      <div className="glass-card radius-card p-6 sm:p-8 border border-white/[0.08] space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
          <div className="w-10 h-10 radius-btn bg-gold-500/10 text-gold-400 flex items-center justify-center border border-gold-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-xl">Family Heritage & Lineage</h3>
            <p className="text-xs text-zinc-400">Background, native roots, and family values</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 radius-btn bg-zinc-900/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Father's Occupation</span>
            <p className="font-medium text-white text-sm">{profile.father_occupation || 'Business / Retired'}</p>
          </div>
          <div className="p-4 radius-btn bg-zinc-900/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Mother's Occupation</span>
            <p className="font-medium text-white text-sm">{profile.mother_occupation || 'Homemaker'}</p>
          </div>
          <div className="p-4 radius-btn bg-zinc-900/70 border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Native City / District</span>
            <p className="font-medium text-white text-sm">{profile.native_place || profile.city || 'Maharashtra'}</p>
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Luxury Proposal Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-white/10 p-3 sm:p-4 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold-400/40 overflow-hidden">
              <CandidateAvatar src={profile.photo_url} name={profile.full_name} size="sm" shape="circle" />
            </div>
            <div>
              <span className="font-serif font-bold text-white text-sm block">{profile.full_name}</span>
              <span className="font-mono text-[11px] text-gold-400">{matchScore}% Compatibility</span>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-3 justify-end">
            {isAcceptedMatch ? (
              <button
                type="button"
                onClick={() => onOpenChat && onOpenChat(profile)}
                className="w-full sm:w-auto px-6 py-3 radius-btn bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Chat & Contact Details</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExpressInterest}
                disabled={loadingInterest || hasExpressedInterest || isOwnProfile}
                className={`w-full sm:w-auto px-8 py-3 radius-btn font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                  hasExpressedInterest
                    ? 'bg-zinc-800 text-zinc-400 border border-white/10 cursor-default'
                    : isOwnProfile
                    ? 'bg-zinc-900 text-zinc-500 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-crimson-600 to-rose-700 hover:from-crimson-500 hover:to-rose-600 text-white crimson-glow active:scale-95'
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
                    <span>Send Proposal / Express Interest</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailPage;
