import React from 'react';
import { ShieldCheck, Star, UserCheck, Briefcase } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BadgeVerified = ({
  isFullyVerified = false,
  isIdVerified = false,
  isProfessionVerified = false,
  type,
  size = 'normal',
  label
}) => {
  const { t } = useLanguage();
  const isCompact = size === 'small';

  // 1. Managed By Metadata
  if (type === 'managed_by') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-sub font-normal">
        <UserCheck className="w-3.5 h-3.5 text-sub" />
        <span>{label || t('managedBySelf')}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {/* 100% VERIFIED BADGE */}
      {(isFullyVerified || type === '100') && (
        <span
          className={`inline-flex items-center gap-1 font-bold badge-trust-lightgreen rounded-full ${
            isCompact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          }`}
          title="100% Verified: Government ID + Family Consent Document Approved"
        >
          <Star className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-current`} />
          <span>{t('fullyVerified')}</span>
        </span>
      )}

      {/* ID VERIFIED BADGE */}
      {(isIdVerified || type === 'govt_id') && !isFullyVerified && (
        <span
          className={`inline-flex items-center gap-1 font-bold badge-trust-lightgreen rounded-full ${
            isCompact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          }`}
          title="Identity Document Verified"
        >
          <ShieldCheck className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
          <span>{t('idVerified')}</span>
        </span>
      )}

      {/* CAREER VERIFIED BADGE */}
      {(isProfessionVerified || type === 'career') && (
        <span
          className={`inline-flex items-center gap-1 font-bold bg-surface-ground text-main border border-main rounded-full ${
            isCompact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          }`}
          title="Career / Education Certificate Verified"
        >
          <Briefcase className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-sub`} />
          <span>{t('careerVerified')}</span>
        </span>
      )}
    </div>
  );
};

export default BadgeVerified;
