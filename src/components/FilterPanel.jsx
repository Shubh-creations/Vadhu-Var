import React from 'react';
import { Filter, RotateCcw, ShieldCheck, MapPin, IndianRupee, GraduationCap, Utensils, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FilterPanel = ({ filters, onFilterChange, onReset, totalMatches }) => {
  const { t } = useLanguage();

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

  const activeFilterCount = [
    filters.incomeBracket !== 'all',
    Boolean(filters.state),
    Boolean(filters.city),
    Boolean(filters.education),
    Boolean(filters.diet),
    Boolean(filters.maritalStatus),
    filters.verifiedOnly
  ].filter(Boolean).length;

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
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 radius-btn text-[10px] font-bold bg-sky-blue text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          <p className="text-[11px] text-sub mt-0.5 font-medium">
            Showing <strong className="text-main">{totalMatches}</strong> candidates
          </p>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 radius-btn bg-surface-ground hover:bg-main/10 text-sub hover:text-main text-xs font-medium transition-colors border border-main"
            title="Reset Filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('reset')}</span>
          </button>
        )}
      </div>

      {/* 2. Location & Income Section */}
      <div className="space-y-4">
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
            value={filters.incomeBracket || 'all'}
            onChange={(e) => onFilterChange('incomeBracket', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors"
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
            value={filters.state || ''}
            onChange={(e) => onFilterChange('state', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors"
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
            value={filters.city || ''}
            onChange={(e) => onFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors placeholder:text-sub/60"
          />
        </div>
      </div>

      {/* 3. Candidate Background & Preferences */}
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
            value={filters.education || ''}
            onChange={(e) => onFilterChange('education', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors"
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
            value={filters.diet || ''}
            onChange={(e) => onFilterChange('diet', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors"
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
            value={filters.maritalStatus || ''}
            onChange={(e) => onFilterChange('maritalStatus', e.target.value)}
            className="w-full px-3 py-2 radius-btn text-xs bg-surface-ground text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue transition-colors"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="never_married">{t('neverMarried')}</option>
            <option value="divorced">{t('divorced')}</option>
            <option value="widowed">{t('widowed')}</option>
          </select>
        </div>
      </div>

      {/* 4. Verification Toggle */}
      <div className="pt-4 border-t border-main">
        <div className="flex items-center justify-between p-3 radius-btn bg-surface-ground border border-main">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-blue flex-shrink-0" />
            <span className="text-xs font-semibold text-main">{t('idVerifiedOnly')}</span>
          </div>

          <button
            onClick={() => onFilterChange('verifiedOnly', !filters.verifiedOnly)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              filters.verifiedOnly ? 'bg-sky-blue' : 'bg-surface-card border border-main'
            }`}
            aria-label="Toggle Verified Profiles Only"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                filters.verifiedOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
