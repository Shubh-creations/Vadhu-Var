import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { calculateProfileCompleteness } from '../lib/profileCompleteness';
import { useLanguage } from '../context/LanguageContext';

export const ProfileCompletenessCard = ({ profile, partnerPreferences, onUpdateProfile }) => {
  const { t } = useLanguage();
  const { percentage, missingItems, completedItems } = calculateProfileCompleteness(profile, partnerPreferences);

  const getBarColor = (pct) => {
    if (pct >= 85) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-sky-blue';
    return 'bg-amber-500';
  };

  const getTextColor = (pct) => {
    if (pct >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (pct >= 60) return 'text-sky-blue';
    return 'text-amber-600 dark:text-amber-400';
  };

  return (
    <div className="bg-surface-card radius-card border border-main p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
      {/* Header with Percentage */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-main text-sm sm:text-base leading-tight">
              Profile Completeness
            </h3>
            <p className="text-[11px] sm:text-xs text-sub mt-0.5">
              Complete profiles receive up to 4x more proposal responses.
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className={`font-serif text-2xl font-extrabold ${getTextColor(percentage)} block leading-none`}>
            {percentage}%
          </span>
          <span className="text-[10px] text-sub font-medium">
            {percentage === 100 ? 'All Star Profile' : 'In Progress'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-surface-ground radius-btn overflow-hidden border border-main">
        <div
          className={`h-full ${getBarColor(percentage)} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Actionable Missing Items List */}
      {missingItems.length > 0 ? (
        <div className="pt-2 space-y-2 border-t border-main">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">
            Suggested Actions to Boost Visibility
          </span>
          <div className="space-y-1.5">
            {missingItems.slice(0, 3).map((item) => (
              <div
                key={item.id || item.label}
                className="flex items-center justify-between p-2.5 radius-btn bg-surface-ground border border-main text-xs"
              >
                <div className="flex items-center gap-2 text-main font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                <span className="px-2 py-0.5 radius-btn bg-sky-blue/10 text-sky-blue font-bold text-[10px] flex-shrink-0">
                  +{item.weight}%
                </span>
              </div>
            ))}
          </div>

          {onUpdateProfile && (
            <button
              type="button"
              onClick={onUpdateProfile}
              className="mt-2 w-full py-2 radius-btn bg-surface-ground hover:bg-surface-card border border-main text-main hover:text-sky-blue text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Complete Profile Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="pt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold border-t border-main">
          <CheckCircle2 className="w-4 h-4" />
          <span>Your profile is 100% complete with verified trust credentials!</span>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletenessCard;
