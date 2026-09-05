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
    <div className="glass-card radius-card border border-zinc-200 dark:border-white/[0.08] p-5 shadow-xl transition-colors space-y-6">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2 min-w-0">
          <Filter className="w-4 h-4 text-amber-600 dark:text-gold-400 flex-shrink-0" />
          <h2 className="font-serif font-bold text-zinc-900 dark:text-white text-base tracking-tight truncate">
            {t('filterTitle')}
          </h2>
          {activeAppliedCount > 0 && (
            <span className="px-2 py-0.5 radius-btn text-[10px] font-bold bg-amber-500 text-zinc-950 flex-shrink-0">
              {activeAppliedCount}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-crimson-500 dark:hover:text-crimson-400 font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
          title={t('resetFilters')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('resetFilters')}</span>
        </button>
      </div>

      {/* 2. Looking For (Gender Selection) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-900 dark:text-white block tracking-wide uppercase">
          {t('lookingFor')}
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/90 radius-btn border border-zinc-200 dark:border-white/[0.06]">
          {[
            { id: 'all', label: t('all') },
            { id: 'female', label: t('brides') },
            { id: 'male', label: t('grooms') }
          ].map((item) => {
            const isSelected = (pendingFilters.gender || 'all') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleFieldChange('gender', item.id)}
                className={`py-1.5 px-2 radius-btn text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Age Range Slider & Quick Preset Pills */}
      <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
            {t('ageRange')}
          </label>
          <span className="text-xs font-mono font-bold text-amber-700 dark:text-gold-400">
            {pendingFilters.ageMin || 18} – {pendingFilters.ageMax || 80} yrs
          </span>
        </div>

        {/* Quick Age Presets */}
        <div className="grid grid-cols-3 gap-1.5">
          {agePresets.map((preset) => {
            const isSelected =
              Number(pendingFilters.ageMin) === preset.min &&
              Number(pendingFilters.ageMax) === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSetAgePreset(preset.min, preset.max)}
                className={`py-1 px-1.5 radius-btn text-[11px] font-mono font-semibold transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-700 dark:text-gold-300 border border-amber-500/40 dark:border-gold-400/40'
                    : 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-white/[0.04]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Dual Min/Max Sliders */}
        <div className="space-y-2 pt-1">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <span className="text-[10px] text-zinc-500 block mb-0.5">Min</span>
              <input
                type="number"
                min="18"
                max="79"
                value={pendingFilters.ageMin ?? 18}
                onChange={(e) => handleAgeChange('ageMin', e.target.value)}
                onBlur={() => handleAgeBlur('ageMin')}
                className="w-full px-2 py-1 radius-btn text-xs font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 text-center outline-none focus:border-amber-500 dark:focus:border-gold-400"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-zinc-500 block mb-0.5">Max</span>
              <input
                type="number"
                min="19"
                max="80"
                value={pendingFilters.ageMax ?? 80}
                onChange={(e) => handleAgeChange('ageMax', e.target.value)}
                onBlur={() => handleAgeBlur('ageMax')}
                className="w-full px-2 py-1 radius-btn text-xs font-mono bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 text-center outline-none focus:border-amber-500 dark:focus:border-gold-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Location & Income Filters */}
      <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-white/[0.06]">
        <label className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
          {t('locationIncome')}
        </label>

        {/* Annual Income */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <IndianRupee className="w-3.5 h-3.5 text-amber-600 dark:text-gold-400" />
            <span>{t('annualIncome')}</span>
          </label>
          <select
            value={pendingFilters.incomeBracket || 'all'}
            onChange={(e) => handleFieldChange('incomeBracket', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 outline-none focus:border-amber-500 dark:focus:border-gold-400 transition-colors cursor-pointer"
          >
            {incomeBrackets.map(b => (
              <option key={b.value} value={b.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{b.label}</option>
            ))}
          </select>
        </div>

        {/* State Selection */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <MapPin className="w-3.5 h-3.5 text-crimson-500 dark:text-crimson-400" />
            <span>{t('state')}</span>
          </label>
          <select
            value={pendingFilters.state || 'All States'}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 outline-none focus:border-amber-500 dark:focus:border-gold-400 transition-colors cursor-pointer"
          >
            {indianStates.map(st => (
              <option key={st} value={st} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{st}</option>
            ))}
          </select>
        </div>

        {/* City Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
            {t('city')}
          </label>
          <input
            type="text"
            placeholder={t('searchCity')}
            value={pendingFilters.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 outline-none focus:border-amber-500 dark:focus:border-gold-400 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />
        </div>

        {/* Education Level */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t('education')}</span>
          </label>
          <select
            value={pendingFilters.education || 'All Education'}
            onChange={(e) => handleFieldChange('education', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 outline-none focus:border-amber-500 dark:focus:border-gold-400 transition-colors cursor-pointer"
          >
            {educationLevels.map(ed => (
              <option key={ed} value={ed} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{ed}</option>
            ))}
          </select>
        </div>

        {/* Diet Preference */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Utensils className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{t('dietPreference')}</span>
          </label>
          <select
            value={pendingFilters.diet || ''}
            onChange={(e) => handleFieldChange('diet', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 outline-none focus:border-amber-500 dark:focus:border-gold-400 transition-colors cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('allDiets')}</option>
            <option value="veg" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('vegetarian')}</option>
            <option value="non-veg" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('nonVegetarian')}</option>
            <option value="eggetarian" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('eggetarian')}</option>
          </select>
        </div>

        {/* Marital Status */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Heart className="w-3.5 h-3.5 text-crimson-500 dark:text-crimson-400" />
            <span>{t('maritalStatus')}</span>
          </label>
          <select
            value={pendingFilters.maritalStatus || ''}
            onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 outline-none focus:border-amber-500 dark:focus:border-gold-400 transition-colors cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('allStatuses')}</option>
            <option value="never_married" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('neverMarried')}</option>
            <option value="divorced" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('divorced')}</option>
            <option value="widowed" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('widowed')}</option>
            <option value="awaiting_divorce" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">{t('awaitingDivorce')}</option>
          </select>
        </div>
      </div>

      {/* 5. Verification Toggle */}
      <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.06]">
        <div className="flex items-center justify-between p-3 radius-btn bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{t('idVerifiedOnly')}</span>
          </div>

          <button
            type="button"
            onClick={() => handleFieldChange('verifiedOnly', !pendingFilters.verifiedOnly)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              pendingFilters.verifiedOnly ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800 border border-zinc-400 dark:border-white/10'
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

      {/* 6. Action Button */}
      <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.06] space-y-2">
        <button
          type="button"
          onClick={() => onApply(pendingFilters)}
          className={`w-full py-3 px-4 radius-btn text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
            hasUnappliedChanges
              ? 'bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 font-extrabold gold-glow scale-[1.01]'
              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-white/10'
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
          <p className="text-[10px] text-center text-amber-600 dark:text-gold-400 font-medium animate-pulse">
            {t('clickApplyHint')}
          </p>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
