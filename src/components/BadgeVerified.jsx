import React from 'react';
import { ShieldCheck, Shield, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BadgeVerified = ({
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

  // Multi-tier verified badge stack
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* 100% Full Verification (ID + Family) */}
      {isFullyVerified && (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 radius-btn text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
          title="100% Verified Candidate (ID Document + Family Consent)"
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{t('fullyVerified')}</span>
        </span>
      )}

      {/* ID Verified */}
      {isIdVerified && !isFullyVerified && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 radius-btn text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
          title="Government ID Document Verified"
        >
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{t('idVerified')}</span>
        </span>
      )}

      {/* Career Verified */}
      {isProfessionVerified && (
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
