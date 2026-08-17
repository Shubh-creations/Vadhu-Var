import React from 'react';
import { ShieldCheck, Shield, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { calculateProfileCompleteness } from '../lib/profileCompleteness';

export const BadgeVerified = ({
  profile = null,
  isFullyVerified = false,
  isIdVerified = false,
  isProfessionVerified = false,
  isPending = false,
  type = 'verified',
  size = 'normal',
  label = null
}) => {
  const { t } = useLanguage();

  if (type === 'managed_by') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 radius-btn text-xs font-medium bg-surface-ground text-sub border border-main">
        <span>{label || t('managedBySelf')}</span>
      </span>
    );
  }

  // Pending Verification Status (Amber Badge for New Candidates)
  if (isPending) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 radius-btn text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
        <span>Verification In Review</span>
      </span>
    );
  }

  // Derive dynamic properties from profile if passed
  const effectiveFullyVerified = profile ? Boolean(profile.is_fully_verified) : isFullyVerified;
  const effectiveIdVerified = profile ? Boolean(profile.is_id_verified) : isIdVerified;
  const effectiveProfessionVerified = profile ? Boolean(profile.is_profession_verified) : isProfessionVerified;

  const completeness = profile ? calculateProfileCompleteness(profile) : null;
  const isProfileComplete = completeness ? completeness.percentage >= 85 : true;

  // Multi-tier verified badge stack
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* 100% Full Verification (Only if both DB flag is true AND profile is genuinely >= 85% complete) */}
      {effectiveFullyVerified && isProfileComplete && (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 radius-btn text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
          title="100% Verified Candidate (ID Document + Family Consent + Complete Profile)"
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{t('fullyVerified')}</span>
        </span>
      )}

      {/* ID Verified */}
      {(effectiveIdVerified || (effectiveFullyVerified && !isProfileComplete)) && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 radius-btn text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
          title="Government ID Document Verified"
        >
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{t('idVerified')}</span>
        </span>
      )}

      {/* Incomplete profile percentage indicator */}
      {completeness && completeness.percentage < 85 && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 radius-btn text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
          title={`Profile is ${completeness.percentage}% complete (${completeness.missingItems.join(', ')} pending)`}
        >
          <span>{completeness.percentage}% Complete</span>
        </span>
      )}

      {/* Career Verified */}
      {effectiveProfessionVerified && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 radius-btn text-xs font-semibold bg-sky-blue/10 text-sky-blue border border-sky-blue/20"
          title="Career / Degree Certificate Verified"
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{t('careerVerified')}</span>
        </span>
      )}
    </div>
  );
};

export default BadgeVerified;
