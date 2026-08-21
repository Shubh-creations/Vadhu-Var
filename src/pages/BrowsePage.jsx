import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Grid, Layers, Sparkles, Filter, ShieldCheck, 
  Heart, UserPlus, ArrowRight, X, ArrowUpDown, Loader2, Star,
  ChevronLeft, ChevronRight, RotateCcw, CheckCircle2
} from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import FilterPanel from '../components/FilterPanel';
import DiscoverOnboardingModal from '../components/DiscoverOnboardingModal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import calculateCompatibilityEstimate from '../lib/compatibilityCalculator';

const defaultFilters = {
  ageMin: 18,
  ageMax: 80,
  gender: 'all',
  city: '',
  state: '',
  education: '',
  diet: '',
  maritalStatus: '',
  incomeBracket: 'all',
  verifiedOnly: false
};

export const BrowsePage = ({ onViewProfile, onOpenCompatibility, onNavigateToProfile, onAuthRequired, onNavigateToDiscover, showShortlistedOnly = false }) => {
  const { profiles, shortlistedIds } = useData();
  const { profile: myProfile, partnerPreferences, user } = useAuth();
  const { t } = useLanguage();

  // 1. All State Hooks (Declared first)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [discoveryView, setDiscoveryView] = useState('grid');
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [sortBy, setSortBy] = useState('best_match');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [deckIndex, setDeckIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  // 2. Filter & Sort Handlers
  const handleApplyFilters = (newFilters) => {
    setIsLoadingFeed(true);
    setAppliedFilters(newFilters);
    setFilterDrawerOpen(false);
    setTimeout(() => {
      setIsLoadingFeed(false);
    }, 200);
  };

  const handleResetFilters = () => {
    setIsLoadingFeed(true);
    setAppliedFilters(defaultFilters);
    setSearchQuery('');
    setSortBy('best_match');
    setFilterDrawerOpen(false);
    setTimeout(() => {
      setIsLoadingFeed(false);
    }, 150);
  };

  const handleRemoveFilter = (key, defaultVal = '') => {
    setIsLoadingFeed(true);
    setAppliedFilters(prev => ({ ...prev, [key]: defaultVal }));
    setTimeout(() => setIsLoadingFeed(false), 150);
  };

  const handleSwitchView = (newView) => {
    setIsLoadingFeed(true);
    setDiscoveryView(newView);
    setTimeout(() => setIsLoadingFeed(false), 200);
  };

  // 3. Filter and Score Sorting Engine (useMemo)
  const filteredProfiles = useMemo(() => {
    const currentUserId = myProfile?.id || user?.id;

    // Hard Filtering
    const matching = (profiles || []).filter((p) => {
      if (!p) return false;
      if (p.is_active === false) return false;
      if ((p.is_visible === false || p.is_search_visible === false) && p.id !== currentUserId) return false;
      if (currentUserId && p.id === currentUserId) return false;
      if (showShortlistedOnly && !shortlistedIds.includes(p.id)) return false;

      // 1. Verified Only Filter
      if (appliedFilters.verifiedOnly && !p.is_id_verified && !p.is_fully_verified) return false;

      // 2. Gender Filter
      if (appliedFilters.gender && appliedFilters.gender !== 'all') {
        const pGender = (p.gender || '').trim().toLowerCase();
        const fGender = appliedFilters.gender.trim().toLowerCase();
        if (pGender !== fGender) return false;
      }

      // 3. Age Range Filter
      const ageNum = Number(p.age);
      if (ageNum) {
        const minAge = Number(appliedFilters.ageMin || 18);
        const maxAge = Number(appliedFilters.ageMax || 80);
        if (ageNum < minAge || ageNum > maxAge) return false;
      }

      // 4. City Filter
      if (appliedFilters.city?.trim()) {
        const targetCity = appliedFilters.city.trim().toLowerCase();
        const pCity = (p.city || '').trim().toLowerCase();
        if (!pCity.includes(targetCity)) return false;
      }

      // 5. State Filter
      if (appliedFilters.state?.trim() && appliedFilters.state !== 'All States') {
        const targetState = appliedFilters.state.trim().toLowerCase();
        const pState = (p.state || '').trim().toLowerCase();
        if (!pState.includes(targetState)) return false;
      }

      // 6. Education Filter
      if (appliedFilters.education?.trim() && appliedFilters.education !== 'All Education') {
        const targetEdu = appliedFilters.education.trim().toLowerCase();
        const pEdu = (p.education_level || '').trim().toLowerCase();
        const isEduMatch = pEdu.includes(targetEdu) || targetEdu.includes(pEdu) ||
          (targetEdu.includes('b.tech') && (pEdu.includes('b.e') || pEdu.includes('engineering') || pEdu.includes('tech'))) ||
          (targetEdu.includes('mbbs') && (pEdu.includes('doctor') || pEdu.includes('medical') || pEdu.includes('md'))) ||
          (targetEdu.includes('graduate') && pEdu.includes('bachelor'));
        if (!isEduMatch) return false;
      }

      // 7. Diet Filter
      if (appliedFilters.diet?.trim()) {
        const targetDiet = appliedFilters.diet.trim().toLowerCase();
        const pDiet = (p.diet || '').trim().toLowerCase();
        if (pDiet !== targetDiet) return false;
      }

      // 8. Marital Status Filter
      if (appliedFilters.maritalStatus?.trim()) {
        const targetStatus = appliedFilters.maritalStatus.trim().toLowerCase();
        const pStatus = (p.marital_status || '').trim().toLowerCase();
        if (pStatus !== targetStatus) return false;
      }

      // 9. Income Bracket Filter
      if (appliedFilters.incomeBracket && appliedFilters.incomeBracket !== 'all') {
        const income = Number(p.annual_income_lpa) || 0;
        if (appliedFilters.incomeBracket === '2.5-5' && (income < 2.5 || income > 5)) return false;
        if (appliedFilters.incomeBracket === '5-10' && (income < 5 || income > 10)) return false;
        if (appliedFilters.incomeBracket === '10-15' && (income < 10 || income > 15)) return false;
        if (appliedFilters.incomeBracket === '15-25' && (income < 15 || income > 25)) return false;
        if (appliedFilters.incomeBracket === '25-50' && (income < 25 || income > 50)) return false;
        if (appliedFilters.incomeBracket === '50+' && income < 50) return false;
      }

      // 10. Search Query Filter (Matches Name, City, State, Occupation, Education, Caste, Bio)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchableFields = [
          p.full_name, p.city, p.state, p.occupation, p.education_level, p.caste, p.sub_caste, p.bio
        ].filter(Boolean).map(f => String(f).toLowerCase());
        const matchesAny = searchableFields.some(field => field.includes(q));
        if (!matchesAny) {
          return false;
        }
      }

      return true;
    });

    // Ranking & Sorting
    return [...matching].sort((a, b) => {
      if (sortBy === 'best_match') {
        const scoreA = calculateCompatibilityEstimate(myProfile, a, partnerPreferences);
        const scoreB = calculateCompatibilityEstimate(myProfile, b, partnerPreferences);
        return scoreB - scoreA;
      }
      if (sortBy === 'newest') {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'age_asc') {
        return (Number(a.age) || 0) - (Number(b.age) || 0);
      }
      if (sortBy === 'age_desc') {
        return (Number(b.age) || 0) - (Number(a.age) || 0);
      }
      return 0;
    });
  }, [profiles, shortlistedIds, appliedFilters, searchQuery, sortBy, myProfile, user, partnerPreferences, showShortlistedOnly]);

  // Dynamic active filter tags for quick removal
  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (appliedFilters.gender && appliedFilters.gender !== 'all') {
      tags.push({
        key: 'gender',
        label: appliedFilters.gender === 'female' ? t('genderBrides') : t('genderGrooms'),
        onRemove: () => handleRemoveFilter('gender', 'all')
      });
    }
    if ((appliedFilters.ageMin && appliedFilters.ageMin > 18) || (appliedFilters.ageMax && appliedFilters.ageMax < 80)) {
      tags.push({
        key: 'age',
        label: `Age: ${appliedFilters.ageMin || 18}-${appliedFilters.ageMax || 80} Yrs`,
        onRemove: () => setAppliedFilters(prev => ({ ...prev, ageMin: 18, ageMax: 80 }))
      });
    }
    if (appliedFilters.state) {
      tags.push({
        key: 'state',
        label: `State: ${appliedFilters.state}`,
        onRemove: () => handleRemoveFilter('state', '')
      });
    }
    if (appliedFilters.city) {
      tags.push({
        key: 'city',
        label: `City: ${appliedFilters.city}`,
        onRemove: () => handleRemoveFilter('city', '')
      });
    }
    if (appliedFilters.education) {
      tags.push({
        key: 'education',
        label: `Edu: ${appliedFilters.education}`,
        onRemove: () => handleRemoveFilter('education', '')
      });
    }
    if (appliedFilters.diet) {
      tags.push({
        key: 'diet',
        label: `Diet: ${appliedFilters.diet.toUpperCase()}`,
        onRemove: () => handleRemoveFilter('diet', '')
      });
    }
    if (appliedFilters.maritalStatus) {
      tags.push({
        key: 'maritalStatus',
        label: `Status: ${appliedFilters.maritalStatus.replace('_', ' ')}`,
        onRemove: () => handleRemoveFilter('maritalStatus', '')
      });
    }
    if (appliedFilters.incomeBracket && appliedFilters.incomeBracket !== 'all') {
      tags.push({
        key: 'income',
        label: `Income: ${appliedFilters.incomeBracket} LPA`,
        onRemove: () => handleRemoveFilter('incomeBracket', 'all')
      });
    }
    if (appliedFilters.verifiedOnly) {
      tags.push({
        key: 'verifiedOnly',
        label: 'ID Verified Only',
        onRemove: () => handleRemoveFilter('verifiedOnly', false)
      });
    }
    if (searchQuery.trim()) {
      tags.push({
        key: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery('')
      });
    }
    return tags;
  }, [appliedFilters, searchQuery, t]);

  // 4. Effects (Running after declarations)
  useEffect(() => {
    if (user && !showShortlistedOnly) {
      const seen = localStorage.getItem('vadhu_var_discover_intro_seen');
      if (!seen) {
        setShowOnboarding(true);
      }
    }
  }, [user, showShortlistedOnly]);

  // Reset deckIndex when filters or search change
  useEffect(() => {
    setDeckIndex(0);
  }, [appliedFilters, searchQuery, sortBy]);

  // Clamp deckIndex if candidate list shrinks
  useEffect(() => {
    if (deckIndex > 0 && deckIndex >= filteredProfiles.length) {
      setDeckIndex(Math.max(0, filteredProfiles.length - 1));
    }
  }, [filteredProfiles.length, deckIndex]);

  // Keyboard navigation for Deck mode
  useEffect(() => {
    if (discoveryView !== 'deck') return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setDeckIndex(prev => Math.min(filteredProfiles.length, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setDeckIndex(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [discoveryView, filteredProfiles.length]);

  // 5. Touch Handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      setDeckIndex(prev => Math.min(filteredProfiles.length, prev + 1));
    } else if (isRightSwipe) {
      setDeckIndex(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-main">
              {showShortlistedOnly ? t('shortlisted') : t('discoverTitle')}
            </h1>
            <span className="text-xs text-sub font-normal">
              ({filteredProfiles.length} {t('candidates')})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-sub mt-1">
            {partnerPreferences
              ? t('discoverSubtitleRanked')
              : t('discoverSubtitle')}
          </p>
        </div>

        {/* View Switcher, Sort Dropdown & Search Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-card border border-main radius-btn px-2.5 py-1.5 shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-blue" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-main outline-none cursor-pointer"
              aria-label={t('sortBestMatch')}
            >
              <option value="best_match" className="bg-surface-card dark:bg-[#12151c] text-main dark:text-white">{t('sortBestMatch')}</option>
              <option value="newest" className="bg-surface-card dark:bg-[#12151c] text-main dark:text-white">{t('sortRecentlyJoined')}</option>
              <option value="age_asc" className="bg-surface-card dark:bg-[#12151c] text-main dark:text-white">{t('sortAgeLowHigh')}</option>
              <option value="age_desc" className="bg-surface-card dark:bg-[#12151c] text-main dark:text-white">{t('sortAgeHighLow')}</option>
            </select>
          </div>

          <div className="flex bg-surface-ground p-0.5 sm:p-1 radius-btn border border-main flex-shrink-0">
            <button
              onClick={() => handleSwitchView('grid')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 radius-btn text-xs font-medium transition-all ${
                discoveryView === 'grid'
                  ? 'bg-surface-card text-main shadow-xs font-bold'
                  : 'text-sub hover:text-main'
              }`}
              title={t('viewGrid')}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('viewGrid')}</span>
            </button>
            <button
              onClick={() => handleSwitchView('deck')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 radius-btn text-xs font-medium transition-all ${
                discoveryView === 'deck'
                  ? 'bg-surface-card text-main shadow-xs font-bold'
                  : 'text-sub hover:text-main'
              }`}
              title={t('viewDeck')}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('viewDeck')}</span>
            </button>
          </div>

          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="md:hidden flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 radius-btn bg-sky-blue text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('filterTitle')}</span>
          </button>
        </div>
      </div>

      {/* Full-Width Search Input */}
      <div className="mb-6 relative">
        <Search className="w-4 h-4 text-sub absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 radius-btn text-xs sm:text-sm bg-surface-card text-main border border-main outline-none focus:border-sky-blue focus:ring-1 focus:ring-sky-blue shadow-xs transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sub hover:text-main"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Discover Layout */}
      {discoveryView === 'deck' ? (
        /* Interactive Deck Mode */
        <div className="max-w-md mx-auto py-2 sm:py-4 space-y-4">
          {/* Active Filter Chips Bar */}
          {activeFilterTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-surface-card radius-card border border-main text-xs shadow-2xs animate-fade-in">
              <span className="text-[11px] font-bold text-sub flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-sky-blue" />
                <span>Filters:</span>
              </span>
              {activeFilterTags.map((tag) => (
                <span
                  key={tag.key}
                  className="inline-flex items-center gap-1 px-2 py-0.5 radius-btn bg-surface-ground border border-main text-main font-semibold shadow-2xs text-[11px]"
                >
                  <span>{tag.label}</span>
                  <button
                    type="button"
                    onClick={tag.onRemove}
                    className="text-sub hover:text-rose-500 transition-colors p-0.5"
                    title="Remove filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline ml-auto pl-1"
              >
                Clear All
              </button>
            </div>
          )}

          {filteredProfiles.length === 0 ? (
            <div className="bg-surface-card radius-card border border-main p-8 text-center space-y-4 shadow-sm">
              <h3 className="font-serif font-bold text-main text-lg">{t('noMatchingProfiles')}</h3>
              <p className="text-xs text-sub">{t('noMatchingProfilesDesc')}</p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 radius-btn bg-sky-blue text-white text-xs font-bold"
              >
                {t('resetAllFilters')}
              </button>
            </div>
          ) : deckIndex >= filteredProfiles.length ? (
            /* End of Deck State */
            <div className="bg-surface-card radius-card border border-main p-8 sm:p-10 text-center space-y-5 shadow-sm animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-main text-lg sm:text-xl">
                  You've Reviewed All Profiles!
                </h3>
                <p className="text-xs text-sub max-w-xs mx-auto">
                  You have reviewed all {filteredProfiles.length} candidates in this deck.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeckIndex(0)}
                  className="w-full sm:w-auto px-5 py-2.5 radius-btn bg-sky-blue text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-sky-blue/90 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Review from Start</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchView('grid')}
                  className="w-full sm:w-auto px-5 py-2.5 radius-btn bg-surface-ground hover:bg-surface-card border border-main text-main font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Grid className="w-4 h-4 text-sky-blue" />
                  <span>Switch to Grid View</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Candidate Card & Controls */
            <div className="space-y-3">
              {/* Deck Progress Bar & Counter */}
              <div className="flex items-center justify-between text-xs px-1 text-sub font-semibold">
                <span className="flex items-center gap-1.5 text-main">
                  <span className="w-2 h-2 rounded-full bg-sky-blue animate-pulse" />
                  Profile {deckIndex + 1} of {filteredProfiles.length}
                </span>
                <span className="text-[11px] text-sub">
                  Swipe or use buttons below
                </span>
              </div>

              <div className="h-1.5 w-full bg-surface-ground radius-btn overflow-hidden border border-main">
                <div
                  className="h-full bg-sky-blue transition-all duration-300 ease-out"
                  style={{ width: `${((deckIndex + 1) / filteredProfiles.length) * 100}%` }}
                />
              </div>

              {/* Active Profile Card Container */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative transition-all duration-200 select-none animate-fade-in"
              >
                <ProfileCard
                  profile={filteredProfiles[deckIndex]}
                  onViewDetails={onViewProfile}
                  onOpenCompatibility={onOpenCompatibility}
                  onAuthRequired={onAuthRequired}
                />
              </div>

              {/* Deck Navigation Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={deckIndex === 0}
                  onClick={() => setDeckIndex(prev => Math.max(0, prev - 1))}
                  className="py-3 px-4 radius-btn bg-surface-card hover:bg-surface-ground border border-main text-main disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-sky-blue" />
                  <span>Previous Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeckIndex(prev => prev + 1)}
                  className="py-3 px-4 radius-btn bg-sky-blue hover:bg-sky-blue/90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>{deckIndex === filteredProfiles.length - 1 ? 'Finish Deck' : 'Next Profile'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-sub text-center pt-1">
                Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-surface-ground border border-main text-[10px] font-mono">←</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-surface-ground border border-main text-[10px] font-mono">→</kbd> keys to flip profiles
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Grid Mode with Sidebar Filter */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop Filter Panel */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <FilterPanel
                appliedFilters={appliedFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                totalMatches={filteredProfiles.length}
              />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {filterDrawerOpen && (
            <div className="fixed inset-0 z-50 flex bg-black/60 md:hidden animate-fade-in">
              <div className="w-4/5 max-w-sm bg-surface-card h-full p-4 overflow-y-auto shadow-2xl animate-slide-in">
                <div className="flex justify-between items-center pb-3 mb-3 border-b border-main">
                  <h3 className="font-serif font-bold text-main">{t('filterTitle')}</h3>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="p-1 radius-btn hover:bg-surface-ground text-sub"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterPanel
                  filters={appliedFilters}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                  totalMatches={filteredProfiles.length}
                  isMobileDrawer={true}
                />
              </div>
            </div>
          )}

          {/* Grid Feed */}
          <div className="md:col-span-3 space-y-4">
            {/* Active Filter Chips Bar */}
            {activeFilterTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-surface-card radius-card border border-main text-xs shadow-2xs animate-fade-in">
                <span className="text-[11px] font-bold text-sub flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5 text-sky-blue" />
                  <span>Applied Filters:</span>
                </span>
                {activeFilterTags.map((tag) => (
                  <span
                    key={tag.key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 radius-btn bg-surface-ground border border-main text-main font-semibold shadow-2xs text-[11px]"
                  >
                    <span>{tag.label}</span>
                    <button
                      type="button"
                      onClick={tag.onRemove}
                      className="text-sub hover:text-rose-500 transition-colors p-0.5"
                      title="Remove filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {activeFilterTags.length > 1 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline ml-auto pl-2"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}

            {isLoadingFeed ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-surface-card radius-card p-5 border border-main space-y-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-surface-ground animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-surface-ground animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-surface-ground animate-pulse rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProfiles.map((p) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    onViewDetails={onViewProfile}
                    onOpenCompatibility={onOpenCompatibility}
                    onAuthRequired={onAuthRequired}
                  />
                ))}
              </div>
            ) : showShortlistedOnly ? (
              /* Shortlisted Empty State */
              <div className="bg-surface-card radius-card border border-main p-8 sm:p-14 text-center my-2 space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <Star className="w-7 h-7 fill-amber-500/20" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-serif font-bold text-main text-lg sm:text-xl">
                    {t('noShortlistedProfiles')}
                  </h3>
                  <p className="text-xs text-sub leading-relaxed">
                    {t('noShortlistedProfilesDesc')}
                  </p>
                </div>
                {onNavigateToDiscover && (
                  <div className="pt-2">
                    <button
                      onClick={onNavigateToDiscover}
                      className="px-6 py-2.5 radius-btn bg-sky-blue text-white text-xs font-bold hover:bg-sky-blue/90 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{t('exploreAllCandidates')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Zero Filter Search Results Empty State */
              <div className="bg-surface-card radius-card border border-main p-8 sm:p-12 text-center my-2 space-y-4 shadow-xs">
                <div className="w-14 h-14 radius-btn bg-sky-blue/10 text-sky-blue flex items-center justify-center mx-auto">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-serif font-bold text-main text-lg sm:text-xl">
                    {t('noMatchingProfiles')}
                  </h3>
                  <p className="text-xs text-sub leading-relaxed">
                    {t('noMatchingProfilesDesc')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto px-6 py-2.5 radius-btn bg-sky-blue text-white text-xs font-bold hover:bg-sky-blue/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>{t('resetAllFilters')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* First-Time Discover Onboarding Tour */}
      <DiscoverOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default BrowsePage;
