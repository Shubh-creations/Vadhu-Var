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
      if (appliedFilters.education && appliedFilters.education !== 'All Education') {
        const targetEdu = appliedFilters.education.trim().toLowerCase();
        const pEdu = (p.education_level || '').trim().toLowerCase();
        if (!pEdu.includes(targetEdu)) return false;
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
        const pIncome = parseFloat(p.annual_income_lpa) || 0;
        const [minStr, maxStr] = appliedFilters.incomeBracket.split('-');
        const minVal = parseFloat(minStr) || 0;
        const maxVal = maxStr ? parseFloat(maxStr) : Infinity;

        if (pIncome < minVal || pIncome > maxVal) {
          if (!p.annual_income_lpa && appliedFilters.incomeBracket !== 'all') {
            return false;
          }
        }
      }

      // 10. Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (p.full_name || '').toLowerCase().includes(q);
        const cityMatch = (p.city || '').toLowerCase().includes(q);
        const stateMatch = (p.state || '').toLowerCase().includes(q);
        const occMatch = (p.occupation || '').toLowerCase().includes(q);
        const eduMatch = (p.education_level || '').toLowerCase().includes(q);
        const dietMatch = (p.diet || '').toLowerCase().includes(q);

        if (!nameMatch && !cityMatch && !stateMatch && !occMatch && !eduMatch && !dietMatch) {
          return false;
        }
      }

      return true;
    });

    // Score Calculation & Sorting
    const scoredProfiles = matching.map(candidate => {
      const matchScore = calculateCompatibilityEstimate(myProfile, candidate, partnerPreferences);
      return {
        ...candidate,
        _matchScore: matchScore
      };
    });

    return scoredProfiles.sort((a, b) => {
      if (sortBy === 'best_match') {
        return (b._matchScore || 0) - (a._matchScore || 0);
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

  // 4. Effects
  useEffect(() => {
    if (user && !showShortlistedOnly) {
      const seen = localStorage.getItem('vadhu_var_discover_intro_seen');
      if (!seen) {
        setShowOnboarding(true);
      }
    }
  }, [user, showShortlistedOnly]);

  useEffect(() => {
    setDeckIndex(0);
  }, [appliedFilters, searchQuery, sortBy]);

  useEffect(() => {
    if (deckIndex > 0 && deckIndex >= filteredProfiles.length) {
      setDeckIndex(Math.max(0, filteredProfiles.length - 1));
    }
  }, [filteredProfiles.length, deckIndex]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10 text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {showShortlistedOnly ? t('shortlisted') : 'Discover Matches'}
            </h1>
            <span className="px-2.5 py-0.5 radius-btn text-xs font-mono font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20">
              {filteredProfiles.length} Candidates
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
            {partnerPreferences
              ? 'Ranked by precision Bklit match compatibility against your saved criteria.'
              : 'Verified matrimonial candidates across Maharashtra and India.'}
          </p>
        </div>

        {/* View Switcher, Sort Dropdown & Search Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 glass-card border border-white/10 radius-btn px-3 py-2 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-gold-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-200 outline-none cursor-pointer"
              aria-label={t('sortBestMatch')}
            >
              <option value="best_match" className="bg-zinc-950 text-white">Best Compatibility Score</option>
              <option value="newest" className="bg-zinc-950 text-white">Recently Joined</option>
              <option value="age_asc" className="bg-zinc-950 text-white">Age: Youngest First</option>
              <option value="age_desc" className="bg-zinc-950 text-white">Age: Oldest First</option>
            </select>
          </div>

          <div className="flex bg-zinc-900/90 p-1 radius-btn border border-white/10 flex-shrink-0">
            <button
              onClick={() => handleSwitchView('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 radius-btn text-xs font-semibold transition-all ${
                discoveryView === 'grid'
                  ? 'bg-zinc-800 text-gold-300 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={t('viewGrid')}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => handleSwitchView('deck')}
              className={`flex items-center gap-1 px-3 py-1.5 radius-btn text-xs font-semibold transition-all ${
                discoveryView === 'deck'
                  ? 'bg-zinc-800 text-gold-300 shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title={t('viewDeck')}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deck</span>
            </button>
          </div>

          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="md:hidden flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by candidate name, city, occupation, or education..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 radius-btn text-xs sm:text-sm glass-card text-white border border-white/10 outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/30 shadow-md transition-colors placeholder:text-zinc-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Discover Layout */}
      {discoveryView === 'deck' ? (
        /* Interactive Deck Mode */
        <div className="max-w-md mx-auto py-2 sm:py-4 space-y-4">
          {filteredProfiles.length === 0 ? (
            <div className="glass-card radius-card border border-white/10 p-8 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-gold-500/10 text-gold-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-white text-lg">No Matching Profiles</h3>
              <p className="text-xs text-zinc-400">Try adjusting your filter preferences or reset filters.</p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : deckIndex >= filteredProfiles.length ? (
            <div className="glass-card radius-card border border-white/10 p-8 text-center space-y-4 shadow-xl">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-white text-xl">You're All Caught Up!</h3>
              <p className="text-xs text-zinc-400">You have reviewed all {filteredProfiles.length} candidates in this batch.</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  onClick={() => setDeckIndex(0)}
                  className="px-5 py-2.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 font-bold text-xs"
                >
                  Review From Start
                </button>
                <button
                  onClick={() => handleSwitchView('grid')}
                  className="px-5 py-2.5 radius-btn glass-card text-white border border-white/10 text-xs font-semibold"
                >
                  Switch to Grid View
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Deck Progress Bar & Filter Action */}
              <div className="flex items-center justify-between text-xs px-1 text-zinc-400 font-semibold font-mono">
                <span className="flex items-center gap-1.5 text-gold-400">
                  <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                  Candidate {deckIndex + 1} of {filteredProfiles.length}
                </span>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-card border border-gold-400/30 text-gold-300 hover:text-white text-[11px] font-sans font-bold shadow-xs hover:border-gold-400 transition-all active:scale-95"
                >
                  <SlidersHorizontal className="w-3 h-3 text-gold-400" />
                  <span>Filters</span>
                </button>
              </div>

              <div className="h-1.5 w-full bg-zinc-900 radius-btn overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-crimson-600 via-gold-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${((deckIndex + 1) / filteredProfiles.length) * 100}%` }}
                />
              </div>

              {/* Active Profile Card Container */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative select-none animate-fade-in"
              >
                <ProfileCard
                  profile={filteredProfiles[deckIndex]}
                  isDeckView={true}
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
                  className="py-3 px-4 radius-btn glass-card hover:bg-white/[0.05] border border-white/10 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gold-400" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeckIndex(prev => prev + 1)}
                  className="py-3 px-4 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-zinc-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>{deckIndex === filteredProfiles.length - 1 ? 'Finish Deck' : 'Next Candidate'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
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
            <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md md:hidden animate-fade-in">
              <div className="w-4/5 max-w-sm glass-card h-full p-4 overflow-y-auto shadow-2xl border-r border-white/10 animate-slide-in">
                <div className="flex justify-between items-center pb-3 mb-3 border-b border-white/10">
                  <h3 className="font-serif font-bold text-white text-base">Filter Profiles</h3>
                  <button
                    onClick={() => setFilterDrawerOpen(false)}
                    className="p-1 radius-btn text-zinc-400 hover:text-white"
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
              <div className="flex flex-wrap items-center gap-2 p-3 glass-card radius-card border border-white/[0.08] text-xs shadow-sm animate-fade-in">
                <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 mr-1">
                  <Filter className="w-3.5 h-3.5 text-gold-400" />
                  <span>Applied Filters:</span>
                </span>
                {activeFilterTags.map((tag) => (
                  <span
                    key={tag.key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 radius-btn bg-zinc-900 border border-white/10 text-zinc-200 font-semibold text-[11px]"
                  >
                    <span>{tag.label}</span>
                    <button
                      type="button"
                      onClick={tag.onRemove}
                      className="text-zinc-400 hover:text-crimson-400 transition-colors p-0.5"
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
                    className="text-[11px] font-bold text-crimson-400 hover:underline ml-auto pl-2"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}

            {isLoadingFeed ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="glass-card radius-card p-5 border border-white/[0.08] space-y-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-zinc-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-zinc-800 rounded" />
                        <div className="h-3 w-1/2 bg-zinc-800 rounded" />
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
            ) : (
              <div className="glass-card radius-card border border-white/10 p-8 sm:p-14 text-center my-2 space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-full bg-gold-500/10 text-gold-400 flex items-center justify-center mx-auto">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-serif font-bold text-white text-lg sm:text-xl">
                    No Matching Profiles Found
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Try broadening your age, location, or income filters to view more candidates.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 radius-btn bg-gradient-to-r from-gold-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* First-Time Discover Tour */}
      <DiscoverOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default BrowsePage;
