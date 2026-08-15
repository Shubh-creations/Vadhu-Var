import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid, Layers, Sparkles, Filter, ShieldCheck, Heart, UserPlus, ArrowRight, X, ArrowUpDown } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import FilterPanel from '../components/FilterPanel';
import CompatibilityModal from '../components/CompatibilityModal';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import calculateCompatibilityEstimate from '../lib/compatibilityCalculator';

export const BrowsePage = ({ onViewProfile, onOpenCompatibility, onNavigateToProfile, onAuthRequired, showShortlistedOnly = false }) => {
  const { profiles, shortlistedIds } = useData();
  const { profile: myProfile, partnerPreferences, user } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [discoveryView, setDiscoveryView] = useState('grid');
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [sortBy, setSortBy] = useState('best_match');

  const [filters, setFilters] = useState({
    ageMin: partnerPreferences?.age_min || 18,
    ageMax: partnerPreferences?.age_max || 60,
    gender: 'all',
    city: partnerPreferences?.city || '',
    state: partnerPreferences?.state && partnerPreferences.state !== 'any' ? partnerPreferences.state : '',
    education: partnerPreferences?.education && partnerPreferences.education !== 'any' ? partnerPreferences.education : '',
    diet: partnerPreferences?.diet && partnerPreferences.diet !== 'any' ? partnerPreferences.diet : '',
    maritalStatus: '',
    incomeBracket: partnerPreferences?.min_income_lpa && partnerPreferences.min_income_lpa !== 'all' ? partnerPreferences.min_income_lpa : 'all',
    verifiedOnly: false
  });

  // Auto-set opposite gender match preference if user is logged in
  useEffect(() => {
    if (myProfile?.gender) {
      const preferredGender = myProfile.gender === 'female' ? 'male' : 'female';
      setFilters(prev => ({ ...prev, gender: preferredGender }));
    }
  }, [myProfile?.gender]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      ageMin: 18,
      ageMax: 60,
      gender: myProfile?.gender ? (myProfile.gender === 'female' ? 'male' : 'female') : 'all',
      city: '',
      state: '',
      education: '',
      diet: '',
      maritalStatus: '',
      incomeBracket: 'all',
      verifiedOnly: false
    });
    setSearchQuery('');
    setSortBy('best_match');
  };

  const handleSwitchView = (newView) => {
    setIsLoadingFeed(true);
    setDiscoveryView(newView);
    setTimeout(() => setIsLoadingFeed(false), 200);
  };

  // Filter and Score Sorting Engine
  const filteredProfiles = useMemo(() => {
    const currentUserId = myProfile?.id || user?.id;

    // 1. Hard Filtering
    const matching = profiles.filter((p) => {
      // Exclude hidden or deactivated profiles
      if (p.is_active === false) return false;
      if (p.is_search_visible === false && p.id !== currentUserId) return false;

      if (showShortlistedOnly && !shortlistedIds.includes(p.id)) return false;
      if (currentUserId && p.id === currentUserId) return false;
      if (filters.verifiedOnly && !p.is_id_verified && !p.is_fully_verified) return false;
      if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
      if (p.age < filters.ageMin || p.age > filters.ageMax) return false;
      if (filters.city && !p.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.state && p.state && p.state.toLowerCase() !== filters.state.toLowerCase()) return false;
      if (filters.education && p.education_level?.toLowerCase() !== filters.education.toLowerCase()) return false;
      if (filters.diet && p.diet !== filters.diet) return false;
      if (filters.maritalStatus && p.marital_status !== filters.maritalStatus) return false;

      // Income Bracket Filter (Starting 2.5 LPA+)
      if (filters.incomeBracket && filters.incomeBracket !== 'all') {
        const income = p.annual_income_lpa || 0;
        if (filters.incomeBracket === '2.5-5' && (income < 2.5 || income > 5)) return false;
        if (filters.incomeBracket === '5-10' && (income < 5 || income > 10)) return false;
        if (filters.incomeBracket === '10-15' && (income < 10 || income > 15)) return false;
        if (filters.incomeBracket === '15-25' && (income < 15 || income > 25)) return false;
        if (filters.incomeBracket === '25-50' && (income < 25 || income > 50)) return false;
        if (filters.incomeBracket === '50+' && income < 50) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.full_name?.toLowerCase().includes(query);
        const matchesCity = p.city?.toLowerCase().includes(query);
        const matchesState = p.state?.toLowerCase().includes(query);
        const matchesOccupation = p.occupation?.toLowerCase().includes(query);
        const matchesEdu = p.education_level?.toLowerCase().includes(query);
        if (!matchesName && !matchesCity && !matchesState && !matchesOccupation && !matchesEdu) return false;
      }

      return true;
    });

    // 2. Score Calculation & Sorting
    const scoredList = matching.map(p => ({
      ...p,
      computedMatchScore: calculateCompatibilityEstimate(myProfile, p, partnerPreferences)
    }));

    return scoredList.sort((a, b) => {
      if (sortBy === 'best_match') {
        // Primary: Match Score descending
        const scoreDiff = b.computedMatchScore - a.computedMatchScore;
        if (scoreDiff !== 0) return scoreDiff;

        // Tie-breaker 1: Verification Tier (100% Verified > ID Verified > Unverified)
        const getTier = (item) => item.is_fully_verified ? 3 : item.is_id_verified ? 2 : 1;
        const tierDiff = getTier(b) - getTier(a);
        if (tierDiff !== 0) return tierDiff;

        // Tie-breaker 2: Recency
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }

      if (sortBy === 'newest') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }

      if (sortBy === 'age_asc') {
        return (a.age || 0) - (b.age || 0);
      }

      if (sortBy === 'age_desc') {
        return (b.age || 0) - (a.age || 0);
      }

      return 0;
    });
  }, [profiles, filters, searchQuery, myProfile, partnerPreferences, user, showShortlistedOnly, shortlistedIds, sortBy]);

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
            {t('discoverSubtitle')}
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
              aria-label="Sort Candidates"
            >
              <option value="best_match">Best Match (100-Pt Score)</option>
              <option value="newest">Recently Joined</option>
              <option value="age_asc">Age: Low to High</option>
              <option value="age_desc">Age: High to Low</option>
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
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => handleSwitchView('deck')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 radius-btn text-xs font-medium transition-all ${
                discoveryView === 'deck'
                  ? 'bg-surface-card text-main shadow-xs font-bold'
                  : 'text-sub hover:text-main'
              }`}
              title="Deck View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deck</span>
            </button>
          </div>

          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="md:hidden flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 radius-btn bg-sky-blue text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
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
        /* Deck Mode */
        <div className="max-w-md mx-auto py-4">
          {filteredProfiles.length > 0 ? (
            <div className="relative">
              <ProfileCard
                profile={filteredProfiles[0]}
                onViewDetails={onViewProfile}
                onOpenCompatibility={onOpenCompatibility}
                onAuthRequired={onAuthRequired}
              />
            </div>
          ) : (
            <div className="bg-surface-card radius-card border border-main p-8 text-center text-sub text-xs">
              No matching candidate found in deck view.
            </div>
          )}
        </div>
      ) : (
        /* Grid Mode with Sidebar Filter */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop Filter Panel */}
          <div className="hidden md:block md:col-span-1 sticky top-20">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              totalMatches={filteredProfiles.length}
            />
          </div>

          {/* Mobile Filter Drawer */}
          {filterDrawerOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto">
              <div className="bg-surface-card radius-card max-w-lg mx-auto p-4 border border-main shadow-2xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-main">
                  <h3 className="font-serif font-bold text-main text-base">Filter Profiles</h3>
                  <button onClick={() => setFilterDrawerOpen(false)} className="p-1 text-sub hover:text-main">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  totalMatches={filteredProfiles.length}
                />
              </div>
            </div>
          )}

          {/* Grid Feed */}
          <div className="md:col-span-3">
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
            ) : (
              <div className="bg-surface-card radius-card border border-main p-8 sm:p-12 text-center my-2 space-y-4 shadow-sm">
                <div className="w-14 h-14 radius-btn bg-sky-blue/10 text-sky-blue flex items-center justify-center mx-auto">
                  <UserPlus className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-serif font-bold text-main text-lg sm:text-xl">
                    Be the First Verified Profile
                  </h3>
                  <p className="text-xs text-sub leading-relaxed">
                    Complete your candidate details to get discovered by verified matches across India.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={user || myProfile ? onNavigateToProfile : onAuthRequired}
                    className="w-full sm:w-auto px-6 py-2.5 radius-btn bg-sky-blue text-white text-xs font-bold hover:bg-sky-blue/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>{myProfile ? 'Update Profile' : 'Create Your Profile'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="w-full sm:w-auto px-5 py-2.5 radius-btn bg-surface-ground border border-main text-sub text-xs font-medium hover:text-main transition-colors"
                  >
                    {t('reset')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
