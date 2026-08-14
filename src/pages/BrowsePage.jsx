import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, X, Sparkles, LayoutGrid, Layers } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import FilterPanel from '../components/FilterPanel';
import HingeCardDeck from '../components/HingeCardDeck';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const BrowsePage = ({ onViewProfile, onOpenCompatibility, onAuthRequired, showShortlistedOnly = false }) => {
  const { profiles, shortlistedIds } = useData();
  const { profile: myProfile, user } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [discoveryView, setDiscoveryView] = useState('grid');
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 60,
    gender: 'all',
    city: '',
    state: '',
    education: '',
    diet: '',
    maritalStatus: '',
    incomeBracket: 'all',
    verifiedOnly: false
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      ageMin: 18,
      ageMax: 60,
      gender: 'all',
      city: '',
      state: '',
      education: '',
      diet: '',
      maritalStatus: '',
      incomeBracket: 'all',
      verifiedOnly: false
    });
    setSearchQuery('');
  };

  const handleSwitchView = (newView) => {
    setIsLoadingFeed(true);
    setDiscoveryView(newView);
    setTimeout(() => setIsLoadingFeed(false), 200);
  };

  const filteredProfiles = useMemo(() => {
    const currentUserId = myProfile?.id || user?.id;

    return profiles.filter((p) => {
      if (showShortlistedOnly && !shortlistedIds.includes(p.id)) return false;
      if (currentUserId && p.id === currentUserId) return false;
      if (filters.verifiedOnly && !p.is_id_verified && !p.is_fully_verified) return false;
      if (filters.gender !== 'all' && p.gender !== filters.gender) return false;
      if (p.age < filters.ageMin || p.age > filters.ageMax) return false;
      if (filters.city && !p.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
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
  }, [profiles, filters, searchQuery, myProfile, user, showShortlistedOnly, shortlistedIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* View Switcher & Search Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-surface-ground p-1 radius-btn border border-main">
            <button
              onClick={() => handleSwitchView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 radius-btn text-xs font-medium transition-all ${
                discoveryView === 'grid'
                  ? 'bg-surface-card text-main shadow-xs'
                  : 'text-sub hover:text-main'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid View</span>
            </button>

            <button
              onClick={() => handleSwitchView('deck')}
              className={`flex items-center gap-1.5 px-3 py-1.5 radius-btn text-xs font-medium transition-all ${
                discoveryView === 'deck'
                  ? 'bg-surface-card text-main shadow-xs'
                  : 'text-sub hover:text-main'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prompt Deck</span>
            </button>
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-sub absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-surface-card border border-main radius-btn text-xs text-main outline-none focus:ring-1 focus:ring-sky-blue"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-sub hover:text-main"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-sky-blue text-white radius-btn text-xs font-medium"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      {discoveryView === 'deck' ? (
        <div className="py-4">
          <HingeCardDeck
            profiles={filteredProfiles}
            onViewDetails={onViewProfile}
            onOpenCompatibility={onOpenCompatibility}
            onAuthRequired={onAuthRequired}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          <div className="hidden md:block md:col-span-1 sticky top-20">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              totalMatches={filteredProfiles.length}
            />
          </div>

          {filterDrawerOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto">
              <div className="bg-surface-card radius-card max-w-lg mx-auto p-4 border border-main">
                <div className="flex justify-end mb-2">
                  <button onClick={() => setFilterDrawerOpen(false)} className="p-1 text-sub">
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
              <div className="bg-surface-card radius-card border border-main p-12 text-center my-4">
                <ShieldCheck className="w-12 h-12 text-sub mx-auto mb-3" />
                <h3 className="font-serif font-bold text-main text-lg mb-1">
                  No Matching Candidates Found
                </h3>
                <p className="text-xs text-sub max-w-md mx-auto mb-6">
                  Try adjusting your filter criteria to view more candidates.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 radius-btn bg-sky-blue text-white text-xs font-medium hover:bg-sky-blue/90 transition-colors"
                >
                  {t('reset')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
