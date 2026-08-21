import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, ShieldCheck, MapPin, IndianRupee, GraduationCap, Utensils, Heart, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FilterPanel = ({ appliedFilters, filters, onApply, onReset, totalMatches = 0, isMobileDrawer = false }) => {
  const { t } = useLanguage();

  const safeApplied = appliedFilters || filters || {};

  // Local pending filter state — adjusts controls without updating parent grid until "Apply"
  const [pendingFilters, setPendingFilters] = useState(safeApplied);

  // Synchronize pendingFilters whenever appliedFilters changes (e.g. after Reset)
  useEffect(() => {
    setPendingFilters(safeApplied);
  }, [appliedFilters, filters]);

  const handleFieldChange = (key, value) => {
    setPendingFilters(prev => ({ ...(prev || {}), [key]: value }));
  };

  // Compare pendingFilters vs appliedFilters to count unapplied changes
  const unappliedCount = Object.keys(pendingFilters || {}).filter(
    key => (pendingFilters || {})[key] !== (safeApplied || {})[key]
  ).length;

  const hasUnappliedChanges = unappliedCount > 0;

  // Count active filters currently applied
  const activeAppliedCount = [
    safeApplied.gender && safeApplied.gender !== 'all',
    safeApplied.incomeBracket && safeApplied.incomeBracket !== 'all',
    Boolean(safeApplied.state),
    Boolean(safeApplied.city),
    Boolean(safeApplied.education),
    Boolean(safeApplied.diet),
    Boolean(safeApplied.maritalStatus),
    safeApplied.verifiedOnly,
    (safeApplied.ageMin && safeApplied.ageMin > 18) || (safeApplied.ageMax && safeApplied.ageMax < 80)
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

  const agePresets = [
    { label: 'All', min: 18, max: 80 },
    { label: '21-28', min: 21, max: 28 },
    { label: '25-32', min: 25, max: 32 },
    { label: '28-35', min: 28, max: 35 },
    { label: '30-40', min: 30, max: 40 },
    { label: '35-50', min: 35, max: 50 }
  ];

  const handleSetAgePreset = (min, max) => {
    setPendingFilters(prev => ({
      ...(prev || {}),
      ageMin: min,
      ageMax: max
    }));
  };

  const handleAgeChange = (field, rawVal) => {
    if (rawVal === '') {
      setPendingFilters(prev => ({ ...(prev || {}), [field]: '' }));
      return;
    }
    const val = parseInt(rawVal, 10);
    if (!isNaN(val)) {
      setPendingFilters(prev => ({ ...(prev || {}), [field]: val }));
    }
  };

  const handleAgeBlur = (field) => {
    setPendingFilters(prev => {
      let min = typeof prev.ageMin === 'number' ? prev.ageMin : 18;
      let max = typeof prev.ageMax === 'number' ? prev.ageMax : 80;

      if (field === 'ageMin') {
        min = Math.max(18, Math.min(79, min));
        if (min > max) max = Math.min(80, min + 5);
      } else if (field === 'ageMax') {
        max = Math.max(19, Math.min(80, max));
        if (max < min) min = Math.max(18, max - 5);
      }

      return {
        ...prev,
        ageMin: min,
        ageMax: max
      };
    });
  };

  return (
    <div className="bg-surface-card radius-card border border-main p-5 shadow-sm transition-colors space-y-6">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-main">
        <div className="flex items-center gap-2 min-w-0">
          <Filter className="w-4 h-4 text-sky-blue flex-shrink-0" />
          <h2 className="font-serif font-bold text-main text-base tracking-tight truncate">
            {t('filterTitle')}
          </h2>
          {activeAppliedCount > 0 && (
            <span className="px-2 py-0.5 radius-btn text-[10px] font-bold bg-sky-blue text-white flex-shrink-0">
              {activeAppliedCount} active
            </span>
          )}
        </div>

        {activeAppliedCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 radius-btn bg-surface-ground hover:bg-main/10 text-sub hover:text-main text-xs font-medium transition-colors border border-main flex-shrink-0"
            title={t('resetAllFilters')}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('reset')}</span>
          </button>
        )}
      </div>

      {/* Looking For Gender Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-main block">{t('lookingFor')}</label>
        <div className="grid grid-cols-3 gap-1.5 bg-surface-ground p-1 radius-btn border border-main">
          {[
            { value: 'all', label: t('genderAll') },
            { value: 'female', label: t('genderBrides') },
            { value: 'male', label: t('genderGrooms') }
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

      {/* 2. Age Range Filter with Quick Presets and Clamped Inputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-main">
          <span>{t('ageRange')}</span>
          <span className="text-sky-blue font-mono font-bold">
            {pendingFilters.ageMin || 18} - {pendingFilters.ageMax || 80} {t('yearsOld')}
          </span>
        </div>

        {/* Quick Age Presets */}
        <div className="flex flex-wrap gap-1">
          {agePresets.map((preset) => {
            const isSelected =
              (pendingFilters.ageMin || 18) === preset.min &&
              (pendingFilters.ageMax || 80) === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSetAgePreset(preset.min, preset.max)}
                className={`px-2 py-1 text-[11px] font-semibold radius-btn transition-colors border ${
                  isSelected
                    ? 'bg-sky-blue text-white border-sky-blue shadow-2xs'
                    : 'bg-surface-ground text-sub border-main hover:text-main hover:bg-surface-card'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Dual Range Sliders */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="18"
              max="70"
              value={pendingFilters.ageMin || 18}
              onChange={(e) => {
                const val = Number(e.target.value);
                const currentMax = Number(pendingFilters.ageMax || 80);
                setPendingFilters(prev => ({
                  ...prev,
                  ageMin: Math.min(val, currentMax - 1)
                }));
              }}
              className="w-full accent-sky-blue h-1.5 bg-surface-ground rounded-lg cursor-pointer"
              title="Minimum Age Slider"
            />
            <input
              type="range"
              min="19"
              max="80"
              value={pendingFilters.ageMax || 80}
              onChange={(e) => {
                const val = Number(e.target.value);
                const currentMin = Number(pendingFilters.ageMin || 18);
                setPendingFilters(prev => ({
                  ...prev,
                  ageMax: Math.max(val, currentMin + 1)
                }));
              }}
              className="w-full accent-sky-blue h-1.5 bg-surface-ground rounded-lg cursor-pointer"
              title="Maximum Age Slider"
            />
          </div>
        </div>

        {/* Manual Precision Number Inputs */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 relative">
            <input
              type="number"
              min="18"
              max="79"
              value={pendingFilters.ageMin !== undefined ? pendingFilters.ageMin : 18}
              onChange={(e) => handleAgeChange('ageMin', e.target.value)}
              onBlur={() => handleAgeBlur('ageMin')}
              className="w-full px-3 py-1.5 radius-btn text-xs font-semibold bg-surface-ground text-main border border-main outline-none focus:border-sky-blue text-center"
              placeholder="18"
            />
            <span className="text-[10px] text-sub absolute -top-2 left-2 px-1 bg-surface-card font-medium">Min</span>
          </div>

          <span className="text-xs text-sub font-bold px-1">{t('to')}</span>

          <div className="flex-1 relative">
            <input
              type="number"
              min="19"
              max="80"
              value={pendingFilters.ageMax !== undefined ? pendingFilters.ageMax : 80}
              onChange={(e) => handleAgeChange('ageMax', e.target.value)}
              onBlur={() => handleAgeBlur('ageMax')}
              className="w-full px-3 py-1.5 radius-btn text-xs font-semibold bg-surface-ground text-main border border-main outline-none focus:border-sky-blue text-center"
              placeholder="80"
            />
            <span className="text-[10px] text-sub absolute -top-2 left-2 px-1 bg-surface-card font-medium">Max</span>
          </div>
        </div>
      </div>

      {/* 3. Location & Income Section */}
      <div className="space-y-4 pt-2 border-t border-main">
        <span className="text-[10px] font-bold uppercase tracking-wider text-sub block">
          {t('locationAndIncome')}
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
              <option key={s} value={s === 'All States' ? '' : s}>
                {s === 'All States' ? t('allStates') : s}
              </option>
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
            placeholder={t('cityPlaceholder')}
            value={pendingFilters.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors placeholder:text-sub/60"
          />
        </div>
      </div>

      {/* 4. Candidate Background & Preferences */}
      <div className="space-y-4 pt-4 border-t border-main">
        <span className="text-[10px] font-bold uppercase tracking-wider text-sub block">
          {t('educationAndLifestyle')}
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
              <option key={e} value={e === 'All Education' ? '' : e}>
                {e === 'All Education' ? t('allEducation') : e}
              </option>
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
            aria-label={t('idVerifiedOnly')}
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
              ? t('applyFiltersChanged', { count: unappliedCount })
              : t('applyFilters')}
          </span>
        </button>

        {hasUnappliedChanges && (
          <p className="text-[10px] text-center text-sky-blue font-medium animate-pulse">
            {t('clickApplyHint')}
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
