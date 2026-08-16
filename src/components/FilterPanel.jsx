import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, ShieldCheck, MapPin, IndianRupee, GraduationCap, Utensils, Heart, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FilterPanel = ({ appliedFilters, onApply, onReset, totalMatches, isMobileDrawer = false }) => {
  const { t } = useLanguage();

  // Local pending filter state — adjusts controls without updating parent grid until "Apply"
  const [pendingFilters, setPendingFilters] = useState(appliedFilters);

  // Synchronize pendingFilters whenever appliedFilters changes (e.g. after Reset)
  useEffect(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  const handleFieldChange = (key, value) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }));
  };

  // Compare pendingFilters vs appliedFilters to count unapplied changes
  const unappliedCount = Object.keys(pendingFilters).filter(
    key => pendingFilters[key] !== appliedFilters[key]
  ).length;

  const hasUnappliedChanges = unappliedCount > 0;

  // Count active filters currently applied
  const activeAppliedCount = [
    appliedFilters.gender && appliedFilters.gender !== 'all',
    appliedFilters.incomeBracket && appliedFilters.incomeBracket !== 'all',
    Boolean(appliedFilters.state),
    Boolean(appliedFilters.city),
    Boolean(appliedFilters.education),
    Boolean(appliedFilters.diet),
    Boolean(appliedFilters.maritalStatus),
    appliedFilters.verifiedOnly,
    (appliedFilters.ageMin && appliedFilters.ageMin > 18) || (appliedFilters.ageMax && appliedFilters.ageMax < 80)
  ].filter(Boolean).length;

  const indianStates = [
    'All States', 'Maharashtra', 'Delhi NCR', 'Karnataka', 'Telangana', 'Tamil Nadu',
    'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Madhya Pradesh', 'Kerala'
  ];

  const incomeBrackets = [
    { value: 'all', label: t('anyIncome') },
    { value: '2.5-5', label: t('income2_5Plus') },
    { value: '5-10', label: t('income5Plus') },
    { value: '10-15', label: t('income10Plus') },
    { value: '15-25', label: t('income15Plus') },
    { value: '25-50', label: t('income25Plus') },
    { value: '50+', label: t('income50Plus') }
  ];

  const educationLevels = [
    'All Education', 'B.Tech / B.E.', 'MBA', 'MBBS / MD', 'M.Tech', 'Chartered Accountant', 'Graduate', 'Post Graduate', 'Ph.D'
  ];

  return (
    <div className="bg-surface-card radius-card border border-main p-5 shadow-sm transition-colors space-y-6">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between pb-4 border-b border-main">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-sky-blue" />
            <h2 className="font-serif font-bold text-main text-base tracking-tight">
              {t('filterTitle')}
            </h2>
            {activeAppliedCount > 0 && (
              <span className="px-2 py-0.5 radius-btn text-[10px] font-bold bg-sky-blue text-white">
                {activeAppliedCount} active
              </span>
            )}
          </div>
          <p className="text-[11px] text-sub mt-0.5 font-medium">
            Showing <strong className="text-main">{totalMatches}</strong> candidates
          </p>
        </div>

        {activeAppliedCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 radius-btn bg-surface-ground hover:bg-main/10 text-sub hover:text-main text-xs font-medium transition-colors border border-main"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('reset')}</span>
          </button>
        )}
      </div>

      {/* Looking For Gender Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-main block">Looking For</label>
        <div className="grid grid-cols-3 gap-1.5 bg-surface-ground p-1 radius-btn border border-main">
          {[
            { value: 'all', label: 'All' },
            { value: 'female', label: 'Brides' },
            { value: 'male', label: 'Grooms' }
          ].map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => handleFieldChange('gender', g.value)}
              className={`py-1.5 text-xs font-semibold radius-btn transition-colors ${
                (pendingFilters.gender || 'all') === g.value
                  ? 'bg-sky-blue text-white shadow-xs'
                  : 'text-sub hover:text-main'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Age Range Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-main">
          <span>Age Range</span>
          <span className="text-sub font-mono font-bold">
            {pendingFilters.ageMin || 18} - {pendingFilters.ageMax || 80} yrs
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="18"
            max="80"
            value={pendingFilters.ageMin || 18}
            onChange={(e) => handleFieldChange('ageMin', Number(e.target.value))}
            className="w-full px-2.5 py-1.5 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue"
            placeholder="Min Age"
          />
          <span className="text-xs text-sub font-bold">to</span>
          <input
            type="number"
            min="18"
            max="80"
            value={pendingFilters.ageMax || 80}
            onChange={(e) => handleFieldChange('ageMax', Number(e.target.value))}
            className="w-full px-2.5 py-1.5 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue"
            placeholder="Max Age"
          />
        </div>
      </div>

      {/* 3. Location & Income Section */}
      <div className="space-y-4 pt-2 border-t border-main">
        <span className="text-[10px] font-bold uppercase tracking-wider text-sub block">
          Location & Income
        </span>

        {/* Annual Income Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-main">
            <IndianRupee className="w-3.5 h-3.5 text-sub" />
            <span>{t('incomeRange')}</span>
          </label>
          <select
            value={pendingFilters.incomeBracket || 'all'}
            onChange={(e) => handleFieldChange('incomeBracket', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors cursor-pointer"
          >
            {incomeBrackets.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-main">
            <MapPin className="w-3.5 h-3.5 text-sub" />
            <span>{t('state')}</span>
          </label>
          <select
            value={pendingFilters.state || ''}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors cursor-pointer"
          >
            {indianStates.map(s => (
              <option key={s} value={s === 'All States' ? '' : s}>{s}</option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-main">
            <MapPin className="w-3.5 h-3.5 text-sub" />
            <span>{t('locationCity')}</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Pune, Delhi, Bengaluru..."
            value={pendingFilters.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors placeholder:text-sub/60"
          />
        </div>
      </div>

      {/* 4. Candidate Background & Preferences */}
      <div className="space-y-4 pt-4 border-t border-main">
        <span className="text-[10px] font-bold uppercase tracking-wider text-sub block">
          Education & Lifestyle
        </span>

        {/* Education Filter */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-main">
            <GraduationCap className="w-3.5 h-3.5 text-sub" />
            <span>{t('education')}</span>
          </label>
          <select
            value={pendingFilters.education || ''}
            onChange={(e) => handleFieldChange('education', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors cursor-pointer"
          >
            {educationLevels.map(e => (
              <option key={e} value={e === 'All Education' ? '' : e}>{e}</option>
            ))}
          </select>
        </div>

        {/* Diet Preference */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-main">
            <Utensils className="w-3.5 h-3.5 text-sub" />
            <span>{t('dietPreference')}</span>
          </label>
          <select
            value={pendingFilters.diet || ''}
            onChange={(e) => handleFieldChange('diet', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors cursor-pointer"
          >
            <option value="">{t('allDiets')}</option>
            <option value="veg">{t('vegetarian')}</option>
            <option value="non-veg">{t('nonVegetarian')}</option>
            <option value="eggetarian">{t('eggetarian')}</option>
          </select>
        </div>

        {/* Marital Status */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-main">
            <Heart className="w-3.5 h-3.5 text-sub" />
            <span>{t('maritalStatus')}</span>
          </label>
          <select
            value={pendingFilters.maritalStatus || ''}
            onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors cursor-pointer"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="never_married">{t('neverMarried')}</option>
            <option value="divorced">{t('divorced')}</option>
            <option value="widowed">{t('widowed')}</option>
            <option value="awaiting_divorce">{t('awaitingDivorce')}</option>
          </select>
        </div>
      </div>

      {/* 5. Verification Toggle */}
      <div className="pt-4 border-t border-main">
        <div className="flex items-center justify-between p-3 radius-btn bg-surface-ground border border-main">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-blue flex-shrink-0" />
            <span className="text-xs font-semibold text-main">{t('idVerifiedOnly')}</span>
          </div>

          <button
            type="button"
            onClick={() => handleFieldChange('verifiedOnly', !pendingFilters.verifiedOnly)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              pendingFilters.verifiedOnly ? 'bg-sky-blue' : 'bg-surface-card border border-main'
            }`}
            aria-label="Toggle Verified Profiles Only"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                pendingFilters.verifiedOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 6. Explicit "Apply Filters" Action Button */}
      <div className="pt-3 border-t border-main space-y-2">
        <button
          type="button"
          onClick={() => onApply(pendingFilters)}
          className={`w-full py-2.5 px-4 radius-btn text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all ${
            hasUnappliedChanges
              ? 'bg-sky-blue hover:bg-sky-blue/90 text-white ring-2 ring-sky-blue/30 scale-[1.01]'
              : 'bg-surface-ground hover:bg-surface-card border border-main text-main'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>
            {hasUnappliedChanges
              ? `Apply Filters (${unappliedCount} changed)`
              : 'Apply Filters'}
          </span>
        </button>

        {hasUnappliedChanges && (
          <p className="text-[10px] text-center text-sky-blue font-medium animate-pulse">
            Click Apply to update matching candidates
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
